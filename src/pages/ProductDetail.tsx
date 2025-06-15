
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [currentStory, setCurrentStory] = useState(0);

  useEffect(() => {
    import('../assets/products.json').then((data) => {
      const productData = data.default[id as string];
      if (productData) {
        setProduct(productData);
        setSelectedColor(productData.colors[0]);
      }
    });
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  const currentStoryData = product.stories.length > 0 ? product.stories[currentStory] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div>
              <div className="aspect-square rounded-lg overflow-hidden mb-4">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.offer && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <span className="text-red-600 font-semibold">{product.offer}</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-sm px-3 py-1 rounded-full">
                  {product.category}
                </span>
                {product.trending && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full ml-2">
                    Trending
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
              
              <div className="flex items-center mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  Rs. {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through ml-3">
                    Rs. {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Colors</h3>
                <div className="flex space-x-3">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedColor === color
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 capitalize">{key}:</span>
                      <span className="text-gray-900 font-medium">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buy Button */}
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors">
                Buy Now - Rs. {product.price.toLocaleString()}
              </button>
            </div>
          </div>

          {/* Customer Story Section - Only show if stories exist */}
          {product.stories.length > 0 && currentStoryData && (
            <div className="border-t border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Customer Stories</h2>
              
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <img 
                        src={currentStoryData.image} 
                        alt={currentStoryData.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {currentStoryData.title}
                      </h3>
                      <p className="text-emerald-600 font-medium mb-1">
                        {currentStoryData.persona}
                      </p>
                      <p className="text-gray-500 text-sm mb-4">
                        📍 {currentStoryData.location}
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        {currentStoryData.text}
                      </p>
                    </div>
                  </div>
                </div>
                
                {product.stories.length > 1 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    {product.stories.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStory(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentStory ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
