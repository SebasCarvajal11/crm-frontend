import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/molecules/form-field'
import { SectionIntro } from '@/components/molecules/section-intro'
import {
  inviteAdminSchema,
  inviteClientSchema,
  registerWorkerSchema,
  useAdminInvites,
} from '@/features/admin/hooks'
import { InviteRoleSwitcher } from './invite-role-switcher'
import { ROLES, type InviteRole } from './invite-role-switcher.types'
import { AdminRoleFields, ClientRoleFields, WorkerRoleFields } from './invite-form-fields'

type Props = {
  accessToken: string
}

const inputClass = 'h-10 rounded-xl'
const pairClass = 'grid grid-cols-1 gap-3 sm:grid-cols-2'

function CommonIdentityFields({
  emailLabel,
  emailError,
  firstError,
  lastError,
  registerEmail,
  registerFirst,
  registerLast,
}: {
  emailLabel: string
  emailError?: string
  firstError?: string
  lastError?: string
  registerEmail: ReturnType<UseFormReturnLike['register']>
  registerFirst: ReturnType<UseFormReturnLike['register']>
  registerLast: ReturnType<UseFormReturnLike['register']>
}) {
  return (
    <>
      <FormField id="invite-email" label={emailLabel} error={emailError}>
        <Input type="email" autoComplete="email" className={inputClass} {...registerEmail} />
      </FormField>
      <div className={pairClass}>
        <FormField id="invite-first" label="Nombres" error={firstError}>
          <Input className={inputClass} {...registerFirst} />
        </FormField>
        <FormField id="invite-last" label="Apellidos" error={lastError}>
          <Input className={inputClass} {...registerLast} />
        </FormField>
      </div>
    </>
  )
}

type UseFormReturnLike = {
  register: (name: string) => Record<string, unknown>
}

export function AdminInviteForms({ accessToken }: Props) {
  const [activeRole, setActiveRole] = useState<InviteRole>('client')

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

  const { adminMutation, inviteMutation, workerMutation } = useAdminInvites(accessToken)
  const currentRoleMeta = ROLES.find((r) => r.id === activeRole) ?? ROLES[0]
  const Icon = currentRoleMeta.icon

  const isPending =
    activeRole === 'client'
      ? inviteMutation.isPending
      : activeRole === 'worker'
        ? workerMutation.isPending
        : adminMutation.isPending

  const submitLabel = isPending
    ? activeRole === 'worker' ? 'Registrando...' : 'Creando...'
    : activeRole === 'client'
      ? 'Crear invitación'
      : activeRole === 'worker'
        ? 'Registrar colaborador'
        : 'Invitar administrador'

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

  return (
    <section className="space-y-4" data-tour="admin-invites-section">
      <SectionIntro
        title="Centro de Incorporación"
        description="Genera invitaciones y accesos de acuerdo a los privilegios requeridos por cada rol."
      />

      <Card className="w-full overflow-hidden rounded-2xl border-border/80 bg-card shadow-md shadow-black/[0.04]">
        <CardHeader className="border-b bg-muted/20 p-4 sm:p-6 space-y-3.5 sm:space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${currentRoleMeta.iconClass}`}
              >
                <Icon className="size-5" />
              </span>
              <div>
                <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                  {activeRole === 'client'
                    ? 'Invitar cliente'
                    : activeRole === 'worker'
                      ? 'Registrar colaborador'
                      : 'Invitar administrador'}
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                  {activeRole === 'client'
                    ? 'Acceso al portal y seguimiento de proyectos.'
                    : activeRole === 'worker'
                      ? 'Colaborador interno para gestión de proyectos y tareas.'
                      : 'Gobernanza, auditoría y control total del sistema.'}
                </CardDescription>
              </div>
            </div>
            <Badge className={`rounded-full border text-[10px] font-semibold shrink-0 ${currentRoleMeta.badgeClass}`}>
              {currentRoleMeta.badgeText}
            </Badge>
          </div>

          <InviteRoleSwitcher activeRole={activeRole} onChange={setActiveRole} />
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div key={activeRole} className="space-y-4 animate-in fade-in duration-160">
              {activeRole === 'client' && (
                <>
                  <CommonIdentityFields
                    emailLabel="Correo electrónico"
                    emailError={inviteForm.formState.errors.email?.message}
                    firstError={inviteForm.formState.errors.first_name?.message}
                    lastError={inviteForm.formState.errors.last_name?.message}
                    registerEmail={inviteForm.register('email')}
                    registerFirst={inviteForm.register('first_name')}
                    registerLast={inviteForm.register('last_name')}
                  />
                  <ClientRoleFields form={inviteForm} clientKind={clientKind} />
                  {inviteMutation.isError && (
                    <Alert variant="destructive">
                      <AlertTitle>No se pudo crear la invitación</AlertTitle>
                      <AlertDescription>{inviteMutation.error.message}</AlertDescription>
                    </Alert>
                  )}
                  {inviteMutation.isSuccess && (
                    <Alert>
                      <AlertTitle>Invitación enviada</AlertTitle>
                      <AlertDescription>{inviteMutation.data.message}</AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              {activeRole === 'worker' && (
                <>
                  <CommonIdentityFields
                    emailLabel="Correo institucional"
                    emailError={workerForm.formState.errors.email?.message}
                    firstError={workerForm.formState.errors.first_name?.message}
                    lastError={workerForm.formState.errors.last_name?.message}
                    registerEmail={workerForm.register('email')}
                    registerFirst={workerForm.register('first_name')}
                    registerLast={workerForm.register('last_name')}
                  />
                  <WorkerRoleFields form={workerForm} />
                  {workerMutation.isError && (
                    <Alert variant="destructive">
                      <AlertTitle>No se pudo registrar el colaborador</AlertTitle>
                      <AlertDescription>{workerMutation.error.message}</AlertDescription>
                    </Alert>
                  )}
                  {workerMutation.isSuccess && (
                    <Alert>
                      <AlertTitle>Invitación creada</AlertTitle>
                      <AlertDescription>
                        Se envió la invitación a {workerMutation.data.data.user.email} para activar su cuenta.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              {activeRole === 'admin' && (
                <>
                  <CommonIdentityFields
                    emailLabel="Correo institucional"
                    emailError={adminForm.formState.errors.email?.message}
                    firstError={adminForm.formState.errors.first_name?.message}
                    lastError={adminForm.formState.errors.last_name?.message}
                    registerEmail={adminForm.register('email')}
                    registerFirst={adminForm.register('first_name')}
                    registerLast={adminForm.register('last_name')}
                  />
                  <AdminRoleFields />
                  {adminMutation.isError && (
                    <Alert variant="destructive">
                      <AlertTitle>No se pudo invitar al administrador</AlertTitle>
                      <AlertDescription>{adminMutation.error.message}</AlertDescription>
                    </Alert>
                  )}
                  {adminMutation.isSuccess && (
                    <Alert>
                      <AlertTitle>Invitación enviada</AlertTitle>
                      <AlertDescription>{adminMutation.data.message}</AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </div>

            <div className="pt-2">
              <Button
                className="h-10 w-full rounded-xl"
                type="submit"
                disabled={isPending}
                data-testid="invite-submit-btn"
              >
                {submitLabel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
