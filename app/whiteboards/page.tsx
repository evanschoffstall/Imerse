"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog-new";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WhiteboardWithRelations } from "@/types/whiteboard";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WhiteboardsPage({
  searchParams,
}: {
  searchParams: { campaignId?: string };
}) {
  const router = useRouter();
  const [whiteboards, setWhiteboards] = useState<WhiteboardWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const campaignId = searchParams.campaignId;

  useEffect(() => {
    if (!campaignId) return;

    fetchWhiteboards();
  }, [campaignId]);

  const fetchWhiteboards = async () => {
    try {
      const res = await fetch(`/api/whiteboards?campaignId=${campaignId}`);
      if (res.ok) {
        const data = await res.json();
        setWhiteboards(data);
      }
    } catch (error) {
      console.error("Failed to fetch whiteboards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim() || !campaignId) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/whiteboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          campaignId,
        }),
      });

      if (res.ok) {
        const whiteboard = await res.json();
        router.push(`/whiteboards/${whiteboard.id}`);
      }
    } catch (error) {
      console.error("Failed to create whiteboard:", error);
    } finally {
      setIsCreating(false);
      setNewName("");
    }
  };

  if (!campaignId) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Please select a campaign</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Whiteboards</h1>
          <p className="text-muted-foreground">
            Collaborative spaces for brainstorming and planning
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>New Whiteboard</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Whiteboard</DialogTitle>
              <DialogDescription>
                Start a new collaborative whiteboard
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Campaign Planning"
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={isCreating || !newName.trim()}
                className="w-full"
              >
                {isCreating ? "Creating..." : "Create Whiteboard"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : whiteboards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No whiteboards yet. Create one to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {whiteboards.map((whiteboard) => (
            <Card
              key={whiteboard.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => router.push(`/whiteboards/${whiteboard.id}`)}
            >
              {whiteboard.thumbnail && (
                <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                  <img
                    src={whiteboard.thumbnail}
                    alt={whiteboard.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{whiteboard.name}</CardTitle>
                <CardDescription>
                  {whiteboard.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(whiteboard.updatedAt))} ago
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
