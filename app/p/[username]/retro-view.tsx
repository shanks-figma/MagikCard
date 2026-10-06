"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/components/retro.module.css";
import { RetroTitleBar } from "@/components/retro-chrome";
import type { User } from "./profile-view";
import { getFavicon, normalizeUrl, getYouTubeEmbedUrl, trackClick, SOCIAL_ICONS } from "./profile-shared";

// Tile backgrounds cycle through the flat, saturated swatches of a 90s desktop.
const TILES = [
  { bg: "#2fb3a3", fg: "#fff" },
  { bg: "#efefef", fg: "#000" },
  { bg: "#ffffff", fg: "#000" },
  { bg: "#000000", fg: "#fff" },
  { bg: "#000080", fg: "#fff" },
  { bg: "#7cc242", fg: "#fff" },
  { bg: "#efe3c8", fg: "#5a4520" },
];

const MENU = ["File", "Edit", "View", "Options", "Help"];

type Tab = "grid" | "list" | "qr";

const TAB_ICONS: Record<Tab, JSX.Element> = {
  grid: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="#000" aria-hidden="true">
      {[4, 11, 18].flatMap((y) => [4, 11, 18].map((x) => <rect key={`${x}-${y}`} x={x - 1.5} y={y - 1.5} width="3" height="3" />))}
    </svg>
  ),
  list: (
    <svg width="26" height="22" viewBox="0 0 26 22" fill="#000" aria-hidden="true">
      {[4, 11, 18].map((y) => (
        <g key={y}><rect x="1" y={y - 1.5} width="3" height="3" /><rect x="7" y={y - 1} width="18" height="2" /></g>
      ))}
    </svg>
  ),
  qr: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" stroke="#000" strokeWidth="2" /><rect x="14" y="3" width="7" height="7" stroke="#000" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" stroke="#000" strokeWidth="2" /><rect x="14" y="14" width="3" height="3" fill="#000" /><rect x="18" y="18" width="3" height="3" fill="#000" />
    </svg>
  ),
};

