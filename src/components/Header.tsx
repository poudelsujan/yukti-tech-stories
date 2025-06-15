
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MobileNavbar from "./MobileNavbar";
import AuthModal from "./AuthModal";

const Header = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const location = useLocation();

  // Hide header on some pages (optional)
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
        <Link to="/" className="text-xl font-bold text-emerald-700 tracking-wide mr-6">
          Yukti Group
        </Link>
        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6 flex-1">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <Link to="/services" className="hover:text-emerald-600">Services</Link>
          <Link to="/products" className="hover:text-emerald-600">Products</Link>
          <Link to="/contact" className="hover:text-emerald-600">Contact</Link>
        </nav>
        {/* Desktop Auth */}
        <div className="hidden lg:flex gap-2 ml-auto">
          <button
            className="border border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-50"
            onClick={() => {
              setAuthOpen(true);
              setAuthMode("login");
            }}
          >
            Login
          </button>
          <button
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700"
            onClick={() => {
              setAuthOpen(true);
              setAuthMode("signup");
            }}
          >
            Sign Up
          </button>
        </div>
        {/* Mobile hamburger/nav */}
        <div className="ml-auto flex lg:hidden">
          <MobileNavbar
            onAuthOpen={mode => {
              setAuthMode(mode);
              setAuthOpen(true);
            }}
          />
        </div>
      </div>
      {/* Modal */}
      <AuthModal isOpen={authOpen} mode={authMode} onClose={() => setAuthOpen(false)} />
    </header>
  );
};

export default Header;
