import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 3, 2026</p>
        </div>

        <Separator />

        {/* Introduction */}
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Imerse is a small indie project. I&apos;m not in the business of selling your data or tracking you.
            Here&apos;s what you should know:
          </p>
        </div>

        {/* What I Collect */}
        <Card>
          <CardHeader>
            <CardTitle>What I Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li><strong>Your account info:</strong> Email, name, and hashed password (I can&apos;t see your actual password)</li>
              <li><strong>Your campaign data:</strong> Whatever you create - characters, locations, quests, notes, etc.</li>
              <li><strong>Basic session data:</strong> Cookies to keep you logged in</li>
            </ul>
          </CardContent>
        </Card>

        {/* What I Do With It */}
        <Card>
          <CardHeader>
            <CardTitle>What I Do With It</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li>Store your data so you can access it</li>
              <li>Make the app work</li>
              <li>Fix bugs and improve things</li>
            </ul>
          </CardContent>
        </Card>

        {/* What I Don't Do */}
        <Card>
          <CardHeader>
            <CardTitle>What I Don&apos;t Do</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li>I don&apos;t sell your data. Ever.</li>
              <li>I don&apos;t use tracking/analytics beyond what&apos;s necessary to run the service</li>
              <li>I don&apos;t share your data with third parties (unless legally required)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Want your data deleted? Want to export it? Just reach out. I&apos;ll handle it promptly.
            </p>
          </CardContent>
        </Card>

        {/* Self-Hosting */}
        <Card>
          <CardHeader>
            <CardTitle>Self-Hosting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Imerse is open source. If you self-host it, you&apos;re in charge of your own data.
              This policy only applies to instances I run.
            </p>
          </CardContent>
        </Card>

        {/* Changes */}
        <Card>
          <CardHeader>
            <CardTitle>Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If I need to update this policy, I&apos;ll update the date at the top and post the changes here.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Questions?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Contact: hello@evanschoffstall.me or open an issue on GitHub
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
