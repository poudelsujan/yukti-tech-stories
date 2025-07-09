
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut, ShoppingBag, UserCircle, Settings, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useCart } from '@/hooks/useCart';
import MobileNavbar from './MobileNavbar';
import CartIcon from './CartIcon';
import CartDrawer from './CartDrawer';
import AdminNotifications from './admin/AdminNotifications';

const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminStatus();
  const { getTotalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const totalItems = getTotalItems();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Services', href: '/services' },
    { name: 'Pre-Order', href: '/preorder' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-primary">
              TechStore
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-600 hover:text-primary transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side - Cart, Notifications and Auth */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Admin Notifications - Only show for admin users */}
            {user && isAdmin && (
              <AdminNotifications />
            )}

            {/* Desktop Cart Icon */}
            <div className="hidden sm:block">
              <CartDrawer>
                <CartIcon onClick={() => {}} />
              </CartDrawer>
            </div>

            {/* Auth Section */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 h-9">
                    <UserCircle className="h-5 w-5" />
                    <span className="hidden sm:inline text-sm font-medium truncate max-w-20">
                      {user.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white">
                  {/* Mobile Cart in Dropdown - moved to top */}
                  <div className="sm:hidden">
                    <CartDrawer>
                      <DropdownMenuItem asChild>
                        <button className="flex items-center gap-2 w-full">
                          <ShoppingCart className="h-4 w-4" />
                          Cart {totalItems > 0 && `(${totalItems})`}
                        </button>
                      </DropdownMenuItem>
                    </CartDrawer>
                    <DropdownMenuSeparator />
                  </div>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 w-full">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center gap-2 w-full">
                      <ShoppingBag className="h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 w-full">
                          <Settings className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="text-sm px-3 py-2 h-9 font-medium">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavbar 
        isOpen={isMenuOpen} 
        setIsOpen={setIsMenuOpen} 
        navItems={navItems}
      />
    </header>
  );
};

export default Header;
