'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
              className="w-6 h-6 rounded-full border border-gray-300 shrink-0"
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
            <div className="flex items-center gap-1 shrink-0">
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
                disabled={index === moons.length - 1}
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
                className="text-destructive hover:text-destructive"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      {editingIndex !== null && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-purple-900">
              {editingIndex >= moons.length ? 'Add Moon' : 'Edit Moon'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Moon Name */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="moon-name">Moon Name</Label>
                <Input
                  id="moon-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g., Luna"
                />
              </div>

              {/* Cycle Length */}
              <div className="space-y-2">
                <Label htmlFor="cycle-length">Cycle Length (days)</Label>
                <Input
                  id="cycle-length"
                  type="number"
                  min="1"
                  max="365"
                  value={editForm.cycle}
                  onChange={(e) => setEditForm({ ...editForm, cycle: parseInt(e.target.value) || 30 })}
                />
                <p className="text-xs text-muted-foreground">
                  Days for complete phase cycle
                </p>
              </div>

              {/* Phase Shift */}
              <div className="space-y-2">
                <Label htmlFor="phase-shift">Phase Shift (days)</Label>
                <Input
                  id="phase-shift"
                  type="number"
                  min="0"
                  max={editForm.cycle - 1}
                  value={editForm.shift}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setEditForm({ ...editForm, shift: Math.min(val, editForm.cycle - 1) });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Offset from year start
                </p>
              </div>

              {/* Color Picker */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="moon-color">Moon Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="moon-color"
                    value={editForm.color}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    className="h-10 w-20 cursor-pointer rounded"
                  />
                  <Input
                    type="text"
                    value={editForm.color}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    className="flex-1 font-mono text-sm"
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
              <Button onClick={handleSave}>
                Save Moon
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Button */}
      {editingIndex === null && (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={handleAdd}
        >
          + Add Moon
        </Button>
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
