'use client';
import React from "react";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { useIsTablet } from "@/hooks/use-is-tablet";

import Logo from "../base/Logo";
import Navigation from "./dashboard/Navigation";

export default function Header() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  return (
    <header className="w-full h-16 text-white flex items-center justify-between px-4 border-b border-b-gray-300">
      <Logo width={250} />
      <Navigation />
    </header>
  );
}