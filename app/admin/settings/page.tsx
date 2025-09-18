'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { adminApiClient } from '@/lib/admin-api-client';
import { Database, RefreshCw } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await adminApiClient.getSettings();
      setSettings(data.settings || {});
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (category: string, key: string, value: string) => {
    setSaving(true);
    try {
      await adminApiClient.updateSetting(category, key, value);
      setSettings((prev: any) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: { ...prev[category]?.[key], value }
        }
      }));
    } catch (error) {
      console.error('Failed to update setting:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>Settings</h1>
        <p style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Configure system settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* System Configuration */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle style={{ color: 'rgb(var(--admin-foreground))' }}>System Configuration</CardTitle>
            <CardDescription style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Core system settings and parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input id="systemName" defaultValue="MicroFi Banking" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemVersion">Version</Label>
                <Input id="systemVersion" defaultValue="1.0.0" disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemDescription">Description</Label>
              <Input
                id="systemDescription"
                defaultValue="Comprehensive banking and financial management platform"
              />
            </div>
            <Button 
              onClick={() => updateSetting('system', 'name', 'MicroFi Banking')}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle style={{ color: 'rgb(var(--admin-foreground))' }}>Security Settings</CardTitle>
            <CardDescription style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Configure security policies and access controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session Timeout</Label>
                <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input id="sessionTimeout" type="number" defaultValue="30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input id="maxLoginAttempts" type="number" defaultValue="5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Maintenance */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle style={{ color: 'rgb(var(--admin-foreground))' }}>System Maintenance</CardTitle>
            <CardDescription style={{ color: 'rgb(var(--admin-muted-foreground))' }}>System maintenance and backup settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Backups</Label>
                <p className="text-sm text-gray-500">Schedule regular system backups</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Backup Database
              </Button>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
