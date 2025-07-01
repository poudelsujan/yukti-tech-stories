
import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  navItems: Array<{ name: string; href: string }>;
}

const MobileNavbar = ({ isOpen, setIsOpen, navItems }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-64 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-lg">Menu</span>
          <button onClick={() => setIsOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="p-4">
          <div className="space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block text-gray-600 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileNavbar;
