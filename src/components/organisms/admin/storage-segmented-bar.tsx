import { useState } from 'react'
import { formatBytes } from '@/shared/lib'
import { usePrefersReducedMotion } from '@/shared/hooks/use-prefers-reduced-motion'
import type { CloudStorageStats } from '@/features/admin/api'
import type { StorageSegment, StorageSegmentId } from './storage-segmented-bar.types'
import { calculateStorageSegments } from './storage-segmented-bar-math'

type Props = {
  cloud: CloudStorageStats
}

function SegmentItem({
  segment,
  isActive,
  isDimmed,
  reducedMotion,
  onHover,
  onSelect,
}: {
  segment: StorageSegment
  isActive: boolean
  isDimmed: boolean
  reducedMotion: boolean
  onHover: (id: StorageSegmentId | null) => void
  onSelect: (id: StorageSegmentId) => void
}) {
  const minWidth = segment.percentage > 0 ? 'min-w-[8px]' : 'min-w-0'
  const motionClasses = reducedMotion ? '' : 'transition-all duration-200 ease-out'
  const stateClasses = isActive
    ? 'z-10 scale-y-125 shadow-sm ring-1 ring-primary/60 brightness-110'
    : isDimmed
      ? 'opacity-40 grayscale-[20%]'
      : 'opacity-100 hover:brightness-105'

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid={`storage-segment-${segment.id}`}
      aria-label={`${segment.label}: ${formatBytes(segment.bytes)} (${segment.percentage}%)`}
      onClick={() => onSelect(segment.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(segment.id)
        }
      }}
      onMouseEnter={() => onHover(segment.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(segment.id)}
      onBlur={() => onHover(null)}
      className={[
        'h-full first:rounded-l-lg last:rounded-r-lg cursor-pointer outline-none',
        segment.colorClass,
        minWidth,
        motionClasses,
        stateClasses,
      ].join(' ')}
      style={{ width: `${segment.percentage}%` }}
    />
  )
}

function SegmentLegendPill({
  segment,
  isActive,
  onHover,
  onSelect,
}: {
  segment: StorageSegment
  isActive: boolean
  onHover: (id: StorageSegmentId | null) => void
  onSelect: (id: StorageSegmentId) => void
}) {
  return (
    <button
      type="button"
      data-testid={`storage-legend-${segment.id}`}
      onClick={() => onSelect(segment.id)}
      onMouseEnter={() => onHover(segment.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(segment.id)}
      onBlur={() => onHover(null)}
      className={[
        'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border text-left',
        'transition-all duration-150 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary',
        isActive
          ? 'bg-muted/80 border-primary/50 shadow-2xs scale-[1.02]'
          : 'bg-card/70 border-border/60 hover:bg-muted/50 text-muted-foreground',
      ].join(' ')}
    >
      <span className={`size-2 rounded-full shrink-0 ring-2 ${segment.dotClass}`} />
      <span className="text-foreground font-semibold">{segment.label}:</span>
      <span className="tabular-nums text-foreground/90 font-bold">{formatBytes(segment.bytes)}</span>
      <span className="text-[10px] text-muted-foreground tabular-nums">({segment.percentage}%)</span>
    </button>
  )
}

function SegmentTooltipCard({ active }: { active: StorageSegment | undefined }) {
  if (!active) return null

  return (
    <div
      data-testid="storage-segment-tooltip"
      role="status"
      className={[
        'flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg border',
        'border-border/80 bg-popover/90 backdrop-blur-md shadow-md text-xs',
        'animate-in fade-in zoom-in-95 duration-150',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        <span className={`size-2.5 rounded-full ring-2 ${active.dotClass}`} />
        <span className="font-semibold text-foreground">{active.label}</span>
        {active.count !== undefined && (
          <span className="text-muted-foreground">({active.count} archivos)</span>
        )}
      </div>
      <div className="flex items-center gap-1.5 font-bold tabular-nums text-foreground">
        <span>{formatBytes(active.bytes)}</span>
        <span className="text-muted-foreground text-[11px] font-normal">({active.percentage}%)</span>
      </div>
    </div>
  )
}

export function StorageSegmentedBar({ cloud }: Props) {
  const [hoveredId, setHoveredId] = useState<StorageSegmentId | null>(null)
  const [selectedId, setSelectedId] = useState<StorageSegmentId | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const { segments, totalUsedPercentage, totalUsedBytes, quotaBytes } =
    calculateStorageSegments(cloud)

  const activeId = hoveredId ?? selectedId
  const activeSegment = segments.find((s) => s.id === activeId)

  const handleSelect = (id: StorageSegmentId) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  return (
    <section className="space-y-2.5" aria-label="Uso detallado de almacenamiento">
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="text-foreground">
          Uso en la nube:{' '}
          <span className="font-bold tabular-nums text-foreground">{totalUsedPercentage}%</span>
        </span>
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          {formatBytes(totalUsedBytes)} de {formatBytes(quotaBytes)}
        </span>
      </div>

      <div
        data-testid="storage-segmented-bar"
        className="h-3.5 rounded-xl border border-border/70 bg-muted/30 p-0.5 flex overflow-hidden shadow-inner"
      >
        {segments.map((segment) => (
          <SegmentItem
            key={segment.id}
            segment={segment}
            isActive={activeId === segment.id}
            isDimmed={activeId !== null && activeId !== segment.id}
            reducedMotion={reducedMotion}
            onHover={setHoveredId}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <div className="min-h-7">
        <SegmentTooltipCard active={activeSegment} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {segments.map((segment) => (
          <SegmentLegendPill
            key={segment.id}
            segment={segment}
            isActive={activeId === segment.id}
            onHover={setHoveredId}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </section>
  )
}
