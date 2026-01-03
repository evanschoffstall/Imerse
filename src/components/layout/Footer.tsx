import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'About Imerse',
      content: 'An ultimate RPG campaign management and worldbuilding tool.',
    },
    {
      title: 'Quick Links',
      links: [
        { href: '/about', label: 'About' },
        { href: '/features', label: 'Features' },
      ],
    },
    {
      title: 'Support',
      links: [
        { href: '/docs', label: 'Documentation' },
        { href: '/help', label: 'Help Center' },
        { href: '/contact', label: 'Contact' },
      ],
    },
  ]

  return (
    <footer className="mt-auto border-t bg-background">
      <div className="centered-container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="mb-4 text-sm font-semibold">{section.title}</h3>
              {section.content ? (
                <p className="text-sm text-muted-foreground">{section.content}</p>
              ) : (
                <ul className="space-y-2">
                  {section.links?.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <Separator className="my-6" />
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Imerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
