import { useCollegeConfig } from '../../context/CollegeConfigContext'
import { ChevronDown, Building2 } from 'lucide-react'

export default function CollegeSelector() {
  const { colleges, activeCollege, setActiveCollegeId } = useCollegeConfig()

  return (
    <div className="flex items-center gap-2">
      <Building2 size={16} className="text-muted-foreground" />
      <div className="relative">
        <select
          value={activeCollege?.id || ''}
          onChange={(e) => setActiveCollegeId(e.target.value)}
          className="appearance-none bg-background border border-border rounded-md pl-8 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {colleges.map((college) => (
            <option key={college.id} value={college.id}>
              {college.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  )
}
