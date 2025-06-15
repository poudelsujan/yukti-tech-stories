import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, ShoppingCart, BarChart3, Lock } from "lucide-react";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.email === 'yuktigroup00@gmail.com' && loginData.password === 'yuktigroup00') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials');
    }
  };

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  placeholder="Enter admin email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <Input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  placeholder="Enter password"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Button 
            onClick={() => setIsAuthenticated(false)} 
            variant="outline"
          >
            Logout
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="products">Add Product</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,341</div>
                  <p className="text-xs text-muted-foreground">+18% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rs. 45,231</div>
                  <p className="text-xs text-muted-foreground">+7% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Smart Door Lock</p>
                        <p className="text-sm text-gray-500">Order #001</p>
                      </div>
                      <span className="text-green-600 font-medium">Rs. 2,999</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">LED Strip Light</p>
                        <p className="text-sm text-gray-500">Order #002</p>
                      </div>
                      <span className="text-green-600 font-medium">Rs. 1,299</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Package className="mr-2 w-4 h-4" />
                    Add New Product
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <ShoppingCart className="mr-2 w-4 h-4" />
                    View All Orders
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 w-4 h-4" />
                    Manage Customers
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product ID</label>
                      <Input
                        type="text"
                        name="id"
                        value={formData.id}
                        onChange={handleInputChange}
                        placeholder="yukti004"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <Input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Smart Door Lock"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.)</label>
                      <Input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="2999"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (Rs.)</label>
                      <Input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        placeholder="3999"
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
                      <Input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="/placeholder.svg?height=400&width=400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Offer Text</label>
                      <Input
                        type="text"
                        name="offer"
                        value={formData.offer}
                        onChange={handleInputChange}
                        placeholder="25% OFF Limited Time"
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
                      <Input
                        type="text"
                        name="specs.connectivity"
                        value={formData.specs.connectivity}
                        onChange={handleInputChange}
                        placeholder="Connectivity"
                      />
                      <Input
                        type="text"
                        name="specs.power"
                        value={formData.specs.power}
                        onChange={handleInputChange}
                        placeholder="Power"
                      />
                      <Input
                        type="text"
                        name="specs.compatibility"
                        value={formData.specs.compatibility}
                        onChange={handleInputChange}
                        placeholder="Compatibility"
                      />
                      <Input
                        type="text"
                        name="specs.warranty"
                        value={formData.specs.warranty}
                        onChange={handleInputChange}
                        placeholder="Warranty"
                      />
                    </div>
                  </div>

                  {/* Colors and Tags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Colors (comma separated)</label>
                      <Input
                        type="text"
                        name="colors"
                        value={formData.colors}
                        onChange={handleInputChange}
                        placeholder="White, Black, Silver"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                      <Input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="smart home, security, keyless"
                      />
                    </div>
                  </div>

                  {/* Customer Story */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Story</h3>
                    <div className="space-y-4">
                      <Input
                        type="text"
                        name="story.title"
                        value={formData.story.title}
                        onChange={handleInputChange}
                        placeholder="Story Title"
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="text"
                          name="story.location"
                          value={formData.story.location}
                          onChange={handleInputChange}
                          placeholder="Location (e.g., Kathmandu, Nepal)"
                        />
                        <Input
                          type="text"
                          name="story.persona"
                          value={formData.story.persona}
                          onChange={handleInputChange}
                          placeholder="Customer Name & Age"
                        />
                      </div>
                      
                      <Input
                        type="text"
                        name="story.image"
                        value={formData.story.image}
                        onChange={handleInputChange}
                        placeholder="Story Image Path"
                      />
                      
                      <textarea
                        name="story.text"
                        value={formData.story.text}
                        onChange={handleInputChange}
                        placeholder="Write the customer story..."
                        rows={4}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={generateJSON}
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                  >
                    Generate JSON
                  </Button>
                </form>

                {generatedJSON && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated JSON (Copy to products.json)</h3>
                    <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">{generatedJSON}</pre>
                    </div>
                    <Button
                      onClick={() => navigator.clipboard.writeText(generatedJSON)}
                      className="mt-4 bg-blue-500 hover:bg-blue-600"
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Order management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Analytics features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
