'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CampaignNotesPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Notes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
