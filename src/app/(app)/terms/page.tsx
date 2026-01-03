import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 3, 2026</p>
        </div>

        <Separator />

        {/* Introduction */}
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Look, I&apos;m just one person building a tool for managing RPG campaigns. Here are the basics:
          </p>
        </div>

        {/* The Service */}
        <Card>
          <CardHeader>
            <CardTitle>What This Is</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Imerse is a campaign management tool for tabletop RPGs. You can organize characters, locations, quests, and notes.
              It&apos;s provided as-is. I do my best to keep it running smoothly, but I can&apos;t guarantee 100% uptime.
            </p>
          </CardContent>
        </Card>

        {/* Your Account */}
        <Card>
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Keep your login secure. Don&apos;t share your password.
            </p>
          </CardContent>
        </Card>

        {/* Your Content */}
        <Card>
          <CardHeader>
            <CardTitle>Your Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>Your campaigns are yours.</strong> I just store them for you. I won&apos;t claim ownership or sell your content.
            </p>
            <p className="text-sm text-muted-foreground">
              Don&apos;t upload anything illegal, malicious, or that infringes on others&apos; rights. Use common sense.
            </p>
          </CardContent>
        </Card>

        {/* Don't Be a Jerk */}
        <Card>
          <CardHeader>
            <CardTitle>Don&apos;t Be a Jerk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Don&apos;t:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Try to hack or break the service</li>
              <li>Use bots to spam or scrape data</li>
              <li>Do anything illegal</li>
              <li>Harass other users</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              If you do any of this, I&apos;ll probably shut down your account.
            </p>
          </CardContent>
        </Card>

        {/* Open Source */}
        <Card>
          <CardHeader>
            <CardTitle>Open Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Imerse is open source with a license. See the license for more details.
            </p>
          </CardContent>
        </Card>

        {/* Backups */}
        <Card>
          <CardHeader>
            <CardTitle>Backups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              I do backups, but you should too. Export your campaigns regularly.
              I&apos;m not responsible if something goes wrong and you lose data.
            </p>
          </CardContent>
        </Card>

        {/* No Guarantees */}
        <Card>
          <CardHeader>
            <CardTitle>No Guarantees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This service is provided as-is. No warranties. I&apos;ll do my best, but I can&apos;t promise perfection.
              The server might go down. There might be bugs. I&apos;m not liable for any damages.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              (Yes, this needs to be in all caps for legal reasons): IMERSE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.
              NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
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
              I might update these terms. If I do, I&apos;ll update the date at the top.
              Keep using the service = you agree to the new terms.
            </p>
          </CardContent>
        </Card>

        {/* Account Deletion */}
        <Card>
          <CardHeader>
            <CardTitle>Account Deletion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Want to leave? You can delete your account anytime. Just reach out or use the account deletion feature when I build it.
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
