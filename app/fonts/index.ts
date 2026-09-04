import localFont from "next/font/local";
import { Inter, Onest } from "next/font/google";

export const sfPro = localFont({
  src: "./SF-Pro-Display-Medium.otf",
  variable: "--font-sf",
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  // 500 is the link-card label weight in the Figma source ("Onest:Medium").
  weight: ["500", "600"],
});
