import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { ProjectContractDraftInput } from '@/features/collab/api'
import { SERVICE_PLANS, formatMoney } from './contract-editor-constants'

type SetField = <K extends keyof ProjectContractDraftInput>(
  key: K,
  value: ProjectContractDraftInput[K],
) => void

type FormProps = {
  values: ProjectContractDraftInput
  onChange: SetField
  onProviderChange: (providerKind: 'cima' | 'independent') => void
  onPlanChange: (plan: (typeof SERVICE_PLANS)[number]) => void
}

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-foreground">{label}</Label>
      {children}
    </div>
  )
}

function ProviderFields({
  values,
  onChange,
  onProviderChange,
}: {
  values: ProjectContractDraftInput
  onChange: SetField
  onProviderChange: (kind: 'cima' | 'independent') => void
}) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold">Prestador del servicio</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Modalidad">
          <select
            className="h-9 w-full rounded-lg border bg-background px-2 text-sm"
            value={values.provider_kind}
            onChange={(e) => onProviderChange(e.target.value as 'cima' | 'independent')}
          >
            <option value="cima">CIMA (con IVA)</option>
            <option value="independent">Ander (sin IVA)</option>
          </select>
        </Field>
        <Field label="Nombre o razón social">
          <Input
            value={values.provider_name}
            onChange={(e) => onChange('provider_name', e.target.value)}
          />
        </Field>
        <Field label="NIT o documento">
          <Input
            value={values.provider_tax_id ?? ''}
            onChange={(e) => onChange('provider_tax_id', e.target.value)}
          />
        </Field>
        <Field label="Representante legal">
          <Input
            value={values.provider_representative ?? ''}
            onChange={(e) => onChange('provider_representative', e.target.value)}
          />
        </Field>
        {values.provider_kind === 'cima' && (
          <Field label="Documento del representante">
            <Input
              value={values.provider_representative_document ?? ''}
              onChange={(e) => onChange('provider_representative_document', e.target.value)}
            />
          </Field>
        )}
      </div>
    </div>
  )
}

function ClientFields({
  values,
  onChange,
}: {
  values: ProjectContractDraftInput
  onChange: SetField
}) {
  const isJuridical = values.client_kind === 'juridical'
  return (
    <div className="border-t border-border/80 pt-5">
      <h4 className="mb-3 text-sm font-semibold">Cliente que firmará</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Tipo de cliente">
          <select
            className="h-9 w-full rounded-lg border bg-background px-2 text-sm"
            value={values.client_kind}
            onChange={(e) => onChange('client_kind', e.target.value as 'natural' | 'juridical')}
          >
            <option value="natural">Persona natural</option>
            <option value="juridical">Persona jurídica</option>
          </select>
        </Field>
        <Field label={isJuridical ? 'Razón social' : 'Nombre completo'}>
          <Input
            value={isJuridical ? (values.client_company_name ?? '') : values.client_name}
            onChange={(e) =>
              onChange(isJuridical ? 'client_company_name' : 'client_name', e.target.value)
            }
          />
        </Field>
        {isJuridical ? (
          <>
            <Field label="NIT">
              <Input
                value={values.client_tax_id ?? ''}
                onChange={(e) => onChange('client_tax_id', e.target.value)}
              />
            </Field>
            <Field label="Representante legal">
              <Input
                value={values.client_representative ?? ''}
                onChange={(e) => onChange('client_representative', e.target.value)}
              />
            </Field>
            <Field label="Documento representante">
              <Input
                value={values.client_representative_document ?? ''}
                onChange={(e) => onChange('client_representative_document', e.target.value)}
              />
            </Field>
          </>
        ) : (
          <Field label="Cédula o documento">
            <Input
              value={values.client_document ?? ''}
              onChange={(e) => onChange('client_document', e.target.value)}
            />
          </Field>
        )}
        <Field label="Correo electrónico">
          <Input
            type="email"
            value={values.client_email}
            onChange={(e) => onChange('client_email', e.target.value)}
          />
        </Field>
        <Field label="Celular">
          <Input
            value={values.client_phone ?? ''}
            onChange={(e) => onChange('client_phone', e.target.value)}
          />
        </Field>
      </div>
    </div>
  )
}

function PlanTermsFields({
  values,
  onChange,
  onPlanChange,
}: {
  values: ProjectContractDraftInput
  onChange: SetField
  onPlanChange: (plan: (typeof SERVICE_PLANS)[number]) => void
}) {
  return (
    <div className="border-t border-border/80 pt-5">
      <h4 className="mb-3 text-sm font-semibold">Plan y condiciones</h4>
      <div className="grid gap-3 md:grid-cols-3">
        {SERVICE_PLANS.map((plan) => {
          const isSelected = values.plan_name === plan.name
          const planFee =
            values.provider_kind === 'cima' ? Math.round(plan.baseFee * 1.19) : plan.baseFee
          return (
            <button
              type="button"
              key={plan.name}
              onClick={() => onPlanChange(plan)}
              className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                  : 'hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              <p className="font-semibold text-sm">{plan.name}</p>
              <p className="mt-1 text-base font-bold text-foreground">
                {formatMoney(planFee)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">/ mes</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{plan.scope}</p>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {values.provider_kind === 'cima' ? 'Valores con IVA del 19% incluido.' : 'Valores sin IVA.'}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Valor mensual (COP)">
          <Input
            type="number"
            min="0"
            value={values.monthly_fee}
            onChange={(e) => onChange('monthly_fee', Number(e.target.value))}
          />
        </Field>
        <Field label="Plazo del contrato">
          <div className="flex h-9 items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={values.term_months === 6 ? 'default' : 'outline'}
              onClick={() => onChange('term_months', 6)}
            >
              6 meses
            </Button>
            <Button
              type="button"
              size="sm"
              variant={values.term_months === 12 ? 'default' : 'outline'}
              onClick={() => onChange('term_months', 12)}
            >
              1 año
            </Button>
            <Input
              className="w-20"
              type="number"
              min="1"
              max="120"
              value={values.term_months}
              onChange={(e) => onChange('term_months', Number(e.target.value))}
            />
          </div>
        </Field>
      </div>

      <Field label="Alcance del servicio" className="mt-3">
        <Textarea
          rows={3}
          value={values.service_scope}
          onChange={(e) => onChange('service_scope', e.target.value)}
        />
      </Field>

      <Field label="Condiciones adicionales (opcional)" className="mt-3">
        <Textarea
          rows={2}
          value={values.additional_terms ?? ''}
          onChange={(e) => onChange('additional_terms', e.target.value)}
        />
      </Field>

      <Field label="Ciudad de firma" className="mt-3">
        <Input
          value={values.signature_city}
          onChange={(e) => onChange('signature_city', e.target.value)}
        />
      </Field>
    </div>
  )
}

export function ContractEditorForm({
  values,
  onChange,
  onProviderChange,
  onPlanChange,
}: FormProps) {
  return (
    <div className="space-y-5 p-4">
      <ProviderFields
        values={values}
        onChange={onChange}
        onProviderChange={onProviderChange}
      />
      <ClientFields values={values} onChange={onChange} />
      <PlanTermsFields
        values={values}
        onChange={onChange}
        onPlanChange={onPlanChange}
      />
    </div>
  )
}
