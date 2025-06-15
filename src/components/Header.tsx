
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import MobileNavbar from "./MobileNavbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Hide header on some pages (optional)
  if (location.pathname.startsWith("/admin") || location.pathname === "/auth") return null;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
        <Link to="/" className="text-xl font-bold text-emerald-700 tracking-wide mr-8">
          Yukti Group
        </Link>
        
        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8 flex-1">
          <Link 
            to="/" 
            className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 relative group"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full"></span>
          </Link>
          <Link 
            to="/services" 
            className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 relative group"
          >
            Services
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full"></span>
          </Link>
          <Link 
            to="/products" 
            className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 relative group"
          >
            Products
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full"></span>
          </Link>
          <Link 
            to="/contact" 
            className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 relative group"
          >
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full"></span>
          </Link>
        </nav>
        
        {/* Desktop Auth */}
        <div className="hidden lg:flex gap-3 ml-auto">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url || ''} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {user.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('') || 
                       user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.user_metadata?.full_name || 'User'}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="outline"
                asChild
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold"
              >
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button
                asChild
                className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
              >
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
        </div>
        
        {/* Mobile hamburger/nav */}
        <div className="ml-auto flex lg:hidden">
          <MobileNavbar user={user} onSignOut={signOut} />
        </div>
      </div>
    </header>
  );
};

export default Header;
