import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import QuickActionsPanel from '../components/QuickActions/QuickActionsPanel'

export default function QuickActions() {
  return (
    <DndProvider backend={HTML5Backend}>
      <QuickActionsPanel />
    </DndProvider>
  )
}
