"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EntityEventTimeline } from "@/types/reminder";
import { useMemo } from "react";

interface EntityEventTimelineProps {
  timeline: EntityEventTimeline;
}

export function EntityEventTimelineView({ timeline }: EntityEventTimelineProps) {
  const sortedEvents = useMemo(() => {
    return [...timeline.events].sort((a, b) => {
      return a.date.localeCompare(b.date);
    });
  }, [timeline.events]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{timeline.entityName} - Event Timeline</CardTitle>
        <CardDescription>
          {timeline.birthDate && (
            <span>Born: {timeline.birthDate}</span>
          )}
          {timeline.deathDate && (
            <span className="ml-4">Died: {timeline.deathDate}</span>
          )}
          {timeline.age && (
            <span className="ml-4">Age: {timeline.age.displayString}</span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {sortedEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No events recorded yet
          </p>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event) => (
              <div key={event.id} className="flex gap-4 border-l-2 border-primary pl-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{event.name}</h4>
                    <Badge variant="outline">{event.eventType.name}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.date}
                  </p>
                  {event.description && (
                    <p className="text-sm mt-2">{event.description}</p>
                  )}
                  {event.age && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Age: {event.age.displayString}
                    </p>
                  )}
                  {event.elapsed && (
                    <p className="text-xs text-muted-foreground">
                      {event.elapsed.displayString} ago
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
