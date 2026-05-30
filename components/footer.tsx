import Link from "next/link"
import { Mail } from "@/components/icons"
import { BrandLogo } from "@/components/brand-logo"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center" aria-label="Shikkha Buddy home">
              <BrandLogo className="h-12" />
            </Link>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Focused SSC science practice for Higher Math, Physics, and Chemistry.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/subjects" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Subjects
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Connect</h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label="Contact Shikkha Buddy"
              >
                <Mail className="h-5 w-5" />
                Contact
              </Link>
            </div>
          </div>
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
