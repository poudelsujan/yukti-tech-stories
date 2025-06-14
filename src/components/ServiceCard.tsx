
import { LucideIcon } from "lucide-react";

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
}

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const IconComponent = service.icon;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all duration-300 p-6">
      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
        <IconComponent className="w-6 h-6 text-green-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
      <p className="text-gray-600 mb-4">{service.description}</p>
      
      <ul className="space-y-2">
        {service.features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceCard;
