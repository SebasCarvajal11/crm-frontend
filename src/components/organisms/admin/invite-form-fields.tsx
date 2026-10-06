import type { UseFormRegisterReturn, UseFormReturn } from 'react-hook-form'
import { ShieldAlert } from 'lucide-react'
import { FormField } from '@/components/molecules/form-field'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type {
  inviteAdminSchema,
  inviteClientSchema,
  registerWorkerSchema,
  useAdminInvites,
} from '@/features/admin/hooks'

const inputClass = 'h-10 rounded-xl'
const pairClass = 'grid grid-cols-1 gap-3 sm:grid-cols-2'

export type CommonIdentityFieldsProps = {
  emailLabel: string
  emailError?: string
  firstError?: string
  lastError?: string
  registerEmail: UseFormRegisterReturn
  registerFirst: UseFormRegisterReturn
  registerLast: UseFormRegisterReturn
}

export function CommonIdentityFields({
  emailLabel,
  emailError,
  firstError,
  lastError,
  registerEmail,
  registerFirst,
  registerLast,
}: CommonIdentityFieldsProps) {
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


export function ClientRoleFields({
  form,
  clientKind,
}: {
  form: UseFormReturn<import('zod').infer<typeof inviteClientSchema>>
  clientKind: 'natural' | 'juridical'
}) {
  const err = form.formState.errors

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <FormField id="invite-kind" label="Tipo de cliente" error={err.client_kind?.message}>
        {(control) => (
          <Select
            value={clientKind}
            onValueChange={(val) =>
              form.setValue('client_kind', val as 'natural' | 'juridical', {
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
      {clientKind === 'juridical' && (
        <FormField id="invite-company" label="Empresa o Razón Social" error={err.company_name?.message}>
          <Input className={inputClass} {...form.register('company_name')} />
        </FormField>
      )}
    </div>
  )
}

export function WorkerRoleFields({
  form,
}: {
  form: UseFormReturn<import('zod').infer<typeof registerWorkerSchema>>
}) {
  const err = form.formState.errors

  return (
    <div className="animate-in fade-in duration-150">
      <FormField id="worker-prof" label="Especialidad o Profesión" error={err.profession?.message}>
        <Input
          className={inputClass}
          placeholder="Ej. Ingeniero de Software, Consultor"
          {...form.register('profession')}
        />
      </FormField>
    </div>
  )
}

export function AdminRoleFields() {
  return (
    <div
      className={[
        'rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs',
        'text-muted-foreground animate-in fade-in duration-150',
      ].join(' ')}
    >
      <div className="flex items-center gap-1.5 font-medium text-primary">
        <ShieldAlert className="size-3.5" />
        <span>Nivel de Acceso Crítico</span>
      </div>
      <p className="mt-1 leading-relaxed">
        Tendrá permisos completos para gestionar usuarios, roles y seguridad global.
      </p>
    </div>
  )
}

export type ClientRoleBlockProps = {
  form: UseFormReturn<import('zod').infer<typeof inviteClientSchema>>
  clientKind: 'natural' | 'juridical'
  mutation: ReturnType<typeof useAdminInvites>['inviteMutation']
}

export function ClientRoleBlock({ form, clientKind, mutation }: ClientRoleBlockProps) {
  return (
    <>
      <CommonIdentityFields
        emailLabel="Correo electrónico"
        emailError={form.formState.errors.email?.message}
        firstError={form.formState.errors.first_name?.message}
        lastError={form.formState.errors.last_name?.message}
        registerEmail={form.register('email')}
        registerFirst={form.register('first_name')}
        registerLast={form.register('last_name')}
      />
      <ClientRoleFields form={form} clientKind={clientKind} />
      {mutation.isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo crear la invitación</AlertTitle>
          <AlertDescription>{mutation.error.message}</AlertDescription>
        </Alert>
      )}
      {mutation.isSuccess && (
        <Alert>
          <AlertTitle>Invitación enviada</AlertTitle>
          <AlertDescription>{mutation.data.message}</AlertDescription>
        </Alert>
      )}
    </>
  )
}

export type WorkerRoleBlockProps = {
  form: UseFormReturn<import('zod').infer<typeof registerWorkerSchema>>
  mutation: ReturnType<typeof useAdminInvites>['workerMutation']
}

export function WorkerRoleBlock({ form, mutation }: WorkerRoleBlockProps) {
  return (
    <>
      <CommonIdentityFields
        emailLabel="Correo institucional"
        emailError={form.formState.errors.email?.message}
        firstError={form.formState.errors.first_name?.message}
        lastError={form.formState.errors.last_name?.message}
        registerEmail={form.register('email')}
        registerFirst={form.register('first_name')}
        registerLast={form.register('last_name')}
      />
      <WorkerRoleFields form={form} />
      {mutation.isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo registrar el colaborador</AlertTitle>
          <AlertDescription>{mutation.error.message}</AlertDescription>
        </Alert>
      )}
      {mutation.isSuccess && (
        <Alert>
          <AlertTitle>Invitación creada</AlertTitle>
          <AlertDescription>
            Se envió la invitación a {mutation.data?.data.user.email} para activar su cuenta.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}

export type AdminRoleBlockProps = {
  form: UseFormReturn<import('zod').infer<typeof inviteAdminSchema>>
  mutation: ReturnType<typeof useAdminInvites>['adminMutation']
}

export function AdminRoleBlock({ form, mutation }: AdminRoleBlockProps) {
  return (
    <>
      <CommonIdentityFields
        emailLabel="Correo institucional"
        emailError={form.formState.errors.email?.message}
        firstError={form.formState.errors.first_name?.message}
        lastError={form.formState.errors.last_name?.message}
        registerEmail={form.register('email')}
        registerFirst={form.register('first_name')}
        registerLast={form.register('last_name')}
      />
      <AdminRoleFields />
      {mutation.isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo invitar al administrador</AlertTitle>
          <AlertDescription>{mutation.error.message}</AlertDescription>
        </Alert>
      )}
      {mutation.isSuccess && (
        <Alert>
          <AlertTitle>Invitación enviada</AlertTitle>
          <AlertDescription>{adminMessage(mutation.data)}</AlertDescription>
        </Alert>
      )}
    </>
  )
}

function adminMessage(data?: { message?: string } | null) {
  return data?.message ?? 'Invitación enviada exitosamente'
}
