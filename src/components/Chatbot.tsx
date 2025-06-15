
import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm here to help you learn about Yukti Group. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const predefinedAnswers: Record<string, string> = {
    'what is yukti group': 'Yukti Group is a Nepali company that empowers small and mid-sized businesses to import products and offers custom technology services. We help businesses grow through import services, digital solutions, and tech support.',
    'what services do you offer': 'We offer Import Services (helping you import goods from abroad), Tech Solutions (web development, mobile apps, digital marketing), and we also have an online shop with imported products for sale.',
    'how can you help import': 'We handle the entire import process for you - from sourcing products abroad to managing customs paperwork and delivery. Our team has expertise in international trade and can help you find quality products at competitive prices.',
    'what tech services': 'Our tech services include web development, mobile app development, digital marketing, custom software solutions, and e-commerce setup. We help businesses digitize and grow their online presence.',
    'how to contact': 'You can contact us through our Contact page, WhatsApp at +977 9847052384, or email us at groupyukti@gmail.com or yuktigroup00@gmail.com. We\'re available Sun-Fri 9AM-6PM and Saturday 10AM-4PM.',
    'where are you located': 'We are located in Balkot, Bhaktapur, Nepal. You can find our detailed contact information on our Contact page.',
    'pricing': 'Our pricing varies based on the service and requirements. Please contact us for a free consultation where we can discuss your specific needs and provide a customized quote.',
    'testimonials': 'We have helped many Nepali businesses grow! Check out testimonials from Rajesh Shrestha (electronics import), Sita Kumari Thapa (handicraft website), and Anil Gurung (product sourcing) on our homepage.',
  };

  const findAnswer = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    for (const [key, answer] of Object.entries(predefinedAnswers)) {
      if (lowerQuestion.includes(key) || key.split(' ').some(word => lowerQuestion.includes(word))) {
        return answer;
      }
    }
    
    return "I'm sorry, I don't have specific information about that. Please contact us directly at groupyukti@gmail.com or +977 9847052384 for personalized assistance. Our team will be happy to help you!";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: findAnswer(inputValue),
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 h-96 mb-4 flex flex-col">
          {/* Header */}
          <div className="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Yukti Group Support</h3>
            </div>
            <div className="flex items-center space-x-2">
              <a 
                href="https://wa.me/9779847052384"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-full transition-colors shadow-sm"
                title="Contact us on WhatsApp"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-green-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button - Only show when chat is closed */}
      {!isOpen && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Chat with Yukti Group Support</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default Chatbot;
