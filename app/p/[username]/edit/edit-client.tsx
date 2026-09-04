"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileView from "../profile-view";

const SOCIAL_PLATFORMS = [
  { key: "linkedin",  label: "LinkedIn",  placeholder: "linkedin.com/in/yourhandle", color: "#0A66C2" },
  { key: "instagram", label: "Instagram", placeholder: "instagram.com/yourhandle",   color: "#E1306C" },
  { key: "twitter",   label: "Twitter / X", placeholder: "x.com/yourhandle",         color: "#1DA1F2" },
  { key: "github",    label: "GitHub",    placeholder: "github.com/yourhandle",       color: "#ffffff" },
  { key: "youtube",   label: "YouTube",   placeholder: "youtube.com/@yourchannel",    color: "#FF0000" },
  { key: "website",   label: "Website",   placeholder: "yourwebsite.com",             color: "#7C3AED" },
  { key: "tiktok",    label: "TikTok",    placeholder: "tiktok.com/@yourhandle",      color: "#000000" },
  { key: "facebook",  label: "Facebook",  placeholder: "facebook.com/yourprofile",    color: "#1877F2" },
  { key: "pinterest", label: "Pinterest", placeholder: "pinterest.com/yourprofile",   color: "#E60023" },
  { key: "spotify",   label: "Spotify",   placeholder: "open.spotify.com/artist/...", color: "#1DB954" },
  { key: "behance",   label: "Behance",   placeholder: "behance.net/yourprofile",     color: "#1769FF" },
  { key: "email",     label: "Email",     placeholder: "mailto:you@example.com",      color: "#ffffff" },
];

