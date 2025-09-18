'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UsageData {
  date: string;
  smsCount: number;
  emailCount: number;
  smsCost: number;
  emailCost: number;
}

export function UsageAnalytics() {
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockData: UsageData[] = [
        { date: '2024-01-15', smsCount: 45, emailCount: 120, smsCost: 180, emailCost: 180 },
        { date: '2024-01-14', smsCount: 32, emailCount: 89, smsCost: 128, emailCost: 134 },
        { date: '2024-01-13', smsCount: 28, emailCount: 76, smsCost: 112, emailCost: 114 },
        { date: '2024-01-12', smsCount: 41, emailCount: 103, smsCost: 164, emailCost: 155 },
        { date: '2024-01-11', smsCount: 35, emailCount: 95, smsCost: 140, emailCost: 143 }
      ];
      
      setUsageData(mockData);
    } catch (error) {
      console.error('Failed to load usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalUsage = () => {
    return usageData.reduce((acc, day) => ({
      smsCount: acc.smsCount + day.smsCount,
      emailCount: acc.emailCount + day.emailCount,
      smsCost: acc.smsCost + day.smsCost,
      emailCost: acc.emailCost + day.emailCost
    }), { smsCount: 0, emailCount: 0, smsCost: 0, emailCost: 0 });
  };

  const formatCost = (cost: number) => {
    return (cost / 100).toFixed(2);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totals = getTotalUsage();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{totals.smsCount}</div>
            <p className="text-sm text-muted-foreground">SMS Sent</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{totals.emailCount}</div>
            <p className="text-sm text-muted-foreground">Emails Sent</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              GHS {formatCost(totals.smsCost)}
            </div>
            <p className="text-sm text-muted-foreground">SMS Cost</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              GHS {formatCost(totals.emailCost)}
            </div>
            <p className="text-sm text-muted-foreground">Email Cost</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Usage History</CardTitle>
          <CardDescription>
            Communication usage and costs for the last 5 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usageData.map((day) => (
              <div key={day.date} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">
                      {new Date(day.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {day.smsCount} SMS • {day.emailCount} Emails
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge variant="outline" className="mr-2">
                      SMS: GHS {formatCost(day.smsCost)}
                    </Badge>
                    <Badge variant="outline">
                      Email: GHS {formatCost(day.emailCost)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      GHS {formatCost(day.smsCost + day.emailCost)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}