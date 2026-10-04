export type StorageSegmentId = 'projects' | 'avatars' | 'documents' | 'other' | 'available'

export type StorageSegment = {
  id: StorageSegmentId
  label: string
  bytes: number
  percentage: number
  count?: number
  colorClass: string
  dotClass: string
  badgeBgClass: string
}

export type StorageSegmentsResult = {
  segments: StorageSegment[]
  totalUsedPercentage: number
  totalUsedBytes: number
  quotaBytes: number
}
