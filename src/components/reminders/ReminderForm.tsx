"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-radix";
import { Textarea } from "@/components/ui/textarea";
import type { CreateReminderInput, EntityEventType } from "@/types/reminder";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface ReminderFormProps {
  campaignId: string;
  entityType: string;
  entityId: string;
  eventTypes: EntityEventType[];
  calendars?: Array<{ id: string; name: string }>;
  onSubmit: (data: CreateReminderInput) => void;
  onCancel?: () => void;
  defaultValues?: Partial<CreateReminderInput>;
}

export function ReminderForm({
  campaignId,
  entityType,
  entityId,
  eventTypes,
  calendars = [],
  onSubmit,
  onCancel,
  defaultValues,
}: ReminderFormProps) {
  const [isRecurring, setIsRecurring] = useState(defaultValues?.isRecurring || false);
  const [recurrenceType, setRecurrenceType] = useState<string>("yearly");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateReminderInput>({
    defaultValues: {
      campaignId,
      entityType,
      entityId,
      isRecurring: false,
      isNotification: false,
      ...defaultValues,
    },
  });

  const handleFormSubmit = (data: CreateReminderInput) => {
    // Build recurrence rule if recurring
    const recurrenceRule = isRecurring
      ? {
        type: recurrenceType as any,
        interval: 1,
      }
      : undefined;

    onSubmit({
      ...data,
      isRecurring,
      recurrenceRule,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          {...register("name", { required: "Name is required" })}
          placeholder="e.g., Birthday, Death Anniversary"
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Additional details about this reminder"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="eventTypeId">Event Type *</Label>
        <Select
          onValueChange={(value) => setValue("eventTypeId", value)}
          defaultValue={defaultValues?.eventTypeId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.eventTypeId && (
          <p className="text-sm text-red-500 mt-1">{errors.eventTypeId.message}</p>
        )}
      </div>

      {calendars.length > 0 && (
        <>
          <div>
            <Label htmlFor="calendarId">Calendar</Label>
            <Select
              onValueChange={(value) => setValue("calendarId", value)}
              defaultValue={defaultValues?.calendarId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select calendar (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {calendars.map((calendar) => (
                  <SelectItem key={calendar.id} value={calendar.id}>
                    {calendar.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="calendarDate">Date</Label>
            <Input
              id="calendarDate"
              type="date"
              {...register("calendarDate")}
              placeholder="YYYY-MM-DD"
            />
          </div>
        </>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isRecurring"
          checked={isRecurring}
          onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
        />
        <Label htmlFor="isRecurring">Recurring reminder</Label>
      </div>

      {isRecurring && (
        <div>
          <Label htmlFor="recurrenceType">Recurrence</Label>
          <Select
            value={recurrenceType}
            onValueChange={setRecurrenceType}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="moon">Moon-based</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isNotification"
          {...register("isNotification")}
        />
        <Label htmlFor="isNotification">Enable notifications</Label>
      </div>

      {watch("isNotification") && (
        <div>
          <Label htmlFor="notifyBefore">Notify (days before)</Label>
          <Input
            id="notifyBefore"
            type="number"
            min="0"
            {...register("notifyBefore", { valueAsNumber: true })}
            placeholder="e.g., 7"
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Reminder"}
        </Button>
      </div>
    </form>
  );
}
