'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarMonth } from '@/types/calendar'
import { useState } from 'react'

interface MonthEditorProps {
  months: CalendarMonth[]
  onChange: (months: CalendarMonth[]) => void
}

export default function MonthEditor({ months: initialMonths, onChange }: MonthEditorProps) {
  const [months, setMonths] = useState<CalendarMonth[]>(initialMonths)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAddMonth = () => {
    const newMonth: CalendarMonth = {
      name: `Month ${months.length + 1}`,
      length: 30,
      intercalary: false,
    }
    const updated = [...months, newMonth]
    setMonths(updated)
    onChange(updated)
    setEditingIndex(updated.length - 1)
  }

  const handleUpdateMonth = (index: number, updates: Partial<CalendarMonth>) => {
    const updated = months.map((month, i) =>
      i === index ? { ...month, ...updates } : month
    )
    setMonths(updated)
    onChange(updated)
  }

  const handleRemoveMonth = (index: number) => {
    if (!confirm('Are you sure you want to remove this month?')) return
    const updated = months.filter((_, i) => i !== index)
    setMonths(updated)
    onChange(updated)
    setEditingIndex(null)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updated = [...months]
      ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    setMonths(updated)
    onChange(updated)
  }

  const handleMoveDown = (index: number) => {
    if (index === months.length - 1) return
    const updated = [...months]
      ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    setMonths(updated)
    onChange(updated)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Months Configuration</CardTitle>
        <Button onClick={handleAddMonth} size="sm">
          + Add Month
        </Button>
      </CardHeader>
      <CardContent>

        {months.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No months configured. Click "Add Month" to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {months.map((month, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${editingIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
              >
                {editingIndex === index ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={`month-name-${index}`}>Month Name</Label>
                      <Input
                        id={`month-name-${index}`}
                        type="text"
                        value={month.name}
                        onChange={(e) => handleUpdateMonth(index, { name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`month-days-${index}`}>Number of Days</Label>
                      <Input
                        id={`month-days-${index}`}
                        type="number"
                        min="1"
                        max="366"
                        value={month.length}
                        onChange={(e) => handleUpdateMonth(index, { length: parseInt(e.target.value) || 30 })}
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        id={`intercalary-${index}`}
                        checked={month.intercalary || false}
                        onCheckedChange={(checked) => handleUpdateMonth(index, { intercalary: Boolean(checked) })}
                      />
                      <span>Intercalary month (special/leap month)</span>
                    </label>

                    <div className="flex justify-end pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingIndex(null)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 font-medium">{index + 1}.</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {month.name}
                          {month.intercalary && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                              Intercalary
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{month.length} days</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === months.length - 1}
                        title="Move down"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndex(index)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMonth(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="text-sm">
            <strong>Total:</strong> {months.length} months, {months.reduce((sum, m) => sum + m.length, 0)} days in year
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
