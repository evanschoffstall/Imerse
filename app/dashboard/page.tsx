import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">3</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Characters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">42</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-600">28</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-semibold">Character Updated</p>
              <p className="text-sm text-muted-foreground">
                Updated &quot;Hero Character&quot; in Example Campaign
              </p>
              <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="font-semibold">Location Created</p>
              <p className="text-sm text-muted-foreground">
                Created new location &quot;Ancient Temple&quot;
              </p>
              <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="font-semibold">Campaign Updated</p>
              <p className="text-sm text-muted-foreground">
                Updated campaign settings for &quot;Fantasy World&quot;
              </p>
              <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
