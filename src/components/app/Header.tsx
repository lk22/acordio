'use client';
import React from "react";
import Logo from "../base/Logo";
import Navigation from "./dashboard/Navigation";

export default function Header() {
  return (
    <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <Logo width={200} />
      <Navigation />
    </header>
  );
}
