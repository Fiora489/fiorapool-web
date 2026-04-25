import { ImageResponse } from 'next/og'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { CustomBuildRow } from '@/lib/types/builds'

export const runtime = 'edge'

const SIZE = { width: 800, height: 400 }

const COLORS = {
  bg: '#1a1a2e',
  surface: '#16213e',
  accent: '#0f3460',
  text: '#e0e0e0',
  muted: '#9ca3af',
  pill: '#0f3460',
  pillText: '#93c5fd',
  patch: '#374151',
  patchText: '#d1d5db',
}

const TAG_PALETTE = [
  '#1e3a5f',
  '#1e4a2f',
  '#3d1a1a',
  '#2d1f4a',
  '#1a3d3d',
]

function tagColor(index: number) {
  return TAG_PALETTE[index % TAG_PALETTE.length]
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: buildData, error } = await supabase
    .from('custom_builds')
    .select(
      'id, user_id, champion_id, name, build_tags, patch_tag, is_public, roles',
    )
    .eq('id', id)
    .single()

  if (error || !buildData) {
    return new Response('Not found', { status: 404 })
  }

  const build = buildData as Pick<
    CustomBuildRow,
    'id' | 'user_id' | 'champion_id' | 'name' | 'build_tags' | 'patch_tag' | 'is_public' | 'roles'
  >

  // Authorization: must be public (edge runtime has no session cookies)
  if (!build.is_public) {
    return new Response('Not found', { status: 404 })
  }

  const tags: string[] = build.build_tags ?? []
  const roles: string[] = (build.roles as string[]) ?? []

  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE.width,
          height: SIZE.height,
          background: COLORS.bg,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 48px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top: champion + roles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 72,
              height: 72,
              background: COLORS.accent,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              color: COLORS.text,
              fontWeight: 700,
            }}
          >
            {build.champion_id.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.1,
              }}
            >
              {build.champion_id}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {roles.map((role) => (
                <span
                  key={role}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: COLORS.muted,
                    background: COLORS.surface,
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: build name */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: COLORS.text,
            lineHeight: 1.3,
            maxWidth: 680,
          }}
        >
          {build.name}
        </div>

        {/* Bottom: tags + patch */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tags.slice(0, 6).map((tag, i) => (
              <span
                key={tag}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.pillText,
                  background: tagColor(i),
                  padding: '4px 12px',
                  borderRadius: 20,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: COLORS.patchText,
              background: COLORS.patch,
              padding: '4px 10px',
              borderRadius: 6,
            }}
          >
            {build.patch_tag}
          </span>
        </div>
      </div>
    ),
    {
      ...SIZE,
    },
  )
}
