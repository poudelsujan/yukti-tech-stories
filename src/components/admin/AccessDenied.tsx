
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AccessDeniedProps {
  message: string;
  description: string;
}

const AccessDenied = ({ message, description }: AccessDeniedProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">{message}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {message === "Access Denied" && (
          <CardContent className="text-center">
            <p className="text-gray-600">Only administrators can access this panel.</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AccessDenied;
