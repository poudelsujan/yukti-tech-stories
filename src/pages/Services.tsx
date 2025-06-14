
import { Globe, Code, ShoppingBag, ArrowRight, CheckCircle, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
  const importServices = [
    "Product sourcing from global suppliers",
    "Quality inspection and verification",
    "Customs clearance and documentation",
    "Logistics and shipping coordination",
    "Market research and product analysis",
    "Compliance with Nepali import regulations"
  ];

  const techServices = [
    "Custom website development",
    "E-commerce platform setup",
    "Mobile app development",
    "Digital marketing strategies",
    "Social media management",
    "SEO and online visibility"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Services
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Comprehensive solutions to help your Nepali business import, digitize, and grow
            </p>
          </div>
        </div>
      </section>

      {/* Import Services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                <Globe className="w-8 h-8 text-green-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Import Services</h2>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                We simplify the complex process of importing products from abroad. From sourcing 
                to delivery, we handle everything so you can focus on growing your business.
              </p>
              <div className="space-y-3">
                {importServices.map((service, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <a 
                  href="https://wa.me/9779800000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
                >
                  <MessageCircle className="mr-2 w-5 h-5" />
                  Start Importing Today
                </a>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Import services - cargo and shipping"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tech Solutions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Tech solutions - web development"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center mb-4">
                <Code className="w-8 h-8 text-green-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Tech Solutions</h2>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                Transform your business with our custom technology solutions. We create digital 
                experiences that connect you with customers and streamline your operations.
              </p>
              <div className="space-y-3">
                {techServices.map((service, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link 
                  to="/contact"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
                >
                  Get Tech Consultation
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Our Product Shop</h2>
            </div>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Browse our curated selection of imported tech products. These are the same quality 
              products we help businesses import, now available for direct purchase.
            </p>
            <Link 
              to="/products"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center"
            >
              Browse Our Shop
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-700 to-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
            Contact us today for a free consultation and discover how we can help you grow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://wa.me/9779800000000"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-green-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              WhatsApp Us Now
            </a>
            <Link 
              to="/contact"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all inline-flex items-center justify-center"
            >
              Schedule Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
