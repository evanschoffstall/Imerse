'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on campaign pages and subpages
  if (pathname?.startsWith('/campaigns/') && pathname !== '/campaigns') {
    return null;
  }
  
  return <Footer />;
}
