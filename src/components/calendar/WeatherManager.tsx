'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarWeather, parseCalendarDate } from '@/types/calendar';
import { useState } from 'react';

interface WeatherManagerProps {
  calendarId: string;
  weather: CalendarWeather[];
  onUpdate: () => void;
}

const WEATHER_TYPES = [
  { value: 'clear', label: 'Clear ☀️', icon: '☀️' },
  { value: 'cloudy', label: 'Cloudy ☁️', icon: '☁️' },
  { value: 'rain', label: 'Rain 🌧️', icon: '🌧️' },
  { value: 'snow', label: 'Snow ❄️', icon: '❄️' },
  { value: 'storm', label: 'Storm ⛈️', icon: '⛈️' },
  { value: 'fog', label: 'Fog 🌫️', icon: '🌫️' },
  { value: 'wind', label: 'Windy 💨', icon: '💨' },
  { value: 'hail', label: 'Hail 🧊', icon: '🧊' },
];

export default function WeatherManager({ calendarId, weather, onUpdate }: WeatherManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    weatherType: 'clear',
    temperature: '',
    precipitation: '',
    wind: '',
    effect: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      date: '',
      weatherType: 'clear',
      temperature: '',
      precipitation: '',
      wind: '',
      effect: '',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (w: CalendarWeather) => {
    setFormData({
      date: w.date,
      weatherType: w.weatherType || 'clear',
      temperature: w.temperature?.toString() || '',
      precipitation: w.precipitation || '',
      wind: w.wind || '',
      effect: w.effect || '',
    });
    setEditingId(w.id);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date) {
      alert('Date is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        calendarId,
        date: formData.date,
        weatherType: formData.weatherType,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        precipitation: formData.precipitation || null,
        wind: formData.wind || null,
        effect: formData.effect || null,
      };

      const url = editingId
        ? `/api/calendars/${calendarId}/weather/${editingId}`
        : `/api/calendars/${calendarId}/weather`;

      const response = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save weather');
      }

      resetForm();
      onUpdate();
    } catch (error) {
      console.error('Failed to save weather:', error);
      alert(error instanceof Error ? error.message : 'Failed to save weather');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this weather entry?')) return;

    try {
      const response = await fetch(`/api/calendars/${calendarId}/weather/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete weather');
      }

      onUpdate();
    } catch (error) {
      console.error('Failed to delete weather:', error);
      alert('Failed to delete weather');
    }
  };

  // Sort weather by date
  const sortedWeather = [...weather].sort((a, b) => {
    const dateA = parseCalendarDate(a.date);
    const dateB = parseCalendarDate(b.date);

    // Handle null dates
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    if (dateA.year !== dateB.year) return dateA.year - dateB.year;
    if (dateA.month !== dateB.month) return dateA.month - dateB.month;
    return dateA.day - dateB.day;
  });

  return (
    <div className="space-y-4">
      {/* Add/Edit Form */}
      {isAdding ? (
        <form onSubmit={handleSubmit}>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-blue-900">
                {editingId ? 'Edit Weather' : 'Add Weather Entry'}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="weather-date">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="weather-date"
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="YYYY-MM-DD (e.g., 2024-03-15)"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: YYYY-MM-DD (negative years supported)
                  </p>
                </div>

                {/* Weather Type */}
                <div className="col-span-2 space-y-2">
                  <Label>Weather Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {WEATHER_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        type="button"
                        variant={formData.weatherType === type.value ? 'default' : 'outline'}
                        className="p-2 h-auto flex flex-col items-center"
                        onClick={() => setFormData({ ...formData, weatherType: type.value })}
                      >
                        <div className="text-2xl">{type.icon}</div>
                        <div className="text-xs mt-1">{type.label.split(' ')[0]}</div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    placeholder="e.g., 22.5"
                  />
                  <p className="text-xs text-muted-foreground">In your preferred units</p>
                </div>

                {/* Wind */}
                <div className="space-y-2">
                  <Label htmlFor="wind">Wind</Label>
                  <Input
                    id="wind"
                    type="text"
                    value={formData.wind}
                    onChange={(e) => setFormData({ ...formData, wind: e.target.value })}
                    placeholder="e.g., Light breeze"
                  />
                </div>

                {/* Precipitation */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="precipitation">Precipitation</Label>
                  <Input
                    id="precipitation"
                    type="text"
                    value={formData.precipitation}
                    onChange={(e) => setFormData({ ...formData, precipitation: e.target.value })}
                    placeholder="e.g., 5mm, Heavy, Light showers"
                  />
                </div>

                {/* Effect */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="effect">Effect / Notes</Label>
                  <Textarea
                    id="effect"
                    value={formData.effect}
                    onChange={(e) => setFormData({ ...formData, effect: e.target.value })}
                    rows={2}
                    placeholder="e.g., Travel delays, Flooding in lowlands"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Add Weather'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setIsAdding(true)}
        >
          + Add Weather Entry
        </Button>
      )}

      {/* Weather List */}
      <div className="space-y-2">
        {sortedWeather.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No weather entries yet. Add one above to track weather conditions.
          </div>
        ) : (
          sortedWeather.map((w) => {
            const weatherType = WEATHER_TYPES.find((t) => t.value === w.weatherType);
            return (
              <div
                key={w.id}
                className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300"
              >
                {/* Weather Icon */}
                <div className="text-3xl shrink-0">{weatherType?.icon || '☀️'}</div>

                {/* Weather Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{w.date}</div>
                      <div className="text-sm text-gray-600">
                        {weatherType?.label || w.weatherType}
                        {w.temperature !== null && ` • ${w.temperature}°`}
                        {w.wind && ` • ${w.wind}`}
                      </div>
                      {w.precipitation && (
                        <div className="text-sm text-gray-600">💧 {w.precipitation}</div>
                      )}
                      {w.effect && (
                        <div className="text-sm text-gray-500 mt-1">{w.effect}</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(w)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(w.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Weather Summary */}
      {weather.length > 0 && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium mb-2">Weather Summary</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            {WEATHER_TYPES.map((type) => {
              const count = weather.filter((w) => w.weatherType === type.value).length;
              if (count === 0) return null;
              return (
                <div key={type.value} className="flex items-center gap-1">
                  <span>{type.icon}</span>
                  <span className="text-gray-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
