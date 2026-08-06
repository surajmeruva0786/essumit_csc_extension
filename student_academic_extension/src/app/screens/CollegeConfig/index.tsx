import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import CollegeSelector from '../../components/CollegeConfig/CollegeSelector'
import FeatureToggles, { FeatureKey } from '../../components/CollegeConfig/FeatureToggles'
import { useCollegeConfig } from '../../context/CollegeConfigContext'
import { type CollegeConfig } from '../../config/collegeConfig'
import { Plus, Trash2, Palette, ExternalLink, FileText, GraduationCap } from 'lucide-react'

export default function CollegeConfigScreen() {
  const { colleges, activeCollegeId, updateCollege, addCollege, deleteCollege } = useCollegeConfig()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCollege, setNewCollege] = useState({
    name: '',
    portalUrl: '',
    primaryColor: '#2563eb',
    attendance: true,
    assignments: true,
    notifications: true,
    timetable: true,
    cgpa: true,
    priorityPinning: true,
  })

  const activeCollege = colleges.find((c) => c.id === activeCollegeId)

  const handleAddCollege = () => {
    if (!newCollege.name || !newCollege.portalUrl) return
    const config: Omit<CollegeConfig, 'id'> = {
      name: newCollege.name,
      portalUrl: newCollege.portalUrl,
      branding: {
        logo: '/icons/icon128.png',
        primaryColor: newCollege.primaryColor,
        name: newCollege.name,
      },
      featureFlags: {
        attendance: newCollege.attendance,
        assignments: newCollege.assignments,
        notifications: newCollege.notifications,
        timetable: newCollege.timetable,
        cgpa: newCollege.cgpa,
        priorityPinning: newCollege.priorityPinning,
      },
      selectors: {
        attendance: '',
        assignments: '',
        notices: '',
        results: '',
      },
    }
    addCollege(config)
    setNewCollege({
      name: '',
      portalUrl: '',
      primaryColor: '#2563eb',
      attendance: true,
      assignments: true,
      notifications: true,
      timetable: true,
      cgpa: true,
      priorityPinning: true,
    })
    setShowAddForm(false)
  }

  const handleDelete = (id: string) => {
    if (colleges.length <= 1) {
      alert('Cannot delete the last college configuration.')
      return
    }
    if (confirm('Are you sure you want to delete this college configuration?')) {
      deleteCollege(id)
    }
  }

  const features = ['attendance', 'assignments', 'notifications', 'timetable', 'cgpa', 'priorityPinning'] as FeatureKey[]

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">College Configuration</h1>
        <p className="text-muted-foreground text-sm">Manage portal URLs, branding, and feature flags for each institution</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active College</CardTitle>
            </CardHeader>
            <CardContent>
              <CollegeSelector />
              {activeCollege && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette size={16} className="text-muted-foreground" />
                    <div
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: activeCollege.branding.primaryColor }}
                    />
                    <span className="text-sm">{activeCollege.branding.primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink size={16} className="text-muted-foreground" />
                    <a
                      href={activeCollege.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate"
                    >
                      {activeCollege.portalUrl}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feature Flags</CardTitle>
            </CardHeader>
            <CardContent>
              {activeCollege ? (
                <FeatureToggles collegeId={activeCollege.id} />
              ) : (
                <p className="text-sm text-muted-foreground">Select a college to manage features</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Institutions</CardTitle>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs"
              >
                <Plus size={14} />
                Add
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {colleges.map((college) => (
                  <div
                    key={college.id}
                    className={`flex items-center justify-between p-2 rounded-md border ${
                      college.id === activeCollegeId ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} className="text-muted-foreground" />
                      <span className="text-sm font-medium">{college.name}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(college.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {showAddForm && (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <input
                    type="text"
                    placeholder="College name"
                    value={newCollege.name}
                    onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Portal URL"
                    value={newCollege.portalUrl}
                    onChange={(e) => setNewCollege({ ...newCollege, portalUrl: e.target.value })}
                    className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Primary Color:</label>
                    <input
                      type="color"
                      value={newCollege.primaryColor}
                      onChange={(e) => setNewCollege({ ...newCollege, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    {features.map((feature) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{feature}</span>
                        <button
                          role="switch"
                          aria-checked={newCollege[feature]}
                          onClick={() => setNewCollege({ ...newCollege, [feature]: !newCollege[feature] })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            newCollege[feature] ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              newCollege[feature] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleAddCollege}
                    disabled={!newCollege.name || !newCollege.portalUrl}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                    Add College
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette size={18} />
                Branding Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeCollege ? (
                <div className="space-y-4">
                  <div
                    className="rounded-lg border border-border p-6"
                    style={{ borderColor: activeCollege.branding.primaryColor }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: activeCollege.branding.primaryColor }}
                      >
                        {activeCollege.branding.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{activeCollege.branding.name}</div>
                        <div className="text-xs text-muted-foreground">{activeCollege.portalUrl}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {features.map((feature) => (
                        <div
                          key={feature}
                          className={`p-3 rounded-md border text-center ${
                            activeCollege.featureFlags[feature]
                              ? 'border-green-500/30 bg-green-500/5'
                              : 'border-border bg-muted/30'
                          }`}
                        >
                          <div className="text-xs text-muted-foreground capitalize">{feature}</div>
                          <div className="text-sm font-medium mt-1">
                            {activeCollege.featureFlags[feature] ? 'Enabled' : 'Disabled'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Select a college to preview branding</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText size={18} />
                Configuration Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold mt-0">Adding a New Institution</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the "Add" form on the left to create a new college configuration. Each institution requires:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1 mt-2">
                    <li>A unique name for identification</li>
                    <li>The portal URL where the institution hosts its academic portal</li>
                    <li>A primary brand color for theming</li>
                    <li>Feature flags to enable or disable modules per college</li>
                    <li>CSS selectors for scraping attendance, assignments, notices, and results from the portal</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-base font-semibold mt-4">Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    All configurations are persisted to <code className="bg-muted px-1 py-0.5 rounded text-xs">chrome.storage.local</code>.
                    In development, they fall back to <code className="bg-muted px-1 py-0.5 rounded text-xs">localStorage</code>.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold mt-4">Selectors</h3>
                  <p className="text-sm text-muted-foreground">
                    CSS selectors tell the extension which DOM elements to scrape from the institution's portal.
                    Update these per college to match their specific HTML structure.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {activeCollege && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">CSS Selectors for {activeCollege.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(Object.keys(activeCollege.selectors) as (keyof typeof activeCollege.selectors)[]).map((selector) => (
                    <div key={selector} className="space-y-1">
                      <label className="text-sm font-medium capitalize">{selector}</label>
                      <input
                        type="text"
                        value={activeCollege.selectors[selector]}
                        onChange={(e) =>
                          updateCollege(activeCollege.id, {
                            selectors: { ...activeCollege.selectors, [selector]: e.target.value },
                          })
                        }
                        className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. .attendance-table"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
