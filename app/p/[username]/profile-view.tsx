"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ProfileCard from "@/components/profile-card";
import { resolveCardStyle } from "@/lib/card-styles";
import { newsreader } from "@/app/fonts/serif";
import { getFavicon, normalizeUrl, getYouTubeEmbedUrl, getSpotifyEmbedUrl, trackClick, SOCIAL_ICONS } from "./profile-shared";
import RetroView from "./retro-view";

function QRModal({ username, onClose }: { username: string; onClose: () => void }) {
  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/p/${username}`
    : `https://magikcard.com/p/${username}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(profileUrl)}&bgcolor=0a0a0a&color=ffffff&margin=12`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-2xl w-72"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <p className="text-sm font-semibold text-white/80">Scan to open profile</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl} alt="QR code" className="w-[160px] h-[160px] rounded-xl" />
        <p className="text-xs text-white/30 text-center break-all">{profileUrl}</p>
      </div>
    </div>
  );
}

// "style" is optional and defaults to "row" so links saved before this
// existed keep rendering exactly as they always have.
export type LinkStyle = "row" | "compact" | "featured" | "grid" | "rich";
// `image` only applies to (and is only editable for) the "rich" style — a
// manually-set banner, not an auto-fetched Open Graph preview.
export type LinkItem = { heading: string; url: string; description?: string; style?: LinkStyle; image?: string };

export type User = {
  cardStyle?: string | null;
  name: string | null;
  username: string | null;
  bio: string | null;
  image: string | null;
  links?: LinkItem[] | null;
  socialLinks?: Record<string, string> | null;
};

