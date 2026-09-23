import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BriefcaseBusiness, ShieldAlert, ShieldPlus, UserPlus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField } from '@/components/molecules/form-field'
import { SectionIntro } from '@/components/molecules/section-intro'
import {
  inviteAdminSchema,
  inviteClientSchema,
  registerWorkerSchema,
  useAdminInvites,
} from '@/features/admin/hooks'

type Props = {
  accessToken: string
}

const cardClass = 'flex h-full flex-col overflow-hidden rounded-2xl border-border/80 bg-card shadow-md shadow-black/[0.04]'
const cardHeaderClass = 'border-b bg-muted/20 p-5 sm:p-6'
const inputClass = 'h-10 rounded-xl'
const pairClass = 'grid grid-cols-1 gap-3 sm:grid-cols-2'

/** Organismo: centro de incorporacion y generacion de accesos para roles del CRM. */
export function AdminInviteForms({ accessToken }: Props) {
  const inviteForm = useForm<import('zod').infer<typeof inviteClientSchema>>({
    resolver: zodResolver(inviteClientSchema),
    defaultValues: { email: '', first_name: '', last_name: '', client_kind: 'natural', company_name: '' },
  })
  const inviteKind = useWatch({ control: inviteForm.control, name: 'client_kind' })

  const workerForm = useForm<import('zod').infer<typeof registerWorkerSchema>>({
    resolver: zodResolver(registerWorkerSchema),
    defaultValues: { email: '', first_name: '', last_name: '', profession: '' },
  })

  const adminForm = useForm<import('zod').infer<typeof inviteAdminSchema>>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: { email: '', first_name: '', last_name: '' },
  })

  const { adminMutation, inviteMutation, workerMutation } = useAdminInvites(accessToken)

  return (
    <section className="space-y-4">
      <div data-tour="admin-invites-section">
        <SectionIntro
          title="Centro de Incorporación"
          description="Genera invitaciones y accesos de acuerdo a los privilegios requeridos por cada rol."
        />
      </div>
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Invitar cliente */}
        <Card data-tour="admin-invite-client" className={cardClass}>
          <CardHeader className={cardHeaderClass}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <UserPlus className="size-5" />
                </span>
                <div>
                  <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                    Invitar cliente
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                    Acceso al portal y seguimiento de proyectos.
                  </CardDescription>
                </div>
              </div>
              <Badge className="rounded-full border-emerald-500/20 bg-emerald-500/10 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400">
                Portal
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between p-5 sm:p-6">
            <form
              className="flex flex-1 flex-col justify-between space-y-4"
              onSubmit={inviteForm.handleSubmit((values) =>
                inviteMutation.mutate(values, { onSuccess: () => inviteForm.reset() })
              )}
            >
              <div className="space-y-4">
                <FormField id="invite-email" label="Correo electrónico" error={inviteForm.formState.errors.email?.message}>
                  <Input type="email" autoComplete="email" className={inputClass} {...inviteForm.register('email')} />
                </FormField>
                <div className={pairClass}>
                  <FormField id="invite-first" label="Nombres" error={inviteForm.formState.errors.first_name?.message}>
                    <Input className={inputClass} {...inviteForm.register('first_name')} />
                  </FormField>
                  <FormField id="invite-last" label="Apellidos" error={inviteForm.formState.errors.last_name?.message}>
                    <Input className={inputClass} {...inviteForm.register('last_name')} />
                  </FormField>
                </div>
                <FormField id="invite-kind" label="Tipo de cliente" error={inviteForm.formState.errors.client_kind?.message}>
                  {(control) => (
                    <Select
                      value={inviteKind}
                      onValueChange={(value) =>
                        inviteForm.setValue('client_kind', value as 'natural' | 'juridical', {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger {...control} className="h-10 w-full rounded-xl">
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural">Persona natural</SelectItem>
                        <SelectItem value="juridical">Persona juridica</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
                {inviteKind === 'juridical' && (
                  <FormField id="invite-company" label="Empresa o Razón Social" error={inviteForm.formState.errors.company_name?.message}>
                    <Input className={inputClass} {...inviteForm.register('company_name')} />
                  </FormField>
                )}
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
              </div>
              <div className="mt-auto pt-4">
                <Button className="h-10 w-full rounded-xl" type="submit" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending ? 'Creando...' : 'Crear invitacion'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Registrar trabajador */}
        <Card data-tour="admin-invite-worker" className={cardClass}>
          <CardHeader className={cardHeaderClass}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-400">
                  <BriefcaseBusiness className="size-5" />
                </span>
                <div>
                  <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                    Registrar trabajador
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                    Colaborador interno para gestión de proyectos.
                  </CardDescription>
                </div>
              </div>
              <Badge className="rounded-full border-cyan-500/20 bg-cyan-500/10 text-[10px] font-semibold text-cyan-700 hover:bg-cyan-500/15 dark:text-cyan-400">
                Operación
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between p-5 sm:p-6">
            <form
              className="flex flex-1 flex-col justify-between space-y-4"
              onSubmit={workerForm.handleSubmit((values) =>
                workerMutation.mutate(values, { onSuccess: () => workerForm.reset() })
              )}
            >
              <div className="space-y-4">
                <FormField id="worker-email" label="Correo institucional" error={workerForm.formState.errors.email?.message}>
                  <Input type="email" autoComplete="email" className={inputClass} {...workerForm.register('email')} />
                </FormField>
                <div className={pairClass}>
                  <FormField id="worker-first" label="Nombres" error={workerForm.formState.errors.first_name?.message}>
                    <Input className={inputClass} {...workerForm.register('first_name')} />
                  </FormField>
                  <FormField id="worker-last" label="Apellidos" error={workerForm.formState.errors.last_name?.message}>
                    <Input className={inputClass} {...workerForm.register('last_name')} />
                  </FormField>
                </div>
                <FormField id="worker-prof" label="Especialidad o Profesión" error={workerForm.formState.errors.profession?.message}>
                  <Input className={inputClass} placeholder="Ej. Ingeniero de Software, Consultor" {...workerForm.register('profession')} />
                </FormField>
                {workerMutation.isError && (
                  <Alert variant="destructive">
                    <AlertTitle>No se pudo registrar el trabajador</AlertTitle>
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
              </div>
              <div className="mt-auto pt-4">
                <Button className="h-10 w-full rounded-xl" type="submit" disabled={workerMutation.isPending}>
                  {workerMutation.isPending ? 'Registrando...' : 'Registrar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Invitar administrador */}
        <Card data-tour="admin-invite-admin" className={cardClass}>
          <CardHeader className={cardHeaderClass}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldPlus className="size-5" />
                </span>
                <div>
                  <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                    Invitar administrador
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                    Gobernanza, auditoría y control del sistema.
                  </CardDescription>
                </div>
              </div>
              <Badge className="rounded-full border-primary/20 bg-primary/10 text-[10px] font-semibold text-primary hover:bg-primary/15">
                Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between p-5 sm:p-6">
            <form
              className="flex flex-1 flex-col justify-between space-y-4"
              onSubmit={adminForm.handleSubmit((values) =>
                adminMutation.mutate(values, { onSuccess: () => adminForm.reset() })
              )}
            >
              <div className="space-y-4">
                <FormField id="admin-email" label="Correo institucional" error={adminForm.formState.errors.email?.message}>
                  <Input type="email" autoComplete="email" className={inputClass} {...adminForm.register('email')} />
                </FormField>
                <div className={pairClass}>
                  <FormField id="admin-first" label="Nombres" error={adminForm.formState.errors.first_name?.message}>
                    <Input className={inputClass} {...adminForm.register('first_name')} />
                  </FormField>
                  <FormField id="admin-last" label="Apellidos" error={adminForm.formState.errors.last_name?.message}>
                    <Input className={inputClass} {...adminForm.register('last_name')} />
                  </FormField>
                </div>
                <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium text-primary">
                    <ShieldAlert className="size-3.5" />
                    <span>Nivel de Acceso Crítico</span>
                  </div>
                  <p className="mt-1 leading-relaxed">
                    Tendrá permisos completos para gestionar usuarios, roles y seguridad global.
                  </p>
                </div>
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
              </div>
              <div className="mt-auto pt-4">
                <Button className="h-10 w-full rounded-xl" type="submit" disabled={adminMutation.isPending}>
                  {adminMutation.isPending ? 'Creando...' : 'Invitar administrador'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
