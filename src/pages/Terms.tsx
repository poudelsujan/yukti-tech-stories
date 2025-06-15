
import Header from "../components/Header";
import Footer from "../components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
            
            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                <p>Welcome to Yukti Group. These terms and conditions outline the rules and regulations for the use of our website and services.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Services</h2>
                <p>Yukti Group provides import services and technology solutions. We reserve the right to modify or discontinue any service at any time without notice.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide accurate and complete information when using our services</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not engage in any fraudulent or illegal activities</li>
                  <li>Respect intellectual property rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Payment Terms</h2>
                <p>Payment terms will be specified in individual service agreements. All payments must be made in the agreed currency and within the specified timeframe.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Limitation of Liability</h2>
                <p>Yukti Group shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact Information</h2>
                <p>For questions about these terms and conditions, please contact us at:</p>
                <ul className="mt-2 space-y-1">
                  <li>Email: groupyukti@gmail.com</li>
                  <li>Phone: +977 9847052384</li>
                  <li>Address: Balkot, Bhaktapur, Nepal</li>
                </ul>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">Last updated: December 2024</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
