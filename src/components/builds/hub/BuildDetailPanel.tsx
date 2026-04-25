'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { HubBuildDetail } from '@/lib/builds/hub-detail'
import { RolePill, PatchChip, BookmarkBtn, KpiCard, Eyebrow, relTime } from './hub-atoms'

const NAV_H = 57 // px — matches the app nav height

// ---------------------------------------------------------------------------
// Helper — derives a champion accent tone from known champions or falls back
// ---------------------------------------------------------------------------
const CHAMP_TONE: Record<string, string> = {
  Fiora:       'oklch(0.68 0.22 22)',
  Riven:       'oklch(0.68 0.22 22)',
  Darius:      'oklch(0.68 0.22 22)',
  Jinx:        'oklch(0.68 0.24 295)',
  Lux:         'oklch(0.88 0.14 90)',
  Ahri:        'oklch(0.68 0.22 22)',
  Yasuo:       'oklch(0.72 0.18 230)',
  Zed:         'oklch(0.68 0.24 295)',
  Caitlyn:     'oklch(0.72 0.18 230)',
  Thresh:      'oklch(0.72 0.18 155)',
  LeeSin:      'oklch(0.78 0.18 75)',
}

function getChampTone(championId: string): string {
  return CHAMP_TONE[championId] ?? 'var(--primary)'
}

