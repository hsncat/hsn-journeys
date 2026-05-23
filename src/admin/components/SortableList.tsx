// ============================================================
// SortableList — drag-and-drop reorderable list using @dnd-kit
// ============================================================
import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: (props: { dragHandle: React.ReactNode }) => React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const dragHandle = (
    <button
      type="button"
      className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 touch-none"
      {...attributes}
      {...listeners}
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 6a2 2 0 110-4 2 2 0 010 4zm8 0a2 2 0 110-4 2 2 0 010 4zM8 13a2 2 0 110-4 2 2 0 010 4zm8 0a2 2 0 110-4 2 2 0 010 4zM8 20a2 2 0 110-4 2 2 0 010 4zm8 0a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    </button>
  );

  return (
    <div ref={setNodeRef} style={style}>
      {children({ dragHandle })}
    </div>
  );
}

interface SortableListProps<T> {
  items: T[];
  getId: (item: T, index: number) => string;
  renderItem: (item: T, index: number, dragHandle: React.ReactNode) => React.ReactNode;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export default function SortableList<T>({ items, getId, renderItem, onReorder }: SortableListProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = items.findIndex((item, i) => getId(item, i) === active.id);
    const toIndex = items.findIndex((item, i) => getId(item, i) === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      onReorder(fromIndex, toIndex);
    }
  }

  const ids = items.map((item, i) => getId(item, i));

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item, i) => (
            <SortableItem key={ids[i]} id={ids[i]}>
              {({ dragHandle }) => renderItem(item, i, dragHandle)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
