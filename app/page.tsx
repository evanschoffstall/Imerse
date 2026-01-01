export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Imerse
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <p className="text-lg mb-4">
            This is Imerse - the ultimate RPG campaign management and worldbuilding tool.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Campaign Management</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage your RPG campaigns with ease
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Worldbuilding</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Build rich, detailed worlds for your stories
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Character Tracking</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Keep track of all your characters and NPCs
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Location Management</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Map out and organize all your locations
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
