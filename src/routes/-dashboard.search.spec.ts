import { describe, expect, it } from 'vitest'
import { parseDashboardSearch } from './-dashboard.search'

describe('parseDashboardSearch', () => {
  it('parses valid search parameters including task_id', () => {
    const parsed = parseDashboardSearch({
      tab: 'collab',
      project_id: 'proj-123',
      workspace_tab: 'board',
      task_id: 'task-456',
    })

    expect(parsed).toEqual({
      tab: 'collab',
      project_id: 'proj-123',
      workspace_tab: 'board',
      chat_channel: undefined,
      chat_message_id: undefined,
      task_id: 'task-456',
    })
  })

  it('filters out invalid tabs and non-string task_id values', () => {
    const parsed = parseDashboardSearch({
      tab: 'unknown_tab',
      task_id: 12345,
    })

    expect(parsed.tab).toBeUndefined()
    expect(parsed.task_id).toBeUndefined()
  })

  it('correctly extracts chat_channel and chat_message_id', () => {
    const parsed = parseDashboardSearch({
      tab: 'collab',
      project_id: 'proj-1',
      workspace_tab: 'chat',
      chat_channel: 'internal',
      chat_message_id: 'msg-99',
    })

    expect(parsed.chat_channel).toBe('internal')
    expect(parsed.chat_message_id).toBe('msg-99')
  })
})
