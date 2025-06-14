
import { Search, ShoppingCart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              Yukti Group
            </span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              to="/services" 
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              Services
            </Link>
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              Shop
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/products">
              <Search className="w-6 h-6 text-gray-600 hover:text-green-600 transition-colors cursor-pointer" />
            </Link>
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-green-600 transition-colors cursor-pointer" />
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </div>
            <a 
              href="https://wa.me/9779800000000"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
