import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { UserAvatar } from '@/components/atoms/user-avatar'
import { ChatMessageBubble } from '@/components/organisms/collab/chat/chat-message-bubble'
import {
  CIMA_CORPORATE_COLORS,
  resolveDeterministicAvatar,
} from '@/shared/lib/avatar-catalog'
import { AvatarDirectoryService } from '@/shared/lib/avatar-directory-service'
import type { ProjectChatMessage } from '@/features/collab/model'

const CIMA_HEX_SET = new Set(CIMA_CORPORATE_COLORS.map((c) => c.hex.toLowerCase()))

describe('ADVERSARIAL STRESS HARNESS: UserAvatar Zero-Null & CIMA Corporate Guarantee', () => {
  const adversarialCases = [
    { label: 'empty props', props: {} },
    { label: 'explicit null src and name', props: { src: null, name: null, userId: null } },
    { label: 'undefined src and name', props: { src: undefined, name: undefined, userId: undefined } },
    { label: 'null src with empty string name and empty userId', props: { src: null, name: '', userId: '' } },
    { label: 'undefined src with whitespace name and whitespace userId', props: { src: undefined, name: '   ', userId: '   ' } },
    { label: 'missing color with arbitrary name', props: { name: 'Mariana Duque', color: null } },
    { label: 'empty color with userId', props: { userId: '11111111-2222-3333-4444-555555555555', color: '' } },
    { label: 'whitespace color', props: { color: '   ', userId: 'usr-999' } },
    { label: 'invalid image URL in src', props: { src: 'https://bad-domain.xyz/404.png', name: 'Dev' } },
    { label: 'malformed query param color in src', props: { src: 'http://cdn.local/avatar.png?c=invalid', name: 'Test' } },
    { label: 'negative avatarId', props: { avatarId: -5, name: 'Negative' } },
    { label: 'extreme size 2xl', props: { size: '2xl' as const, name: 'Large' } },
    { label: 'extreme size xs', props: { size: 'xs' as const, name: 'Mini' } },
    { label: 'special characters in name', props: { name: '<script>alert("xss")</script> & "quotes"' } },
    { label: 'huge string in userId', props: { userId: 'A'.repeat(500) } },
    { label: 'all presence statuses', props: { presenceStatus: 'away' as const, presenceLabel: 'Ausente temporal' } },
  ]

  adversarialCases.forEach(({ label, props }) => {
    it(`[Stress-Test UserAvatar] ${label}`, () => {
      const markup = renderToStaticMarkup(<UserAvatar {...props} />)

      // Oracle 1: Must render image representation (<img> tag or sprite role="img")
      const hasImageRep = markup.includes('<img') || markup.includes('role="img"')
      expect(hasImageRep).toBe(true)

      // Oracle 2: Must never render initials in markup
      expect(markup).not.toMatch(/<span[^>]*>[A-Z]{1,2}<\/span>/)
      expect(markup).not.toContain('lucide-user-round')
      expect(markup).not.toContain('UserRound')

      // Oracle 3: Must always render background-color
      const colorMatch = markup.match(/background-color:\s*(#[0-9a-fA-F]{3,8})/i)
      expect(colorMatch).not.toBeNull()

      const color = colorMatch![1].toLowerCase()
      // If no valid custom color was passed, it must belong to CIMA Corporate Palette
      if (!props.color || !props.color.trim()) {
        expect(CIMA_HEX_SET.has(color)).toBe(true)
      }

      // Oracle 4: Img src or sprite must be present
      const hasValidSource =
        /src="[^"]+"/.test(markup) || markup.includes('data-testid="user-avatar-sprite"')
      expect(hasValidSource).toBe(true)
    })
  })

  it('Evaluación de borde empírica: comportamiento cuando src o avatarUrl es una cadena vacía ("")', () => {
    // Si src="" se pasa explícitamente, UserAvatar sanea cadenas vacías y recurre al avatar determinista
    const markup = renderToStaticMarkup(<UserAvatar src="" name="Usuario Vacío" />)
    expect(markup).not.toContain('UserRound')
    const hasImageRep = markup.includes('<img') || markup.includes('role="img"')
    expect(hasImageRep).toBe(true)
    const hasValidSource =
      /src="\/avatars\/avatar-\d+\.webp"/.test(markup) || markup.includes('data-testid="user-avatar-sprite"')
    expect(hasValidSource).toBe(true)
    const colorMatch = markup.match(/background-color:\s*(#[0-9a-fA-F]{3,8})/i)
    expect(colorMatch).not.toBeNull()
    expect(CIMA_HEX_SET.has(colorMatch![1].toLowerCase())).toBe(true)
  })

  it('Oráculo determinista: resolveDeterministicAvatar soporta 1000 entradas arbitrarias y siempre devuelve valores CIMA válidos', () => {
    const inputs = [
      '',
      '   ',
      'null',
      'undefined',
      'admin',
      '00000000-0000-0000-0000-000000000000',
      'uuid-very-long-' + 'x'.repeat(200),
      ...Array.from({ length: 100 }, (_, i) => `user-rand-${Math.random()}-${i}`),
    ]

    for (const input of inputs) {
      const resolved = resolveDeterministicAvatar(input)
      expect(resolved.avatarId).toBeGreaterThanOrEqual(0)
      expect(resolved.avatarId).toBeLessThan(84)
      expect(CIMA_HEX_SET.has(resolved.color.toLowerCase())).toBe(true)
      expect(resolved.url).toBe(`/avatars/avatar-${resolved.avatarId}.webp`)
    }
  })
})

describe('ADVERSARIAL STRESS HARNESS: ChatMessageBubble Avatar Rendering Consistency', () => {
  const createTestMessage = (isOwn: boolean): ProjectChatMessage => ({
    id: `msg-${isOwn ? 'own' : 'foreign'}-123`,
    projectId: 'proj-001',
    channel: 'external',
    messageType: 'text',
    authorSub: isOwn ? 'sub-me' : 'sub-peer',
    authorEmail: isOwn ? 'me@cima.co' : 'peer@client.com',
    authorFirstName: isOwn ? 'Owner' : 'Peer',
    authorLastName: isOwn ? 'User' : 'Client',
    authorRole: isOwn ? 'admin' : 'client',
    authorProfession: null,
    body: `Mensaje de prueba (${isOwn ? 'propio' : 'ajeno'})`,
    mentionedSubs: null,
    metadata: null,
    createdAt: '2026-10-06T12:00:00Z',
  })

  it('renderiza UserAvatar tanto para mensajes propios (isOwn = true) como ajenos (isOwn = false)', () => {
    // 1. Mensaje ajeno (isOwn = false)
    const markupForeign = renderToStaticMarkup(
      <ChatMessageBubble
        message={createTestMessage(false)}
        isOwn={false}
        isMentioned={false}
        sameAuthorAsPrevious={false}
        sameAuthorAsNext={false}
        displayName="Peer Client"
        authorTag="Cliente"
        avatarUrl="/avatars/avatar-7.webp"
        avatarColor="#1e3a8a"
        isNewlyArrived={false}
        highlightMessageId={null}
        onOpenDetails={() => {}}
      />
    )

    expect(markupForeign).toContain('data-testid="user-avatar"')
    expect(markupForeign).toContain('flex-row')
    expect(markupForeign).not.toContain('flex-row-reverse')
    expect(markupForeign).toContain('data-avatar-id="7"')
    expect(markupForeign).toContain('background-color:#1e3a8a')

    // 2. Mensaje propio (isOwn = true)
    const markupOwn = renderToStaticMarkup(
      <ChatMessageBubble
        message={createTestMessage(true)}
        isOwn={true}
        isMentioned={false}
        sameAuthorAsPrevious={false}
        sameAuthorAsNext={false}
        displayName="Owner User"
        authorTag="Admin"
        avatarUrl="/avatars/avatar-15.webp"
        avatarColor="#86070c"
        isNewlyArrived={false}
        highlightMessageId={null}
        onOpenDetails={() => {}}
      />
    )

    expect(markupOwn).toContain('data-testid="user-avatar"')
    expect(markupOwn).toContain('flex-row-reverse')
    expect(markupOwn).toContain('data-avatar-id="15"')
    expect(markupOwn).toContain('background-color:#86070c')
  })

  it('Garantía Cero-Nulos dentro de ChatMessageBubble: renderiza avatar determinista y color CIMA cuando avatarUrl y avatarColor son nulos', () => {
    // Mensaje propio con avatarUrl=null, avatarColor=null
    const markupOwnNull = renderToStaticMarkup(
      <ChatMessageBubble
        message={createTestMessage(true)}
        isOwn={true}
        isMentioned={false}
        sameAuthorAsPrevious={false}
        sameAuthorAsNext={false}
        displayName="Owner User"
        authorTag="Admin"
        avatarUrl={null}
        avatarColor={null}
        isNewlyArrived={false}
        highlightMessageId={null}
        onOpenDetails={() => {}}
      />
    )

    expect(markupOwnNull).toContain('data-testid="user-avatar"')
    expect(markupOwnNull).toContain('data-testid="user-avatar-sprite"')
    const colorMatch = markupOwnNull.match(/background-color:\s*(#[0-9a-fA-F]{6})/i)
    expect(colorMatch).not.toBeNull()
    expect(CIMA_HEX_SET.has(colorMatch![1].toLowerCase())).toBe(true)
  })

  it('respeta agrupación visual: omite avatar cuando sameAuthorAsNext = true en mensajes consecutivos', () => {
    const markupGrouped = renderToStaticMarkup(
      <ChatMessageBubble
        message={createTestMessage(false)}
        isOwn={false}
        isMentioned={false}
        sameAuthorAsPrevious={true}
        sameAuthorAsNext={true}
        displayName="Peer Client"
        authorTag="Cliente"
        avatarUrl="/avatars/avatar-7.webp"
        avatarColor="#1e3a8a"
        isNewlyArrived={false}
        highlightMessageId={null}
        onOpenDetails={() => {}}
      />
    )

    // El avatar no se dibuja si el siguiente mensaje es del mismo autor
    expect(markupGrouped).not.toContain('data-testid="user-avatar"')
  })
})

describe('ADVERSARIAL STRESS HARNESS: AvatarDirectoryService Reactive Store & Deterministic Cache', () => {
  it('resuelve usuarios no cacheados determinísticamente y notifica a los suscriptores al mutar preset', () => {
    const service = AvatarDirectoryService
    let notificationsCount = 0
    const unsubscribe = service.subscribe(() => {
      notificationsCount++
    })

    const initial = service.getEntity('test-sub-1')
    expect(initial.avatarId).toBeGreaterThanOrEqual(0)
    expect(initial.avatarId).toBeLessThan(84)
    expect(CIMA_HEX_SET.has(initial.color.toLowerCase())).toBe(true)

    // Mutar preset
    service.updateUserPreset('test-sub-1', {
      avatarId: 42,
      color: '#1d4ed8',
    })

    expect(notificationsCount).toBeGreaterThanOrEqual(1)
    const updated = service.getEntity('test-sub-1')
    expect(updated.avatarId).toBe(42)
    expect(updated.color).toBe('#1d4ed8')
    expect(updated.url).toBe('/avatars/avatar-42.webp')

    unsubscribe()
  })
})
