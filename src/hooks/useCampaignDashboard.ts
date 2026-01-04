import { cachedFetch } from "@/lib/api-cache";
import { useEffect, useState } from "react";

interface DashboardStats {
  hasCharacters: boolean;
  hasLocations: boolean;
}

interface RecentEntity {
  id: string;
  name: string;
  type: string;
  updatedAt: string;
  imageId?: string | null;
}

interface Quest {
  id: string;
  name: string;
  updatedAt: string;
  status: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentEntities: RecentEntity[];
  activeQuests: Quest[];
}

export function useCampaignDashboard(campaignId: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await cachedFetch<DashboardData>(
          `/api/campaigns/${campaignId}/dashboard`
        );
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId]);

  return { data, loading, error };
}
