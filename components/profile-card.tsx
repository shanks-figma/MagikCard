"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { User } from "lucide-react";
import { resolveCardStyle } from "@/lib/card-styles";
import styles from "./profile-card.module.css";
import retro from "./retro.module.css";
import { RetroTitleBar } from "./retro-chrome";

type OrientationAPI = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export default function ProfileCard({ image, username, name, preview = false, cardStyle, headingLevel = 1 }: {
  image: string | null; username: string; name: string; preview?: boolean; cardStyle?: string | null; headingLevel?: 1 | 2 | 3;
}) {
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3";
  const card = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const reducedMotion = useRef(true);
  const [motion, setMotion] = useState<"off" | "permission" | "on" | "denied">("off");
  const [imageFailed, setImageFailed] = useState(false);
  const reset = useCallback(() => { target.current = { x: 0, y: 0 }; }, []);

  useEffect(() => { setImageFailed(false); }, [image]);

  const isAura = resolveCardStyle(cardStyle) === "aura";
  const isRetro = resolveCardStyle(cardStyle) === "retro";

  useEffect(() => {
    if (preview || isAura || isRetro) return; // flat styles have no tilt
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const configure = () => {
      reducedMotion.current = preference.matches;
      reset();
      const api = window.DeviceOrientationEvent as OrientationAPI | undefined;
      if (preference.matches || !window.isSecureContext || !api) setMotion("off");
      else setMotion(typeof api.requestPermission === "function" ? "permission" : "on");
    };
    configure();
    preference.addEventListener("change", configure);
    let frame = 0;
    let last = 0;
    const current = { x: 0, y: 0 };
    const animate = (time: number) => {
      const blend = 1 - Math.exp(-Math.min(time - last, 64) / 90);
      last = time;
      current.x += (target.current.x - current.x) * blend;
      current.y += (target.current.y - current.y) * blend;
      card.current?.style.setProperty("--tilt-x", `${current.x.toFixed(3)}deg`);
      card.current?.style.setProperty("--tilt-y", `${current.y.toFixed(3)}deg`);
      card.current?.style.setProperty("--reflection-x", `${50 + current.y * 3}%`);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); preference.removeEventListener("change", configure); };
  }, [preview, reset, isAura, isRetro]);

  useEffect(() => {
    if (preview || motion !== "on") return;
    let baseline: { beta: number; gamma: number } | null = null;
    const calibrate = () => { baseline = null; reset(); };
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (reducedMotion.current || document.hidden || event.beta === null || event.gamma === null) return;
      baseline ??= { beta: event.beta, gamma: event.gamma };
      const delta = (value: number, start: number) => ((value - start + 540) % 360) - 180;
      const beta = delta(event.beta, baseline.beta);
      const gamma = delta(event.gamma, baseline.gamma);
      const angle = (window.screen.orientation?.angle ?? 0) * Math.PI / 180;
      const clamp = (value: number) => Math.max(-11, Math.min(11, value * 0.4));
      target.current = {
        x: clamp(-beta * Math.cos(angle) + gamma * Math.sin(angle)),
        y: clamp(gamma * Math.cos(angle) + beta * Math.sin(angle)),
      };
    };
    window.addEventListener("deviceorientation", onOrientation);
    window.addEventListener("orientationchange", calibrate);
    document.addEventListener("visibilitychange", calibrate);
    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("orientationchange", calibrate);
      document.removeEventListener("visibilitychange", calibrate);
    };
  }, [motion, preview, reset]);

  async function enableMotion() {
    try {
      const api = window.DeviceOrientationEvent as OrientationAPI;
      const result = await api.requestPermission?.();
      setMotion(result === "denied" ? "denied" : "on");
    } catch { setMotion("denied"); }
  }

  if (isRetro) {
    return (
      <div className={`${retro.window} ${retro.mini}`} data-testid="profile-tilt-card" data-card-style="retro">
        <RetroTitleBar title={username || name} />
        <div className={retro.miniBody}>
          <div className={retro.avatar}>
            {image && !imageFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name} draggable={false} onError={() => setImageFailed(true)} />
            ) : <User size={48} strokeWidth={1} aria-label={name} />}
          </div>
          <Heading className={retro.miniName}>{name}</Heading>
          <p className={retro.miniHandle}>@{username}</p>
          <span className={retro.btn} aria-hidden="true">+ Save contact</span>
        </div>
      </div>
    );
  }

  if (isAura) {
    return (
      <div className={styles.auraWrapper} data-testid="profile-tilt-card" data-card-style="aura">
        <div className={styles.auraGlow}>
          <div className={styles.auraPhoto}>
            {image && !imageFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name} draggable={false} onError={() => setImageFailed(true)} />
            ) : <User size={64} strokeWidth={1} aria-label={name} />}
          </div>
        </div>
        <Heading className={styles.auraName}>{name}</Heading>
        <p className={styles.auraUsername}>@{username}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.stage}
        onPointerMove={(event) => {
          if (preview || reducedMotion.current || event.pointerType === "touch") return;
          const bounds = event.currentTarget.getBoundingClientRect();
          target.current = {
            x: -((event.clientY - bounds.top) / bounds.height - 0.5) * 16,
            y: ((event.clientX - bounds.left) / bounds.width - 0.5) * 16,
          };
        }} onPointerLeave={reset} onPointerCancel={reset}>
        <div className={`${styles.card} ${styles[resolveCardStyle(cardStyle)] ?? ""}`} data-card-style={resolveCardStyle(cardStyle)} ref={card} data-testid="profile-tilt-card">
          <div className={styles.labelSlot}>
            <div className={styles.label}>
              <Heading className={styles.name}>{name}</Heading>
              <p className={styles.username}>@{username}</p>
            </div>
          </div>
          <div className={styles.imageSlot}>
          <div className={styles.photo}>
            {image && !imageFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name} draggable={false} onError={() => setImageFailed(true)} />
            ) : <User size={88} strokeWidth={1} aria-label={name} />}
          </div>
          </div>
        </div>
      </div>
      {!preview && motion === "permission" && (
        <button className={styles.motionButton} onClick={enableMotion}>Enable tilt</button>
      )}
      {motion === "denied" && <p className={styles.motionNote} role="status">Motion access is off. You can enable it in your browser settings.</p>}
    </div>
  );
}
