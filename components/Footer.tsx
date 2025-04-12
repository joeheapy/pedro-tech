'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border py-6 bg-background/90 backdrop-blur-sm mt-auto shrink-0">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p>
              © {new Date().getFullYear()} Public Goods Design. Low-cost service
              design tools for charities and social enterprises, powered by AI.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="mailto:contact@publicgoods.design"
              className="text-foreground hover:text-primary transition-colors"
            >
              contact@publicgoods.design
            </Link>
            <span className="hidden md:inline text-muted-foreground">•</span>
            <Link
              href="/privacy"
              className="text-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
