'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CampaignFamiliesPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Families</h1>
      <Card>
        <CardHeader>
          <CardTitle>Families</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
