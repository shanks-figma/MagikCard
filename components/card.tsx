"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function FlippableCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [formData, setFormData] = useState({
    magikLink: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
  });
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const theme = themes.minimal;

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.src =
      "https://res.cloudinary.com/dlmgrochr/image/upload/v1763283241/magikcard-front_bt7ffp.png";
  }, []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
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
    alert(`Form submitted!\n${JSON.stringify(formData, null, 2)}`);
  };

  // Prevent image download
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  useEffect(() => {
    // Prevent common download shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+S, Ctrl+P, Ctrl+Shift+I, F12
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "s" || e.key === "p" || e.key === "i")
      ) {
        e.preventDefault();
        return false;
      }
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
    };

    // Prevent right-click context menu globally on card
    const handleGlobalContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".card-container")) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleGlobalContextMenu);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleGlobalContextMenu);
    };
  }, []);

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 md:flex-row md:items-center md:gap-y-8 lg:gap-16 w-full">
        <div className="mb-8 w-full max-w-md md:mb-0 md:w-1/2">
          <div
            className="relative mx-auto cursor-pointer perspective-1000 card-container select-none no-drag"
            style={
              imageDimensions
                ? {
                    width: "100%",
                    maxWidth: "22.5rem",
                    aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}`,
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                  }
                : { width: "100%", maxWidth: "22.5rem" }
            }
            onClick={handleFlip}
            onContextMenu={handleContextMenu}
            onDragStart={handleDragStart}
          >
            <motion.div
              className="relative h-full w-full transform-style-3d transition-all duration-500"
              initial={false}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              {/* Front of card */}
              <div
                className="absolute h-full w-full backface-hidden rounded-2xl shadow-xl overflow-hidden select-none"
                onContextMenu={handleContextMenu}
                onDragStart={handleDragStart}
                style={
                  {
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    pointerEvents: "auto",
                  } as React.CSSProperties
                }
              >
                {imageDimensions && (
                  <Image
                    src="https://res.cloudinary.com/dlmgrochr/image/upload/v1763283241/magikcard-front_bt7ffp.png"
                    alt="Card front"
                    width={imageDimensions.width}
                    height={imageDimensions.height}
                    className="h-full w-full object-contain select-none pointer-events-none no-drag"
                    quality={100}
                    priority
                    unoptimized
                    draggable={false}
                    onContextMenu={handleContextMenu}
                    onDragStart={handleDragStart}
                    style={
                      {
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        MozUserSelect: "none",
                        msUserSelect: "none",
                        pointerEvents: "none",
                      } as React.CSSProperties
                    }
                  />
                )}
              </div>

              {/* Back of card */}
              <div
                className="absolute h-full w-full rotate-y-180 backface-hidden overflow-hidden rounded-2xl shadow-xl select-none"
                onContextMenu={handleContextMenu}
                onDragStart={handleDragStart}
                style={
                  {
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    pointerEvents: "auto",
                  } as React.CSSProperties
                }
              >
                {imageDimensions && (
                  <Image
                    src="https://res.cloudinary.com/dlmgrochr/image/upload/v1763283242/magikcard-back_biv5na.png"
                    alt="Card back"
                    width={imageDimensions.width}
                    height={imageDimensions.height}
                    className="h-full w-full object-contain select-none pointer-events-none no-drag"
                    quality={100}
                    priority
                    unoptimized
                    draggable={false}
                    onContextMenu={handleContextMenu}
                    onDragStart={handleDragStart}
                    style={
                      {
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        MozUserSelect: "none",
                        msUserSelect: "none",
                        pointerEvents: "none",
                      } as React.CSSProperties
                    }
                  />
                )}
              </div>
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
    </>
  );
}
