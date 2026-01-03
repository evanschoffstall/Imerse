'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'next/navigation';

export default function CampaignMapsPage() {
  const params = useParams();
  
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Maps</h1>
      <Card>
        <CardHeader>
          <CardTitle>Maps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
