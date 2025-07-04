
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SignInPromptProps {
  message?: string;
  description?: string;
}

const SignInPrompt = ({ 
  message = "Sign In Required", 
  description = "Please sign in to continue with your purchase" 
}: SignInPromptProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{message}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate('/auth')} 
            className="w-full"
          >
            <User className="h-4 w-4 mr-2" />
            Sign In / Sign Up
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/products')} 
            className="w-full"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPrompt;
