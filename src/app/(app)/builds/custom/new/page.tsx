import { redirect } from 'next/navigation'
import { getChampionList } from '@/lib/ddragon'
import { currentPatch } from '@/lib/builds/patch-stamp'
import { createBuild } from '@/lib/builds/actions'

// ---------------------------------------------------------------------------
// Server action — create build then redirect into the editor
// ---------------------------------------------------------------------------
async function handleCreate(form: FormData) {
  'use server'

  const name       = (form.get('name') as string | null)?.trim() ?? ''
  const championId = (form.get('championId') as string | null)?.trim() ?? ''
  const patchTag   = (form.get('patchTag') as string | null)?.trim() ?? ''
  const rolesRaw   = form.getAll('roles') as string[]

  const result = await createBuild({
    name:       name || `${championId} Build`,
    championId,
    roles:      rolesRaw as never,
    patchTag,
  })

  if (result.ok) {
    redirect(`/builds/custom/${result.data.id}`)
  }

  // On error fall back to list (edge case — form validation should catch first)
  redirect('/builds/custom')
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export const metadata = { title: 'New Build — FioraPool' }

const ROLES = [
  { value: 'TOP',     label: 'Top' },
  { value: 'JUNGLE',  label: 'Jungle' },
  { value: 'MID',     label: 'Mid' },
  { value: 'ADC',     label: 'ADC' },
  { value: 'SUPPORT', label: 'Support' },
]

export default async function NewBuildPage() {
  const [champions, patch] = await Promise.all([
    getChampionList(),
    currentPatch(),
  ])

  const championIds = Object.keys(champions).sort()

  return (
    <div
      style={{
        maxWidth: 520,
        margin: '48px auto',
        padding: '0 24px 80px',
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: '-0.02em',
            color: 'var(--foreground)',
          }}
        >
          New Build
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 14,
            color: 'var(--muted-foreground)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Set up the basics — you can edit everything in the editor.
        </p>
      </div>

      <form action={handleCreate}>
        {/* Hidden patch */}
        <input type="hidden" name="patchTag" value={patch} />

        {/* Champion */}
        <Field label="Champion" htmlFor="championId">
          <input
            id="championId"
            name="championId"
            list="champion-list"
            required
            placeholder="Fiora"
            autoComplete="off"
            style={inputStyle}
          />
          <datalist id="champion-list">
            {championIds.map(id => (
              <option key={id} value={id} />
            ))}
          </datalist>
        </Field>

        {/* Build name */}
        <Field label="Build name" htmlFor="name">
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Carry Fiora — Dueling"
            maxLength={80}
            style={inputStyle}
          />
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted-foreground)' }}>
            Optional — defaults to &ldquo;Champion Build&rdquo; if left blank.
          </p>
        </Field>

        {/* Roles */}
        <Field label="Role(s)" htmlFor="roles">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {ROLES.map(r => (
              <label
                key={r.value}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'oklch(0.16 0.02 280)',
                  color: 'var(--muted-foreground)',
                  fontSize: 13,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  name="roles"
                  value={r.value}
                  style={{ accentColor: 'var(--primary)', width: 14, height: 14 }}
                />
                {r.label}
              </label>
            ))}
          </div>
        </Field>

        <div style={{ marginTop: 28 }}>
          <button
            type="submit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Create Build
          </button>
        </div>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        htmlFor={htmlFor}
        style={{
          display: 'block',
          marginBottom: 6,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--foreground)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'oklch(0.16 0.02 280)',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}
