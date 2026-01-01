'use client';

import { CalendarSeason } from '@/types/calendar';
import { useState } from 'react';

interface SeasonEditorProps {
  seasons: CalendarSeason[];
  months: Array<{ name: string; length: number; intercalary: boolean }>;
  onChange: (seasons: CalendarSeason[]) => void;
}

export default function SeasonEditor({ seasons, months, onChange }: SeasonEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CalendarSeason>({
    name: '',
    monthStart: 1,
    monthEnd: 1,
    color: '#3b82f6',
  });

  const handleAdd = () => {
    const newSeason: CalendarSeason = {
      name: 'New Season',
      monthStart: 1,
      monthEnd: Math.min(3, months.length),
      color: '#3b82f6',
    };
    setEditForm(newSeason);
    setEditingIndex(seasons.length);
  };

  const handleEdit = (index: number) => {
    setEditForm({ ...seasons[index] });
    setEditingIndex(index);
  };

  const handleSave = () => {
    if (editingIndex === null) return;

    // Validate month range
    if (editForm.monthStart < 1 || editForm.monthStart > months.length) {
      alert(`Start month must be between 1 and ${months.length}`);
      return;
    }
    if (editForm.monthEnd < 1 || editForm.monthEnd > months.length) {
      alert(`End month must be between 1 and ${months.length}`);
      return;
    }
    if (!editForm.name.trim()) {
      alert('Season name is required');
      return;
    }

    const newSeasons = [...seasons];
    if (editingIndex >= newSeasons.length) {
      newSeasons.push(editForm);
    } else {
      newSeasons[editingIndex] = editForm;
    }

    onChange(newSeasons);
    setEditingIndex(null);
  };

  const handleCancel = () => {
    setEditingIndex(null);
  };

  const handleRemove = (index: number) => {
    if (confirm('Remove this season?')) {
      const newSeasons = seasons.filter((_, i) => i !== index);
      onChange(newSeasons);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSeasons = [...seasons];
    [newSeasons[index - 1], newSeasons[index]] = [newSeasons[index], newSeasons[index - 1]];
    onChange(newSeasons);
  };

  const handleMoveDown = (index: number) => {
    if (index === seasons.length - 1) return;
    const newSeasons = [...seasons];
    [newSeasons[index], newSeasons[index + 1]] = [newSeasons[index + 1], newSeasons[index]];
    onChange(newSeasons);
  };

  const getSeasonDuration = (season: CalendarSeason): number => {
    let days = 0;
    const start = season.monthStart - 1;
    const end = season.monthEnd - 1;

    if (start <= end) {
      // Normal range
      for (let i = start; i <= end; i++) {
        if (months[i]) {
          days += months[i].length;
        }
      }
    } else {
      // Wraps around year end
      for (let i = start; i < months.length; i++) {
        if (months[i]) {
          days += months[i].length;
        }
      }
      for (let i = 0; i <= end; i++) {
        if (months[i]) {
          days += months[i].length;
        }
      }
    }

    return days;
  };

  const getSeasonMonthNames = (season: CalendarSeason): string => {
    const start = season.monthStart - 1;
    const end = season.monthEnd - 1;
    const names: string[] = [];

    if (start <= end) {
      for (let i = start; i <= end; i++) {
        if (months[i]) {
          names.push(months[i].name);
        }
      }
    } else {
      for (let i = start; i < months.length; i++) {
        if (months[i]) {
          names.push(months[i].name);
        }
      }
      for (let i = 0; i <= end; i++) {
        if (months[i]) {
          names.push(months[i].name);
        }
      }
    }

    return names.join(', ');
  };

  if (months.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please add months before creating seasons.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Season List */}
      <div className="space-y-2">
        {seasons.map((season, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            {/* Season Color */}
            <div
              className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
              style={{ backgroundColor: season.color }}
            />

            {/* Season Info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium">{season.name}</div>
              <div className="text-sm text-gray-600">
                Months {season.monthStart}-{season.monthEnd} ({getSeasonDuration(season)} days)
              </div>
              <div className="text-xs text-gray-500 truncate">
                {getSeasonMonthNames(season)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-30"
                title="Move up"
              >
                ↑
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === seasons.length - 1}
                className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-30"
                title="Move down"
              >
                ↓
              </button>
              <button
                onClick={() => handleEdit(index)}
                className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleRemove(index)}
                className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      {editingIndex !== null && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
          <h3 className="font-semibold text-blue-900">
            {editingIndex >= seasons.length ? 'Add Season' : 'Edit Season'}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Season Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Season Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Spring"
              />
            </div>

            {/* Start Month */}
            <div>
              <label className="block text-sm font-medium mb-1">Start Month</label>
              <select
                value={editForm.monthStart}
                onChange={(e) => setEditForm({ ...editForm, monthStart: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {months.map((month, idx) => (
                  <option key={idx} value={idx + 1}>
                    {idx + 1}. {month.name}
                  </option>
                ))}
              </select>
            </div>

            {/* End Month */}
            <div>
              <label className="block text-sm font-medium mb-1">End Month</label>
              <select
                value={editForm.monthEnd}
                onChange={(e) => setEditForm({ ...editForm, monthEnd: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {months.map((month, idx) => (
                  <option key={idx} value={idx + 1}>
                    {idx + 1}. {month.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Picker */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Season Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editForm.color}
                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  className="h-10 w-20 cursor-pointer"
                />
                <input
                  type="text"
                  value={editForm.color}
                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Preview</label>
              <div
                className="h-12 rounded-lg border-2"
                style={{ backgroundColor: editForm.color, borderColor: editForm.color }}
              >
                <div className="h-full flex items-center justify-center text-white font-semibold drop-shadow-md">
                  {editForm.name || 'Season Name'}
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Duration: {getSeasonDuration(editForm)} days
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Season
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {editingIndex === null && (
        <button
          onClick={handleAdd}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600"
        >
          + Add Season
        </button>
      )}

      {/* Season Bar Visualization */}
      {seasons.length > 0 && (
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Season Distribution</label>
          <div className="flex h-8 rounded-lg overflow-hidden border border-gray-300">
            {seasons.map((season, index) => {
              const duration = getSeasonDuration(season);
              const totalDays = months.reduce((sum, m) => sum + m.length, 0);
              const percentage = totalDays > 0 ? (duration / totalDays) * 100 : 0;

              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: season.color,
                    width: `${percentage}%`,
                  }}
                  className="flex items-center justify-center text-xs font-medium text-white"
                  title={`${season.name}: ${duration} days (${percentage.toFixed(1)}%)`}
                >
                  {percentage > 10 && season.name}
                </div>
              );
            })}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Total: {seasons.length} season{seasons.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
