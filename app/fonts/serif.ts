import { Newsreader } from "next/font/google";

// Kept out of app/fonts/index.ts so the aura theme's serif never depends on
// the local-only fonts registered there.
export const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});
