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
            Welcome to Imerse. By accessing or using our service, you agree to be bound by these Terms of Service. Please read them carefully.
          </p>
        </div>

        {/* Acceptance of Terms */}
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              By creating an account or using Imerse, you agree to these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use our service.
            </p>
          </CardContent>
        </Card>

        {/* Description of Service */}
        <Card>
          <CardHeader>
            <CardTitle>2. Description of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Imerse is an RPG campaign management and worldbuilding platform that allows users to create, organize, and manage tabletop roleplaying game campaigns. The service includes tools for tracking characters, locations, quests, notes, and other campaign-related content.
            </p>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>3. User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Account Creation</h3>
              <p className="text-sm text-muted-foreground">
                You must create an account to use Imerse. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Account Responsibility</h3>
              <p className="text-sm text-muted-foreground">
                You must provide accurate, current, and complete information during registration. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Age Requirement</h3>
              <p className="text-sm text-muted-foreground">
                You must be at least 13 years old to use Imerse. By creating an account, you represent that you meet this age requirement.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Content */}
        <Card>
          <CardHeader>
            <CardTitle>4. User Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Your Content</h3>
              <p className="text-sm text-muted-foreground">
                You retain all rights to the campaign content you create on Imerse. By using our service, you grant us a limited license to store, display, and process your content solely for the purpose of providing the service to you.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Content Responsibility</h3>
              <p className="text-sm text-muted-foreground">
                You are solely responsible for the content you create and share. You agree not to upload content that:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4 mt-2">
                <li>Violates any laws or regulations</li>
                <li>Infringes on intellectual property rights</li>
                <li>Contains malicious code or viruses</li>
                <li>Harasses, threatens, or harms others</li>
                <li>Contains explicit sexual content involving minors</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Content Removal</h3>
              <p className="text-sm text-muted-foreground">
                We reserve the right to remove content that violates these terms or is otherwise objectionable, though we are not obligated to monitor user content.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card>
          <CardHeader>
            <CardTitle>5. Acceptable Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Use automated tools to access the service without permission</li>
              <li>Impersonate others or misrepresent your affiliation</li>
              <li>Collect or harvest data from other users</li>
              <li>Use the service to distribute spam or malware</li>
            </ul>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle>6. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Imerse is open-source software licensed under the MIT License. The code is available on GitHub. The Imerse name and branding remain our intellectual property.
            </p>
            <p className="text-sm text-muted-foreground">
              All content created by users belongs to those users. You retain full ownership of your campaign content.
            </p>
          </CardContent>
        </Card>

        {/* Service Availability */}
        <Card>
          <CardHeader>
            <CardTitle>7. Service Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We strive to keep Imerse available 24/7, but we do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the service at any time, with or without notice.
            </p>
            <p className="text-sm text-muted-foreground">
              We are not liable for any loss or damage resulting from service interruptions or downtime.
            </p>
          </CardContent>
        </Card>

        {/* Data and Backups */}
        <Card>
          <CardHeader>
            <CardTitle>8. Data and Backups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              While we take reasonable measures to protect and backup your data, we are not responsible for data loss. You are encouraged to regularly export and backup your campaign content.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card>
          <CardHeader>
            <CardTitle>9. Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You may terminate your account at any time by contacting us or using the account deletion feature. We may terminate or suspend your account if you violate these Terms of Service.
            </p>
            <p className="text-sm text-muted-foreground">
              Upon termination, your right to use the service will immediately cease. We may retain certain data as required by law or for legitimate business purposes.
            </p>
          </CardContent>
        </Card>

        {/* Disclaimer of Warranties */}
        <Card>
          <CardHeader>
            <CardTitle>10. Disclaimer of Warranties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              IMERSE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle>11. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IMERSE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>12. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We reserve the right to modify these Terms of Service at any time. We will notify users of material changes by posting an update on our website. Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card>
          <CardHeader>
            <CardTitle>13. Governing Law</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              These Terms of Service shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>14. Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Email: legal@imerse.app</p>
              <p>GitHub: github.com/imerse/imerse</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
