"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const baseNavItems = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
  ];

  const loggedInNavItems = [
    ...baseNavItems,
    { href: '/editor', label: 'My documents' }, // Updated link for logged in users
  ];

  const loggedOutNavItems = [
    ...baseNavItems,
    { href: '/sign-in', label: 'Sign In' },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    setIsMobileMenuOpen(false); // Close mobile menu on sign out
  };

  const userInitials = user?.firstName?.[0] || user?.lastName?.[0] || 'U';

  // Show loading state or nothing until Clerk is loaded
  if (!isLoaded) {
    return (
        <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20', isScrolled ? 'glass shadow-md' : 'bg-transparent')}>
          <div className="container mx-auto px-6 flex h-full items-center justify-between max-w-[1400px]">
              {/* Optional: Add a loading skeleton or indicator here */}
          </div>
        </header>
    );
  }

  const currentNavItems = user ? loggedInNavItems : loggedOutNavItems;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'glass shadow-md' : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="container mx-auto px-6 flex h-20 items-center justify-between max-w-[1400px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-cool-gradient flex items-center justify-center text-white font-bold text-lg">
            D
          </div>
          <span className={cn(
            'font-bold text-xl hidden sm:inline',
             isScrolled ? 'text-foreground' : 'text-white'
          )}>
            Documentor
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {currentNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'text-base font-medium transition-colors hover:text-primary',
                isScrolled ? 'text-foreground hover:text-primary' : 'text-white hover:text-white/80'
              )}
            >
              {item.label}
            </Link>
          ))}

          {/* Conditional Buttons/Avatar */}
          {user ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.fullName || user.primaryEmailAddress?.emailAddress}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                     {/* TODO: Link to actual profile page if it exists */}
                    <Link href="#">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          ) : (
             <Link href="/signup">
               <Button variant="default" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                 Try for free
               </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
           <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={cn(isScrolled ? 'text-foreground' : 'text-white', 'hover:bg-white/10')}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background p-6 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="w-8 h-8 rounded-md bg-cool-gradient flex items-center justify-center text-white font-bold text-lg"> D </div>
                  <span className="font-bold text-xl text-foreground"> Documentor </span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                   <X className="h-6 w-6 text-muted-foreground" />
                   <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="flex flex-col gap-4 flex-grow">
                {currentNavItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Conditional Mobile Footer */}
              <div className="mt-auto pt-6 border-t">
                 {user ? (
                   <div className="space-y-4">
                      <Link
                         href="#" // TODO: Link to profile page
                         className="block text-lg font-medium text-foreground hover:text-primary transition-colors"
                         onClick={() => setIsMobileMenuOpen(false)}
                       >
                         Profile
                       </Link>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleSignOut}
                      >
                        Log out
                      </Button>
                   </div>
                 ) : (
                   <Link href="/signup" className="block">
                     <Button variant="default" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                       Try for free
                     </Button>
                   </Link>
                 )}
               </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 