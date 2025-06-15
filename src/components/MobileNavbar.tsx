
import React, { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Props {
  user: SupabaseUser | null;
  onSignOut: () => void;
}

const MobileNavbar = ({ user, onSignOut }: Props) => {
  const [open, setOpen] = useState(false);

  // Close menu when a link is clicked
  const handleLinkClick = () => setOpen(false);

  const handleSignOut = () => {
    handleLinkClick();
    onSignOut();
  };

  return (
    <div className="lg:hidden">
      <button
        className="p-2 text-gray-700 hover:text-emerald-600 transition-colors"
        aria-label="Open menu"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>
      
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white z-50 shadow-xl rounded-b-xl border-t border-gray-100 animate-slide-down">
          <nav className="flex flex-col py-6">
            {/* User Profile Section (if logged in) */}
            {user && (
              <div className="px-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.user_metadata?.avatar_url || ''} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {user.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('') || 
                       user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="px-6 py-2 space-y-1">
              <Link 
                to="/" 
                className="block py-3 text-lg font-semibold text-gray-700 hover:text-emerald-600 transition-colors" 
                onClick={handleLinkClick}
              >
                Home
              </Link>
              <Link 
                to="/services" 
                className="block py-3 text-lg font-semibold text-gray-700 hover:text-emerald-600 transition-colors" 
                onClick={handleLinkClick}
              >
                Services
              </Link>
              <Link 
                to="/products" 
                className="block py-3 text-lg font-semibold text-gray-700 hover:text-emerald-600 transition-colors" 
                onClick={handleLinkClick}
              >
                Products
              </Link>
              <Link 
                to="/contact" 
                className="block py-3 text-lg font-semibold text-gray-700 hover:text-emerald-600 transition-colors" 
                onClick={handleLinkClick}
              >
                Contact
              </Link>
            </div>

            {/* Auth Section */}
            <div className="px-6 pt-4 border-t border-gray-100 space-y-3">
              {user ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to="/profile" onClick={handleLinkClick}>
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    asChild
                  >
                    <Link to="/auth" onClick={handleLinkClick}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    asChild
                  >
                    <Link to="/auth" onClick={handleLinkClick}>
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

export default MobileNavbar;
