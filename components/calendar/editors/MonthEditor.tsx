'use client'

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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Months Configuration</h2>
        <button
          onClick={handleAddMonth}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          + Add Month
        </button>
      </div>

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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month Name
                    </label>
                    <input
                      type="text"
                      value={month.name}
                      onChange={(e) => handleUpdateMonth(index, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Days
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="366"
                      value={month.length}
                      onChange={(e) => handleUpdateMonth(index, { length: parseInt(e.target.value) || 30 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`intercalary-${index}`}
                      checked={month.intercalary || false}
                      onChange={(e) => handleUpdateMonth(index, { intercalary: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`intercalary-${index}`} className="ml-2 block text-sm text-gray-700">
                      Intercalary month (special/leap month)
                    </label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Done
                    </button>
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
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === months.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingIndex(index)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveMonth(index)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-700">
          <strong>Total:</strong> {months.length} months, {months.reduce((sum, m) => sum + m.length, 0)} days in year
        </div>
      </div>
    </div>
  )
}