// ---------------------------------------------------------------------------
// ItemTile — 52px square representing a single item (shows first 2 capitals)
// ---------------------------------------------------------------------------
function ItemTile({
  name,
  itemId,
  core,
  idx,
  tone,
}: {
  name?: string
  itemId: number
  core?: boolean
  idx?: number
  tone: string
}) {
  // Display: item ID (we don't have item names in the detail; show truncated ID)
  const label = String(itemId).slice(0, 4)

  return (
    <div
      title={name ?? String(itemId)}
      style={{
        width: 52,
        height: 52,
        borderRadius: 8,
        background: 'linear-gradient(135deg, oklch(0.22 0.02 280), oklch(0.16 0.02 280))',
        border: core ? `1.5px solid ${tone}` : '1px solid var(--border)',
        boxShadow: core ? `0 0 12px color-mix(in oklch, ${tone} 35%, transparent)` : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: 11,
        color: core ? tone : 'var(--muted-foreground)',
        letterSpacing: '0.02em',
        flexShrink: 0,
      }}
    >
      {label}
      {idx !== undefined && (
        <span
          style={{
            position: 'absolute',
            top: -6,
            left: -6,
            width: 18,
            height: 18,
            borderRadius: 9999,
            background: 'var(--background)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            fontWeight: 700,
            color: 'var(--muted-foreground)',
          }}
        >
          {idx}
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ArrowRight
// ---------------------------------------------------------------------------
function ArrowRight() {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: 'var(--muted-foreground)', flexShrink: 0 }}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// SkillGrid — 4 rows (Q/W/E/R) × 18 columns (levels 1-18)
// ---------------------------------------------------------------------------
const SKILLS = ['Q', 'W', 'E', 'R'] as const

function SkillGrid({ tone }: { tone: string }) {
  // Generate a stable skill order that prioritises Q (most common for most champs)
  // In production this would come from the build's skill_order data
  const skillOrder = [
    'Q','W','E','Q','Q','R','Q','W','Q','R','W','W','W','E','E','R','E','E',
  ]

  return (
    <div
      style={{
        marginTop: 10,
        display: 'grid',
        gridTemplateColumns: '28px repeat(18, 1fr)',
        gap: 3,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
      }}
    >
      {SKILLS.map((skill) => (
        <>
          {/* skill label */}
          <div
            key={`label-${skill}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 11,
              color: 'var(--muted-foreground)',
            }}
          >
            {skill}
          </div>
          {/* level cells */}
          {skillOrder.map((s, i) => (
            <div
              key={`${skill}-${i}`}
              style={{
                height: 22,
                borderRadius: 4,
                background: s === skill
                  ? tone
                  : 'oklch(0.20 0.02 280)',
                border: `1px solid ${s === skill ? 'transparent' : 'var(--border)'}`,
                boxShadow: s === skill
                  ? `0 0 8px color-mix(in oklch, ${tone} 45%, transparent)`
                  : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: s === skill ? 'var(--primary-foreground)' : 'transparent',
                fontWeight: 700,
                fontSize: 9,
              }}
            >
              {s === skill ? s : ''}
            </div>
          ))}
        </>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// LoadingShimmer — shown while detail data is loading
// ---------------------------------------------------------------------------
function LoadingShimmer() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        color: 'var(--muted-foreground)',
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
      </svg>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13 }}>
        Loading build…
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// BuildDetailPanel
// ---------------------------------------------------------------------------
interface BuildDetailPanelProps {
  build: HubBuildDetail | null
  loading: boolean
  bookmarked: boolean
  onToggleBookmark: (id: string) => void
  onClose: () => void
  isLoggedIn: boolean
}

export default function BuildDetailPanel({
  build,
  loading,
  bookmarked,
  onToggleBookmark,
  onClose,
  isLoggedIn,
}: BuildDetailPanelProps) {
  // Keyboard dismiss + body scroll lock
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const tone = build ? getChampTone(build.championId) : 'var(--primary)'

  // Collect all items across blocks for the detail display
  const startingItems = build?.blocks?.starting?.items ?? []
  const coreItems     = build?.blocks?.core?.items ?? []
  const fullItems     = build?.blocks?.full?.items ?? []
  const bootsItems    = build?.blocks?.boots?.items ?? []



  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: 'fixed',
          top: NAV_H,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 80,
          background: 'oklch(0.06 0.02 280 / 0.55)',
          backdropFilter: 'blur(2px)',
          animation: 'fpFadeIn 220ms var(--ease-out-expo, ease) forwards',
        }}
      />

      {/* Panel */}
      <section
        role="dialog"
        aria-modal="true"
        aria-label={build?.name ?? 'Build details'}
        style={{
          position: 'fixed',
          top: NAV_H,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 90,
          background: 'var(--background)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fpPanelIn 360ms var(--ease-out-expo, ease) forwards',
          overflowY: 'auto',
        }}
      >
        {/* ---------------------------------------------------------------- */}
        {/* HERO HEADER — champion splash                                     */}
        {/* ---------------------------------------------------------------- */}
        <div
          style={{
            position: 'relative',
            height: 280,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {build && (
            <Image
              src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${build.championId}_0.jpg`}
              alt={build.championId}
              fill
              sizes="100vw"
              priority
              style={{ objectFit: 'cover', objectPosition: 'top center' }}
            />
          )}
          {/* gradient overlay — bottom-heavy */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, oklch(0 0 0 / 0.2) 0%, var(--background) 100%)',
            }}
          />

          {/* close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 36,
              height: 36,
              borderRadius: 9999,
              border: '1px solid oklch(0.3 0.02 280)',
              background: 'oklch(0.12 0.02 280 / 0.85)',
              backdropFilter: 'blur(6px)',
              color: 'var(--muted-foreground)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 160ms',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--tier-rose)'
              e.currentTarget.style.color = 'var(--tier-rose)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'oklch(0.3 0.02 280)'
              e.currentTarget.style.color = 'var(--muted-foreground)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>

          {/* bottom-left: champ icon + build title + meta */}
          {build && (
            <div
              style={{
                position: 'absolute',
                left: 40,
                bottom: 28,
                right: 140,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 20,
                minWidth: 0,
              }}
            >
              {/* champ icon ring */}
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 9999,
                  overflow: 'hidden',
                  border: `3px solid ${tone}`,
                  boxShadow: `0 0 20px color-mix(in oklch, ${tone} 40%, transparent)`,
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${build.championId}_0.jpg`}
                  alt={build.championId}
                  fill
                  sizes="96px"
                  style={{ objectFit: 'cover', objectPosition: 'top center' }}
                />
              </div>

              {/* title block */}
              <div style={{ minWidth: 0, paddingBottom: 4 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    color: tone,
                    textTransform: 'uppercase',
                  }}
                >
                  <span>{build.championId}</span>
                  <span style={{ color: 'var(--muted-foreground)' }}>·</span>
                  {build.roles.map((r) => (
                    <RolePill key={r} role={r} size="md" />
                  ))}
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 36,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.05,
                    color: 'var(--foreground)',
                    textShadow: '0 2px 20px oklch(0 0 0 / 0.6)',
                  }}
                >
                  {build.name}
                </h2>
                <div
                  style={{
                    marginTop: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--muted-foreground)',
                  }}
                >
                  <span style={{ color: tone, fontWeight: 700 }}>
                    @{build.authorId.slice(0, 8)}
                  </span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>{relTime(build.updatedAt)}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <PatchChip patch={build.patchTag} />
                </div>
              </div>
            </div>
          )}

          {/* bottom-right: bookmark */}
          {build && (
            <div
              style={{
                position: 'absolute',
                right: 40,
                bottom: 28,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <BookmarkBtn
                bookmarked={bookmarked}
                onToggle={() => onToggleBookmark(build.id)}
                disabled={!isLoggedIn}
              />
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* BODY                                                              */}
        {/* ---------------------------------------------------------------- */}
        {loading && <LoadingShimmer />}

        {!loading && build && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 300px',
              gap: 32,
              padding: '28px 40px 60px',
              maxWidth: 1200,
              width: '100%',
              margin: '0 auto',
              boxSizing: 'border-box',
            }}
          >
            {/* ------------------------------------------------------------ */}
            {/* Left column                                                   */}
            {/* ------------------------------------------------------------ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>
              {/* KPI strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                }}
              >
                <KpiCard
                  label="Bookmarks"
                  value={build.bookmarkCount.toLocaleString()}
                  tone="var(--primary)"
                  sub="community saves"
                />
                <KpiCard
                  label="Patch"
                  value={build.patchTag}
                  tone={tone}
                  sub="build version"
                />
                <KpiCard
                  label="Created"
                  value={relTime(build.createdAt)}
                  sub="build age"
                />
              </div>

              {/* Description */}
              {build.descriptionMd && (
                <section>
                  <Eyebrow>About this build</Eyebrow>
                  <p
                    style={{
                      marginTop: 10,
                      fontFamily: 'var(--font-body)',
                      fontSize: 14,
                      color: 'var(--muted-foreground)',
                      lineHeight: 1.7,
                    }}
                  >
                    {build.descriptionMd}
                  </p>
                </section>
              )}

              {/* Starting items */}
              {startingItems.length > 0 && (
                <section>
                  <Eyebrow>Starting items</Eyebrow>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      marginTop: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    {startingItems.map((item, i) => (
                      <ItemTile key={i} itemId={item.id} tone={tone} />
                    ))}
                  </div>
                </section>
              )}

              {/* Core items */}
              {coreItems.length > 0 && (
                <section>
                  <Eyebrow>Core items</Eyebrow>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginTop: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    {coreItems.map((item, i) => (
                      <>
                        <ItemTile key={i} itemId={item.id} tone={tone} core />
                        {i < coreItems.length - 1 && <ArrowRight key={`arr-${i}`} />}
                      </>
                    ))}
                  </div>
                </section>
              )}

              {/* Full build */}
              {fullItems.length > 0 && (
                <section>
                  <Eyebrow>Full build</Eyebrow>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      marginTop: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    {fullItems.map((item, i) => (
                      <ItemTile key={i} itemId={item.id} tone={tone} idx={i + 1} />
                    ))}
                  </div>
                </section>
              )}

              {/* Boots */}
              {bootsItems.length > 0 && (
                <section>
                  <Eyebrow>Boots</Eyebrow>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      marginTop: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    {bootsItems.map((item, i) => (
                      <ItemTile key={i} itemId={item.id} tone={tone} />
                    ))}
                  </div>
                </section>
              )}

              {/* Skill order */}
              <section>
                <Eyebrow>Skill order</Eyebrow>
                <SkillGrid tone={tone} />
              </section>

              {/* Open in editor CTA */}
              <div style={{ paddingTop: 8 }}>
                <Link
                  href={`/builds/custom/${build.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 22px',
                    borderRadius: 9,
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: 'none',
                    boxShadow: '0 6px 20px -6px var(--primary-glow)',
                    transition: 'opacity 160ms',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                >
                  Open in editor
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Right column — sidebar                                        */}
            {/* ------------------------------------------------------------ */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
              {/* Keystone card */}
              {build.keystoneId && (
                <div
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '18px 18px 20px',
                  }}
                >
                  <Eyebrow>Keystone</Eyebrow>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginTop: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 9999,
                        background: `color-mix(in oklch, ${tone} 15%, oklch(0.20 0.02 280))`,
                        border: `2px solid ${tone}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: 12,
                        color: tone,
                        flexShrink: 0,
                      }}
                    >
                      {String(build.keystoneId).slice(0, 3)}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: 14,
                          letterSpacing: '-0.01em',
                          color: 'var(--foreground)',
                        }}
                      >
                        Rune #{build.keystoneId}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: 'var(--muted-foreground)',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          marginTop: 2,
                        }}
                      >
                        Keystone
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {build.buildTags.length > 0 && (
                <div
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '18px 18px 20px',
                  }}
                >
                  <Eyebrow>Build tags</Eyebrow>
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      flexWrap: 'wrap',
                      marginTop: 10,
                    }}
                  >
                    {build.buildTags.map((t) => (
                      <span
                        key={t}
                        style={{
                          padding: '5px 11px',
                          borderRadius: 9999,
                          background: 'oklch(0.22 0.02 280)',
                          border: '1px solid var(--border)',
                          fontFamily: 'var(--font-body)',
                          fontSize: 12,
                          fontWeight: 500,
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Situational items */}
              {build.blocks?.situational?.items && build.blocks.situational.items.length > 0 && (
                <div
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '18px 18px 20px',
                  }}
                >
                  <Eyebrow>Situational</Eyebrow>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                      marginTop: 10,
                    }}
                  >
                    {build.blocks.situational.items.map((item, i) => (
                      <ItemTile key={i} itemId={item.id} tone={tone} />
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </section>
    </>
  )
}
