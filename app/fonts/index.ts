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
  // 300/400/500 are the link-card description/label weights in the Figma
  // source ("Onest:Light" / "Onest:Regular" / "Onest:Medium").
  weight: ["300", "400", "500", "600"],
});
