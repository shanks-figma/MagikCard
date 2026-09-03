"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import Image from "next/image";
import { motion } from "framer-motion";

type Card = {
  id: string;
  name: string;
  username: string;
  redirect_url: string | null;
  card_front_url: string | null;
  card_back_url: string | null;
};

type View = "grid" | "edit" | "new";

const emptyForm = { name: "", username: "", redirect_url: "", card_front_url: "", card_back_url: "" };

export default function DashboardClient({
  session,
  initialCards,
  initialUsername,
  initialBio,
  initialName,
}: {
  session: Session;
  initialCards: Card[];
  initialUsername: string | null;
  initialBio: string | null;
  initialName: string | null;
}) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [view, setView] = useState<View>("grid");
  const [username, setUsername] = useState(initialUsername ?? "");
  const [bio, setBio] = useState(initialBio ?? "");
  const [profileName, setProfileName] = useState(initialName ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [selected, setSelected] = useState<Card | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isFlipped, setIsFlipped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [frontDimensions, setFrontDimensions] = useState<{ width: number; height: number } | null>(null);
  const [displayMode, setDisplayMode] = useState<"card" | "table">("card");

  useEffect(() => {
    const url = form.card_front_url;
    if (!url) { setFrontDimensions(null); return; }
    const img = new window.Image();
    img.onload = () => setFrontDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = url;
  }, [form.card_front_url]);

  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const openNew = () => {
    setForm(emptyForm);
    setIsFlipped(false);
    setError("");
    setSuccess("");
    setView("new");
  };

  const openEdit = (card: Card) => {
    setSelected(card);
    setForm({
      name: card.name,
      username: card.username,
      redirect_url: card.redirect_url || "",
      card_front_url: card.card_front_url || "",
      card_back_url: card.card_back_url || "",
    });
    setIsFlipped(false);
    setError("");
    setSuccess("");
    setView("edit");
  };

  const handleImageUpload =
    (field: "card_front_url" | "card_back_url") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setForm((f) => ({ ...f, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    };

  const displayUrl = (url: string) => (url.startsWith("data:") ? "Uploaded image" : url);

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed to create");
    } else {
      setCards((c) => [data, ...c]);
      setSuccess("Card created!");
      setTimeout(() => { setSuccess(""); setView("grid"); }, 1200);
    }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/cards/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed to save");
    } else {
      setCards((c) => c.map((card) => (card.id === selected.id ? data : card)));
      setSelected(data);
      setSuccess("Saved!");
      setTimeout(() => setSuccess(""), 2000);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selected || !confirm("Delete this card?")) return;
    setDeleting(true);
    const res = await fetch(`/api/cards/${selected.id}`, { method: "DELETE" });
    if (res.ok) {
      setCards((c) => c.filter((card) => card.id !== selected.id));
      setView("grid");
    } else {
      setError("Failed to delete");
    }
    setDeleting(false);
  };

  const handleCopy = (username: string) => {
    navigator.clipboard.writeText(`${origin}/u/${username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileError("");
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, name: profileName }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setProfileError(data.error || "Failed to save");
    } else {
      setProfileSuccess("Profile saved!");
      setShowProfileEdit(false);
      setTimeout(() => setProfileSuccess(""), 3000);
    }
    setProfileSaving(false);
  };

  // ─── Card grid ───────────────────────────────────────────────────────────
  if (view === "grid") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Nav session={session} username={username} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* Profile quick-access banner */}
          {username && (
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-3.5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(profileName || username)[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{profileName || username}</p>
                  <p className="text-xs text-slate-400">/p/{username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/p/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-slate-600"
                >
                  View
                </a>
                <a
                  href={`/p/${username}/edit`}
                  className="text-xs px-3 py-1.5 bg-black text-white rounded-lg hover:bg-slate-800 transition font-medium"
                >
                  Edit profile
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">My Cards</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {cards.length} card{cards.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setDisplayMode("card")}
                  className={`px-3 py-2 text-sm font-medium transition ${displayMode === "card" ? "bg-black text-white" : "text-slate-500 hover:bg-slate-50"}`}
                  title="Card view"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
                    <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
                  </svg>
                </button>
                <button
                  onClick={() => setDisplayMode("table")}
                  className={`px-3 py-2 text-sm font-medium transition ${displayMode === "table" ? "bg-black text-white" : "text-slate-500 hover:bg-slate-50"}`}
                  title="Table view"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <rect x="1" y="2" width="14" height="2" rx="1"/><rect x="1" y="7" width="14" height="2" rx="1"/>
                    <rect x="1" y="12" width="14" height="2" rx="1"/>
                  </svg>
                </button>
              </div>
              <button
                onClick={openNew}
                className="flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition"
              >
                <span className="text-lg leading-none">+</span> New Card
              </button>
            </div>
          </div>

          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-2xl">
                🪄
              </div>
              <p className="text-slate-600 font-medium">No cards yet</p>
              <p className="text-slate-400 text-sm mt-1">Create your first card to get started</p>
              <button
                onClick={openNew}
                className="mt-6 px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition"
              >
                Create Card
              </button>
            </div>
          ) : displayMode === "card" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition cursor-pointer group"
                  onClick={() => openEdit(card)}
                >
                  <div className="relative w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center min-h-[60px]">
                    {card.card_front_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.card_front_url} alt={card.name} className="w-full h-auto block" />
                    ) : (
                      <span className="text-slate-300 text-sm py-8">No image</span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-slate-800 truncate">{card.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">/u/{card.username}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <code className="flex-1 text-xs bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-slate-500 truncate">
                        {origin}/u/{card.username}
                      </code>
                      <button
                        className="shrink-0 text-xs px-2 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-slate-600"
                        onClick={(e) => { e.stopPropagation(); handleCopy(card.username); }}
                      >
                        {copied ? "✓" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── Table view ── */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 font-medium text-slate-500 w-10">#</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-500">Name</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-500">Slug</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-500 hidden md:table-cell">Redirect URL</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-500 hidden sm:table-cell">Public Link</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-500 hidden lg:table-cell">Images</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card, i) => (
                    <tr
                      key={card.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition"
                      onClick={() => openEdit(card)}
                    >
                      <td className="px-5 py-3.5 text-slate-300 font-mono text-xs">{i + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {card.card_front_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={card.card_front_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-100" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 shrink-0" />
                          )}
                          <span className="font-medium text-slate-800 truncate max-w-[140px]">{card.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">/u/{card.username}</code>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-slate-500 max-w-[200px] truncate">
                        {card.redirect_url || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-slate-500 truncate max-w-[160px]">{origin}/u/{card.username}</code>
                          <button
                            className="shrink-0 text-xs px-2 py-1 border border-slate-200 rounded-md hover:bg-slate-100 transition text-slate-600"
                            onClick={(e) => { e.stopPropagation(); handleCopy(card.username); }}
                          >
                            {copied ? "✓" : "Copy"}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span className={card.card_front_url ? "text-green-500" : "text-slate-200"}>● Front</span>
                          <span className={card.card_back_url ? "text-green-500" : "text-slate-200"}>● Back</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 transition text-slate-600"
                          onClick={(e) => { e.stopPropagation(); openEdit(card); }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── New / Edit form ─────────────────────────────────────────────────────
  const isNew = view === "new";
  const previewFront = form.card_front_url;
  const previewBack = form.card_back_url;

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav session={session} username={username} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: preview + link */}
        <div className="flex flex-col gap-6">
          <button
            onClick={() => setView("grid")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-black transition w-fit"
          >
            ← Back to cards
          </button>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {isNew ? "New Card" : form.name || "Edit Card"}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">Click to flip</p>
          </div>

          {/* 3D card */}
          <div
            className="relative mx-auto w-full max-w-sm cursor-pointer select-none"
            style={{
              perspective: "1000px",
              aspectRatio: frontDimensions
                ? `${frontDimensions.width} / ${frontDimensions.height}`
                : "1.586 / 1",
            }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              className="relative w-full h-full"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
            >
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                {previewFront ? (
                  <Image src={previewFront} alt="Front" fill className="object-cover" unoptimized />
                ) : (
                  <p className="text-slate-400 text-sm">Front of card</p>
                )}
              </div>
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {previewBack ? (
                  <Image src={previewBack} alt="Back" fill className="object-cover" unoptimized />
                ) : (
                  <p className="text-slate-400 text-sm">Back of card</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Public link */}
          {form.username && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                Public link
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-slate-700 truncate">
                  {origin}/u/{form.username}
                </code>
                <button
                  onClick={() => handleCopy(form.username)}
                  className="shrink-0 text-sm px-3 py-2 bg-black text-white rounded-lg hover:bg-slate-800 transition"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5 h-fit">
          <h2 className="text-lg font-semibold text-slate-800">Card Details</h2>

          <Field label="Card Name" hint="A label to identify this card">
            <input
              type="text"
              placeholder="Work Card"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </Field>

          <Field label="Username" hint={`Public URL: /u/${form.username || "your-username"}`}>
            <input
              type="text"
              placeholder="work-card"
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  username: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                }))
              }
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </Field>

          <Field label="Redirect URL" hint="Where people go when they tap this card">
            <input
              type="url"
              placeholder="https://yoursite.com"
              value={form.redirect_url}
              onChange={(e) => setForm((f) => ({ ...f, redirect_url: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </Field>

          <ImageField
            label="Card Front"
            value={form.card_front_url}
            onChange={(v) => setForm((f) => ({ ...f, card_front_url: v }))}
            onUpload={handleImageUpload("card_front_url")}
            displayUrl={displayUrl}
          />

          <ImageField
            label="Card Back"
            value={form.card_back_url}
            onChange={(v) => setForm((f) => ({ ...f, card_back_url: v }))}
            onUpload={handleImageUpload("card_back_url")}
            displayUrl={displayUrl}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <div className="flex gap-3 pt-1">
            {!isNew && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 h-11 text-sm font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 transition"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
            <button
              onClick={isNew ? handleCreate : handleUpdate}
              disabled={saving}
              className="flex-1 h-11 bg-black text-white rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : isNew ? "Create Card" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Small reusable components ────────────────────────────────────────────

function Nav({ session, username }: { session: Session; username?: string | null }) {
  return (
    <nav className="border-b bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Image src="/logo.png" alt="logo" width={28} height={28} className="rounded-full" />
        <span className="font-semibold text-slate-800">MagikCard</span>
      </div>
      <div className="flex items-center gap-3">
        {username && (
          <a
            href={`/p/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 hover:text-black border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition hidden sm:flex items-center gap-1.5"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            My Profile
          </a>
        )}
        <span className="text-sm text-slate-400 hidden sm:block">{session.user?.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-slate-600 hover:text-black border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function ImageField({
  label, value, onChange, onUpload, displayUrl,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  displayUrl: (url: string) => string;
}) {
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Paste image URL"
          value={displayUrl(value)}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <label className="shrink-0 h-10 px-3 flex items-center text-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg cursor-pointer transition font-medium">
          Upload
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
        </label>
      </div>
    </Field>
  );
}
