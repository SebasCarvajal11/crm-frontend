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
const AUTH_VERSION = import.meta.env.VITE_AUTH_API_VERSION || 'v1';
const COLLAB_VERSION = import.meta.env.VITE_COLLAB_API_VERSION || 'v1';
const MEDIA_VERSION = import.meta.env.VITE_MEDIA_API_VERSION || 'v1';

const AUTH_API = `/api/${AUTH_VERSION}`;
const COLLAB_API = `/api/${COLLAB_VERSION}`;
const MEDIA_API = `/api/${MEDIA_VERSION}`;
const API_PREFIX = '/api/v1';

// ── Auth (público, sin JWT) ─────────────────────────────────────────────────
export const AUTH_ROUTES = {
  login: `${AUTH_API}/auth/login`,
  refresh: `${AUTH_API}/auth/refresh`,
  forgotPassword: `${AUTH_API}/auth/forgot-password`,
  resetPassword: `${AUTH_API}/auth/reset-password`,
  acceptInviteToken: (token: string) => `${AUTH_API}/auth/accept-invite/${encodeURIComponent(token)}`,
  acceptInvite: `${AUTH_API}/auth/accept-invite`,
  verifyEmail: `${AUTH_API}/auth/verify-email`,
} as const

// ── Identity (autenticado) — contrato de gateway, no topologia interna ──────
export const IDENTITY_ROUTES = {
  me: `${AUTH_API}/identity/me`,
  logout: `${AUTH_API}/identity/logout`,
  search: `${AUTH_API}/identity/search`,
} as const

// ── Account (autenticado) — contrato de gateway, no topologia interna ───────
export const ACCOUNT_ROUTES = {
  password: `${AUTH_API}/account/password`,
  sessions: `${AUTH_API}/account/sessions`,
  session: (familyId: string) => `${AUTH_API}/account/sessions/${familyId}`,
  verifyEmailRequest: `${AUTH_API}/account/verify-email/request`,
} as const

// ── Admin (autenticado) — contrato de gateway, no topologia interna ─────────
export const ADMIN_ROUTES = {
  workers: `${AUTH_API}/admin/workers`,
  clientsInvite: `${AUTH_API}/admin/clients/invite`,
  adminsInvite: `${AUTH_API}/admin/admins/invite`,
  users: `${AUTH_API}/admin/users`,
  userStatus: (subject: string) => `${AUTH_API}/admin/users/${subject}/status`,
  userFlags: (subject: string) => `${AUTH_API}/admin/users/${subject}/flags`,
  userRestore: (subject: string) => `${AUTH_API}/admin/users/${subject}/restore`,
  user: (subject: string) => `${AUTH_API}/admin/users/${subject}`,
} as const

// ── Projects (autenticado) ──────────────────────────────────────────────────
export const PROJECT_ROUTES = {
  list: `${COLLAB_API}/collab/projects`,
  search: `${COLLAB_API}/collab/projects/search`,
  create: `${COLLAB_API}/collab/projects`,
  update: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}`,
  board: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/board`,
  workspace: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/workspace`,
  members: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/members`,
  brief: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/brief`,
  timeline: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/timeline`,
  columns: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/columns`,
  // Files
  files: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/files`,
  filesTimeline: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/files/timeline`,
  filesUpload: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/files/upload`,
  filesUploadUrl: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/files/upload-url`,
  filesUploadedObject: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/files/uploaded-object`,
  // Tasks
  tasks: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/tasks`,
  taskComments: (projectId: string, taskId: string) =>
    `${COLLAB_API}/collab/projects/${projectId}/tasks/${taskId}/comments`,
  taskFiles: (projectId: string, taskId: string) =>
    `${COLLAB_API}/collab/projects/${projectId}/tasks/${taskId}/files`,
  taskFilesUploadUrl: (projectId: string, taskId: string) =>
    `${COLLAB_API}/collab/projects/${projectId}/tasks/${taskId}/files/upload-url`,
  taskFilesMetadata: (projectId: string, taskId: string) =>
    `${COLLAB_API}/collab/projects/${projectId}/tasks/${taskId}/files/metadata`,
  // Chat
  chatExternal: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/chat/external`,
  chatExternalRead: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/chat/external/read`,
  chatInternal: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/chat/internal`,
  chatInternalRead: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/chat/internal/read`,
  // Change Requests
  changeRequestMinor: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/change-requests/minor`,
  changeRequestFormal: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/change-requests/formal`,
  changeRequest: (projectId: string, changeRequestId: string) =>
    `${COLLAB_API}/collab/projects/${projectId}/change-requests/${changeRequestId}`,
  changeLogFormal: (projectId: string) => `${COLLAB_API}/collab/projects/${projectId}/change-log/formal`,
} as const

// ── Columns (autenticado) ───────────────────────────────────────────────────
export const COLUMN_ROUTES = {
  update: (columnId: string) => `${COLLAB_API}/collab/columns/${columnId}`,
} as const

// ── Tasks (autenticado) ─────────────────────────────────────────────────────
export const TASK_ROUTES = {
  update: (taskId: string) => `${COLLAB_API}/collab/tasks/${taskId}`,
} as const

// ── Files (autenticado) ─────────────────────────────────────────────────────
export const FILE_ROUTES = {
  delete: (fileId: string) => `${COLLAB_API}/collab/files/${fileId}`,
  update: (fileId: string) => `${COLLAB_API}/collab/files/${fileId}`,
  download: (fileId: string) => `${COLLAB_API}/collab/files/${fileId}/download`,
  access: (fileId: string) => `${COLLAB_API}/collab/files/${fileId}/access`,
  approve: (fileId: string) => `${COLLAB_API}/collab/files/${fileId}/approve`,
} as const

// ── Notifications (autenticado) ─────────────────────────────────────────────
export const NOTIFICATION_ROUTES = {
  chatMentionsUnread: `${COLLAB_API}/collab/notifications/chat-mentions/unread`,
  chatMentionsUnreadCount: `${COLLAB_API}/collab/notifications/chat-mentions/unread/count`,
  chatMentionRead: (notificationId: string) =>
    `${COLLAB_API}/collab/notifications/chat-mentions/${notificationId}/read`,
} as const

// ── Media (autenticado) ─────────────────────────────────────────────────────
export const MEDIA_ROUTES = {
  avatars: `${MEDIA_API}/media/avatars`,
  avatarsCurrent: `${MEDIA_API}/media/avatars/current`,
  avatarsUsers: `${MEDIA_API}/media/avatars/users`,
  documentsUploadUrl: `${MEDIA_API}/media/documents/upload-url`,
  documentsConfirm: `${MEDIA_API}/media/documents/confirm`,
} as const
// ── Docs (público) ──────────────────────────────────────────────────────────
export const DOCS_ROUTES = {
  openApiYaml: `${API_PREFIX}/openapi.yaml`,
  swaggerUi: `${API_PREFIX}/docs`,
  authOpenApi: `${API_PREFIX}/docs/auth/${AUTH_VERSION}/openapi.yaml`,
  collabOpenApi: `${API_PREFIX}/docs/collab/${COLLAB_VERSION}/openapi.yaml`,
  mediaOpenApi: `${API_PREFIX}/docs/media/${MEDIA_VERSION}/openapi.yaml`,
} as const
