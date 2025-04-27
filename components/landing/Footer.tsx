import React from 'react';
import Link from 'next/link';
import { Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { href: '#features', label: 'Features' },
      { href: '#pricing', label: 'Pricing' },
      { href: '#', label: 'Integrations' }, // Placeholder link
      { href: '#', label: 'Security' }, // Placeholder link
    ],
    resources: [
      { href: '#', label: 'Blog' }, // Placeholder link
      { href: '#', label: 'Documentation' }, // Placeholder link
      { href: '#', label: 'Help Center' }, // Placeholder link
      { href: '#', label: 'Contact Us' }, // Placeholder link
    ],
    company: [
      { href: '#', label: 'About Us' }, // Placeholder link
      { href: '#', label: 'Careers' }, // Placeholder link
      { href: '#', label: 'Privacy Policy' }, // Placeholder link
      { href: '#', label: 'Terms of Service' }, // Placeholder link
    ],
  };

  return (
    <footer className="bg-[hsl(var(--warm-surface-alt))] text-text-body relative overflow-hidden">
      {/* Optional: Decorative blurred shapes (add these later if needed) */}
      {/* <div className="absolute inset-0 blur-3xl opacity-20"> ... </div> */}

      <div className="container mx-auto px-6 py-16 max-w-[1400px] relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Logo & Tagline */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-cool-gradient flex items-center justify-center text-white font-bold text-lg">
                D
              </div>
              <span className="font-bold text-xl text-text-dark">
                Documentor
              </span>
            </Link>
            <p className="text-sm text-text-body">
              AI-powered collaborative document editing for modern teams.
            </p>
          </div>

          {/* Column 2: Product Links */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-text-dark mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resource Links */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-text-dark mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company Links */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-text-dark mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section: Copyright & Social Icons */}
        <div className="border-t border-[hsl(var(--border))] pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-text-body/60">
            &copy; {currentYear} Documentor. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link href="#" className="text-text-body/60 hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-text-body/60 hover:text-primary transition-colors">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="#" className="text-text-body/60 hover:text-primary transition-colors">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>

       {/* Decorative Gradient Strip */}
       <div className="absolute bottom-0 left-0 right-0 h-2 bg-cool-gradient opacity-60"></div>
    </footer>
  );
};

export default Footer; 