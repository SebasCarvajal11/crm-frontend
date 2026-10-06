import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionIntro } from '@/components/molecules/section-intro'
import { cn } from '@/shared/lib/utils'
import {
  inviteAdminSchema,
  inviteClientSchema,
  registerWorkerSchema,
  useAdminInvites,
} from '@/features/admin/hooks'
import { InviteRoleSwitcher } from './invite-role-switcher'
import { ROLES, type InviteRole } from './invite-role-switcher.types'
import {
  AdminRoleBlock,
  ClientRoleBlock,
  WorkerRoleBlock,
} from './invite-form-fields'
import { RolePrivilegesCard } from './role-privileges-card'
import { InviteSecurityCard } from './invite-security-card'

type Props = {
  accessToken: string
}

function getSubmitLabel(role: InviteRole, isPending: boolean) {
  if (isPending) return role === 'worker' ? 'Registrando...' : 'Creando...'
  if (role === 'client') return 'Crear invitación'
  if (role === 'worker') return 'Registrar colaborador'
  return 'Invitar administrador'
}

function roleHeading(role: InviteRole) {
  if (role === 'client') return 'Invitar cliente'
  if (role === 'worker') return 'Registrar colaborador'
  return 'Invitar administrador'
}

function roleSubheading(role: InviteRole) {
  if (role === 'client') return 'Acceso al portal y seguimiento de proyectos.'
  if (role === 'worker') return 'Colaborador interno para gestión de proyectos y tareas.'
  return 'Gobernanza, auditoría y control total del sistema.'
}

function useRoleForms() {
  const inviteForm = useForm<import('zod').infer<typeof inviteClientSchema>>({
    resolver: zodResolver(inviteClientSchema),
    defaultValues: { email: '', first_name: '', last_name: '', client_kind: 'natural', company_name: '' },
  })
  const clientKind = useWatch({ control: inviteForm.control, name: 'client_kind' })

  const workerForm = useForm<import('zod').infer<typeof registerWorkerSchema>>({
    resolver: zodResolver(registerWorkerSchema),
    defaultValues: { email: '', first_name: '', last_name: '', profession: '' },
  })

  const adminForm = useForm<import('zod').infer<typeof inviteAdminSchema>>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: { email: '', first_name: '', last_name: '' },
  })

  return { inviteForm, clientKind, workerForm, adminForm }
}

function useAdminInviteManager(accessToken: string) {
  const [activeRole, setActiveRole] = useState<InviteRole>('client')
  const { inviteForm, clientKind, workerForm, adminForm } = useRoleForms()
  const { adminMutation, inviteMutation, workerMutation } = useAdminInvites(accessToken)

  const isPending =
    activeRole === 'client'
      ? inviteMutation.isPending
      : activeRole === 'worker'
        ? workerMutation.isPending
        : adminMutation.isPending

  const submitLabel = getSubmitLabel(activeRole, isPending)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeRole === 'client') {
      void inviteForm.handleSubmit((values) =>
        inviteMutation.mutate(values, { onSuccess: () => inviteForm.reset() })
      )(e)
    } else if (activeRole === 'worker') {
      void workerForm.handleSubmit((values) =>
        workerMutation.mutate(values, { onSuccess: () => workerForm.reset() })
      )(e)
    } else {
      void adminForm.handleSubmit((values) =>
        adminMutation.mutate(values, { onSuccess: () => adminForm.reset() })
      )(e)
    }
  }

  return {
    activeRole, setActiveRole, inviteForm, clientKind, workerForm,
    adminForm, inviteMutation, workerMutation, adminMutation,
    isPending, submitLabel, handleSubmit,
  }
}

function InviteFormHeader({
  activeRole,
  onRoleChange,
}: {
  activeRole: InviteRole
  onRoleChange: (role: InviteRole) => void
}) {
  const meta = ROLES.find((r) => r.id === activeRole) ?? ROLES[0]
  const Icon = meta.icon

  return (
    <div className="border-b border-border/60 bg-muted/20 p-4 sm:p-6 space-y-3.5 sm:space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', meta.iconClass)}>
            <Icon className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {roleHeading(activeRole)}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {roleSubheading(activeRole)}
            </p>
          </div>
        </div>
        <Badge className={cn('rounded-full border text-[10px] font-semibold shrink-0', meta.badgeClass)}>
          {meta.badgeText}
        </Badge>
      </div>

      <InviteRoleSwitcher activeRole={activeRole} onChange={onRoleChange} />
    </div>
  )
}

function InviteFormActions({ isPending, submitLabel }: { isPending: boolean; submitLabel: string }) {
  return (
    <div className="border-t border-border/60 bg-muted/10 p-4 sm:p-6 space-y-2 mt-auto">
      <Button
        className="h-10 w-full rounded-xl"
        type="submit"
        disabled={isPending}
        data-testid="invite-submit-btn"
      >
        {submitLabel}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground/80">
        Se emitirá un enlace con vigencia de 72 horas para activación segura.
      </p>
    </div>
  )
}

function InviteFormPanel({ state }: { state: ReturnType<typeof useAdminInviteManager> }) {
  const { activeRole, setActiveRole, isPending, submitLabel, handleSubmit } = state

  return (
    <div className="flex flex-col justify-between lg:col-span-7">
      <InviteFormHeader activeRole={activeRole} onRoleChange={setActiveRole} />

      <form className="flex flex-col flex-1 justify-between" onSubmit={handleSubmit} noValidate>
        <div className="p-4 sm:p-6 space-y-4">
          <div key={activeRole} className="space-y-4 animate-in fade-in duration-160">
            {activeRole === 'client' && (
              <ClientRoleBlock
                form={state.inviteForm}
                clientKind={state.clientKind}
                mutation={state.inviteMutation}
              />
            )}
            {activeRole === 'worker' && (
              <WorkerRoleBlock form={state.workerForm} mutation={state.workerMutation} />
            )}
            {activeRole === 'admin' && (
              <AdminRoleBlock form={state.adminForm} mutation={state.adminMutation} />
            )}
          </div>
        </div>

        <InviteFormActions isPending={isPending} submitLabel={submitLabel} />
      </form>
    </div>
  )
}

function InviteGovernancePanel({ role }: { role: InviteRole }) {
  return (
    <div className="flex flex-col justify-between bg-muted/15 lg:col-span-5 divide-y divide-border/60">
      <RolePrivilegesCard role={role} embedded />
      <InviteSecurityCard embedded />
    </div>
  )
}

export function AdminInviteForms({ accessToken }: Props) {
  const state = useAdminInviteManager(accessToken)

  return (
    <section className="space-y-4" data-tour="admin-invites-section">
      <SectionIntro
        title="Centro de Incorporación"
        description="Genera invitaciones y accesos de acuerdo a los privilegios requeridos por cada rol."
      />

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div
          className={[
            'grid grid-cols-1 lg:grid-cols-12',
            'divide-y lg:divide-y-0 lg:divide-x divide-border/60 items-stretch',
          ].join(' ')}
        >
          <InviteFormPanel state={state} />
          <InviteGovernancePanel role={state.activeRole} />
        </div>
      </div>
    </section>
  )
}
