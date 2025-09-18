'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  Bell,
  Shield,
  Server,
  TrendingDown
} from 'lucide-react';

interface SystemAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'performance' | 'system' | 'billing';
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
  tenant_affected?: string;
}

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      // Demo data for now
      setAlerts([
        {
          id: '1',
          title: 'High CPU Usage Detected',
          description: 'Worker CPU usage exceeded 80% for the past 15 minutes',
          severity: 'high',
          category: 'performance',
          status: 'active',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          title: 'Failed Login Attempts',
          description: 'Multiple failed login attempts from IP 203.0.113.1',
          severity: 'critical',
          category: 'security',
          status: 'acknowledged',
          created_at: '2024-01-15T10:25:00Z'
        },
        {
          id: '3',
          title: 'Database Connection Timeout',
          description: 'D1 database response time exceeded 5 seconds',
          severity: 'medium',
          category: 'system',
          status: 'resolved',
          created_at: '2024-01-15T10:20:00Z'
        },
        {
          id: '4',
          title: 'Payment Failure Rate Increase',
          description: 'Payment failure rate increased to 15% for Demo Banking tenant',
          severity: 'high',
          category: 'billing',
          status: 'active',
          created_at: '2024-01-15T10:15:00Z',
          tenant_affected: 'Demo Banking'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return variants[severity as keyof typeof variants] || variants.low;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-red-100 text-red-800',
      acknowledged: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return variants[status as keyof typeof variants] || variants.active;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      security: Shield,
      performance: TrendingDown,
      system: Server,
      billing: Bell
    };
    return icons[category as keyof typeof icons] || AlertTriangle;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: AlertTriangle,
      acknowledged: Clock,
      resolved: CheckCircle
    };
    return icons[status as keyof typeof icons] || AlertTriangle;
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'acknowledged' as const }
        : alert
    ));
  };

  const handleResolve = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved' as const }
        : alert
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>System Alerts</h1>
          <p style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Monitor system health and incidents</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Configure Alerts
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="admin-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>{activeAlerts.length}</p>
                <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="admin-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>{criticalAlerts.length}</p>
                <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="admin-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>
                  {alerts.filter(a => a.status === 'acknowledged').length}
                </p>
                <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Acknowledged</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="admin-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>
                  {alerts.filter(a => a.status === 'resolved').length}
                </p>
                <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle style={{ color: 'rgb(var(--admin-foreground))' }}>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => {
              const CategoryIcon = getCategoryIcon(alert.category);
              const StatusIcon = getStatusIcon(alert.status);
              
              return (
                <div key={alert.id} className="flex items-center justify-between p-4 rounded-lg" style={{ border: '1px solid rgb(var(--admin-border))' }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--admin-muted))' }}>
                      <CategoryIcon className="w-5 h-5" style={{ color: 'rgb(var(--admin-muted-foreground))' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium" style={{ color: 'rgb(var(--admin-foreground))' }}>{alert.title}</p>
                        <Badge className={getSeverityBadge(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge className={getStatusBadge(alert.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>{alert.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                        {alert.tenant_affected && (
                          <span>• Tenant: {alert.tenant_affected}</span>
                        )}
                        <span>• {alert.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {alert.status === 'active' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleResolve(alert.id)}
                        >
                          Resolve
                        </Button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResolve(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}