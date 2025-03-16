"use client";

import type React from "react";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

// Theme definitions
const themes = {
  minimal: {
    name: "Minimal",
    cardBg: "from-slate-50 to-slate-100",
    textColor: "text-slate-700",
    secondaryText: "text-slate-500",
    stripColor: "bg-slate-800",
    formBg: "bg-slate-50",
    buttonBg: "bg-slate-800 hover:bg-slate-700",
    buttonText: "text-white",
    accent: "border-slate-300",
    logo: "X",
    imageFront: "/images-f.png",
    imageBack: "/image-b.png",
  },
  dark: {
    name: "Dark",
    cardBg: "from-gray-900 to-gray-800",
    textColor: "text-gray-100",
    secondaryText: "text-gray-400",
    stripColor: "bg-gray-700",
    formBg: "bg-gray-800",
    buttonBg: "bg-gray-700 hover:bg-gray-600",
    buttonText: "text-white",
    accent: "border-gray-600",
    logo: "Z",
  },
  gradient: {
    name: "Gradient",
    cardBg: "from-blue-500 to-purple-600",
    textColor: "text-purple-400",
    secondaryText: "text-blue-100",
    stripColor: "bg-blue-900",
    formBg: "bg-blue-50",
    buttonBg: "bg-blue-600 hover:bg-blue-500",
    buttonText: "text-white",
    accent: "border-blue-300",
    logo: "N",
  },
  gold: {
    name: "Gold",
    cardBg: "from-yellow-600 to-yellow-500",
    textColor: "text-yellow-900",
    secondaryText: "text-yellow-800",
    stripColor: "bg-yellow-900",
    formBg: "bg-yellow-50",
    buttonBg: "bg-yellow-700 hover:bg-yellow-600",
    buttonText: "text-white",
    accent: "border-yellow-400",
    logo: "G",
  },
};

type ThemeKey = keyof typeof themes;

export default function FlippableCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("minimal");
  const [formData, setFormData] = useState({
    magikLink: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
  });

  const theme = themes[selectedTheme];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleThemeChange = (theme: ThemeKey) => {
    setSelectedTheme(theme);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Form submitted with ${selectedTheme} theme!\n${JSON.stringify(
        formData,
        null,
        2
      )}`
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 md:flex-row md:items-center md:gap-y-8 lg:gap-16 w-full">
      <div className="mb-8 w-full max-w-md md:mb-0 md:w-1/2">
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-800">
          Select Theme
        </h2>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(Object.keys(themes) as ThemeKey[]).map((themeKey) => (
            <div
              key={themeKey}
              className={`relative cursor-pointer p-1 transition-all rounded-xl ${
                selectedTheme === themeKey
                  ? "ring-2 ring-offset-2 ring-blue-500"
                  : ""
              }`}
              onClick={() => handleThemeChange(themeKey)}
            >
              <div
                className={`h-16 rounded-xl bg-gradient-to-br ${themes[themeKey].cardBg} p-2`}
              >
                <div className="flex h-full items-center justify-center">
                  {/* <span
                    className={`text-xl font-thin ${themes[themeKey].textColor}`}
                  >
                    {themes[themeKey].logo}
                  </span> */}
                  <span className={`text-xs ${themes[themeKey].secondaryText}`}>
                    {themes[themeKey].name}
                  </span>
                </div>
              </div>
              {selectedTheme === themeKey && (
                <div className="absolute -right-1 -top-1 rounded-full bg-blue-500 p-1 text-white">
                  <Check size={12} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          className="relative mx-auto  h-96 w-56 cursor-pointer perspective-1000"
          onClick={handleFlip}
        >
          <motion.div
            className="relative h-full w-full transform-style-3d transition-all duration-500"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {/* Front of card */}
            <div
              className={`absolute h-full w-full backface-hidden rounded-2xl p-6 shadow-xl bg-[url('https://cdn.dribbble.com/userupload/31045538/file/original-8d14a5a770488ae7772f6411fb6078e8.png')] bg-cover bg-center`}
            ></div>

            {/* Back of card */}
            <div
              className={`absolute h-full w-full rotate-x-180 backface-hidden overflow-hidden rounded-2xl bg-[url('https://cdn.dribbble.com/userupload/9815792/file/original-014a755d8c0071e6a15337305a3ef24d.png')] bg-cover bg-center shadow-xl`}
            ></div>
          </motion.div>
        </div>
      </div>

      {/* Form */}
      <div className="w-full max-w-md md:w-1/2">
        <div
          className={`rounded-xl ${theme.formBg} p-6 shadow-lg transition-colors duration-300`}
        >
          <h2 className={`mb-6 text-xl font-bold ${theme.textColor}`}>
            Set Your Magik Link
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="magikLink" className={theme.secondaryText}>
                Magik Link
              </Label>
              <Input
                id="magikLink"
                name="magikLink"
                placeholder="https://magikkard.vercel.app/your-link"
                maxLength={16}
                value={formData.magikLink}
                onChange={handleInputChange}
                className={`border-${theme.accent} ${theme.textColor} bg-transparent`}
              />
            </div>

            <Button
              type="submit"
              className={`mt-6 w-full ${theme.buttonBg} ${theme.buttonText}`}
            >
              Save Magik Link
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