const SOCIAL_ICONS: Record<string, JSX.Element> = {
  linkedin: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
  instagram: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>,
  twitter: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  github: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>,
  youtube: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  website: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>,
  tiktok: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/></svg>,
  facebook: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  pinterest: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>,
  spotify: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>,
  behance: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.598.41.27.733.62.96 1.05.225.43.34.954.34 1.56 0 .67-.15 1.23-.456 1.68-.304.45-.74.82-1.303 1.109.79.23 1.385.63 1.784 1.194.397.564.6 1.248.6 2.055 0 .66-.13 1.23-.38 1.707-.25.476-.6.87-1.05 1.184-.45.313-.966.548-1.548.697-.58.15-1.19.225-1.83.225H0V4.503h6.938zm-.43 5.237c.525 0 .95-.124 1.274-.37.325-.248.487-.633.487-1.157 0-.29-.054-.534-.16-.727a1.26 1.26 0 00-.434-.46 1.862 1.862 0 00-.64-.24 3.638 3.638 0 00-.77-.077H2.58v3.03h3.928zm.2 5.494c.295 0 .574-.03.835-.09.262-.06.49-.155.684-.284.196-.13.352-.306.467-.528.114-.22.17-.497.17-.826 0-.658-.19-1.133-.57-1.424-.376-.29-.876-.434-1.497-.434H2.58v3.586h4.128zM16.35 4.16h5.81v1.51h-5.81V4.16zm6.524 7.098c0-.718-.1-1.386-.303-2.008a4.592 4.592 0 00-.894-1.61 4.18 4.18 0 00-1.488-1.075c-.598-.264-1.286-.395-2.065-.395-.74 0-1.416.13-2.028.393a4.645 4.645 0 00-1.565 1.076 4.86 4.86 0 00-1.014 1.612 5.634 5.634 0 00-.36 2.013c0 .744.113 1.43.34 2.057.228.628.558 1.166.99 1.614.43.448.958.797 1.578 1.044.62.247 1.322.37 2.104.37.998 0 1.872-.218 2.617-.655.746-.436 1.32-1.13 1.72-2.082h-2.28c-.114.283-.37.543-.765.78-.395.236-.84.354-1.332.354-.69 0-1.258-.192-1.7-.575-.44-.383-.69-.99-.746-1.822h6.19v-.09zm-6.19-.982c.068-.686.3-1.224.69-1.614.39-.39.9-.584 1.53-.584.326 0 .618.055.875.165.257.11.474.262.653.457.178.195.316.43.415.702.1.273.15.565.15.874h-4.31z"/></svg>,
  email: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

function normalizeUrl(url: string): string {
  if (url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("http")) return url;
  return `https://${url}`;
}

type Link = { heading: string; url: string; description?: string };

const inputClass =
  "w-full bg-white/[0.06] text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 border border-white/10 rounded-xl px-3 py-[10px] h-11 transition";

/** Card shell used by every section of the builder. */
function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.07] p-5" style={{ background: "#111" }}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-[15px] font-semibold text-white tracking-[-0.02em]">{title}</h2>
          {description && <p className="text-[12px] text-white/30 mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function EditClient({
  username,
  initialName,
  initialBio,
  initialImage,
  initialLinks,
  initialSocialLinks,
  usernameChangedAt,
}: {
  username: string;
  usernameChangedAt: string | null;
  initialName: string;
  initialBio: string;
  initialImage: string | null;
  initialLinks: Link[];
  initialSocialLinks: Record<string, string>;
}) {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(initialImage);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [usernameVal, setUsernameVal] = useState(username);
  const [bio, setBio] = useState(initialBio);
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(initialSocialLinks);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    fetch(`/api/link-click?username=${username}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => setClickCounts(data as Record<string, number>))
      .catch(() => {});
  }, [username]);

  const totalClicks = Object.values(clickCounts).reduce((sum, n) => sum + n, 0);

  // 30-day lock logic
  const daysLeft = usernameChangedAt
    ? Math.ceil(30 - (Date.now() - new Date(usernameChangedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const usernameLocked = daysLeft > 0;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const fd = new FormData();
    fd.append("avatar", file);
    const res = await fetch("/api/user/avatar", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setImage(data.imageUrl);
    else setError(data.error || "Image upload failed");
    setUploadingImage(false);
  };

  const addLink = () => setLinks((l) => [...l, { heading: "", url: "", description: "" }]);
  const removeLink = (i: number) => setLinks((l) => l.filter((_, idx) => idx !== i));
  const moveLink = (i: number, dir: "up" | "down") => {
    setLinks((l) => {
      const arr = [...l];
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  };
  const updateLink = (i: number, field: "heading" | "url" | "description", val: string) =>
    setLinks((l) => l.map((lk, idx) => (idx === i ? { ...lk, [field]: val } : lk)));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username: usernameVal, bio, links, socialLinks }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Failed to save");
    } else {
      const data = await res.json().catch(() => ({}));
      router.push(`/p/${data.username ?? usernameVal}`);
      router.refresh();
    }
    setSaving(false);
  };

  // What the public page will render, straight from the live form state.
  const previewUser = {
    name,
    username: usernameVal,
    bio,
    image,
    links,
    socialLinks,
  };

  return (
    <div className="min-h-screen w-full" style={{ background: "#0a0a0a" }}>
      {/* ── Header ── */}
      <div
        className="sticky top-0 z-20 border-b border-white/[0.06]"
        style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-[1360px] mx-auto flex items-center gap-3 px-4 sm:px-6 py-3.5">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.14] transition shrink-0"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-[16px] font-semibold text-white tracking-[-0.03em] truncate">Edit Profile</h1>
            <p className="text-[11px] text-white/30 truncate">magikcard.com/p/{usernameVal || "…"}</p>
          </div>

          {/* Mobile edit/preview switch */}
          <div className="xl:hidden flex items-center p-0.5 rounded-full bg-white/[0.07] border border-white/[0.08] shrink-0">
            {(["edit", "preview"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium capitalize transition ${
                  mobileTab === tab ? "bg-white text-black" : "text-white/50 hover:text-white/80"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 h-9 px-4 rounded-full text-[13px] font-semibold bg-white text-black hover:bg-white/90 transition disabled:opacity-50 shrink-0"
          >
            {saving ? (
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : "Save"}
          </button>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-6">
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-6 xl:items-start">

          {/* ═══ LEFT — builder ═══ */}
          <div className={`${mobileTab === "edit" ? "block" : "hidden"} xl:block space-y-5`}>

            {/* ── Basic details ── */}
            <Section title="Basic details" description="Your name, handle and bio.">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative shrink-0">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="Profile" className="w-20 h-20 rounded-[18px] object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-[18px] bg-gradient-to-br from-orange-400 to-red-700 flex items-center justify-center text-2xl font-bold text-white">
                      {(name || usernameVal)[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-white/90 transition disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    ) : (
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                        <path d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 012.828 2.828L11.828 13.828a2 2 0 01-1.414.586H8v-2.414A2 2 0 019 11z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/80">Profile photo</p>
                  <p className="text-[12px] text-white/30 mt-0.5">JPG, PNG, WEBP or GIF.</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="mt-2 text-[12px] font-medium text-white/60 hover:text-white bg-white/[0.07] hover:bg-white/[0.12] px-3 py-1.5 rounded-full transition disabled:opacity-50"
                  >
                    {uploadingImage ? "Uploading…" : image ? "Change photo" : "Upload photo"}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-[13px] text-white/40 mb-1.5 font-medium tracking-[-0.005em]">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className={inputClass}
                  />
                </div>
                {/* Username */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[13px] text-white/40 font-medium tracking-[-0.005em]">Username</label>
                    {usernameLocked && (
                      <span className="text-[11px] text-orange-400/80 flex items-center gap-1">
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        {daysLeft}d left
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">@</span>
                    <input
                      type="text"
                      value={usernameVal}
                      onChange={(e) => setUsernameVal(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                      disabled={usernameLocked}
                      placeholder="your-username"
                      className={`${inputClass} pl-7 ${usernameLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                    />
                  </div>
                  {usernameLocked
                    ? <p className="text-[11px] text-white/30 mt-1.5">Can change again in {daysLeft} day{daysLeft === 1 ? "" : "s"}</p>
                    : <p className="text-[11px] text-white/20 mt-1.5">Lowercase letters, numbers, - and _ only</p>
                  }
                </div>
                {/* Bio */}
                <div className="sm:col-span-2">
                  <label className="block text-[13px] text-white/40 mb-1.5 font-medium tracking-[-0.005em]">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="A short bio..."
                    rows={3}
                    className="w-full bg-white/[0.06] text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 border border-white/10 rounded-xl px-3 py-[10px] resize-none leading-relaxed transition"
                  />
                </div>
              </div>
            </Section>

            {/* ── Social accounts ── */}
            <Section title="Social accounts" description="Shown as icon buttons on your page.">
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-4">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <div key={platform.key}>
                    <label className="flex items-center gap-2 text-[13px] text-white/40 mb-1.5 font-medium tracking-[-0.005em]">
                      <span
                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 [&>svg]:w-3 [&>svg]:h-3"
                        style={{ background: `${platform.color}1f`, color: platform.color }}
                      >
                        {SOCIAL_ICONS[platform.key]}
                      </span>
                      {platform.label}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={socialLinks[platform.key] ?? ""}
                        onChange={(e) => setSocialLinks((s) => ({ ...s, [platform.key]: e.target.value }))}
                        placeholder={platform.placeholder}
                        className={`${inputClass} truncate ${socialLinks[platform.key] ? "pr-9" : ""}`}
                      />
                      {socialLinks[platform.key] && (
                        <button
                          onClick={() => setSocialLinks((s) => { const n = { ...s }; delete n[platform.key]; return n; })}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-red-400 transition"
                          aria-label={`Clear ${platform.label}`}
                        >
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── External links ── */}
            <Section
              title="Links"
              description={totalClicks > 0 ? `${totalClicks} total click${totalClicks === 1 ? "" : "s"} so far.` : "Add the links you want to feature."}
              action={
                <button
                  onClick={addLink}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white bg-white/[0.07] hover:bg-white/[0.12] px-3 py-1.5 rounded-full transition shrink-0"
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Add link
                </button>
              }
            >
              {links.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/[0.1] py-10 text-center text-white/20 text-sm">
                  No links yet — tap Add link
                </div>
              )}

              {links.length > 0 && (
                <div className="space-y-3">
                  {links.map((lk, i) => (
                    <div key={i} className="rounded-2xl border border-white/[0.07] px-4 py-3" style={{ background: "#161616" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-white/30 font-semibold tracking-wide uppercase">Link {i + 1}</span>
                        {lk.url && (clickCounts[normalizeUrl(lk.url)] ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-white/40 bg-white/[0.07] border border-white/[0.08] rounded-full px-2 py-0.5">
                            <svg width="9" height="9" fill="none" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" fill="currentColor"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            {clickCounts[normalizeUrl(lk.url)]}
                          </span>
                        )}
                        <div className="flex items-center gap-1 ml-auto">
                          <button onClick={() => moveLink(i, "up")} disabled={i === 0}
                            className="text-white/20 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition p-0.5">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                          <button onClick={() => moveLink(i, "down")} disabled={i === links.length - 1}
                            className="text-white/20 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition p-0.5">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                        </div>
                        <button onClick={() => removeLink(i)} className="text-white/20 hover:text-red-400 transition">
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={lk.heading}
                          onChange={(e) => updateLink(i, "heading", e.target.value)}
                          placeholder="Label (e.g. Portfolio)"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={lk.url}
                          onChange={(e) => updateLink(i, "url", e.target.value)}
                          placeholder="https://..."
                          className={inputClass}
                        />
                        <input
                          placeholder="Short description (optional)"
                          className={`${inputClass} sm:col-span-2`}
                          value={lk.description ?? ""}
                          onChange={(e) => updateLink(i, "description", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* ═══ RIGHT — live preview ═══ */}
          <div className={`${mobileTab === "preview" ? "block" : "hidden"} xl:block xl:sticky xl:top-[84px]`}>
            <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: "#111" }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-[15px] font-semibold text-white tracking-[-0.02em]">Live preview</h2>
                  <p className="text-[12px] text-white/30 mt-0.5">Updates as you type. Save to publish.</p>
                </div>
                <a
                  href={`/p/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[12px] font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/25 rounded-full px-3 py-1.5 transition shrink-0"
                >
                  Open live
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                    <path d="M3 13L13 3M13 3H7M13 3V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>

              {/* Device frame */}
              <div
                className="mx-auto rounded-[32px] border-[8px] border-[#1c1c1c] overflow-hidden shadow-2xl bg-black"
                style={{ maxWidth: "340px", height: "min(calc(100vh - 220px), 700px)", minHeight: "440px" }}
              >
                <div className="h-full overflow-y-auto overscroll-contain">
                  <ProfileView user={previewUser} preview />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
