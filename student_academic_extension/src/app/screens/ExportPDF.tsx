import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Download, FileText, Printer, Share2, CalendarCheck, BarChart3 } from 'lucide-react'

const semesters = [
  { id: '1', name: 'Semester 1' },
  { id: '2', name: 'Semester 2' },
  { id: '3', name: 'Semester 3' },
  { id: '4', name: 'Semester 4' },
  { id: '5', name: 'Semester 5' },
]

export default function ExportPDF() {
  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Export Summary</h1>
        <p className="text-muted-foreground text-sm">Export attendance and marks summary as PDF</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CalendarCheck size={20} className="text-blue-500" />
            <CardTitle className="text-base">Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Semester</label>
              <select className="w-full px-3 py-2 border border-border rounded-md text-sm">
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>{sem.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                <Download size={16} />
                Export PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm">
                <Printer size={16} />
                Print
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 size={20} className="text-green-500" />
            <CardTitle className="text-base">Marks Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Semester</label>
              <select className="w-full px-3 py-2 border border-border rounded-md text-sm">
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>{sem.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                <Download size={16} />
                Export PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm">
                <Printer size={16} />
                Print
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>PDF preview will be displayed here</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <button className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-md text-xs">
                  <Share2 size={14} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
