
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import TestimonialCard from "../components/TestimonialCard";

const Home = () => {
  const [products, setProducts] = useState<any>({});
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  const featuredProducts = Object.values(products).filter((product: any) => product.trending);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Yukti — Making your life 
              <span className="block text-green-200">easier and efficient</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              Smart technology solutions designed for modern Nepali homes. 
              Transform your daily routine with our innovative products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/products"
                className="bg-white hover:bg-gray-100 text-green-700 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
              >
                Shop Now
              </Link>
              <Link 
                to="/products"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all inline-flex items-center justify-center"
              >
                Offers and Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trending Products
            </h2>
            <p className="text-xl text-gray-600">
              Discover our most popular smart tech solutions
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
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from satisfied Yukti customers across Nepal
            </p>
          </div>
          
          {testimonials.length > 0 && (
            <div className="max-w-2xl mx-auto">
              <TestimonialCard testimonial={testimonials[currentTestimonial]} />
              
              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentTestimonial ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-green-700 to-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make Your Home Smart?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Join thousands of satisfied customers across Nepal
          </p>
          <Link 
            to="/products"
            className="bg-white text-green-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-block"
          >
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