function ShareButton({ username, light = false }: { username: string; light?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs font-medium transition border rounded-full px-3 py-1.5 ${
        light ? "text-black/40 hover:text-black/70 border-black/10" : "text-white/40 hover:text-white/70 border-white/10"
      }`}>
      {copied ? (
        <>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Share
        </>
      )}
    </button>
  );
}

const ArrowIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M3 13L13 3M13 3H7M13 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * Link card chrome — matched to the social-icon chip's own styling (below,
 * in the Social links section) rather than the Figma link-card node
 * (638:64/952:28), which uses a different, more translucent gradient stroke.
 *
 * Two-layer wrapper, same shape the social chips use:
 *  - outer: 1px padding + a solid dark-gray gradient border
 *  - inner: a translucent gradient fill stacked over solid black
 */
const CARD_FILL = "linear-gradient(to bottom, rgba(206,210,215,0.2), rgba(96,100,105,0.2)), #000000";
const CARD_STROKE = "linear-gradient(to bottom, #323334, #292A2A)";
const cardOuter = { minWidth: 0, padding: 1, borderRadius: 13, background: CARD_STROKE } as const;
const cardInner = { borderRadius: 12, background: CARD_FILL } as const;
const THUMB_SIZE = 42.85; // Figma: 42.854px

const onestStyle = { fontFamily: "var(--font-onest), sans-serif" } as const;

function LinkThumb({ url, size, radius = 12 }: { url: string; size: number; radius?: number }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size, borderRadius: radius, background: "rgba(235,235,235,0.1)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getFavicon(url)}
        alt=""
        className="object-contain"
        style={{ width: size * 0.56, height: size * 0.56 }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    </div>
  );
}

/**
 * Banner for the "rich" link style. Falls back to the favicon tile — via
 * React state, not an imperative style mutation on error — whenever no
 * image URL is set, or the one that's set fails to load. That keeps a
 * failed banner visually identical to "no banner set" instead of leaving
 * an empty box with the browser's own broken-image glyph in the corner.
 *
 * <img onError> alone isn't enough: for an image the browser resolves as
 * broken before React finishes mounting (e.g. a bad/unreachable URL that
 * fails fast), the error event can fire before the listener is attached —
 * the same class of bug as the avatar dominant-color extraction elsewhere
 * in this file. Checked directly: a genuinely broken image reported
 * img.complete === true, naturalWidth === 0 with onError never having run.
 * So on mount we also check img.complete/naturalWidth directly as a second
 * trigger, exactly like onImageLoad's fallback for the avatar.
 */
function RichBanner({ url, image }: { url: string; image?: string }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    setFailed(false); // a new image URL deserves a fresh attempt
  }, [image]);
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [image]);
  const showImage = !!image && !failed;
  return (
    <div
      className="w-full rounded-xl overflow-hidden bg-white/[0.06] flex items-center justify-center"
      style={{ aspectRatio: "337.065 / 217.065" }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={image}
          alt=""
          className="w-full h-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <LinkThumb url={url} size={40} />
      )}
    </div>
  );
}

/**
 * Renders one link in one of four styles. All four share the same card
 * chrome (cardOuter/cardInner) so switching styles never changes the "does
 * this look like part of the same page" answer — only density and emphasis
 * change.
 *
 *  row      — the default. Thumbnail + title + description, one per row.
 *  compact  — title only, smaller thumbnail, for lists with many links.
 *  featured — bigger thumbnail and type, for the one link that matters most.
 *  grid     — square tile, two per row (via flex-wrap on the parent), for a
 *             portfolio/gallery feel rather than a list.
 */
function LinkCard({
  lk,
  href,
  onClick,
}: {
  lk: LinkItem;
  href: string;
  onClick: () => void;
}) {
  const style = lk.style ?? "row";

  if (style === "rich") {
    return (
      <div style={{ ...cardOuter, flex: "0 0 100%" }}>
        <a
          href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}
          style={cardInner}
          className="flex flex-col gap-[11px] p-3 hover:brightness-125 transition"
        >
          {/* Figma: image w/h ratio 337.06/217.06 ≈ 1.553. A manually-set
              banner (see LinkItem.image) — not an auto-fetched OG preview. */}
          <RichBanner url={lk.url} image={lk.image} />
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2 px-1">
              <p className="text-[16px] font-medium text-white truncate" style={{ ...onestStyle, lineHeight: "18px" }}>
                {lk.heading}
              </p>
              <ArrowIcon size={20} />
            </div>
            {lk.description && (
              <p
                className="px-1 text-[13px] font-light truncate"
                style={{ ...onestStyle, lineHeight: "16px", color: "#9B9B9B" }}
              >
                {lk.description}
              </p>
            )}
          </div>
        </a>
      </div>
    );
  }

  if (style === "grid") {
    return (
      <div style={{ ...cardOuter, flex: "0 0 calc(50% - 6px)" }}>
        <a
          href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}
          style={cardInner}
          className="flex flex-col items-center text-center gap-2 px-3 pt-4 pb-3 hover:brightness-125 transition h-full"
        >
          <LinkThumb url={lk.url} size={40} />
          <p
            className="text-[13px] font-medium text-white leading-[16px] line-clamp-2 break-words"
            style={onestStyle}
          >
            {lk.heading}
          </p>
        </a>
      </div>
    );
  }

  if (style === "compact") {
    return (
      <div style={{ ...cardOuter, flex: "0 0 100%" }}>
        <a
          href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}
          style={cardInner}
          className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 hover:brightness-125 transition"
        >
          <LinkThumb url={lk.url} size={28} radius={9} />
          <p className="flex-1 min-w-0 text-[14px] font-medium text-white truncate" style={{ ...onestStyle, lineHeight: "16px" }}>
            {lk.heading}
          </p>
          <ArrowIcon size={16} />
        </a>
      </div>
    );
  }

  if (style === "featured") {
    return (
      <div style={{ ...cardOuter, flex: "0 0 100%" }}>
        <a
          href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}
          style={cardInner}
          className="flex items-center gap-4 pl-3 pr-4 py-3 hover:brightness-125 transition"
        >
          <LinkThumb url={lk.url} size={56} />
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
            <p className="text-[18px] font-semibold text-white truncate" style={{ ...onestStyle, lineHeight: "22px" }}>
              {lk.heading}
            </p>
            {lk.description && (
              <p className="text-[13px] font-normal line-clamp-2" style={{ ...onestStyle, lineHeight: "17px", color: "#9B9B9B" }}>
                {lk.description}
              </p>
            )}
          </div>
          <ArrowIcon size={22} />
        </a>
      </div>
    );
  }

  // "row" — the existing default card, unchanged.
  return (
    <div style={{ ...cardOuter, flex: "0 0 100%" }}>
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}
        style={cardInner}
        className="flex items-center gap-[11px] pl-2 pr-3 py-2 hover:brightness-125 transition">
        <LinkThumb url={lk.url} size={THUMB_SIZE} />
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-[2px]">
          <p className="text-[16px] font-medium text-white truncate" style={{ ...onestStyle, lineHeight: "18px" }}>
            {lk.heading}
          </p>
          {lk.description && (
            <p className="text-[12px] font-normal truncate" style={{ ...onestStyle, lineHeight: "18px", color: "#9B9B9B" }}>
              {lk.description}
            </p>
          )}
        </div>
        <ArrowIcon size={20} />
      </a>
    </div>
  );
}

const AURA = {
  ink: "#2b2a28",
  muted: "#7d7b78",
  hero: "#f2e6e8",
  mint: "#dfe9e3",
  list: "#f6f6f5",
  divider: "#e7e6e4",
} as const;

function AuraCheck() {
  return (
    <span className="flex items-center justify-center w-[18px] h-[18px] rounded-full shrink-0" style={{ background: "#d4efd2" }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#3f9a4c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

const auraPill = "flex items-center gap-1.5 h-[26px] rounded-full bg-white text-[13px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]";

function AuraSharePill({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(`${window.location.origin}/p/${username}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={`${auraPill} pl-3 pr-1`}
      style={{ color: AURA.ink }}
    >
      {copied ? "Copied" : "Share"}
      <AuraCheck />
    </button>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * The "aura" card style: a full-page light layout modelled section-for-section
 * on an iOS profile screen — pink hero card, mint action card, grouped list,
 * bottom icon bar. It replaces the dark layout wholesale rather than
 * recolouring it, so individual link styles (row/grid/rich…) don't apply here.
 */
function AuraView({ user, isOwner, preview }: { user: User; isOwner: boolean; preview: boolean }) {
  const [showQR, setShowQR] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const username = user.username ?? "";
  const displayName = user.name ?? `@${username}`;
  const links = (user.links ?? []).filter((l) => l.heading && l.url);
  const socials = Object.entries(user.socialLinks ?? {}).filter(([, v]) => v);
  const serif = newsreader.className;

  return (
    <div
      className={`bg-white ${preview ? "h-full pointer-events-none select-none" : "min-h-screen"}`}
      style={{ color: AURA.ink }}
    >
      {isOwner && (
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 bg-white/80 backdrop-blur border-b border-black/[0.06]">
          <Link href="/dashboard" className="text-sm text-black/50 hover:text-black transition">Dashboard</Link>
          <Link href={`/p/${username}/edit`} className="text-sm font-medium px-3.5 py-1.5 rounded-full bg-black text-white hover:bg-black/85 transition">
            Edit profile
          </Link>
        </div>
      )}

      <div className="max-w-[420px] mx-auto px-2.5 pt-3 pb-4 flex flex-col gap-2.5">
        {/* Hero */}
        <section className="relative rounded-[38px] px-5 pt-5 pb-9 flex flex-col items-center text-center overflow-hidden" style={{ background: AURA.hero }}>
          <div className="w-full flex items-center justify-between">
            <span className={`${auraPill} pl-1 pr-3`}>
              <AuraCheck />
              <span>MagikCard</span>
              <span style={{ color: AURA.muted }}>Card</span>
            </span>
            {username && <AuraSharePill username={username} />}
          </div>

          <div className="relative mt-6 w-[196px] h-[196px]">
            {/* soft colour halo that the feathered photo dissolves into */}
            <div className="absolute inset-[-18px] rounded-full blur-2xl opacity-90"
              style={{ background: "radial-gradient(circle at 70% 20%, #f4b4a8 0%, transparent 45%), radial-gradient(circle at 30% 30%, #e9b8e0 0%, transparent 50%), radial-gradient(circle at 50% 85%, #9fd3a6 0%, transparent 50%)" }} />
            <div className="absolute inset-0 rounded-full overflow-hidden"
              style={{ WebkitMaskImage: "radial-gradient(circle, #000 58%, transparent 71%)", maskImage: "radial-gradient(circle, #000 58%, transparent 71%)" }}>
              {user.image && !imageFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={displayName} className="w-full h-full object-cover" onError={() => setImageFailed(true)} />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-6xl ${serif}`} style={{ background: "#ead6da", color: AURA.muted }}>
                  {displayName.replace(/^@/, "")[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <h1 className={`${serif} mt-3 text-[46px] leading-[1.1] tracking-[-0.02em] break-words max-w-full`}>{displayName}</h1>
          <p className="mt-4 text-[19px]" style={{ color: AURA.muted }}>@{username}</p>
        </section>

        {/* Primary action */}
        {username && (
          <a href={`/api/vcard/${username}`} className="flex items-center gap-4 rounded-full pl-5 pr-6 py-4 active:scale-[0.99] transition" style={{ background: AURA.mint }}>
            <span className="relative w-[50px] h-[50px] shrink-0 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full blur-[3px]" style={{ background: "radial-gradient(circle at 40% 35%, #8fcf8a, #3f8f4f 70%)" }} />
              <svg className="relative" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="min-w-0 flex flex-col text-left">
              <span className={`${serif} text-[21px] leading-tight`}>Save my contact</span>
              <span className="mt-1 flex items-center gap-1.5 text-[13px]" style={{ color: AURA.muted }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#ec9a82" }} />
                Add to your phone · vCard
              </span>
            </span>
          </a>
        )}

        {/* Links as a grouped list */}
        {(links.length > 0 || isOwner) && (
          <section className="rounded-[30px] overflow-hidden" style={{ background: AURA.list }}>
            {links.length === 0 && (
              <Link href={`/p/${username}/edit`} className="block px-5 py-6 text-[15px]" style={{ color: AURA.muted }}>
                Add links to your profile →
              </Link>
            )}
            {links.map((lk, i) => {
              const href = normalizeUrl(lk.url);
              const onClick = () => trackClick(username, lk.url);
              const yt = getYouTubeEmbedUrl(lk.url);
              const sp = getSpotifyEmbedUrl(lk.url);
              const sub = lk.description || hostOf(lk.url);
              const border = i > 0 ? { borderTop: `1px solid ${AURA.divider}` } : undefined;

              if (yt || sp) {
                return (
                  <div key={i} className="px-5 pt-5 pb-4" style={border}>
                    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className="block">
                      <p className={`${serif} text-[21px] leading-tight truncate`}>{lk.heading}</p>
                      <p className="mt-1 text-[13px] truncate" style={{ color: AURA.muted }}>{sub}</p>
                    </a>
                    <div className="mt-3 rounded-2xl overflow-hidden">
                      {yt ? (
                        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                          <iframe src={yt} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={lk.heading} />
                        </div>
                      ) : (
                        <iframe src={sp!} width="100%" height={lk.url.includes("/track/") ? "80" : "352"} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title={lk.heading} />
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}
                  className="flex items-center gap-3 px-5 py-5 hover:bg-black/[0.02] transition" style={border}>
                  <span className="flex-1 min-w-0">
                    <span className={`${serif} block text-[21px] leading-tight truncate`}>{lk.heading}</span>
                    <span className="block mt-1.5 text-[13px] truncate" style={{ color: AURA.muted }}>{sub}</span>
                  </span>
                  {/* segmented-control look, as in the reference's row toggles */}
                  <span className="shrink-0 flex items-center p-[3px] rounded-full text-[13px]" style={{ background: "#ebeae8" }}>
                    <span className="px-3 py-[5px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)]">Open</span>
                    <span className="px-2.5" style={{ color: AURA.muted }}><ArrowIcon size={12} /></span>
                  </span>
                </a>
              );
            })}
          </section>
        )}

        {!links.length && !socials.length && !isOwner && (
          <p className="text-center py-10 text-sm" style={{ color: AURA.muted }}>No links yet.</p>
        )}
      </div>

      {/* Bottom icon bar — socials, then QR */}
      <nav className={`${preview ? "" : "sticky bottom-0"} bg-white/90 backdrop-blur`}>
        <div className="max-w-[420px] mx-auto px-6 pt-3 pb-5 flex items-center justify-around">
          {socials.map(([key, url], i) => (
            <a key={key} href={normalizeUrl(url)} target="_blank" rel="noopener noreferrer" title={key}
              className="w-10 h-10 flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6 transition hover:opacity-70"
              style={{ color: i === 0 ? "#1c1b1a" : "#8e8c89" }}>
              {SOCIAL_ICONS[key] ?? <span className="text-sm font-semibold">{key[0].toUpperCase()}</span>}
            </a>
          ))}
          <button type="button" onClick={() => setShowQR(true)} title="QR code"
            className="w-10 h-10 flex items-center justify-center transition hover:opacity-70" style={{ color: socials.length ? "#8e8c89" : "#1c1b1a" }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="3" height="3" rx="0.5" fill="currentColor"/><rect x="18" y="18" width="3" height="3" rx="0.5" fill="currentColor"/></svg>
          </button>
        </div>
      </nav>
      {showQR && <QRModal username={username} onClose={() => setShowQR(false)} />}
    </div>
  );
}

export default function ProfileView({
  user,
  isOwner = false,
  preview = false,
}: {
  user: User;
  isOwner?: boolean;
  /** Renders inside the edit-page preview frame: fills its container and is inert (no clicks / click-tracking). */
  preview?: boolean;
}) {
  const displayName = user.name ?? `@${user.username}`;
  const externalLinks = (user.links as { heading: string; url: string; description?: string }[] | null) ?? [];
  const socialLinks = (user.socialLinks as Record<string, string> | null) ?? {};
  const hasSocialLinks = Object.values(socialLinks).some(Boolean);
  const [showQR, setShowQR] = useState(false);
  // Aura and Retro are whole-page layouts, not just a different avatar card.
  const layout = resolveCardStyle(user.cardStyle);
  if (layout === "aura") return <AuraView user={user} isOwner={isOwner} preview={preview} />;
  if (layout === "retro") return <RetroView user={user} isOwner={isOwner} preview={preview} />;

  return (
    <div
      className={`bg-black text-white ${
        preview ? "h-full pointer-events-none select-none" : "min-h-screen"
      }`}
    >
      {/* ── Owner edit bar ── */}
      {isOwner && (
        <div className={`sticky top-0 z-20 flex items-center justify-between px-5 py-3 backdrop-blur border-b ${
          "bg-black/60 border-white/10"
        }`}>
          <Link href="/dashboard" className={`text-sm transition flex items-center gap-1.5 text-white/50 hover:text-white`}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Dashboard
          </Link>
          <Link
            href={`/p/${user.username}/edit`}
            className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-full transition ${
              "bg-white text-black hover:bg-white/90"
            }`}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Edit profile
          </Link>
        </div>
      )}

      {/* Photo and username card */}
      <div className="relative pb-6 pt-10 flex flex-col items-center text-center px-6">
        <ProfileCard image={user.image} username={user.username ?? ""} name={displayName} preview={preview} cardStyle={user.cardStyle} />

        {/* The one high-emphasis action on the page: this is a business card,
            so taking it with you is the primary job. */}
        {user.username && (
          <a
            href={`/api/vcard/${user.username}`}
            className={`mt-6 w-full max-w-xs flex items-center justify-center gap-2 h-12 rounded-2xl text-[15px] font-semibold active:scale-[0.98] transition ${
              "bg-white text-black hover:bg-white/90"
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Save contact
          </a>
        )}
      </div>

      {/* ── Content ── */}
      <div className="max-w-sm mx-auto px-5 pb-16 space-y-8 pt-8">

        {/* Share + QR */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowQR(true)}
            className={`flex items-center gap-1.5 text-xs font-medium transition border rounded-full px-3 py-1.5 ${
              "text-white/40 hover:text-white/70 border-white/10"
            }`}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="3" height="3" rx="0.5" fill="currentColor"/><rect x="19" y="14" width="2" height="2" rx="0.5" fill="currentColor"/><rect x="14" y="19" width="2" height="2" rx="0.5" fill="currentColor"/><rect x="18" y="18" width="3" height="3" rx="0.5" fill="currentColor"/></svg>
            QR
          </button>
          <ShareButton username={user.username ?? ""} />
        </div>
        {showQR && <QRModal username={user.username ?? ""} onClose={() => setShowQR(false)} />}

        {/* Links */}
        {externalLinks.filter((l) => l.heading && l.url).length > 0 && (
          <section className="flex flex-col gap-3">
            <p className={`text-[18px] text-white`}>All links</p>
            {/* flex-wrap, not flex-col: grid-style cards report a half-width
                flex-basis and sit two-up, everything else reports full width
                and wraps to its own line — order is preserved either way. */}
            <div className="flex flex-wrap gap-3">
            {externalLinks.filter((l) => l.heading && l.url).map((lk, i) => {
              const href = normalizeUrl(lk.url);
              const ytEmbed = getYouTubeEmbedUrl(lk.url);
              const spEmbed = getSpotifyEmbedUrl(lk.url);

              if (ytEmbed) {
                return (
                  <div key={i} style={{ ...cardOuter, flex: "0 0 100%" }}>
                  <div className="overflow-hidden" style={cardInner}>
                    <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" className="text-red-500 shrink-0"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      <p className={`text-sm font-semibold flex-1 truncate text-white`}>{lk.heading}</p>
                      <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(user.username ?? "", lk.url)} className={`transition shrink-0 text-white/30 hover:text-white/70`}>
                        <ArrowIcon />
                      </a>
                    </div>
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        src={ytEmbed}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={lk.heading}
                      />
                    </div>
                    {lk.description && (
                      <p className={`px-4 pb-3 pt-1 text-xs text-white/40`}>{lk.description}</p>
                    )}
                  </div>
                  </div>
                );
              }

              if (spEmbed) {
                const isTrack = lk.url.includes("/track/");
                return (
                  <div key={i} style={{ ...cardOuter, flex: "0 0 100%" }}>
                  <div className="overflow-hidden" style={cardInner}>
                    <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" className="text-green-500 shrink-0"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                      <p className={`text-sm font-semibold flex-1 truncate text-white`}>{lk.heading}</p>
                      <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(user.username ?? "", lk.url)} className={`transition shrink-0 text-white/30 hover:text-white/70`}>
                        <ArrowIcon />
                      </a>
                    </div>
                    <div className="px-3 pb-3">
                      <iframe
                        src={spEmbed}
                        width="100%"
                        height={isTrack ? "80" : "352"}
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        style={{ borderRadius: "12px" }}
                        title={lk.heading}
                      />
                    </div>
                    {lk.description && (
                      <p className={`px-4 pb-3 text-xs text-white/40`}>{lk.description}</p>
                    )}
                  </div>
                  </div>
                );
              }

              return (
                <LinkCard
                  key={i}
                  lk={lk}
                  href={href}
                  onClick={() => trackClick(user.username ?? "", lk.url)}
                />
              );
            })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {externalLinks.filter((l) => l.heading && l.url).length === 0 && !hasSocialLinks && (
          <div className={`text-center py-16 text-sm text-white/30`}>
            {isOwner ? (
              <Link href={`/p/${user.username}/edit`} className="text-blue-400 hover:underline">
                Add links to your profile →
              </Link>
            ) : "No links yet."}
          </div>
        )}

        {/* Social links */}
        {hasSocialLinks && (
          <section>
            <h2 className={`text-sm font-medium mb-3 text-white/40`}>Social links</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(socialLinks).filter(([, v]) => v).map(([key, url]) => (
                <div
                  key={key}
                  style={{ padding: "1px", borderRadius: "13px", background: "linear-gradient(to bottom, #323334, #292A2A)" }}
                >
                  <a href={normalizeUrl(url)} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center justify-center text-white`}
                    style={{ width: "52px", height: "52px", borderRadius: "12px", background: "linear-gradient(to bottom, rgba(206,210,215,0.2), rgba(96,100,105,0.2)), #000000" }}
                    title={key}>
                    {SOCIAL_ICONS[key] ?? <span className="text-xs font-bold">{key[0].toUpperCase()}</span>}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        <Link href="/" className={`text-xs transition font-medium tracking-wide text-white/20 hover:text-white/50`}>
          MagikCard
        </Link>
      </div>
    </div>
  );
}

