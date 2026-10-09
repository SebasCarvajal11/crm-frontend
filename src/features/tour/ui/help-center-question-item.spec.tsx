import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { HelpCenterQuestionItem, QuestionExpandedBody } from './help-center-question-item'
import type { GuidedQuestion } from '../model/types'

describe('HelpCenterQuestionItem: Modo FAQ con Acordeón y Localización Opcional', () => {
  const sampleQuestion: GuidedQuestion = {
    id: 'test-q1',
    question: '¿Cómo firmo digitalmente un contrato?',
    answer: 'Accede a la pestaña Contrato, revisa las cláusulas y presiona Firmar digitalmente.',
    tab: 'collab',
    workspaceTab: 'contract',
    roles: ['client', 'admin'],
    category: 'flujo',
    targetElement: '[data-tour="workspace-tab-contract"]',
  }

  it('renderiza la pregunta y respuesta inicial en el diálogo', () => {
    const markup = renderToStaticMarkup(
      <HelpCenterQuestionItem
        question={sampleQuestion}
        scopeMode="section"
        onHighlight={vi.fn()}
      />
    )

    expect(markup).toContain('¿Cómo firmo digitalmente un contrato?')
    expect(markup).toContain('Accede a la pestaña Contrato')
    expect(markup).toContain('data-testid="help-question-item"')
  })

  it('muestra la insignia de sección cuando scopeMode es all', () => {
    const markup = renderToStaticMarkup(
      <HelpCenterQuestionItem
        question={sampleQuestion}
        scopeMode="all"
        tabLabel="Colaboración"
        onHighlight={vi.fn()}
      />
    )

    expect(markup).toContain('Colaboración')
  })

  it('muestra botones de feedback en la respuesta expandida y estado de agradecimiento', () => {
    const initialMarkup = renderToStaticMarkup(
      <QuestionExpandedBody
        answer="Respuesta de prueba"
        canHighlight={true}
        onHighlight={vi.fn()}
        onFeedback={vi.fn()}
      />
    )
    expect(initialMarkup).toContain('¿Te fue útil?')
    expect(initialMarkup).toContain('Sí')
    expect(initialMarkup).toContain('No me sirvió')

    const votedMarkup = renderToStaticMarkup(
      <QuestionExpandedBody
        answer="Respuesta de prueba"
        canHighlight={true}
        feedback="helpful"
        onHighlight={vi.fn()}
        onFeedback={vi.fn()}
      />
    )
    expect(votedMarkup).toContain('¡Gracias por tu valoración!')
  })
})
