/**
 * Rutas públicas del API Gateway (KrakenD).
 * Source of truth: crm-infra/gateway/endpoints/*.json
 *
 * Este módulo centraliza todas las rutas para:
 * 1. Facilitar la detección de rutas incorrectas en code review
 * 2. Evitar que el frontend exponga topología interna de microservicios
 * 3. Proporcionar type-safety para parámetros de ruta
 */

// ── API Version Prefix ──────────────────────────────────────────────────────
const API = "/api/v1";

// ── Auth (público, sin JWT) ─────────────────────────────────────────────────
export const AUTH_ROUTES = {
  login: `${API}/auth/login`,
  refresh: `${API}/auth/refresh`,
  forgotPassword: `${API}/auth/forgot-password`,
  resetPassword: `${API}/auth/reset-password`,
  acceptInviteToken: (token: string) => `${API}/auth/accept-invite/${encodeURIComponent(token)}`,
  acceptInvite: `${API}/auth/accept-invite`,
  verifyEmail: `${API}/auth/verify-email`,
} as const

// ── Identity (autenticado) — contrato de gateway, no topologia interna ──────
export const IDENTITY_ROUTES = {
  me: `${API}/identity/me`,
  logout: `${API}/identity/logout`,
  search: `${API}/identity/search`,
} as const

// ── Account (autenticado) — contrato de gateway, no topologia interna ───────
export const ACCOUNT_ROUTES = {
  password: `${API}/account/password`,
  sessions: `${API}/account/sessions`,
  session: (familyId: string) => `${API}/account/sessions/${familyId}`,
  verifyEmailRequest: `${API}/account/verify-email/request`,
} as const

// ── Admin (autenticado) — contrato de gateway, no topologia interna ─────────
export const ADMIN_ROUTES = {
  workers: `${API}/admin/workers`,
  clientsInvite: `${API}/admin/clients/invite`,
  adminsInvite: `${API}/admin/admins/invite`,
  users: `${API}/admin/users`,
  userStatus: (subject: string) => `${API}/admin/users/${subject}/status`,
  userFlags: (subject: string) => `${API}/admin/users/${subject}/flags`,
  userRestore: (subject: string) => `${API}/admin/users/${subject}/restore`,
  user: (subject: string) => `${API}/admin/users/${subject}`,
} as const

// ── Projects (autenticado) ──────────────────────────────────────────────────
export const PROJECT_ROUTES = {
  list: `${API}/collab/projects`,
  search: `${API}/collab/projects/search`,
  create: `${API}/collab/projects`,
  update: (projectId: string) => `${API}/collab/projects/${projectId}`,
  board: (projectId: string) => `${API}/collab/projects/${projectId}/board`,
  workspace: (projectId: string) => `${API}/collab/projects/${projectId}/workspace`,
  members: (projectId: string) => `${API}/collab/projects/${projectId}/members`,
  brief: (projectId: string) => `${API}/collab/projects/${projectId}/brief`,
  timeline: (projectId: string) => `${API}/collab/projects/${projectId}/timeline`,
  columns: (projectId: string) => `${API}/collab/projects/${projectId}/columns`,
  // Files
  files: (projectId: string) => `${API}/collab/projects/${projectId}/files`,
  filesTimeline: (projectId: string) => `${API}/collab/projects/${projectId}/files/timeline`,
  filesUpload: (projectId: string) => `${API}/collab/projects/${projectId}/files/upload`,
  filesUploadUrl: (projectId: string) => `${API}/collab/projects/${projectId}/files/upload-url`,
  filesUploadedObject: (projectId: string) => `${API}/collab/projects/${projectId}/files/uploaded-object`,
  // Tasks
  tasks: (projectId: string) => `${API}/collab/projects/${projectId}/tasks`,
  taskComments: (projectId: string, taskId: string) =>
    `${API}/collab/projects/${projectId}/tasks/${taskId}/comments`,
  taskFiles: (projectId: string, taskId: string) =>
    `${API}/collab/projects/${projectId}/tasks/${taskId}/files`,
  taskFilesUploadUrl: (projectId: string, taskId: string) =>
    `${API}/collab/projects/${projectId}/tasks/${taskId}/files/upload-url`,
  taskFilesMetadata: (projectId: string, taskId: string) =>
    `${API}/collab/projects/${projectId}/tasks/${taskId}/files/metadata`,
  // Chat
  chatExternal: (projectId: string) => `${API}/collab/projects/${projectId}/chat/external`,
  chatExternalRead: (projectId: string) => `${API}/collab/projects/${projectId}/chat/external/read`,
  chatInternal: (projectId: string) => `${API}/collab/projects/${projectId}/chat/internal`,
  chatInternalRead: (projectId: string) => `${API}/collab/projects/${projectId}/chat/internal/read`,
  // Change Requests
  changeRequestMinor: (projectId: string) => `${API}/collab/projects/${projectId}/change-requests/minor`,
  changeRequestFormal: (projectId: string) => `${API}/collab/projects/${projectId}/change-requests/formal`,
  changeRequest: (projectId: string, changeRequestId: string) =>
    `${API}/collab/projects/${projectId}/change-requests/${changeRequestId}`,
  changeLogFormal: (projectId: string) => `${API}/collab/projects/${projectId}/change-log/formal`,
} as const

