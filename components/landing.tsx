"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowUpRight, Check, QrCode, UserPlus, BarChart3, PlayCircle, RefreshCw,
  Globe2, Rocket, Palette, Briefcase, Video, Users, Plus, X, MousePointerClick, Smartphone,
} from "lucide-react";
import ProfileView from "@/app/p/[username]/profile-view";
import { SOCIAL_ICONS } from "@/app/p/[username]/profile-shared";
import s from "./landing.module.css";
import { CLAIM_KEY } from "@/lib/claim";

// Exact case matters on Vercel's case-sensitive filesystem.
const PHOTO = "/avatars/Shashank000283_gmail_com.png";

const DEMO_USER = {
  name: "Shashank",
  username: "shashank",
  bio: "Designer building next AI tools",
  image: PHOTO,
  cardStyle: "crystal",
  links: [
    { heading: "Portfolio", url: "shanks.framer.website", description: "Selected product design work" },
    { heading: "Designer Interview Checklist", url: "linkedin.com", description: "Crack your next design interview" },
    { heading: "Book a 1:1 call", url: "cal.com", description: "30 min · portfolio reviews" },
  ],
  socialLinks: { linkedin: "linkedin.com", instagram: "instagram.com", twitter: "x.com", email: "hello@example.com" },
};

const PLATFORMS = [
  ["linkedin", "LinkedIn"], ["instagram", "Instagram"], ["twitter", "X"], ["youtube", "YouTube"],
  ["spotify", "Spotify"], ["github", "GitHub"], ["tiktok", "TikTok"], ["behance", "Behance"],
  ["pinterest", "Pinterest"], ["facebook", "Facebook"], ["website", "Your website"], ["email", "Email"],
] as const;

const USE_CASES = [
  { Icon: Rocket, title: "Founders", text: "Your pitch, your calendar and your socials — ready for every investor coffee and demo day." },
  { Icon: Palette, title: "Designers & creatives", text: "Put your portfolio front and centre, so your best work is the first thing people see." },
  { Icon: Briefcase, title: "Job seekers", text: "Resume, LinkedIn and portfolio in one tap. Make recruiters remember your name." },
  { Icon: Video, title: "Creators", text: "Every platform, one link. Embed your latest video or track right on your page." },
  { Icon: Users, title: "Sales & events", text: "Swap details in seconds at the booth, then follow up while you're still top of mind." },
];

const FAQ = [
  ["Is MagikCard free?", "Yes. Creating your card, adding your links and sharing it are free."],
  ["Do the people I meet need an app?", "No. Your card opens in any phone or desktop browser. They don't need an account or an app to view it, save your contact, or scan your QR code."],
  ["How does “Save contact” work?", "One tap downloads your contact card (a standard vCard), ready to add straight to their phone's address book — no retyping your name or email."],
  ["Can I change my card later?", "Anytime. Update your photo, links and details in the editor and your card changes instantly. The link you've shared keeps working unless you change your username."],
  ["Can I see what people click?", "Yes. Your editor shows how many times each of your links has been clicked, so you know what's working."],
  ["What can people see on my profile?", "Only what you add: your name, photo, bio, links and social accounts. Your card is public, so share only the details you're happy for anyone to see."],
];

function ClaimForm({ createUrl, dark = false, id }: { createUrl: string; dark?: boolean; id: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        try { if (name) sessionStorage.setItem(CLAIM_KEY, name); } catch {}
        router.push(createUrl);
      }}
      className={`flex flex-col sm:flex-row gap-2 p-2 rounded-[22px] w-full max-w-[520px] ${dark ? "bg-white/10 ring-1 ring-white/15" : "bg-white ring-1 ring-black/[0.08] shadow-[0_10px_40px_-12px_rgba(0,0,0,0.18)]"}`}
    >
      <label htmlFor={id} className={`flex-1 flex items-center min-w-0 h-12 px-4 rounded-2xl ${dark ? "bg-white/5" : "bg-[#f5f4ef]"}`}>
        <span className={`shrink-0 text-[15px] ${dark ? "text-white/50" : "text-black/45"}`}>magikcard.com/p/</span>
        <input
          id={id}
          value={name}
          onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30))}
          placeholder="yourname"
          autoComplete="off" autoCapitalize="none" spellCheck={false}
          aria-label="Choose your username"
          className={`flex-1 min-w-0 bg-transparent border-0 p-0 outline-none focus:ring-0 text-[15px] font-semibold ${dark ? "text-white placeholder:text-white/30" : "text-black placeholder:text-black/25"}`}
        />
      </label>
      <button type="submit" className={`h-12 px-6 rounded-2xl text-[15px] font-semibold inline-flex items-center justify-center gap-2 transition active:scale-[0.98] ${dark ? "bg-white text-black hover:bg-white/90" : "bg-[#0b0b0c] text-white hover:bg-black/85"}`}>
        Claim your card <ArrowRight size={18} />
      </button>
    </form>
  );
}

