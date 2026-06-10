import type { Page, APIResponse } from '@playwright/test'
import { getGatewayUrl } from './e2e-env'

const GATEWAY = getGatewayUrl()

export class ApiHelper {
  constructor(private page: Page) {}

  async login(
    email: string,
    password: string
  ): Promise<{ accessToken: string; userId: string; role: string }> {
    const res = await this.page.request.post(`${GATEWAY}/api/v1/auth/login`, {
      data: { email, password },
    })
    const json = await res.json()
    const { access_token, user } = json.data
    return {
      accessToken: access_token,
      userId: user.id,
      role: user.role,
    }
  }

  async getMe(accessToken: string): Promise<APIResponse> {
    return this.page.request.get(`${GATEWAY}/api/v1/identity/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }

  async listProjects(accessToken: string): Promise<APIResponse> {
    return this.page.request.get(`${GATEWAY}/api/v1/collab/projects`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }

  async createProject(
    accessToken: string,
    data: { name: string; type: string; clientUserId?: string; description?: string }
  ): Promise<APIResponse> {
    return this.page.request.post(`${GATEWAY}/api/v1/collab/projects`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data,
    })
  }

  async listUsers(accessToken: string, params?: Record<string, string>): Promise<APIResponse> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.page.request.get(`${GATEWAY}/api/v1/auth/users${qs}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await this.page.request.get(`${GATEWAY}/api/v1/health`)
      return res.ok()
    } catch {
      return false
    }
  }
}
