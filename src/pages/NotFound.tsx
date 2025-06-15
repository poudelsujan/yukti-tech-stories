
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => window.history.back()} 
            variant="outline" 
            className="w-full"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Go Back
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/'} 
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Home className="mr-2 w-4 h-4" />
            Back to Home
          </Button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? <a href="/contact" className="text-green-600 hover:text-green-700 underline">Contact us</a></p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
