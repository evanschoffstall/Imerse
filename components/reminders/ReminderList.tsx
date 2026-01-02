"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReminderWithRelations } from "@/types/reminder";
import { formatDistanceToNow } from "date-fns";

interface ReminderListProps {
  reminders: ReminderWithRelations[];
  onEdit?: (reminder: ReminderWithRelations) => void;
  onDelete?: (reminderId: string) => void;
}

export function ReminderList({ reminders, onEdit, onDelete }: ReminderListProps) {
  if (reminders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No reminders yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reminders.map((reminder) => (
        <Card key={reminder.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{reminder.name}</CardTitle>
                <CardDescription>
                  {reminder.description}
                </CardDescription>
              </div>
              <Badge variant="outline">{reminder.eventType.name}</Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-2 text-sm">
              {reminder.calendarDate && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{reminder.calendarDate}</span>
                </div>
              )}

              {reminder.calendar && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Calendar:</span>
                  <span>{reminder.calendar.name}</span>
                </div>
              )}

              {reminder.isRecurring && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Recurring</Badge>
                  {reminder.recurrenceRule && (
                    <span className="text-muted-foreground">
                      {(reminder.recurrenceRule as any).type}
                    </span>
                  )}
                </div>
              )}

              {reminder.isNotification && reminder.notifyBefore && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Notify:</span>
                  <span>{reminder.notifyBefore} days before</span>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-2">
                Created {formatDistanceToNow(new Date(reminder.createdAt))} ago
              </div>
            </div>

            {(onEdit || onDelete) && (
              <div className="flex gap-2 mt-4">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(reminder)}
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(reminder.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
