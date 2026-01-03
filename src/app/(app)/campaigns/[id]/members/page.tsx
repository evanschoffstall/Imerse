"use client"

import { RoleLevel } from "@/lib/permissions"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar: string | null
}

interface CampaignMember {
  id: string
  role: string
  isAdmin: boolean
  permissions: string[] | null
  createdAt: string
  user: User
}

interface MemberListProps {
  campaignId: string
}

export default function MembersPage({ params }: { params: { id: string } }) {
  const campaignId = params.id
  const router = useRouter()

  const [members, setMembers] = useState<CampaignMember[]>([])
  const [owner, setOwner] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Add member form state
  const [addingMember, setAddingMember] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberRole, setNewMemberRole] = useState<RoleLevel>(RoleLevel.MEMBER)
  const [newMemberIsAdmin, setNewMemberIsAdmin] = useState(false)
  const [addError, setAddError] = useState("")

  useEffect(() => {
    fetchMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/members`)
      if (!response.ok) {
        throw new Error("Failed to fetch members")
      }
      const data = await response.json()
      setMembers(data.members)
      setOwner(data.owner)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError("")
    setAddingMember(true)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newMemberEmail,
          role: newMemberRole,
          isAdmin: newMemberIsAdmin,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add member")
      }

      // Refresh members list
      await fetchMembers()

      // Reset form
      setNewMemberEmail("")
      setNewMemberRole(RoleLevel.MEMBER)
      setNewMemberIsAdmin(false)
    } catch (err: any) {
      setAddError(err.message)
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return
    }

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/members/${userId}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to remove member")
      }

      await fetchMembers()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleUpdateRole = async (
    userId: string,
    newRole: string,
    newIsAdmin: boolean
  ) => {
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/members/${userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole, isAdmin: newIsAdmin }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update member")
      }

      await fetchMembers()
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading members...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Campaign Members</h1>
          <Link
            href={`/campaigns/${campaignId}`}
            className="text-blue-600 hover:underline"
          >
            ← Back to Campaign
          </Link>
        </div>

        {/* Campaign Owner */}
        {owner && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Campaign Owner</h3>
                <p className="text-gray-700">{owner.name}</p>
                <p className="text-sm text-gray-500">{owner.email}</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                Owner
              </span>
            </div>
          </div>
        )}

        {/* Add Member Form */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Member</h2>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Email
              </label>
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user@example.com"
                required
                disabled={addingMember}
              />
              <p className="text-sm text-gray-500 mt-1">
                The user must already have an account
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as RoleLevel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={addingMember}
                >
                  <option value={RoleLevel.MEMBER}>Member</option>
                  <option value={RoleLevel.VIEWER}>Viewer</option>
                  <option value={RoleLevel.ADMIN}>Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Access
                </label>
                <label className="flex items-center space-x-2 h-10">
                  <input
                    type="checkbox"
                    checked={newMemberIsAdmin}
                    onChange={(e) => setNewMemberIsAdmin(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={addingMember}
                  />
                  <span className="text-sm text-gray-700">Make admin</span>
                </label>
              </div>
            </div>

            {addError && (
              <div className="text-red-600 text-sm">{addError}</div>
            )}

            <button
              type="submit"
              disabled={addingMember}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {addingMember ? "Adding..." : "Add Member"}
            </button>
          </form>
        </div>

        {/* Members List */}
        <div className="bg-white border rounded-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">
              Members ({members.length})
            </h2>
          </div>

          {members.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No members yet. Add members to collaborate on this campaign.
            </div>
          ) : (
            <ul className="divide-y">
              {members.map((member) => (
                <li key={member.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {member.user.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleUpdateRole(
                              member.user.id,
                              e.target.value,
                              member.isAdmin
                            )
                          }
                          className="text-sm px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value={RoleLevel.MEMBER}>Member</option>
                          <option value={RoleLevel.VIEWER}>Viewer</option>
                          <option value={RoleLevel.ADMIN}>Admin</option>
                        </select>

                        <label className="flex items-center space-x-1 text-sm">
                          <input
                            type="checkbox"
                            checked={member.isAdmin}
                            onChange={(e) =>
                              handleUpdateRole(
                                member.user.id,
                                member.role,
                                e.target.checked
                              )
                            }
                            className="w-3 h-3"
                          />
                          <span>Admin</span>
                        </label>

                        {member.isAdmin && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Joined {new Date(member.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveMember(member.user.id)}
                      className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
