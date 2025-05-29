
import { useState } from "react";

const Admin = () => {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    price: "",
    originalPrice: "",
    category: "",
    image: "",
    trending: false,
    offer: "",
    specs: {
      connectivity: "",
      power: "",
      compatibility: "",
      warranty: ""
    },
    colors: "",
    tags: "",
    story: {
      title: "",
      location: "",
      persona: "",
      image: "",
      text: ""
    }
  });

  const [generatedJSON, setGeneratedJSON] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('specs.')) {
      const specKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specs: {
          ...prev.specs,
          [specKey]: value
        }
      }));
    } else if (name.startsWith('story.')) {
      const storyKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        story: {
          ...prev.story,
          [storyKey]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const generateJSON = () => {
    const productData = {
      [formData.id]: {
        id: formData.id,
        title: formData.title,
        price: parseInt(formData.price),
        originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : undefined,
        category: formData.category,
        image: formData.image,
        trending: formData.trending,
        offer: formData.offer,
        specs: formData.specs,
        colors: formData.colors.split(',').map(color => color.trim()),
        tags: formData.tags.split(',').map(tag => tag.trim()),
        stories: [formData.story]
      }
    };

    setGeneratedJSON(JSON.stringify(productData, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel - Add New Product</h1>
          
          <form className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product ID</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  placeholder="yukti004"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Smart Door Lock"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="2999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (Rs.)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  placeholder="3999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select Category</option>
                  <option value="Home Electronics">Home Electronics</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Security">Security</option>
                  <option value="Kitchen">Kitchen</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Path</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="/placeholder.svg?height=400&width=400"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Offer Text</label>
                <input
                  type="text"
                  name="offer"
                  value={formData.offer}
                  onChange={handleInputChange}
                  placeholder="25% OFF Limited Time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="trending"
                checked={formData.trending}
                onChange={handleInputChange}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Mark as Trending</label>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="specs.connectivity"
                  value={formData.specs.connectivity}
                  onChange={handleInputChange}
                  placeholder="Connectivity"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <input
                  type="text"
                  name="specs.power"
                  value={formData.specs.power}
                  onChange={handleInputChange}
                  placeholder="Power"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <input
                  type="text"
                  name="specs.compatibility"
                  value={formData.specs.compatibility}
                  onChange={handleInputChange}
                  placeholder="Compatibility"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <input
                  type="text"
                  name="specs.warranty"
                  value={formData.specs.warranty}
                  onChange={handleInputChange}
                  placeholder="Warranty"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Colors and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Colors (comma separated)</label>
                <input
                  type="text"
                  name="colors"
                  value={formData.colors}
                  onChange={handleInputChange}
                  placeholder="White, Black, Silver"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="smart home, security, keyless"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Customer Story */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Story</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  name="story.title"
                  value={formData.story.title}
                  onChange={handleInputChange}
                  placeholder="Story Title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="story.location"
                    value={formData.story.location}
                    onChange={handleInputChange}
                    placeholder="Location (e.g., Kathmandu, Nepal)"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    name="story.persona"
                    value={formData.story.persona}
                    onChange={handleInputChange}
                    placeholder="Customer Name & Age"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <input
                  type="text"
                  name="story.image"
                  value={formData.story.image}
                  onChange={handleInputChange}
                  placeholder="Story Image Path"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                
                <textarea
                  name="story.text"
                  value={formData.story.text}
                  onChange={handleInputChange}
                  placeholder="Write the customer story..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={generateJSON}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Generate JSON
            </button>
          </form>

          {generatedJSON && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated JSON (Copy to products.json)</h3>
              <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">{generatedJSON}</pre>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(generatedJSON)}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