function hostOf(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * The "retro" card style: the whole profile drawn as a Windows 95 program
 * window — title bar, menu bar, bevelled buttons, a tab strip, a sunken
 * panel of link tiles, and a taskbar of social links.
 */
export default function RetroView({ user, isOwner, preview }: { user: User; isOwner: boolean; preview: boolean }) {
  const [tab, setTab] = useState<Tab>("grid");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const username = user.username ?? "";
  const displayName = user.name ?? `@${username}`;
  const links = (user.links ?? []).filter((l) => l.heading && l.url);
  const socialMap = user.socialLinks ?? {};
  const socials = Object.entries(socialMap).filter(([, v]) => v);
  const email = socialMap.email?.replace(/^mailto:/i, "");
  const website = socialMap.website;
  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/p/${username}` : `/p/${username}`;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${styles.desktop} ${preview ? "h-full pointer-events-none select-none" : "min-h-screen"}`}>
      {isOwner && (
        <div className={styles.ownerBar}>
          <Link href="/dashboard" className={styles.btn}>Dashboard</Link>
          <Link href={`/p/${username}/edit`} className={styles.btn}>Edit profile</Link>
        </div>
      )}

      <div className={styles.window}>
        <RetroTitleBar title={`${username || "profile"}.exe`} />
        <div className={styles.menubar} aria-hidden="true">
          {MENU.map((m) => <span key={m}><u>{m[0]}</u>{m.slice(1)}</span>)}
        </div>

        <p className={styles.handle}>{username}</p>
        <hr className={styles.rule} />

        <section className={styles.profileRow}>
          <div className={styles.avatar}>
            {user.image && !imageFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={displayName} onError={() => setImageFailed(true)} />
            ) : (
              displayName.replace(/^@/, "")[0]?.toUpperCase()
            )}
          </div>
          <div className={styles.side}>
            <div className={styles.stats}>
              <div><b>{links.length}</b><span>{links.length === 1 ? "link" : "links"}</span></div>
              <div><b>{socials.length}</b><span>{socials.length === 1 ? "social" : "socials"}</span></div>
            </div>
            <div className={styles.actions}>
              {username && <a href={`/api/vcard/${username}`} className={`${styles.btn} ${styles.grow}`}>+ Save contact</a>}
              <div className="relative">
                <button type="button" aria-label="More" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}
                  className={`${styles.btn} ${styles.square} ${menuOpen ? styles.pressed : ""}`}>
                  <svg width="12" height="7" viewBox="0 0 12 7" aria-hidden="true"><path d="M0 0h12L6 7z" fill="#000" /></svg>
                </button>
                {menuOpen && (
                  <div className={styles.menu} role="menu">
                    <button type="button" role="menuitem" onClick={() => { copyLink(); setMenuOpen(false); }}>Copy link</button>
                    <button type="button" role="menuitem" onClick={() => { setTab("qr"); setMenuOpen(false); }}>Show QR code</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className={styles.bio}>
          <b>{displayName}</b>
          {user.bio && <p>{user.bio}</p>}
          {email && <a href={`mailto:${email}`}>{email}</a>}
          {website && <a href={normalizeUrl(website)} target="_blank" rel="noopener noreferrer">{hostOf(website)}</a>}
          {copied && <p role="status">Link copied to clipboard.</p>}
        </div>
        <hr className={styles.rule} />

        <div className={styles.tabs} role="tablist">
          {(["grid", "list", "qr"] as Tab[]).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} aria-label={t === "qr" ? "QR code" : `${t} view`}
              onClick={() => setTab(t)} className={`${styles.btn} ${tab === t ? styles.pressed : ""}`}>
              {TAB_ICONS[t]}
            </button>
          ))}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelBody}>
            {tab === "qr" ? (
              <div className={styles.qr}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(profileUrl)}&margin=4`} alt="QR code for this profile" />
                <span>{profileUrl.replace(/^https?:\/\//, "")}</span>
                <button type="button" className={styles.btn} onClick={copyLink}>{copied ? "Copied!" : "Copy link"}</button>
              </div>
            ) : links.length === 0 ? (
              <p className={styles.empty}>
                {isOwner ? <Link href={`/p/${username}/edit`}>Add links to your profile</Link> : "No links yet."}
              </p>
            ) : tab === "grid" ? (
              <div className={styles.grid}>
                {links.map((lk, i) => {
                  const c = TILES[i % TILES.length];
                  const yt = getYouTubeEmbedUrl(lk.url)?.split("/embed/")[1];
                  const cover = lk.image || (yt ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg` : null);
                  return (
                    <a key={i} href={normalizeUrl(lk.url)} target="_blank" rel="noopener noreferrer" title={lk.heading}
                      onClick={() => trackClick(username, lk.url)} className={styles.tile} style={{ background: c.bg, color: c.fg }}>
                      {cover ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={cover} alt="" className={styles.fill} />
                          <span className="sr-only">{lk.heading}</span>
                        </>
                      ) : (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={getFavicon(lk.url)} alt="" width={40} height={40} className={styles.pixel} />
                          <span className={styles.tileLabel}>{lk.heading}</span>
                        </>
                      )}
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className={styles.list}>
                {links.map((lk, i) => (
                  <a key={i} href={normalizeUrl(lk.url)} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(username, lk.url)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getFavicon(lk.url)} alt="" width={24} height={24} className={styles.pixel} />
                    <span className={styles.listText}>
                      <b>{lk.heading}</b>
                      <span className={styles.muted}>{lk.description || hostOf(lk.url)}</span>
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className={styles.scrollbar} aria-hidden="true">
            <span className={styles.scrollBtn}><svg width="9" height="5" viewBox="0 0 9 5"><path d="M4.5 0L9 5H0z" fill="#000" /></svg></span>
            <span className={styles.scrollThumb} />
            <span className={styles.scrollTrack} />
            <span className={styles.scrollBtn}><svg width="9" height="5" viewBox="0 0 9 5"><path d="M0 0h9L4.5 5z" fill="#000" /></svg></span>
          </div>
        </div>

        {socials.length > 0 && (
          <nav className={styles.taskbar} aria-label="Social links">
            {socials.map(([key, url]) => (
              <a key={key} href={normalizeUrl(url)} target="_blank" rel="noopener noreferrer" title={key} aria-label={key} className={styles.btn}>
                {SOCIAL_ICONS[key] ?? <b>{key[0].toUpperCase()}</b>}
              </a>
            ))}
          </nav>
        )}
      </div>

      <div className={styles.footer}><Link href="/">MagikCard</Link></div>
    </div>
  );
}
