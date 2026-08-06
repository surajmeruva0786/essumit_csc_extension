import { useState } from 'react'
import { Link } from 'react-router'
import { useDrop, useDrag } from 'react-dnd'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useQuickActions } from '../../context/QuickActionsContext'
import { ActionEditor } from './ActionEditor'
import { Trash2, GripVertical, Plus, X, ArrowUpDown } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { QuickAction } from '../../context/QuickActionsContext'

const ItemTypes = { ACTION: 'action' }

interface DragItem {
  index: number
  id: string
  type: string
}

interface QuickActionCardProps {
  action: QuickAction
  index: number
  onRemove: (id: string) => void
  isRearrangeMode: boolean
  onReorder: (fromIndex: number, toIndex: number) => void
}

function QuickActionCard({ action, index, onRemove, isRearrangeMode, onReorder }: QuickActionCardProps) {
  const IconComponent = Icons[action.icon as keyof typeof Icons] as React.ComponentType<{ size?: number }> | undefined

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    type: ItemTypes.ACTION,
    item: { id: action.id, index, type: ItemTypes.ACTION } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [{ isOver }, dropRef] = useDrop({
    accept: ItemTypes.ACTION,
    drop: (item: DragItem) => {
      if (item.index !== index) {
        onReorder(item.index, index)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  const setRef = (node: HTMLDivElement | null) => {
    dragRef(node)
    dropRef(node)
    previewRef(node)
  }

  return (
    <Card
      ref={setRef}
      className={`relative transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isOver ? 'ring-2 ring-primary' : ''}`}
    >
      <CardContent className="p-4">
        {isRearrangeMode && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <button
              onClick={() => onRemove(action.id)}
              className="p-1 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
              title="Remove action"
            >
              <Trash2 size={14} />
            </button>
            <div className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground">
              <GripVertical size={14} />
            </div>
          </div>
        )}
        <Link
          to={action.url}
          className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors"
        >
          <div className="p-3 rounded-lg bg-muted text-primary">
            {IconComponent ? <IconComponent size={24} /> : null}
          </div>
          <span className="text-sm font-medium text-center">{action.label}</span>
          {action.shortcut && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {action.shortcut}
            </span>
          )}
        </Link>
      </CardContent>
    </Card>
  )
}

export default function QuickActionsPanel() {
  const { actions, addAction, removeAction, reorderActions } = useQuickActions()
  const [isRearrangeMode, setIsRearrangeMode] = useState(false)
  const [showEditor, setShowEditor] = useState(false)

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quick Actions</h1>
          <p className="text-muted-foreground text-sm">Customize your shortcuts and portal links</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRearrangeMode(!isRearrangeMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm border transition-colors ${
              isRearrangeMode ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-accent'
            }`}
          >
            <ArrowUpDown size={16} />
            {isRearrangeMode ? 'Done' : 'Rearrange'}
          </button>
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Add Action
          </button>
        </div>
      </div>

      {showEditor && (
        <ActionEditor
          onSave={(action) => {
            addAction(action)
            setShowEditor(false)
          }}
          onCancel={() => setShowEditor(false)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <QuickActionCard
            key={action.id}
            action={action}
            index={index}
            onRemove={removeAction}
            isRearrangeMode={isRearrangeMode}
            onReorder={reorderActions}
          />
        ))}
      </div>

      {actions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No quick actions configured. Click "Add Action" to get started.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
