'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface Weekday {
  name: string;
  isWeekend?: boolean;
}

interface WeekdayEditorProps {
  weekdays: string[];
  onChange: (weekdays: string[]) => void;
}

export default function WeekdayEditor({ weekdays, onChange }: WeekdayEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    const newWeekdays = [...weekdays, 'New Day'];
    onChange(newWeekdays);
    setEditingIndex(newWeekdays.length - 1);
    setEditName('New Day');
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditName(weekdays[index]);
  };

  const handleSave = () => {
    if (editingIndex === null) return;

    if (!editName.trim()) {
      alert('Day name is required');
      return;
    }

    const newWeekdays = [...weekdays];
    newWeekdays[editingIndex] = editName.trim();
    onChange(newWeekdays);
    setEditingIndex(null);
  };

  const handleCancel = () => {
    setEditingIndex(null);
  };

  const handleRemove = (index: number) => {
    if (weekdays.length <= 1) {
      alert('Must have at least one weekday');
      return;
    }
    if (confirm('Remove this day?')) {
      const newWeekdays = weekdays.filter((_, i) => i !== index);
      onChange(newWeekdays);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newWeekdays = [...weekdays];
    [newWeekdays[index - 1], newWeekdays[index]] = [newWeekdays[index], newWeekdays[index - 1]];
    onChange(newWeekdays);
  };

  const handleMoveDown = (index: number) => {
    if (index === weekdays.length - 1) return;
    const newWeekdays = [...weekdays];
    [newWeekdays[index], newWeekdays[index + 1]] = [newWeekdays[index + 1], newWeekdays[index]];
    onChange(newWeekdays);
  };

  const loadPreset = (preset: string) => {
    const presets: Record<string, string[]> = {
      standard: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      fantasy: ['Fireday', 'Earthday', 'Airday', 'Waterday', 'Spiritday'],
      elder_scrolls: ['Morndas', 'Tirdas', 'Middas', 'Turdas', 'Fredas', 'Loredas', 'Sundas'],
      tolkien: ['Sterday', 'Sunday', 'Monday', 'Trewsday', 'Hevensday', 'Mersday', 'Highday'],
      six_day: ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'],
      eight_day: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8'],
      ten_day: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'],
    };

    if (confirm(`Load ${preset} preset? This will replace current weekdays.`)) {
      onChange(presets[preset] || presets.standard);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preset Selector */}
      <div className="space-y-2">
        <Label>Load Preset</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { key: 'standard', label: '7-Day (Standard)' },
            { key: 'short', label: '7-Day (Short)' },
            { key: 'fantasy', label: '5-Day (Fantasy)' },
            { key: 'six_day', label: '6-Day Week' },
            { key: 'eight_day', label: '8-Day Week' },
            { key: 'ten_day', label: '10-Day Week' },
            { key: 'elder_scrolls', label: 'Elder Scrolls' },
            { key: 'tolkien', label: 'Tolkien' },
          ].map((preset) => (
            <Button
              key={preset.key}
              variant="outline"
              size="sm"
              onClick={() => loadPreset(preset.key)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Weekday List */}
      <div className="space-y-2">
        {weekdays.map((day, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            {/* Position Number */}
            <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 font-semibold rounded shrink-0">
              {index + 1}
            </div>

            {/* Weekday Info */}
            {editingIndex === index ? (
              <Input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                className="flex-1 border-blue-300"
                placeholder="Day name"
                autoFocus
              />
            ) : (
              <div className="flex-1 min-w-0">
                <div className="font-medium">{day}</div>
                <div className="text-xs text-gray-500">
                  Day {index + 1} of {weekdays.length}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {editingIndex === index ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className="text-green-600 hover:text-green-600"
                  >
                    ✓ Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                  >
                    ✕ Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    title="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === weekdays.length - 1}
                    title="Move down"
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    disabled={weekdays.length <= 1}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      {editingIndex === null && (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={handleAdd}
        >
          + Add Day
        </Button>
      )}

      {/* Week Summary */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium mb-2">Week Configuration</div>
        <div className="space-y-1 text-sm text-gray-600">
          <div>
            <span className="font-medium">Week Length:</span> {weekdays.length} day{weekdays.length !== 1 ? 's' : ''}
          </div>
          <div>
            <span className="font-medium">Day Names:</span> {weekdays.join(', ')}
          </div>
        </div>
      </div>

      {/* Week Visualization */}
      <div>
        <label className="block text-sm font-medium mb-2">Week Preview</label>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(weekdays.length, 7)}, minmax(0, 1fr))` }}>
          {weekdays.map((day, index) => (
            <div
              key={index}
              className="p-2 bg-blue-50 border border-blue-200 rounded text-center"
            >
              <div className="text-xs text-blue-600 font-medium mb-1">Day {index + 1}</div>
              <div className="text-sm font-semibold">{day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-900">
          <div className="font-medium mb-1">💡 Tip:</div>
          <div className="text-blue-700">
            Week length affects calendar grid layout. Most fantasy worlds use 5-10 day weeks.
            Standard Earth week is 7 days. Use presets above for quick setup.
          </div>
        </div>
      </div>
    </div>
  );
}
