import type { UseFormReturn } from 'react-hook-form'
import { ShieldAlert } from 'lucide-react'
import { FormField } from '@/components/molecules/form-field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { inviteClientSchema, registerWorkerSchema } from '@/features/admin/hooks'

const inputClass = 'h-10 rounded-xl'

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
    <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground animate-in fade-in duration-150">
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
