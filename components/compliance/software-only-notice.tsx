'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, ExternalLink } from 'lucide-react';

export const SoftwareOnlyNotice = () => {
  return (
    <Alert className="border-blue-200 bg-blue-50 mb-4">
      <Shield className="h-4 w-4" />
      <AlertDescription>
        <strong>MicroFi Software Platform:</strong> We provide financial management software only. 
        We do not process payments or handle funds.
      </AlertDescription>
    </Alert>
  );
};

export const PaymentBlockedNotice = () => {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          Payment Processing Not Available
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-red-700">
          MicroFi is a software platform only. We do not process payments.
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://paystack.com', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Get Paystack
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};