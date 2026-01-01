'use client';

import { CalendarDate, parseCalendarDate } from '@/types/calendar';
import { Character } from '@/types/character';
import { Event } from '@/types/event';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CalendarEventListProps {
  calendarId: string;
  campaignId: string;
  selectedDate?: CalendarDate;
  month?: number;
  year?: number;
}

export default function CalendarEventList({
  calendarId,
  campaignId,
  selectedDate,
  month,
  year,
}: CalendarEventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [birthdays, setBirthdays] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch events for this calendar
        const eventsRes = await fetch(
          `/api/events?campaignId=${campaignId}&calendarId=${calendarId}`
        );
        if (eventsRes.ok) {
          const data = await eventsRes.json();
          setEvents(data.events || []);
        }

        // Fetch characters with birthdays on this calendar
        const charactersRes = await fetch(`/api/characters?campaignId=${campaignId}`);
        if (charactersRes.ok) {
          const data = await charactersRes.json();
          const withBirthdays = data.characters.filter(
            (c: Character) => c.birthCalendarId === calendarId && c.birthDate
          );
          setBirthdays(withBirthdays);
        }
      } catch (error) {
        console.error('Failed to fetch calendar data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [calendarId, campaignId]);

  const getEventsForDate = (date: CalendarDate): Event[] => {
    const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;

    return events.filter((event) => {
      if (!event.calendarDate) return false;

      if (event.isRecurring && event.recurrenceRule) {
        // Check if event occurs on this date (simplified check)
        return event.calendarDate === dateStr;
      }

      return event.calendarDate === dateStr;
    });
  };

  const getBirthdaysForDate = (date: CalendarDate): Character[] => {
    return birthdays.filter((character) => {
      if (!character.birthDate) return false;
      const birthDate = parseCalendarDate(character.birthDate);
      if (!birthDate) return false;

      // Match month and day (birthdays recur yearly)
      return birthDate.month === date.month && birthDate.day === date.day;
    });
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading events...
      </div>
    );
  }

  // If specific date selected, show events for that date
  if (selectedDate) {
    const dateEvents = getEventsForDate(selectedDate);
    const dateBirthdays = getBirthdaysForDate(selectedDate);

    if (dateEvents.length === 0 && dateBirthdays.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          No events or birthdays on this date.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Events */}
        {dateEvents.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Events</h3>
            <div className="space-y-2">
              {dateEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-blue-900">{event.name}</div>
                      {event.type && (
                        <div className="text-sm text-blue-600">{event.type}</div>
                      )}
                      {event.isRecurring && (
                        <div className="text-xs text-blue-500 mt-1">🔄 Recurring</div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Birthdays */}
        {dateBirthdays.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Birthdays</h3>
            <div className="space-y-2">
              {dateBirthdays.map((character) => {
                const birthDate = parseCalendarDate(character.birthDate!);
                const age = birthDate
                  ? selectedDate.year - birthDate.year
                  : null;

                return (
                  <Link
                    key={character.id}
                    href={`/characters/${character.id}`}
                    className="block p-3 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-purple-900">
                          🎂 {character.name}
                        </div>
                        {age !== null && age > 0 && (
                          <div className="text-sm text-purple-600">
                            Turning {age} years old
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show all events and birthdays for the month/year
  return (
    <div className="space-y-4">
      {/* Upcoming Events */}
      {events.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Events ({events.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.slice(0, 20).map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {event.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.calendarDate}
                      {event.type && ` • ${event.type}`}
                    </div>
                    {event.isRecurring && (
                      <div className="text-xs text-blue-600 mt-1">🔄 Recurring</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Birthdays */}
      {birthdays.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Birthdays ({birthdays.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {birthdays.map((character) => (
              <Link
                key={character.id}
                href={`/characters/${character.id}`}
                className="block p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">🎂</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {character.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {character.birthDate}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && birthdays.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>No events or birthdays on this calendar yet.</p>
          <p className="text-sm mt-2">
            Add events or character birthdays to see them here!
          </p>
        </div>
      )}
    </div>
  );
}
