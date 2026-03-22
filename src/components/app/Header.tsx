'use client';
import React from "react";
import Logo from "../base/Logo";
import Navigation from "./dashboard/Navigation";

export default function Header() {
  return (
    <header className="w-full border-b bg-card">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Logo width={180} />
          <Navigation />
        </div>
      </div>
    </header>
  );
}
