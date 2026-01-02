export default function DashboardPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total Campaigns</h3>
          <p className="text-4xl font-bold text-blue-600">3</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total Characters</h3>
          <p className="text-4xl font-bold text-green-600">42</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total Locations</h3>
          <p className="text-4xl font-bold text-purple-600">28</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="font-semibold">Character Updated</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Updated &quot;Hero Character&quot; in Example Campaign
            </p>
            <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="font-semibold">Location Created</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Created new location &quot;Ancient Temple&quot;
            </p>
            <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <p className="font-semibold">Campaign Updated</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Updated campaign settings for &quot;Fantasy World&quot;
            </p>
            <p className="text-xs text-gray-500 mt-1">1 day ago</p>
          </div>
        </div>
      </div>
    </div>
  )
}
