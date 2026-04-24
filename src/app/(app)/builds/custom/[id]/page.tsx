import { Suspense } from 'react'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBuildById } from '@/lib/builds/server'
import { getItemsCatalogue } from '@/lib/builds/items-catalogue'
import { getRuneTree } from '@/lib/builds/rune-tree'
import { getSummonerSpells } from '@/lib/builds/summoner-spells'
import { BuildEditor } from './_components/BuildEditor'

export const metadata = {
  title: 'Build Editor · FioraPool',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BuildEditorPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?next=/builds/custom/${id}`)

  const full = await getBuildById(id, user.id)
  if (!full) notFound()

  const patch = full.build.patch_tag

  const [catalogue, runeTree, summonerSpells] = await Promise.all([
    getItemsCatalogue(patch),
    getRuneTree(patch),
    getSummonerSpells(patch),
  ])

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-muted-foreground text-sm">Loading editor…</div>}>
      <BuildEditor
        full={full}
        catalogue={catalogue}
        runeTree={runeTree}
        summonerSpells={summonerSpells}
      />
    </Suspense>
  )
}
