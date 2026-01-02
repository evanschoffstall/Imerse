'use client';

import { CalendarMoon } from '@/types/calendar';
import { useState } from 'react';

interface MoonEditorProps {
  moons: CalendarMoon[];
  onChange: (moons: CalendarMoon[]) => void;
}

export default function MoonEditor({ moons, onChange }: MoonEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CalendarMoon>({
    name: '',
    cycle: 30,
    shift: 0,
    color: '#a78bfa',
  });

  const handleAdd = () => {
    const newMoon: CalendarMoon = {
      name: 'New Moon',
      cycle: 30,
      shift: 0,
      color: '#a78bfa',
    };
    setEditForm(newMoon);
    setEditingIndex(moons.length);
  };

  const handleEdit = (index: number) => {
    setEditForm({ ...moons[index] });
    setEditingIndex(index);
  };

  const handleSave = () => {
    if (editingIndex === null) return;

    // Validate
    if (!editForm.name.trim()) {
      alert('Moon name is required');
      return;
    }
    if (editForm.cycle < 1 || editForm.cycle > 365) {
      alert('Cycle must be between 1 and 365 days');
      return;
    }
    if (editForm.shift < 0 || editForm.shift >= editForm.cycle) {
      alert(`Shift must be between 0 and ${editForm.cycle - 1}`);
      return;
    }

    const newMoons = [...moons];
    if (editingIndex >= newMoons.length) {
      newMoons.push(editForm);
    } else {
      newMoons[editingIndex] = editForm;
    }

    onChange(newMoons);
    setEditingIndex(null);
  };

  const handleCancel = () => {
    setEditingIndex(null);
  };

  const handleRemove = (index: number) => {
    if (confirm('Remove this moon?')) {
      const newMoons = moons.filter((_, i) => i !== index);
      onChange(newMoons);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newMoons = [...moons];
    [newMoons[index - 1], newMoons[index]] = [newMoons[index], newMoons[index - 1]];
    onChange(newMoons);
  };

  const handleMoveDown = (index: number) => {
    if (index === moons.length - 1) return;
    const newMoons = [...moons];
    [newMoons[index], newMoons[index + 1]] = [newMoons[index + 1], newMoons[index]];
    onChange(newMoons);
  };

  const getMoonPhase = (dayOfYear: number, moon: CalendarMoon): string => {
    const adjustedDay = (dayOfYear + moon.shift) % moon.cycle;
    const phase = adjustedDay / moon.cycle;

    if (phase < 0.0625 || phase >= 0.9375) return '🌑'; // New Moon
    if (phase < 0.1875) return '🌒'; // Waxing Crescent
    if (phase < 0.3125) return '🌓'; // First Quarter
    if (phase < 0.4375) return '🌔'; // Waxing Gibbous
    if (phase < 0.5625) return '🌕'; // Full Moon
    if (phase < 0.6875) return '🌖'; // Waning Gibbous
    if (phase < 0.8125) return '🌗'; // Last Quarter
    return '🌘'; // Waning Crescent
  };

  const getMoonPhaseName = (dayOfYear: number, moon: CalendarMoon): string => {
    const adjustedDay = (dayOfYear + moon.shift) % moon.cycle;
    const phase = adjustedDay / moon.cycle;

    if (phase < 0.0625 || phase >= 0.9375) return 'New Moon';
    if (phase < 0.1875) return 'Waxing Crescent';
    if (phase < 0.3125) return 'First Quarter';
    if (phase < 0.4375) return 'Waxing Gibbous';
    if (phase < 0.5625) return 'Full Moon';
    if (phase < 0.6875) return 'Waning Gibbous';
    if (phase < 0.8125) return 'Last Quarter';
    return 'Waning Crescent';
  };

  return (
    <div className="space-y-4">
      {/* Moon List */}
      <div className="space-y-2">
        {moons.map((moon, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            {/* Moon Color */}
            <div
              className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
              style={{ backgroundColor: moon.color }}
            />

            {/* Moon Info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium">{moon.name}</div>
              <div className="text-sm text-gray-600">
                {moon.cycle} day cycle, shift: {moon.shift}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span>Phases:</span>
                {[0, Math.floor(moon.cycle * 0.25), Math.floor(moon.cycle * 0.5), Math.floor(moon.cycle * 0.75)].map((day) => (
                  <span key={day}>{getMoonPhase(day, moon)}</span>
                ))}
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
                disabled={index === moons.length - 1}
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
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
          <h3 className="font-semibold text-purple-900">
            {editingIndex >= moons.length ? 'Add Moon' : 'Edit Moon'}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Moon Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Moon Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Luna"
              />
            </div>

            {/* Cycle Length */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Cycle Length (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={editForm.cycle}
                onChange={(e) => setEditForm({ ...editForm, cycle: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Days for complete phase cycle
              </p>
            </div>

            {/* Phase Shift */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Phase Shift (days)
              </label>
              <input
                type="number"
                min="0"
                max={editForm.cycle - 1}
                value={editForm.shift}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setEditForm({ ...editForm, shift: Math.min(val, editForm.cycle - 1) });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Offset from year start
              </p>
            </div>

            {/* Color Picker */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Moon Color</label>
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
                  placeholder="#a78bfa"
                />
              </div>
            </div>

            {/* Phase Preview */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Phase Preview</label>
              <div className="grid grid-cols-4 gap-2">
                {[0, Math.floor(editForm.cycle * 0.25), Math.floor(editForm.cycle * 0.5), Math.floor(editForm.cycle * 0.75)].map((day, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-gray-200 text-center"
                  >
                    <div className="text-3xl mb-1">{getMoonPhase(day, editForm)}</div>
                    <div className="text-xs font-medium text-gray-700">
                      {getMoonPhaseName(day, editForm)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Day {day}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Full cycle: {editForm.cycle} days • Approx. {Math.floor(365 / editForm.cycle)} cycles/year
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Cycle Timeline</label>
              <div className="relative h-16 bg-gray-100 rounded-lg overflow-hidden">
                {/* Phase indicators */}
                {Array.from({ length: Math.min(editForm.cycle, 30) }).map((_, idx) => {
                  const dayOfCycle = Math.floor((idx / 30) * editForm.cycle);
                  const phase = getMoonPhase(dayOfCycle, editForm);
                  return (
                    <div
                      key={idx}
                      className="absolute top-0 bottom-0 flex items-center justify-center text-xs"
                      style={{
                        left: `${(idx / 30) * 100}%`,
                        width: `${100 / 30}%`,
                      }}
                    >
                      {idx % 5 === 0 && phase}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Save Moon
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
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600"
        >
          + Add Moon
        </button>
      )}

      {/* Moon Summary */}
      {moons.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium mb-2">Moon Summary</div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Total Moons: {moons.length}</div>
            <div>
              Cycle Lengths: {moons.map((m) => m.cycle).join(', ')} days
            </div>
            <div>
              Average Cycle: {Math.round(moons.reduce((sum, m) => sum + m.cycle, 0) / moons.length)} days
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