// ── Columns (autenticado) ───────────────────────────────────────────────────
export const COLUMN_ROUTES = {
  update: (columnId: string) => `${API}/collab/columns/${columnId}`,
} as const

// ── Tasks (autenticado) ─────────────────────────────────────────────────────
export const TASK_ROUTES = {
  update: (taskId: string) => `${API}/collab/tasks/${taskId}`,
} as const

// ── Files (autenticado) ─────────────────────────────────────────────────────
export const FILE_ROUTES = {
  delete: (fileId: string) => `${API}/collab/files/${fileId}`,
  update: (fileId: string) => `${API}/collab/files/${fileId}`,
  download: (fileId: string) => `${API}/collab/files/${fileId}/download`,
  access: (fileId: string) => `${API}/collab/files/${fileId}/access`,
  approve: (fileId: string) => `${API}/collab/files/${fileId}/approve`,
} as const

// ── Notifications (autenticado) ─────────────────────────────────────────────
export const NOTIFICATION_ROUTES = {
  chatMentionsUnread: `${API}/collab/notifications/chat-mentions/unread`,
  chatMentionsUnreadCount: `${API}/collab/notifications/chat-mentions/unread/count`,
  chatMentionRead: (notificationId: string) =>
    `${API}/collab/notifications/chat-mentions/${notificationId}/read`,
} as const

// ── Media (autenticado) ─────────────────────────────────────────────────────
export const MEDIA_ROUTES = {
  avatars: `${API}/media/avatars`,
  avatarsCurrent: `${API}/media/avatars/current`,
  avatarsUsers: `${API}/media/avatars/users`,
  documentsUploadUrl: `${API}/media/documents/upload-url`,
  documentsConfirm: `${API}/media/documents/confirm`,
} as const

// ── BFF (autenticado, multi-backend) ────────────────────────────────────────
export const BFF_ROUTES = {
  dashboard: '/bff/dashboard',
  adminOverview: '/bff/admin-overview',
  workspace: (projectId: string) => `/bff/workspace/${projectId}`,
} as const

// ── Docs (público) ──────────────────────────────────────────────────────────
export const DOCS_ROUTES = {
  openApiYaml: '/openapi.yaml',
  swaggerUi: '/docs',
  authOpenApi: '/docs/auth/openapi.yaml',
  collabOpenApi: '/docs/collab/openapi.yaml',
  mediaOpenApi: '/docs/media/openapi.yaml',
} as const
