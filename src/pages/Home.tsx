
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, Code, ShoppingBag, Users, Star, MessageCircle } from "lucide-react";
import ProductCard from "../components/ProductCard";
import TestimonialCard from "../components/TestimonialCard";
import ServiceCard from "../components/ServiceCard";

const Home = () => {
  const [products, setProducts] = useState<any>({});
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    // Load products
    import('../assets/products.json').then((data) => {
      setProducts(data.default);
    });

    // Load testimonials
    import('../assets/testimonials.json').then((data) => {
      setTestimonials(data.default.testimonials);
    });
  }, []);

  const featuredProducts = Object.values(products).slice(0, 3);

  const services = [
    {
      icon: Globe,
      title: "Import Services",
      description: "We help you import quality products from abroad with full documentation and customs support.",
      features: ["Product sourcing", "Customs clearance", "Quality assurance", "Logistics management"]
    },
    {
      icon: Code,
      title: "Tech Solutions",
      description: "Custom web development, mobile apps, and digital marketing to grow your business online.",
      features: ["Website development", "Mobile applications", "Digital marketing", "E-commerce setup"]
    },
    {
      icon: ShoppingBag,
      title: "Our Products",
      description: "Browse our curated selection of imported tech products available for immediate purchase.",
      features: ["Smart devices", "Electronics", "Tech accessories", "Competitive pricing"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                Empowering Nepali Businesses to 
                <span className="block text-green-200">Import, Sell & Grow</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-2xl">
                Your trusted partner for importing quality products and building digital solutions. 
                From sourcing to selling, we make business growth simple.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/services"
                  className="bg-white hover:bg-gray-100 text-green-700 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center group"
                >
                  Start Importing
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/products"
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all inline-flex items-center justify-center"
                >
                  View Our Shop
                </Link>
                <Link 
                  to="/contact"
                  className="bg-green-800 hover:bg-green-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
                >
                  Get Tech Help
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Nepali business team working together"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              About Yukti Group
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're dedicated to empowering small and mid-sized Nepali businesses through comprehensive 
              import services, cutting-edge technology solutions, and future export opportunities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">500+ Businesses Served</h3>
              <p className="text-gray-600">Helping Nepali entrepreneurs succeed since our inception</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Import Network</h3>
              <p className="text-gray-600">Connecting you to quality suppliers worldwide</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tech Innovation</h3>
              <p className="text-gray-600">Digital solutions tailored for Nepali markets</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive solutions to help your business thrive
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Product Showcase
            </h2>
            <p className="text-xl text-gray-600">
              Quality imported products available for purchase
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/products"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center group"
            >
              View All Products
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">
              Success stories from businesses we've helped grow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.slice(0, 2).map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-700 to-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
            Join hundreds of successful Nepali businesses who trust Yukti Group for their import and tech needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://wa.me/9779800000000"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-green-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              WhatsApp Us
            </a>
            <Link 
              to="/contact"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all inline-flex items-center justify-center"
            >
              Get Free Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
