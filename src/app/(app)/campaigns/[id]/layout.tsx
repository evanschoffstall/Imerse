'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Campaign } from '@/features/campaigns';
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Grid3x3,
  Home,
  Map as MapIcon,
  MapPin,
  Notebook,
  Scroll,
  Settings,
  Shield,
  Sparkles,
  Swords,
  Users,
  Users2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${params.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch campaign');
        }

        const data = await response.json();
        setCampaign(data.campaign);
      } catch (error) {
        console.error('Error fetching campaign:', error);
        toast.error('Failed to load campaign');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCampaign();
    }
  }, [params.id]);

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', href: `/campaigns/${params.id}` },
    { icon: Users, label: 'Characters', href: `/campaigns/${params.id}/characters` },
    { icon: MapPin, label: 'Locations', href: `/campaigns/${params.id}/locations` },
    { icon: MapIcon, label: 'Maps', href: `/campaigns/${params.id}/maps` },
    { icon: Shield, label: 'Organizations', href: `/campaigns/${params.id}/organizations` },
    { icon: Users2, label: 'Families', href: `/campaigns/${params.id}/families` },
    { icon: Swords, label: 'Creatures', href: `/campaigns/${params.id}/creatures` },
    { icon: Clock, label: 'Time', href: `/campaigns/${params.id}/timelines` },
    { icon: Calendar, label: 'Calendars', href: `/campaigns/${params.id}/calendars` },
    { icon: Scroll, label: 'Events', href: `/campaigns/${params.id}/events` },
    { icon: Notebook, label: 'Journals', href: `/campaigns/${params.id}/journals` },
    { icon: BookOpen, label: 'Game', href: `#`, disabled: true },
    { icon: Scroll, label: 'Quests', href: `/campaigns/${params.id}/quests` },
    { icon: Sparkles, label: 'Objects', href: `#`, disabled: true },
    { icon: Sparkles, label: 'Abilities', href: `#`, disabled: true },
    { icon: FileText, label: 'Notes', href: `/campaigns/${params.id}/notes` },
    { icon: Grid3x3, label: 'Other', href: `#`, disabled: true },
  ];

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const days = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return then.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-64 border-r border-border bg-card p-4">
          <Skeleton className="h-8 w-full mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-12 w-1/3 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === `/campaigns/${params.id}`) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar Navigation - Fixed height with independent scroll */}
      <div className="w-64 border-r border-border bg-card flex flex-col shrink-0 overflow-hidden">
        {/* Campaign Header - Fixed */}
        <div className="p-4 border-b border-border shrink-0">
          {campaign.image && (
            <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden">
              <img
                src={campaign.image}
                alt={campaign.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h2 className="font-bold text-lg truncate">{campaign.name}</h2>
          <p className="text-xs text-muted-foreground">Updated {formatTimeAgo(campaign.updatedAt)}</p>
        </div>

        {/* Navigation Links - Scrollable independently */}
        <nav className="flex-1 overflow-y-auto p-2">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={index} href={item.disabled ? '#' : item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${active
                    ? 'bg-primary text-primary-foreground'
                    : item.disabled
                      ? 'text-muted-foreground opacity-50 cursor-not-allowed'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Settings at bottom - Fixed */}
        <div className="p-2 border-t border-border shrink-0">
          <Link href={`/campaigns/${campaign.id}/edit`}>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Campaign Banner Header - Scrolls with content */}
        <div className="relative h-20 border-b border-border">
          {campaign.image && (
            <img
              src={campaign.image}
              alt={campaign.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-background" />
          <div className="absolute inset-0 flex items-center px-6">
            <h1 className="text-2xl font-bold text-foreground drop-shadow-lg">{campaign.name}</h1>
          </div>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
