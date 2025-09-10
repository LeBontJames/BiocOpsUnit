"use client";

import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block">
      {/* Menu per desktop */}
      <div className="flex justify-center items-center space-x-8 py-4">
        <a href="#" className="text-white hover:text-gray-300">
          HOME
        </a>
        <a href="#" className="text-white hover:text-gray-300">
          RISULTATI
        </a>
        <a href="#" className="text-white hover:text-gray-300">
          TORNEI
        </a>
        <a href="#" className="text-white hover:text-gray-300">
          PROSSIMAMENTE
        </a>
        <a href="#" className="text-white hover:text-gray-300">
          LIVE
        </a>
      </div>
    </nav>
  );
}
