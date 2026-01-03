'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-radix';
import { Switch } from '@/components/ui/switch';
import type { EmailDigestFrequency, NotificationPreference } from '@/types/notification';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/notifications/preferences');
        if (response.ok) {
          const data = await response.json();
          setPreferences(data);
        }
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreference, value: boolean | string) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  if (loading || !preferences) {
    return <div className="text-sm text-muted-foreground">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>In-App Notifications</CardTitle>
          <CardDescription>
            Choose which notifications you want to see in the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifyOnMention" className="flex flex-col space-y-1">
              <span>Mentions</span>
              <span className="text-sm text-muted-foreground font-normal">
                When someone mentions you
              </span>
            </Label>
            <Switch
              id="notifyOnMention"
              checked={preferences.notifyOnMention}
              onCheckedChange={(checked) => updatePreference('notifyOnMention', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifyOnComment" className="flex flex-col space-y-1">
              <span>Comments</span>
              <span className="text-sm text-muted-foreground font-normal">
                When someone comments on your content
              </span>
            </Label>
            <Switch
              id="notifyOnComment"
              checked={preferences.notifyOnComment}
              onCheckedChange={(checked) => updatePreference('notifyOnComment', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifyOnCalendar" className="flex flex-col space-y-1">
              <span>Calendar Events</span>
              <span className="text-sm text-muted-foreground font-normal">
                Upcoming calendar events
              </span>
            </Label>
            <Switch
              id="notifyOnCalendar"
              checked={preferences.notifyOnCalendar}
              onCheckedChange={(checked) => updatePreference('notifyOnCalendar', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifyOnReminder" className="flex flex-col space-y-1">
              <span>Reminders</span>
              <span className="text-sm text-muted-foreground font-normal">
                Reminder notifications
              </span>
            </Label>
            <Switch
              id="notifyOnReminder"
              checked={preferences.notifyOnReminder}
              onCheckedChange={(checked) => updatePreference('notifyOnReminder', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifyOnCampaign" className="flex flex-col space-y-1">
              <span>Campaign Updates</span>
              <span className="text-sm text-muted-foreground font-normal">
                Campaign changes and updates
              </span>
            </Label>
            <Switch
              id="notifyOnCampaign"
              checked={preferences.notifyOnCampaign}
              onCheckedChange={(checked) => updatePreference('notifyOnCampaign', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifyOnQuest" className="flex flex-col space-y-1">
              <span>Quest Updates</span>
              <span className="text-sm text-muted-foreground font-normal">
                Quest status changes
              </span>
            </Label>
            <Switch
              id="notifyOnQuest"
              checked={preferences.notifyOnQuest}
              onCheckedChange={(checked) => updatePreference('notifyOnQuest', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifyOnCharacter" className="flex flex-col space-y-1">
              <span>Character Updates</span>
              <span className="text-sm text-muted-foreground font-normal">
                Character changes
              </span>
            </Label>
            <Switch
              id="notifyOnCharacter"
              checked={preferences.notifyOnCharacter}
              onCheckedChange={(checked) => updatePreference('notifyOnCharacter', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose which notifications you want to receive via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailOnMention" className="flex flex-col space-y-1">
              <span>Email on Mentions</span>
              <span className="text-sm text-muted-foreground font-normal">
                Receive email when mentioned
              </span>
            </Label>
            <Switch
              id="emailOnMention"
              checked={preferences.emailOnMention}
              onCheckedChange={(checked) => updatePreference('emailOnMention', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="emailOnComment" className="flex flex-col space-y-1">
              <span>Email on Comments</span>
              <span className="text-sm text-muted-foreground font-normal">
                Receive email for comments
              </span>
            </Label>
            <Switch
              id="emailOnComment"
              checked={preferences.emailOnComment}
              onCheckedChange={(checked) => updatePreference('emailOnComment', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="emailDigest" className="flex flex-col space-y-1">
              <span>Email Digest</span>
              <span className="text-sm text-muted-foreground font-normal">
                Receive a summary of notifications
              </span>
            </Label>
            <Switch
              id="emailDigest"
              checked={preferences.emailDigest}
              onCheckedChange={(checked) => updatePreference('emailDigest', checked)}
            />
          </div>

          {preferences.emailDigest && (
            <div className="ml-4">
              <Label htmlFor="emailDigestFrequency">Digest Frequency</Label>
              <Select
                value={preferences.emailDigestFrequency}
                onValueChange={(value) =>
                  updatePreference('emailDigestFrequency', value as EmailDigestFrequency)
                }
              >
                <SelectTrigger id="emailDigestFrequency" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
