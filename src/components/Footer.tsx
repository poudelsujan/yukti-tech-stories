
import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-green-400 mb-4">Yukti Group</h3>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Empowering Nepali businesses to import, sell & grow. We provide comprehensive 
              import services and cutting-edge technology solutions to help your business thrive 
              in the digital age.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/161HhbUETu/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://www.instagram.com/yukti_group00" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://www.linkedin.com/in/yukti-group-nepal/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-green-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/services" className="text-gray-300 hover:text-green-400 transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-300 hover:text-green-400 transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-green-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  Balkot, Bhaktapur, Nepal
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  +977 9847052384
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div className="text-gray-300 text-sm">
                  <div>groupyukti@gmail.com</div>
                  <div>yuktigroup00@gmail.com</div>
                </div>
              </div>
            </div>

            {/* Legal Section */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4 text-green-400">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/terms" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                    Terms and Conditions
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-400">Import Services</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Product Sourcing from Global Markets</li>
                <li>• Customs & Documentation Handling</li>
                <li>• Quality Assurance & Inspection</li>
                <li>• Logistics & Delivery Management</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-400">Tech Solutions</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Web Development & E-commerce</li>
                <li>• Mobile App Development</li>
                <li>• Digital Marketing & SEO</li>
                <li>• Custom Software Solutions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Yukti Group. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/terms" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
              Terms and Conditions
            </a>
            <a href="/privacy" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
