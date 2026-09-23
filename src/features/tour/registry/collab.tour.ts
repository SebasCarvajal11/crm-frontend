import type { CimaTourDefinition } from '../model/types'
import {
  KANBAN_STEPS,
  TASK_STEPS,
  DOC_STEPS,
  CONTRACT_STEPS,
  CHANGE_STEPS,
  WORKSPACE_ALL_STEPS,
} from './collab-steps'

export { collabQuestions } from './collab.questions'
export { KANBAN_STEPS, TASK_STEPS, DOC_STEPS, CONTRACT_STEPS, CHANGE_STEPS, WORKSPACE_ALL_STEPS }

export const collabKanbanMission: CimaTourDefinition = {
  id: 'mission-collab-kanban',
  tab: 'collab',
  title: 'Misión 1: Exploración del Tablero Kanban',
  description: 'Aprende a buscar proyectos, evaluar estados y abrir el espacio de trabajo.',
  roles: ['admin', 'worker', 'client'],
  category: 'onboarding',
  badgeLabel: 'Inicio Rápido',
  estimatedMinutes: 1,
  steps: KANBAN_STEPS,
}

export const collabTasksMission: CimaTourDefinition = {
  id: 'mission-collab-tasks',
  tab: 'collab',
  workspaceTab: 'board',
  title: 'Misión 2: Flujo de Tareas Operativas',
  description: 'Gestiona el tablero operativo, busca actividades y registra nuevas tareas técnicas.',
  roles: ['admin', 'worker', 'client'],
  category: 'onboarding',
  badgeLabel: 'Tablero Ágil',
  estimatedMinutes: 1,
  steps: TASK_STEPS,
}

export const collabDocsMission: CimaTourDefinition = {
  id: 'mission-collab-docs',
  tab: 'collab',
  workspaceTab: 'chat',
  title: 'Misión 3: Conversación y Documentación',
  description: 'Explora mensajería en tiempo real, repositorio de archivos, trazabilidad y brief.',
  roles: ['admin', 'worker', 'client'],
  category: 'onboarding',
  badgeLabel: 'Entregables',
  estimatedMinutes: 2,
  steps: [...DOC_STEPS, ...CONTRACT_STEPS],
}

export const collabChangesMission: CimaTourDefinition = {
  id: 'mission-collab-changes',
  tab: 'collab',
  workspaceTab: 'change-requests',
  title: 'Misión 4: Solicitud de Cambios y Equipo',
  description: 'Revisa solicitudes formales de cambio de alcance y el personal asignado al proyecto.',
  roles: ['admin', 'worker', 'client'],
  category: 'onboarding',
  badgeLabel: 'Gobernanza',
  estimatedMinutes: 1,
  steps: CHANGE_STEPS,
}

export const collabKanbanTour: CimaTourDefinition = {
  id: 'tour-collab-kanban',
  tab: 'collab',
  title: 'Recorrido del Tablero y Proyectos',
  description: 'Conoce cómo explorar el tablero kanban e interactuar con cada espacio de trabajo.',
  roles: ['admin', 'worker', 'client'],
  category: 'advanced',
  badgeLabel: 'Tablero y Workspace',
  estimatedMinutes: 3,
  steps: [...KANBAN_STEPS, ...WORKSPACE_ALL_STEPS],
}

export const collabWorkspaceTour: CimaTourDefinition = {
  id: 'tour-collab-workspace',
  tab: 'collab',
  title: 'Espacio de Trabajo del Proyecto',
  description: 'Guía interactiva para navegar por tareas, chat, brief, archivos, cambios y contratos.',
  roles: ['admin', 'worker', 'client'],
  category: 'advanced',
  badgeLabel: 'Workspace',
  estimatedMinutes: 2,
  steps: WORKSPACE_ALL_STEPS,
}

export const COLLAB_MISSIONS: CimaTourDefinition[] = [
  collabKanbanMission,
  collabTasksMission,
  collabDocsMission,
  collabChangesMission,
]
