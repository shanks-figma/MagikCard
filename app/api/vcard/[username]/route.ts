import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Serves the profile as a downloadable .vcf ("Save contact").
//
// This is a server route rather than a client-side Blob download on purpose:
// iOS Safari is unreliable with `<a download>` + blob: URLs, and this card is
// primarily scanned/opened on a phone. A real endpoint with a text/vcard
// content type gets handled natively by iOS/Android contact apps.
//
// vCard 3.0 (not 4.0): iOS Contacts, Google Contacts and Outlook all parse 3.0
// most reliably.

// Contact apps render the photo small, so a full-size avatar is wasted bytes —
// a 400KB PNG becomes ~540KB once base64'd into the .vcf. We ask Next's image
// optimizer for a 256px copy first (~20KB) and only fall back to the original.
const PHOTO_WIDTH = 256;
const MAX_PHOTO_BYTES = 512 * 1024;

/** RFC 2426 §2.4.2 — escape backslash, semicolon, comma and newlines in TEXT values. */
function esc(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * RFC 2426 §2.6 — fold long lines at 75 chars, continuations prefixed with a space.
 * Only folds pure-ASCII lines: folding is defined in octets, so splitting a line
 * containing multi-byte UTF-8 by character index can cut a codepoint in half.
 * Long non-ASCII lines are left unfolded, which parsers tolerate.
 */
function fold(line: string): string {
  if (line.length <= 75) return line;
  // eslint-disable-next-line no-control-regex
  if (/[^\x00-\x7F]/.test(line)) return line;
  const parts: string[] = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 74) {
    parts.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest.length) parts.push(" " + rest);
  return parts.join("\r\n");
}

/** "Ekta Singh" -> N:Singh;Ekta;;; — last token is the family name. */
function structuredName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return ";;;;";
  if (parts.length === 1) return `;${esc(parts[0])};;;`;
  const family = parts.pop() as string;
  return `${esc(family)};${esc(parts.join(" "))};;;`;
}

function normalizeUrl(url: string): string {
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  return `https://${url}`;
}

async function readImage(url: string): Promise<{ b64: string; type: string } | null> {
  const res = await fetch(url);
  if (!res.ok) return null;

  // vCard 3.0 wants a bare image subtype (JPEG/PNG/GIF), not a MIME string.
  const subtype = (res.headers.get("content-type") ?? "")
    .split("/")[1]
    ?.split(";")[0]
    ?.toUpperCase();
  if (!subtype || !["JPEG", "JPG", "PNG", "GIF"].includes(subtype)) return null;

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength > MAX_PHOTO_BYTES) return null;

  return { b64: buf.toString("base64"), type: subtype === "JPG" ? "JPEG" : subtype };
}

async function fetchPhoto(
  image: string,
  origin: string
): Promise<{ b64: string; type: string } | null> {
  // Prefer a downscaled copy; fall back to the original if the optimizer can't
  // serve it (e.g. a host not covered by next.config images.remotePatterns).
  const optimized = `${origin}/_next/image?url=${encodeURIComponent(image)}&w=${PHOTO_WIDTH}&q=75`;
  try {
    const small = await readImage(optimized);
    if (small) return small;
  } catch {
    /* fall through to the original */
  }

  try {
    return await readImage(image.startsWith("http") ? image : `${origin}${image}`);
  } catch {
    return null; // a missing photo must never fail the download
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const user = await prisma.user.findFirst({
      where: { username: params.username },
      select: { name: true, username: true, bio: true, image: true, links: true, socialLinks: true },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const origin = req.nextUrl.origin;
    const displayName = user.name?.trim() || `@${user.username}`;
    const socialLinks = (user.socialLinks as Record<string, string> | null) ?? {};
    const links = (user.links as { heading: string; url: string }[] | null) ?? [];

    const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

    lines.push(`N:${structuredName(displayName)}`);
    lines.push(`FN:${esc(displayName)}`);
    if (user.username) lines.push(`NICKNAME:${esc(user.username)}`);
    if (user.bio?.trim()) lines.push(`NOTE:${esc(user.bio.trim())}`);

    // Only the email the user explicitly published on their profile — never
    // User.email, which is their private account/login address.
    const publicEmail = socialLinks.email?.trim().replace(/^mailto:/i, "");
    if (publicEmail) lines.push(`EMAIL;TYPE=INTERNET:${esc(publicEmail)}`);

    // The profile itself is the primary URL.
    lines.push(`URL:${esc(`${origin}/p/${user.username}`)}`);

    for (const [platform, raw] of Object.entries(socialLinks)) {
      if (!raw?.trim() || platform === "email") continue;
      lines.push(
        `X-SOCIALPROFILE;TYPE=${esc(platform)}:${esc(normalizeUrl(raw.trim()))}`
      );
    }

    for (const link of links) {
      if (!link?.heading?.trim() || !link?.url?.trim()) continue;
      lines.push(`URL:${esc(normalizeUrl(link.url.trim()))}`);
    }

    if (user.image) {
      const photo = await fetchPhoto(user.image, origin);
      if (photo) lines.push(`PHOTO;ENCODING=b;TYPE=${photo.type}:${photo.b64}`);
    }

    lines.push(`REV:${new Date().toISOString()}`);
    lines.push("END:VCARD");

    const vcard = lines.map(fold).join("\r\n") + "\r\n";
    const filename = `${(user.username || "contact").replace(/[^a-z0-9_-]/gi, "")}.vcf`;

    return new NextResponse(vcard, {
      status: 200,
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("[GET /api/vcard]", e);
    return NextResponse.json({ error: "Could not build contact card" }, { status: 500 });
  }
}
