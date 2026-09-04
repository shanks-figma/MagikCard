"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";

function extractDominantColor(img: HTMLImageElement): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "122,26,10";
    ctx.drawImage(img, 0, 0, 40, 40);
    const data = ctx.getImageData(0, 0, 40, 40).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 128) continue; // skip transparent
      r += data[i]; g += data[i + 1]; b += data[i + 2];
      count++;
    }
    if (!count) return "122,26,10";
    // Boost saturation by pulling towards dominant channel
    const ar = Math.round(r / count);
    const ag = Math.round(g / count);
    const ab = Math.round(b / count);
    return `${ar},${ag},${ab}`;
  } catch {
    return "122,26,10";
  }
}

function getFavicon(url: string): string {
  try {
    const hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return "";
  }
}

function normalizeUrl(url: string): string {
  if (url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("http")) return url;
  return `https://${url}`;
}

function getYouTubeEmbedUrl(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function getSpotifyEmbedUrl(url: string): string | null {
  const m = url.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0` : null;
}

function trackClick(username: string, linkUrl: string) {
  fetch("/api/link-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, linkUrl: normalizeUrl(linkUrl) }),
  }).catch(() => {});
}

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

type User = {
  name: string | null;
  username: string | null;
  bio: string | null;
  image: string | null;
  links?: { heading: string; url: string; description?: string }[] | null;
  socialLinks?: Record<string, string> | null;
};

const SOCIAL_ICONS: Record<string, JSX.Element> = {
  linkedin: (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  ),
  twitter: (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  github: (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  website: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
    </svg>
  ),
  tiktok: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/></svg>,
  facebook: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  pinterest: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>,
  spotify: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>,
  behance: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.598.41.27.733.62.96 1.05.225.43.34.954.34 1.56 0 .67-.15 1.23-.456 1.68-.304.45-.74.82-1.303 1.109.79.23 1.385.63 1.784 1.194.397.564.6 1.248.6 2.055 0 .66-.13 1.23-.38 1.707-.25.476-.6.87-1.05 1.184-.45.313-.966.548-1.548.697-.58.15-1.19.225-1.83.225H0V4.503h6.938zm-.43 5.237c.525 0 .95-.124 1.274-.37.325-.248.487-.633.487-1.157 0-.29-.054-.534-.16-.727a1.26 1.26 0 00-.434-.46 1.862 1.862 0 00-.64-.24 3.638 3.638 0 00-.77-.077H2.58v3.03h3.928zm.2 5.494c.295 0 .574-.03.835-.09.262-.06.49-.155.684-.284.196-.13.352-.306.467-.528.114-.22.17-.497.17-.826 0-.658-.19-1.133-.57-1.424-.376-.29-.876-.434-1.497-.434H2.58v3.586h4.128zM16.35 4.16h5.81v1.51h-5.81V4.16zm6.524 7.098c0-.718-.1-1.386-.303-2.008a4.592 4.592 0 00-.894-1.61 4.18 4.18 0 00-1.488-1.075c-.598-.264-1.286-.395-2.065-.395-.74 0-1.416.13-2.028.393a4.645 4.645 0 00-1.565 1.076 4.86 4.86 0 00-1.014 1.612 5.634 5.634 0 00-.36 2.013c0 .744.113 1.43.34 2.057.228.628.558 1.166.99 1.614.43.448.958.797 1.578 1.044.62.247 1.322.37 2.104.37.998 0 1.872-.218 2.617-.655.746-.436 1.32-1.13 1.72-2.082h-2.28c-.114.283-.37.543-.765.78-.395.236-.84.354-1.332.354-.69 0-1.258-.192-1.7-.575-.44-.383-.69-.99-.746-1.822h6.19v-.09zm-6.19-.982c.068-.686.3-1.224.69-1.614.39-.39.9-.584 1.53-.584.326 0 .618.055.875.165.257.11.474.262.653.457.178.195.316.43.415.702.1.273.15.565.15.874h-4.31z"/></svg>,
  email: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

function ShareButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs font-medium text-white/40 hover:text-white/70 transition border border-white/10 rounded-full px-3 py-1.5">
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

const ArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M3 13L13 3M13 3H7M13 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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
  const initials = displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  // Dynamic gradient color extracted from profile image
  const [accentRgb, setAccentRgb] = useState("122,26,10");
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const color = extractDominantColor(e.currentTarget);
    setAccentRgb(color);
  }, []);

  const externalLinks = (user.links as { heading: string; url: string; description?: string }[] | null) ?? [];
  const socialLinks = (user.socialLinks as Record<string, string> | null) ?? {};
  const hasSocialLinks = Object.values(socialLinks).some(Boolean);
  const [showQR, setShowQR] = useState(false);

  return (
    <div
      className={`bg-black text-white ${
        preview ? "h-full pointer-events-none select-none" : "min-h-screen"
      }`}
    >
      {/* ── Owner edit bar ── */}
      {isOwner && (
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 bg-black/60 backdrop-blur border-b border-white/10">
          <Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition flex items-center gap-1.5">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Dashboard
          </Link>
          <Link
            href={`/p/${user.username}/edit`}
            className="flex items-center gap-1.5 text-sm font-medium bg-white text-black px-3.5 py-1.5 rounded-full hover:bg-white/90 transition"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Edit profile
          </Link>
        </div>
      )}

      {/* ── Header gradient ── */}
      <div
        className="relative pb-10 pt-14 flex flex-col items-center text-center px-6"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(${accentRgb},0.5) 0%, rgba(${accentRgb},0.15) 50%, #000000 100%)`, transition: "background 0.6s ease" }}
      >
        {/* Avatar */}
        <div className="relative mb-8 overflow-visible">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={displayName} className="w-36 h-36 rounded-[30px] object-cover shadow-xl" crossOrigin="anonymous" onLoad={onImageLoad} />
          ) : (
            <div className="w-36 h-36 rounded-[30px] bg-gradient-to-br from-orange-400 to-red-700 flex items-center justify-center shadow-xl text-3xl font-bold text-white">
              {initials}
            </div>
          )}
          <div className="absolute top-full -mt-2 left-1/2 -translate-x-1/2 min-w-max whitespace-nowrap flex items-center z-10 -rotate-[5deg]"
            style={{ fontFamily: "var(--font-onest), sans-serif", fontSize: "17.31px", fontWeight: 600, color: "#262626", background: "linear-gradient(to bottom, #FFFFFF, #C1C1C1)", borderRadius: "7.88px", gap: "3.94px", paddingTop: "3px", paddingBottom: "3px", paddingLeft: "3px", paddingRight: "6px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/at.svg" alt="@" className="w-auto h-full" />
            {user.username}
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-white">{displayName}</h1>
        {user.bio && (
          <p className="mt-2 text-sm text-white/60 max-w-xs leading-relaxed">{user.bio}</p>
        )}
      </div>

      {/* ── Content ── */}
      <div className="max-w-sm mx-auto px-5 pb-16 space-y-8 pt-8">

        {/* Share + QR */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-white/40 hover:text-white/70 transition border border-white/10 rounded-full px-3 py-1.5"
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="3" height="3" rx="0.5" fill="currentColor"/><rect x="19" y="14" width="2" height="2" rx="0.5" fill="currentColor"/><rect x="14" y="19" width="2" height="2" rx="0.5" fill="currentColor"/><rect x="18" y="18" width="3" height="3" rx="0.5" fill="currentColor"/></svg>
            QR
          </button>
          <ShareButton username={user.username ?? ""} />
        </div>
        {showQR && <QRModal username={user.username ?? ""} onClose={() => setShowQR(false)} />}

        {/* Links */}
        {externalLinks.filter((l) => l.heading && l.url).length > 0 && (
          <section className="space-y-3">
            {externalLinks.filter((l) => l.heading && l.url).map((lk, i) => {
              const href = normalizeUrl(lk.url);
              const ytEmbed = getYouTubeEmbedUrl(lk.url);
              const spEmbed = getSpotifyEmbedUrl(lk.url);
              const isFeatured = i === 0;

              if (ytEmbed) {
                return (
                  <div key={i} className="rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.04]">
                    <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" className="text-red-500 shrink-0"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      <p className="text-sm font-semibold text-white flex-1 truncate">{lk.heading}</p>
                      <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(user.username ?? "", lk.url)} className="text-white/30 hover:text-white/70 transition shrink-0">
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
                      <p className="px-4 pb-3 pt-1 text-xs text-white/40">{lk.description}</p>
                    )}
                  </div>
                );
              }

              if (spEmbed) {
                const isTrack = lk.url.includes("/track/");
                return (
                  <div key={i} className="rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.04]">
                    <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" className="text-green-500 shrink-0"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                      <p className="text-sm font-semibold text-white flex-1 truncate">{lk.heading}</p>
                      <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(user.username ?? "", lk.url)} className="text-white/30 hover:text-white/70 transition shrink-0">
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
                      <p className="px-4 pb-3 text-xs text-white/40">{lk.description}</p>
                    )}
                  </div>
                );
              }

              // Regular link card
              if (isFeatured) {
                return (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                    onClick={() => trackClick(user.username ?? "", lk.url)}
                    className="flex items-center gap-4 bg-white/[0.07] hover:bg-white/[0.10] border border-white/[0.08] rounded-2xl px-4 py-4 transition group w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getFavicon(lk.url)} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 bg-white/10"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-white truncate">{lk.heading}</p>
                      {lk.description && (
                        <p className="text-xs text-white/50 mt-0.5 truncate">{lk.description}</p>
                      )}
                    </div>
                    <ArrowIcon />
                  </a>
                );
              }

              return (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackClick(user.username ?? "", lk.url)}
                  className="flex items-center gap-3 bg-white/[0.07] hover:bg-white/[0.10] border border-white/[0.08] rounded-2xl px-4 py-3.5 transition group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getFavicon(lk.url)} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 bg-white/10"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">{lk.heading}</p>
                    {lk.description && (
                      <p className="text-xs text-white/40 mt-0.5 truncate">{lk.description}</p>
                    )}
                  </div>
                  <ArrowIcon />
                </a>
              );
            })}
          </section>
        )}

        {/* Empty state */}
        {externalLinks.filter((l) => l.heading && l.url).length === 0 && !hasSocialLinks && (
          <div className="text-center py-16 text-white/30 text-sm">
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
            <h2 className="text-sm font-medium text-white/40 mb-3">Social links</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(socialLinks).filter(([, v]) => v).map(([key, url]) => (
                <div key={key} style={{ padding: "1px", borderRadius: "13px", background: "linear-gradient(to bottom, #323334, #292A2A)" }}>
                  <a href={normalizeUrl(url)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center text-white"
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
        <Link href="/" className="text-xs text-white/20 hover:text-white/50 transition font-medium tracking-wide">
          MagikCard
        </Link>
      </div>
    </div>
  );
}

