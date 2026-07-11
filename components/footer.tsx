import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Practice", href: "/subjects" },
      { label: "Pricing", href: "/pricing" },
      { label: "How it works", href: "/how-it-works" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Support", href: "/support" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Trust & Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Data Protection", href: "/data-protection" },
      { label: "AI Disclaimer", href: "/ai-disclaimer" },
      { label: "Data Deletion", href: "/data-deletion" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center" aria-label="Shikkha Buddy home">
              <BrandLogo className="h-12" />
            </Link>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Focused SSC exam practice for General Math, Physics, and Chemistry.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Shikkha Buddy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
