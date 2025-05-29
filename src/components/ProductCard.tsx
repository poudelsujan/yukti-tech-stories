
import { Link } from "react-router-dom";

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  trending?: boolean;
  offer?: string;
  specs: Record<string, string>;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link to={`/product/${product.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group">
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={product.image} 
            alt={product.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.trending && (
            <span className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Trending
            </span>
          )}
          {product.offer && (
            <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {product.offer}
            </span>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-800 transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500 mb-3">{product.category}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-600">
            {Object.entries(product.specs).slice(0, 2).map(([key, value]) => (
              <span key={key} className="block">
                {key}: {value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
