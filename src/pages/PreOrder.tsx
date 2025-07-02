
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PreOrderForm from '@/components/PreOrderForm';

const PreOrder = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">International Pre-Order</h1>
            <p className="text-gray-600 mt-2">
              Import products directly from international platforms like Alibaba, eBay, and Made in China
            </p>
          </div>
          <PreOrderForm />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PreOrder;
