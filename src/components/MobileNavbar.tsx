
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  onAuthOpen: (mode: "login" | "signup") => void;
}

const MobileNavbar = ({ onAuthOpen }: Props) => {
  const [open, setOpen] = useState(false);

  // Close menu when a link is clicked
  const handleLinkClick = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        className="p-2 text-gray-700"
        aria-label="Open menu"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white z-50 shadow-lg rounded-b-lg border-t border-gray-100 animate-slide-down">
          <nav className="flex flex-col items-center py-6 space-y-3">
            <Link to="/" className="text-lg font-semibold" onClick={handleLinkClick}>
              Home
            </Link>
            <Link to="/services" className="text-lg font-semibold" onClick={handleLinkClick}>
              Services
            </Link>
            <Link to="/products" className="text-lg font-semibold" onClick={handleLinkClick}>
              Products
            </Link>
            <Link to="/contact" className="text-lg font-semibold" onClick={handleLinkClick}>
              Contact
            </Link>
            <button
              className="w-full mt-2 text-green-700 font-semibold bg-green-50 hover:bg-green-100 py-2 rounded-lg"
              onClick={() => {
                handleLinkClick();
                onAuthOpen("login");
              }}
            >
              Login
            </button>
            <button
              className="w-full text-emerald-600 font-semibold py-2 hover:bg-emerald-50 rounded-lg"
              onClick={() => {
                handleLinkClick();
                onAuthOpen("signup");
              }}
            >
              Sign Up
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default MobileNavbar;
