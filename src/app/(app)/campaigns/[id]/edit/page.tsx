'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { CampaignForm, CampaignFormData } from '@/features/campaigns';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [initialData, setInitialData] = useState<Partial<CampaignFormData> | null>(null);
  const [isSavingStyle, setIsSavingStyle] = useState(false);

  // Background style settings
  const [bgOpacity, setBgOpacity] = useState(0.8);
  const [bgBlur, setBgBlur] = useState(4);
  const [bgExpandToSidebar, setBgExpandToSidebar] = useState(false);
  const [bgExpandToHeader, setBgExpandToHeader] = useState(false);
  const [headerBgOpacity, setHeaderBgOpacity] = useState(0.95);
  const [headerBlur, setHeaderBlur] = useState(0);
  const [sidebarBgOpacity, setSidebarBgOpacity] = useState(1.0);
  const [sidebarBlur, setSidebarBlur] = useState(0);

  // Apply styles live for preview
  useEffect(() => {
    document.documentElement.style.setProperty('--campaign-bg-opacity', bgOpacity.toString());
    document.documentElement.style.setProperty('--campaign-bg-blur', `${bgBlur}px`);
    document.documentElement.style.setProperty('--campaign-header-bg-opacity', headerBgOpacity.toString());
    document.documentElement.style.setProperty('--campaign-header-blur', `${headerBlur}px`);
    document.documentElement.style.setProperty('--campaign-sidebar-bg-opacity', sidebarBgOpacity.toString());
    document.documentElement.style.setProperty('--campaign-sidebar-blur', `${sidebarBlur}px`);
    document.documentElement.style.setProperty('--campaign-bg-expand-to-sidebar', bgExpandToSidebar ? '1' : '0');
    document.documentElement.style.setProperty('--campaign-bg-expand-to-header', bgExpandToHeader ? '1' : '0');
  }, [bgOpacity, bgBlur, headerBgOpacity, headerBlur, sidebarBgOpacity, sidebarBlur, bgExpandToSidebar, bgExpandToHeader]);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const [campaignRes, styleRes] = await Promise.all([
          fetch(`/api/campaigns/${params.id}`),
          fetch(`/api/campaigns/${params.id}/style`),
        ]);

        if (!campaignRes.ok) {
          throw new Error('Failed to fetch campaign');
        }

        const campaignData = await campaignRes.json();
        setInitialData({
          name: campaignData.campaign.name,
          description: campaignData.campaign.description || '',
          image: campaignData.campaign.image || '',
          backgroundImage: campaignData.campaign.backgroundImage || '',
        });

        if (styleRes.ok) {
          const styleData = await styleRes.json();
          setBgOpacity(styleData.bgOpacity ?? 0.8);
          setBgBlur(styleData.bgBlur ?? 4);
          setBgExpandToSidebar(styleData.bgExpandToSidebar ?? false);
          setBgExpandToHeader(styleData.bgExpandToHeader ?? false);
          setHeaderBgOpacity(styleData.headerBgOpacity ?? 0.95);
          setHeaderBlur(styleData.headerBlur ?? 0);
          setSidebarBgOpacity(styleData.sidebarBgOpacity ?? 1.0);
          setSidebarBlur(styleData.sidebarBlur ?? 0);
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
        toast.error('Failed to load campaign');
        router.push('/campaigns');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (params.id) {
      fetchCampaign();
    }
  }, [params.id, router]);

  const handleSubmit = async (data: CampaignFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/campaigns/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || '',
          image: data.image || '',
          backgroundImage: data.backgroundImage || '',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update campaign');
      }

      toast.success('Campaign updated successfully!');
      router.push(`/campaigns/${params.id}`);
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStyle = async () => {
    setIsSavingStyle(true);

    try {
      const response = await fetch(`/api/campaigns/${params.id}/style`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bgOpacity,
          bgBlur,
          bgExpandToSidebar,
          bgExpandToHeader,
          headerBgOpacity,
          headerBlur,
          sidebarBgOpacity,
          sidebarBlur,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update style');
      }

      toast.success('Background settings saved');
    } catch (error) {
      console.error('Error saving style:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSavingStyle(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/campaigns/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete campaign');
      }

      toast.success('Campaign deleted successfully');
      router.push('/campaigns');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete campaign');
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };



  if (isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!initialData) {
    return null;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Edit Campaign</CardTitle>
            <CardDescription>
              Update your campaign details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignForm
              initialData={initialData}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitText="Update Campaign"
            />
          </CardContent>
        </Card>

        {/* Background Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Background Settings</CardTitle>
            <CardDescription>
              Customize how your background image is displayed (live preview)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Header Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">Header</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="header-opacity">Background Opacity</Label>
                    <span className="text-sm text-muted-foreground">{Math.round(headerBgOpacity * 100)}%</span>
                  </div>
                  <Slider
                    id="header-opacity"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[headerBgOpacity]}
                    onValueChange={(values) => setHeaderBgOpacity(values[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="header-blur">Blur</Label>
                    <span className="text-sm text-muted-foreground">{Math.round(headerBlur)}px</span>
                  </div>
                  <Slider
                    id="header-blur"
                    min={0}
                    max={50}
                    step={1}
                    value={[headerBlur]}
                    onValueChange={(values) => setHeaderBlur(values[0])}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bg-header"
                    checked={bgExpandToHeader}
                    onCheckedChange={(checked) => setBgExpandToHeader(checked as boolean)}
                  />
                  <Label htmlFor="bg-header" className="cursor-pointer">
                    Expand background to header
                  </Label>
                </div>
              </div>

              {/* Sidebar Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">Sidebar</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sidebar-opacity">Background Opacity</Label>
                    <span className="text-sm text-muted-foreground">{Math.round(sidebarBgOpacity * 100)}%</span>
                  </div>
                  <Slider
                    id="sidebar-opacity"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[sidebarBgOpacity]}
                    onValueChange={(values) => setSidebarBgOpacity(values[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sidebar-blur">Blur</Label>
                    <span className="text-sm text-muted-foreground">{Math.round(sidebarBlur)}px</span>
                  </div>
                  <Slider
                    id="sidebar-blur"
                    min={0}
                    max={50}
                    step={1}
                    value={[sidebarBlur]}
                    onValueChange={(values) => setSidebarBlur(values[0])}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bg-sidebar"
                    checked={bgExpandToSidebar}
                    onCheckedChange={(checked) => setBgExpandToSidebar(checked as boolean)}
                  />
                  <Label htmlFor="bg-sidebar" className="cursor-pointer">
                    Expand background to sidebar
                  </Label>
                </div>
              </div>
            </div>

            {/* Main background settings */}
            <div className="mt-6 pt-6 border-t space-y-4">
              <h3 className="font-semibold text-lg mb-4">Main Background</h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bg-opacity">Overlay Opacity</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(bgOpacity * 100)}%</span>
                </div>
                <Slider
                  id="bg-opacity"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[bgOpacity]}
                  onValueChange={(values) => setBgOpacity(values[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bg-blur">Blur</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(bgBlur)}px</span>
                </div>
                <Slider
                  id="bg-blur"
                  min={0}
                  max={50}
                  step={1}
                  value={[bgBlur]}
                  onValueChange={(values) => setBgBlur(values[0])}
                />
              </div>
            </div>
            <Button onClick={handleSaveStyle} disabled={isSavingStyle}>
              {isSavingStyle ? 'Saving...' : 'Save Background Settings'}
            </Button>          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this campaign and all its data. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Campaign
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone and will delete all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
