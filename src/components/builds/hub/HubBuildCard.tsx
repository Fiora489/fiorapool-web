'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { HubBuildCard as HubBuildCardType } from '@/lib/types/builds'
import { RolePill, PatchChip, BookmarkBtn, relTime } from './hub-atoms'

// ---------------------------------------------------------------------------
// Per-champion accent colours — used for card hover glow
// Champions not in the map fall back to var(--primary)
// ---------------------------------------------------------------------------
const CHAMP_TONE: Record<string, string> = {
  Fiora:       'oklch(0.68 0.22 22)',
  Riven:       'oklch(0.68 0.22 22)',
  Darius:      'oklch(0.68 0.22 22)',
  Jinx:        'oklch(0.68 0.24 295)',
  Lux:         'oklch(0.88 0.14 90)',
  Ahri:        'oklch(0.68 0.22 22)',
  Yasuo:       'oklch(0.72 0.18 230)',
  Yone:        'oklch(0.72 0.18 230)',
  Zed:         'oklch(0.68 0.24 295)',
  Caitlyn:     'oklch(0.72 0.18 230)',
  Jinx2:       'oklch(0.68 0.24 295)',
  Thresh:      'oklch(0.72 0.18 155)',
  Nautilus:    'oklch(0.72 0.18 230)',
  LeeSin:      'oklch(0.78 0.18 75)',
  Vi:          'oklch(0.68 0.22 22)',
  Garen:       'oklch(0.88 0.14 90)',
  MissFortune: 'oklch(0.68 0.22 22)',
  Vayne:       'oklch(0.72 0.18 230)',
  Ezreal:      'oklch(0.78 0.18 75)',
  Lulu:        'oklch(0.68 0.24 295)',
}

function getChampTone(championId: string): string {
  return CHAMP_TONE[championId] ?? 'var(--primary)'
}

// ---------------------------------------------------------------------------
// HubBuildCard
// ---------------------------------------------------------------------------
interface HubBuildCardProps {
  build: HubBuildCardType
  bookmarked: boolean
  onToggleBookmark: (id: string) => void
  onOpen: (id: string) => void
  isLoggedIn: boolean
}

export default function HubBuildCard({
  build,
  bookmarked,
  onToggleBookmark,
  onOpen,
  isLoggedIn,
}: HubBuildCardProps) {
  const [hovered, setHovered] = useState(false)
  const tone = getChampTone(build.championId)

  const cardStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 14,
    border: `1px solid ${hovered ? `color-mix(in oklch, ${tone} 45%, var(--border))` : 'var(--border)'}`,
    background: 'var(--card)',
    overflow: 'hidden',
    cursor: 'pointer',
    transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: hovered
      ? `0 8px 32px -8px oklch(0 0 0 / 0.4), 0 0 0 1px color-mix(in oklch, ${tone} 35%, transparent), 0 0 20px -4px color-mix(in oklch, ${tone} 25%, transparent)`
      : '0 1px 2px oklch(0 0 0 / 0.25), 0 4px 16px oklch(0 0 0 / 0.18)',
    transition: 'transform 200ms var(--ease-out-expo, ease), box-shadow 200ms var(--ease-out-expo, ease), border-color 200ms',
  }

  return (
    <article
      role="article"
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(build.id)}
    >
      {/* ---------------------------------------------------------------- */}
      {/* HEADER — champion loading art (132px)                            */}
      {/* ---------------------------------------------------------------- */}
      <div style={{ position: 'relative', height: 132, flexShrink: 0, overflow: 'hidden' }}>
        <Image
          src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${build.championId}_0.jpg`}
          alt={build.championId}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: 'cover', objectPosition: 'top' }}
          loading="lazy"
        />
        {/* gradient overlay */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, oklch(0 0 0 / 0.1) 0%, oklch(0 0 0 / 0.55) 100%)',
          }}
        />

        {/* top-right: patch chip + bookmark */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <PatchChip patch={build.patchTag} />
          <BookmarkBtn
            bookmarked={bookmarked}
            onToggle={() => onToggleBookmark(build.id)}
            disabled={!isLoggedIn}
          />
        </div>

        {/* bottom-left: champ icon (54px circle) */}
        <div
          style={{
            position: 'absolute',
            bottom: -22,
            left: 14,
            width: 54,
            height: 54,
            borderRadius: 9999,
            overflow: 'hidden',
            border: `2px solid ${tone}`,
            boxShadow: `0 0 12px color-mix(in oklch, ${tone} 40%, transparent)`,
            background: 'var(--card)',
            flexShrink: 0,
          }}
        >
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${build.championId}_0.jpg`}
            alt=""
            fill
            sizes="54px"
            style={{ objectFit: 'cover', objectPosition: 'top center' }}
            aria-hidden
          />
        </div>

        {/* bottom-right: role pills */}
        <div
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
            display: 'flex',
            gap: 4,
          }}
        >
          {build.roles.map((r) => (
            <RolePill key={r} role={r} />
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* BODY                                                              */}
      {/* ---------------------------------------------------------------- */}
      <div
        style={{
          padding: '32px 14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flex: 1,
        }}
      >
        {/* title + author */}
        <div>
          <h3
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: '-0.01em',
              lineHeight: 1.25,
              color: 'var(--foreground)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {build.name}
          </h3>
          <p
            style={{
              margin: '4px 0 0',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: tone,
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            @{build.authorId.slice(0, 8)}
          </p>
        </div>

        {/* description */}
        {build.description_md && (
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--muted-foreground)',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {build.description_md}
          </p>
        )}

        {/* tags */}
        {build.buildTags.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {build.buildTags.slice(0, 3).map((t) => (
              <span
                key={t}
                style={{
                  padding: '2px 8px',
                  borderRadius: 9999,
                  background: 'oklch(0.22 0.02 280)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 10,
                  fontWeight: 500,
                  color: 'var(--muted-foreground)',
                }}
              >
                #{t}
              </span>
            ))}
            {build.buildTags.length > 3 && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 9999,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--muted-foreground)',
                  opacity: 0.5,
                }}
              >
                +{build.buildTags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* FOOTER                                                            */}
      {/* ---------------------------------------------------------------- */}
      <div
        style={{
          padding: '10px 14px 13px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        {/* bookmark count */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: bookmarked ? 'var(--primary)' : 'var(--muted-foreground)',
            fontWeight: 600,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M5 3h14a1 1 0 0 1 1 1v18l-8-4-8 4V4a1 1 0 0 1 1-1z" />
          </svg>
          {build.bookmarkCount.toLocaleString()}
        </span>

        {/* timestamp */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted-foreground)',
            opacity: 0.6,
          }}
        >
          {relTime(build.updatedAt)}
        </span>
      </div>
    </article>
  )
}
