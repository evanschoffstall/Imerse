'use client';

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
        <form onSubmit={handleSubmit} className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
          <h3 className="font-semibold text-blue-900">
            {editingId ? 'Edit Weather' : 'Add Weather Entry'}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Date */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="YYYY-MM-DD (e.g., 2024-03-15)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: YYYY-MM-DD (negative years supported)
              </p>
            </div>

            {/* Weather Type */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Weather Type</label>
              <div className="grid grid-cols-4 gap-2">
                {WEATHER_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, weatherType: type.value })}
                    className={`p-2 rounded-lg border-2 text-center transition ${formData.weatherType === type.value
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-300 bg-white hover:border-blue-300'
                      }`}
                  >
                    <div className="text-2xl">{type.icon}</div>
                    <div className="text-xs mt-1">{type.label.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium mb-1">Temperature</label>
              <input
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., 22.5"
              />
              <p className="text-xs text-gray-500 mt-1">In your preferred units</p>
            </div>

            {/* Wind */}
            <div>
              <label className="block text-sm font-medium mb-1">Wind</label>
              <input
                type="text"
                value={formData.wind}
                onChange={(e) => setFormData({ ...formData, wind: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Light breeze"
              />
            </div>

            {/* Precipitation */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Precipitation</label>
              <input
                type="text"
                value={formData.precipitation}
                onChange={(e) => setFormData({ ...formData, precipitation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., 5mm, Heavy, Light showers"
              />
            </div>

            {/* Effect */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Effect / Notes</label>
              <textarea
                value={formData.effect}
                onChange={(e) => setFormData({ ...formData, effect: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
                placeholder="e.g., Travel delays, Flooding in lowlands"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Add Weather'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600"
        >
          + Add Weather Entry
        </button>
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
                <div className="text-3xl flex-shrink-0">{weatherType?.icon || '☀️'}</div>

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
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(w)}
                        className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
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
