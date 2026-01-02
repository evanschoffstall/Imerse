'use client'

import { Button } from '@/components/ui/button'
import {
  EntityType,
  FieldDiff,
  formatFieldValue,
  getFieldLabel,
  getVersionLabel,
  getVersionTimestamp,
  Version,
} from '@/types/version'
import * as React from 'react'
import { toast } from 'sonner'

export interface VersionHistoryProps {
  entityType: EntityType
  entityId: string
  campaignId: string
  entityName?: string
}

export function VersionHistory({
  entityType,
  entityId,
  campaignId,
  entityName,
}: VersionHistoryProps) {
  const [versions, setVersions] = React.useState<Version[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedVersion, setSelectedVersion] = React.useState<Version | null>(null)
  const [compareVersion, setCompareVersion] = React.useState<Version | null>(null)
  const [diff, setDiff] = React.useState<FieldDiff[]>([])
  const [comparing, setComparing] = React.useState(false)
  const [restoring, setRestoring] = React.useState(false)
  const [showTimeline, setShowTimeline] = React.useState(false)

  const fetchVersions = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/versions?entityType=${entityType}&entityId=${entityId}&campaignId=${campaignId}`
      )
      if (!response.ok) throw new Error('Failed to fetch versions')
      const data = await response.json()
      setVersions(data.versions)
    } catch (error) {
      console.error('Error fetching versions:', error)
      toast.error('Failed to load version history')
    } finally {
      setLoading(false)
    }
  }, [entityType, entityId, campaignId])

  React.useEffect(() => {
    fetchVersions()
  }, [fetchVersions])

  const handleViewVersion = (version: Version) => {
    setSelectedVersion(version)
    setCompareVersion(null)
    setDiff([])
  }

  const handleCompare = async (v1: Version, v2: Version) => {
    setComparing(true)
    try {
      const response = await fetch(
        `/api/versions/compare?version1Id=${v1.id}&version2Id=${v2.id}`
      )
      if (!response.ok) throw new Error('Failed to compare versions')
      const data = await response.json()
      setDiff(data.diff)
      setSelectedVersion(v1)
      setCompareVersion(v2)
    } catch (error) {
      console.error('Error comparing versions:', error)
      toast.error('Failed to compare versions')
    } finally {
      setComparing(false)
    }
  }

  const handleRestore = async (version: Version) => {
    if (
      !confirm(
        `Are you sure you want to restore to version ${version.versionNumber}? This will replace the current version.`
      )
    ) {
      return
    }

    setRestoring(true)
    try {
      const response = await fetch(`/api/versions/${version.id}/restore`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to restore version')

      toast.success('Version restored successfully')
      setSelectedVersion(null)
      setCompareVersion(null)
      fetchVersions()
      // Reload the page to show restored data
      window.location.reload()
    } catch (error) {
      console.error('Error restoring version:', error)
      toast.error('Failed to restore version')
    } finally {
      setRestoring(false)
    }
  }

  const closeDetailView = () => {
    setSelectedVersion(null)
    setCompareVersion(null)
    setDiff([])
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Version History</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowTimeline(!showTimeline)}
            size="sm"
            variant="secondary"
          >
            {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
          </Button>
        </div>
      </div>

      {/* No versions message */}
      {versions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No version history available yet. Versions will be created automatically when you edit
          this entity.
        </p>
      ) : (
        <>
          {/* Timeline View */}
          {showTimeline && (
            <div className="mb-6 space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleViewVersion(version)}
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                    {version.versionNumber}
                  </div>
                  <div className="grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{getVersionLabel(version)}</span>
                      {index === 0 && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                      {version.changeType === 'create' && (
                        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded">
                          Created
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {version.changesMade || 'Updated entity'}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>{version.createdBy?.name}</span>
                      <span>•</span>
                      <span>{getVersionTimestamp(version)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {index > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCompare(versions[index - 1], version)
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700"
                        disabled={comparing}
                      >
                        Compare
                      </button>
                    )}
                    {index > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRestore(version)
                        }}
                        className="text-sm text-green-600 hover:text-green-700"
                        disabled={restoring}
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detail View */}
          {selectedVersion && (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold mb-2">
                    {getVersionLabel(selectedVersion)}
                    {compareVersion && ` vs ${getVersionLabel(compareVersion)}`}
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>By {selectedVersion.createdBy?.name}</p>
                    <p>{getVersionTimestamp(selectedVersion)}</p>
                    {selectedVersion.changesMade && (
                      <p className="mt-2 italic">{selectedVersion.changesMade}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeDetailView}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* Comparison View */}
              {compareVersion && diff.length > 0 ? (
                <div className="space-y-4">
                  <h5 className="font-medium">Changes:</h5>
                  {diff.map((fieldDiff, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-900 rounded"
                    >
                      <div className="font-medium mb-2">
                        {getFieldLabel(entityType, fieldDiff.field)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            - Old:
                          </span>
                          <pre className="mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs overflow-x-auto">
                            {formatFieldValue(fieldDiff.oldValue)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            + New:
                          </span>
                          <pre className="mt-1 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs overflow-x-auto">
                            {formatFieldValue(fieldDiff.newValue)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Snapshot View */
                <div className="space-y-3">
                  <h5 className="font-medium">Snapshot:</h5>
                  <div className="max-h-96 overflow-y-auto">
                    <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded overflow-x-auto">
                      {JSON.stringify(selectedVersion.snapshot, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                {versions[0].id !== selectedVersion.id && (
                  <Button
                    onClick={() => handleRestore(selectedVersion)}
                    disabled={restoring}
                    variant="default"
                  >
                    {restoring ? 'Restoring...' : 'Restore This Version'}
                  </Button>
                )}
                <Button onClick={closeDetailView} variant="secondary">
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {!selectedVersion && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total Versions:</span>
                  <span className="ml-2 font-medium">{versions.length}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">First Created:</span>
                  <span className="ml-2 font-medium">
                    {getVersionTimestamp(versions[versions.length - 1])}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                  <span className="ml-2 font-medium">
                    {getVersionTimestamp(versions[0])}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
