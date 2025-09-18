'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Lock, Eye, FileText } from 'lucide-react';

export default function GatewayDisclaimer() {
  return (
    <div className="space-y-4">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>IMPORTANT LEGAL NOTICE:</strong> By configuring payment gateways, you acknowledge that:
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li>You are solely responsible for your API keys and their security</li>
            <li>MicroFi is not liable for any exposure, misuse, or compromise of your keys</li>
            <li>You maintain full control over your payment processing</li>
            <li>MicroFi operates as software-only provider with zero payment liability</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Lock className="w-4 h-4 text-green-600" />
              <span>Encryption</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge variant="outline" className="text-xs">AES-256-GCM</Badge>
            <p className="text-xs text-gray-600">
              Your keys are encrypted with military-grade encryption before storage.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Zero Access</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge variant="outline" className="text-xs">No Plaintext</Badge>
            <p className="text-xs text-gray-600">
              MicroFi never sees your plaintext API keys at any point.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>MFI Compliant</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge variant="outline" className="text-xs">Software Only</Badge>
            <p className="text-xs text-gray-600">
              Platform provides software interface only, no payment processing.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2 text-amber-800">
            <FileText className="w-4 h-4" />
            <span>Terms of Service</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-amber-700 space-y-2">
          <p>
            <strong>1. Key Management:</strong> You are solely responsible for the security, 
            rotation, and management of your payment gateway API keys.
          </p>
          <p>
            <strong>2. Liability Limitation:</strong> MicroFi disclaims all liability for 
            key exposure, unauthorized access, or financial losses related to payment processing.
          </p>
          <p>
            <strong>3. Compliance:</strong> You must ensure your payment processing complies 
            with all applicable regulations in your jurisdiction.
          </p>
          <p>
            <strong>4. Data Processing:</strong> MicroFi processes only encrypted key data 
            and transaction metadata for display purposes only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}