function Phone() {
  return (
    <div className="relative w-[316px] h-[640px] rounded-[54px] bg-[#0b0b0c] p-2 shadow-[0_40px_80px_-30px_rgba(20,30,90,0.55)] ring-1 ring-black/10">
      <div className="relative w-[300px] h-[624px] rounded-[46px] overflow-hidden bg-black">
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 w-[92px] h-[26px] rounded-full bg-black" />
        <div className={s.screen} aria-hidden="true">
          <ProfileView user={DEMO_USER} preview />
        </div>
      </div>
    </div>
  );
}

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div className={`absolute z-10 flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur px-4 py-3 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.3)] ring-1 ring-black/5 ${className}`}>
      {children}
    </div>
  );
}

const sectionTitle = "text-[clamp(36px,5.4vw,68px)] font-semibold leading-[0.98] tracking-[-0.045em]";
const eyebrow = "text-[13px] font-semibold uppercase tracking-[0.14em]";

export default function Landing({ signedIn }: { signedIn: boolean }) {
  const createUrl = signedIn ? "/onboarding" : "/join";
  const [qrUrl, setQrUrl] = useState("");
  useEffect(() => setQrUrl(`${window.location.origin}/p/shashank`), []);

  return (
    <div className="bg-[#f5f4ef] text-[#0b0b0c] overflow-x-clip" style={{ fontFamily: "var(--font-onest), system-ui, sans-serif" }}>
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-[#f5f4ef]/80 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto h-16 px-5 flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-[17px] tracking-[-0.02em]">
            <Image src="/logo.png" alt="" width={28} height={28} /> MagikCard
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-[14px] text-black/60" aria-label="Main">
            <a href="#features" className="hover:text-black transition">Features</a>
            <a href="#use-cases" className="hover:text-black transition">Who it&apos;s for</a>
            <a href="#how-it-works" className="hover:text-black transition">How it works</a>
            <a href="#faq" className="hover:text-black transition">FAQ</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href={signedIn ? "/dashboard" : "/join?mode=signin"} className="hidden sm:inline-flex h-10 px-4 items-center text-[14px] font-medium text-black/70 hover:text-black transition">
              {signedIn ? "Dashboard" : "Log in"}
            </Link>
            <Link href={createUrl} className="h-10 px-4 rounded-full bg-[#0b0b0c] text-white text-[14px] font-semibold inline-flex items-center gap-1.5 hover:bg-black/85 transition">
              {signedIn ? "Edit your card" : "Get your card"} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative">
          <div className="absolute inset-0 -z-0 pointer-events-none" aria-hidden="true"
            style={{ background: "radial-gradient(700px 420px at 78% 30%, rgba(45,85,255,0.16), transparent 70%), radial-gradient(500px 360px at 95% 75%, rgba(215,255,61,0.35), transparent 70%)" }} />
          <div className="relative max-w-[1200px] mx-auto px-5 pt-14 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
            <div>
              <span className="inline-flex items-center gap-2 h-8 px-3 rounded-full bg-white ring-1 ring-black/[0.08] text-[13px] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" /> Free to create · No app needed
              </span>
              <h1 className="mt-6 text-[clamp(46px,7.6vw,96px)] font-semibold leading-[0.93] tracking-[-0.055em]">
                The last business card you&apos;ll <span className="relative whitespace-nowrap"><span className="relative z-10">ever need.</span><span className="absolute left-0 right-0 bottom-[0.08em] h-[0.32em] bg-[#d7ff3d] -z-0" aria-hidden="true" /></span>
              </h1>
              <p className="mt-6 max-w-[520px] text-[19px] leading-[1.5] text-black/60">
                MagikCard turns your photo, links and contact details into one beautiful page. Share it with a link or a QR code — and people save you to their phone in a single tap.
              </p>
              <div className="mt-9"><ClaimForm createUrl={createUrl} id="claim-hero" /></div>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-black/55">
                {["Set up in minutes", "Works on every phone", "Update it anytime"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5"><Check size={16} className="text-[#2d55ff]" />{t}</li>
                ))}
              </ul>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <Phone />
                <Chip className={`${s.float} -left-28 top-[330px] hidden sm:flex`}>
                  <span className="w-9 h-9 rounded-full bg-[#22c55e]/15 text-[#16a34a] flex items-center justify-center"><UserPlus size={18} /></span>
                  <span><b className="block text-[14px]">Saved to Contacts</b><span className="text-[12px] text-black/50">Shashank · just now</span></span>
                </Chip>
                <Chip className={`${s.floatSlow} -right-14 top-14 hidden sm:flex`}>
                  <span className="w-9 h-9 rounded-full bg-[#2d55ff]/12 text-[#2d55ff] flex items-center justify-center"><MousePointerClick size={18} /></span>
                  <span><b className="block text-[14px]">Portfolio</b><span className="text-[12px] text-black/50">+24 clicks this week</span></span>
                </Chip>
              </div>
            </div>
          </div>
        </section>

        {/* Platforms marquee */}
        <section className="border-y border-black/[0.06] bg-white/60 py-7" aria-label="Works with the platforms you already use">
          <p className="text-center text-[13px] font-medium text-black/45 mb-5">Bring every part of you into one link</p>
          <div className={`overflow-hidden ${s.marqueeMask}`}>
            <div className={s.marquee}>
              {[0, 1].map((dup) => (
                <ul key={dup} className="flex items-center gap-12 pr-12" aria-hidden={dup === 1}>
                  {PLATFORMS.map(([key, label]) => (
                    <li key={key} className="flex items-center gap-2.5 text-black/55 whitespace-nowrap text-[15px] font-medium [&_svg]:w-5 [&_svg]:h-5">
                      {SOCIAL_ICONS[key]}{label}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>

        {/* Problem / before-after */}
        <section className="bg-[#0b0b0c] text-white">
          <div className="max-w-[1200px] mx-auto px-5 py-24 lg:py-32">
            <p className={`${eyebrow} text-[#d7ff3d]`}>The problem</p>
            <h2 className={`${sectionTitle} mt-5 max-w-[900px]`}>
              Paper cards end up in a drawer. <span className="text-white/40">Your first impression deserves better.</span>
            </h2>
            <div className="mt-16 grid md:grid-cols-2 gap-4">
              <div className="rounded-[28px] bg-white/[0.04] ring-1 ring-white/10 p-8">
                <p className="text-[14px] font-semibold text-white/40 uppercase tracking-[0.12em]">Without MagikCard</p>
                <ul className="mt-6 space-y-4">
                  {["“How do you spell your email again?”", "“What's your Instagram? I'll find you later.”", "“I'll send you my portfolio when I'm home.”", "“Sorry, I ran out of cards.”"].map((q) => (
                    <li key={q} className="flex gap-3 text-[18px] text-white/60"><X size={20} className="shrink-0 mt-1 text-[#ff6b6b]" />{q}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[28px] bg-[#2d55ff] p-8 relative overflow-hidden">
                <p className="text-[14px] font-semibold text-white/70 uppercase tracking-[0.12em]">With MagikCard</p>
                <ul className="mt-6 space-y-4">
                  {["They scan your QR code.", "Your contact lands in their phone.", "Your work, socials and calendar are one tap away.", "You never run out. Ever."].map((q) => (
                    <li key={q} className="flex gap-3 text-[18px] font-medium"><Check size={20} className="shrink-0 mt-1 text-[#d7ff3d]" />{q}</li>
                  ))}
                </ul>
                <QrCode size={180} strokeWidth={1} className="absolute -right-8 -bottom-8 text-white/10" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        {/* Features bento */}
        <section id="features" className="scroll-mt-20">
          <div className="max-w-[1200px] mx-auto px-5 py-24 lg:py-32">
            <div className="max-w-[720px]">
              <p className={`${eyebrow} text-[#2d55ff]`}>Features</p>
              <h2 className={`${sectionTitle} mt-5`}>Everything a business card does. Plus everything it can&apos;t.</h2>
            </div>

            <div className="mt-14 grid md:grid-cols-6 gap-4">
              {/* Save contact */}
              <article className="md:col-span-4 rounded-[28px] bg-white ring-1 ring-black/[0.06] p-8 flex flex-col md:flex-row gap-8 items-center overflow-hidden">
                <div className="flex-1">
                  <UserPlus className="text-[#2d55ff]" size={28} />
                  <h3 className="mt-5 text-[28px] font-semibold tracking-[-0.03em] leading-tight">Saved in one tap</h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-black/55">No more typing names into phones. People tap “Save contact” and you&apos;re in their address book — name, photo, email and links included.</p>
                </div>
                <div className="w-[250px] shrink-0 rounded-[26px] bg-[#f5f4ef] p-5 ring-1 ring-black/5">
                  <div className="flex flex-col items-center text-center">
                    <Image src={PHOTO} alt="" width={64} height={64} className="rounded-full bg-white object-cover" />
                    <p className="mt-3 font-semibold text-[17px]">Shashank</p>
                    <p className="text-[12px] text-black/45">Designer building next AI tools</p>
                  </div>
                  <div className="mt-4 rounded-xl bg-white divide-y divide-black/5 text-[13px]">
                    <p className="px-3 py-2.5 flex justify-between"><span className="text-black/45">email</span><span>hello@…</span></p>
                    <p className="px-3 py-2.5 flex justify-between"><span className="text-black/45">website</span><span>shanks.framer…</span></p>
                  </div>
                  <p className="mt-3 h-10 rounded-xl bg-[#0b0b0c] text-white text-[13px] font-semibold flex items-center justify-center">Add to Contacts</p>
                </div>
              </article>

              {/* QR */}
              <article className="md:col-span-2 rounded-[28px] bg-[#d7ff3d] p-8 flex flex-col">
                <QrCode size={28} />
                <h3 className="mt-5 text-[28px] font-semibold tracking-[-0.03em] leading-tight">Scan, don&apos;t swap</h3>
                <p className="mt-3 text-[16px] leading-relaxed text-black/65">Show your QR code in person. It opens your card instantly — no app, no account.</p>
                <div className="mt-auto pt-6 flex justify-center">
                  <div className="w-[132px] h-[132px] rounded-2xl bg-white p-2.5 shadow-sm">
                    {qrUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${encodeURIComponent(qrUrl)}`} alt="QR code that opens a sample MagikCard" className="w-full h-full" />
                    )}
                  </div>
                </div>
              </article>

              {/* Analytics */}
              <article className="md:col-span-2 rounded-[28px] bg-[#0b0b0c] text-white p-8 flex flex-col">
                <BarChart3 size={28} className="text-[#d7ff3d]" />
                <h3 className="mt-5 text-[28px] font-semibold tracking-[-0.03em] leading-tight">Know what works</h3>
                <p className="mt-3 text-[16px] leading-relaxed text-white/55">See how many clicks every link gets, right in your editor.</p>
                <div className="mt-8 space-y-3" aria-hidden="true">
                  {[["Portfolio", 92], ["Book a call", 64], ["LinkedIn", 41]].map(([label, w]) => (
                    <div key={label}>
                      <div className="flex justify-between text-[12px] text-white/60 mb-1.5"><span>{label}</span><span>{w}</span></div>
                      <div className="h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#d7ff3d]" style={{ width: `${w}%` }} /></div>
                    </div>
                  ))}
                </div>
              </article>

              {/* Rich links */}
              <article className="md:col-span-4 rounded-[28px] bg-white ring-1 ring-black/[0.06] p-8 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <PlayCircle size={28} className="text-[#2d55ff]" />
                  <h3 className="mt-5 text-[28px] font-semibold tracking-[-0.03em] leading-tight">Show, don&apos;t just tell</h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-black/55">Feature links with big banners, and play YouTube videos or Spotify tracks right on your card. Your best work, front and centre.</p>
                </div>
                <div className="w-full md:w-[290px] shrink-0 rounded-[20px] bg-[#0b0b0c] p-3" aria-hidden="true">
                  <div className="aspect-[1.55] rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#2d55ff,#8b5cf6 55%,#f472b6)" }}>
                    <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center"><span className="ml-1 border-y-[10px] border-y-transparent border-l-[16px] border-l-black" /></span>
                  </div>
                  <div className="px-1 pt-3 pb-1 flex items-center justify-between text-white">
                    <span><b className="block text-[14px]">My design process, in 5 minutes</b><span className="text-[12px] text-white/45">youtube.com</span></span>
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </article>

              {/* Small features */}
              {[
                { Icon: RefreshCw, title: "Always up to date", text: "Update your job, links or photo anytime — without handing out a new card." },
                { Icon: Smartphone, title: "Made for phones", text: "Designed to look great on the screen people actually use to meet you." },
                { Icon: Globe2, title: "Everywhere you are", text: "Put it in your bio, email signature, slides or conference badge." },
              ].map(({ Icon, title, text }) => (
                <article key={title} className="md:col-span-2 rounded-[28px] bg-white ring-1 ring-black/[0.06] p-8">
                  <Icon size={26} className="text-[#2d55ff]" />
                  <h3 className="mt-5 text-[21px] font-semibold tracking-[-0.02em]">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-black/55">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section id="use-cases" className="scroll-mt-20 bg-white border-y border-black/[0.06]">
          <div className="max-w-[1200px] mx-auto px-5 py-24 lg:py-32">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-[640px]">
                <p className={`${eyebrow} text-[#2d55ff]`}>Who it&apos;s for</p>
                <h2 className={`${sectionTitle} mt-5`}>Made for people who meet people.</h2>
              </div>
              <Link href={createUrl} className="inline-flex items-center gap-1.5 text-[15px] font-semibold hover:gap-2.5 transition-all">Start for free <ArrowRight size={18} /></Link>
            </div>
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {USE_CASES.map(({ Icon, title, text }) => (
                <article key={title} className="group rounded-[24px] bg-[#f5f4ef] p-6 hover:bg-[#0b0b0c] hover:text-white transition-colors duration-300">
                  <span className="w-11 h-11 rounded-full bg-white group-hover:bg-white/10 flex items-center justify-center transition-colors"><Icon size={20} /></span>
                  <h3 className="mt-6 text-[19px] font-semibold tracking-[-0.02em]">{title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-black/55 group-hover:text-white/60 transition-colors">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20">
          <div className="max-w-[1200px] mx-auto px-5 py-24 lg:py-32">
            <div className="max-w-[640px]">
              <p className={`${eyebrow} text-[#2d55ff]`}>How it works</p>
              <h2 className={`${sectionTitle} mt-5`}>Live in three steps.</h2>
            </div>
            <ol className="mt-14 grid md:grid-cols-3 gap-4">
              {[
                ["01", "Claim your name", "Pick your username and get your own link: magikcard.com/p/you."],
                ["02", "Add your world", "Photo, bio, links, socials and media. Watch your card update live as you type."],
                ["03", "Share it everywhere", "Send the link, show the QR code, and let people save you in one tap."],
              ].map(([n, title, text]) => (
                <li key={n} className="rounded-[28px] ring-1 ring-black/[0.08] p-8 bg-white/50">
                  <span className="text-[56px] font-semibold tracking-[-0.06em] leading-none text-[#2d55ff]">{n}</span>
                  <h3 className="mt-8 text-[24px] font-semibold tracking-[-0.03em]">{title}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-black/55">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-t border-black/[0.06]">
          <div className="max-w-[1200px] mx-auto px-5 py-24 lg:py-32 grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
            <div>
              <p className={`${eyebrow} text-[#2d55ff]`}>FAQ</p>
              <h2 className={`${sectionTitle} mt-5`}>Questions, answered.</h2>
            </div>
            <div className="divide-y divide-black/10 border-y border-black/10">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group py-6">
                  <summary className="flex items-center justify-between gap-6 cursor-pointer list-none text-[19px] font-semibold tracking-[-0.02em] [&::-webkit-details-marker]:hidden">
                    {q}
                    <Plus size={22} className="shrink-0 transition-transform duration-300 group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 pr-10 text-[16px] leading-relaxed text-black/55">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-5 pb-24">
          <div className="relative max-w-[1200px] mx-auto rounded-[40px] bg-[#2d55ff] text-white overflow-hidden px-6 py-20 md:py-28 flex flex-col items-center text-center">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
              style={{ background: "radial-gradient(600px 300px at 15% 0%, rgba(215,255,61,0.35), transparent 70%), radial-gradient(500px 300px at 100% 100%, rgba(11,11,12,0.35), transparent 70%)" }} />
            <h2 className="relative text-[clamp(40px,6.4vw,84px)] font-semibold leading-[0.95] tracking-[-0.05em] max-w-[900px]">
              Your next introduction starts here.
            </h2>
            <p className="relative mt-6 text-[18px] text-white/75 max-w-[520px]">Claim your name before someone else does. It&apos;s free, and it takes minutes.</p>
            <div className="relative mt-10 w-full flex justify-center"><ClaimForm createUrl={createUrl} dark id="claim-footer" /></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[14px] text-black/50">
          <Link href="/" className="flex items-center gap-2 font-semibold text-black"><Image src="/logo.png" alt="" width={22} height={22} /> MagikCard</Link>
          <p>The business card for the internet.</p>
          <Link href={signedIn ? "/dashboard" : "/join?mode=signin"} className="hover:text-black transition">{signedIn ? "Dashboard" : "Log in"}</Link>
        </div>
      </footer>
    </div>
  );
}
