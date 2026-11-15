import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { getPulseCutoffDate } from '@/lib/pulse-lifecycle'

export const runtime = 'nodejs'

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const pillar = searchParams.get('pillar') ?? undefined
  const lane   = searchParams.get('lane')   ?? undefined
  const source = searchParams.get('source') ?? undefined
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const isArchive = searchParams.get('archive') === 'true' || searchParams.get('window') === 'archive'

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const cutoff = getPulseCutoffDate()

  let query = supabase
    .from('pulse_items')
    .select('*', { count: 'exact' })
    .eq('status', 'live')

  if (isArchive) {
    query = query.lt('published_at', cutoff)
  } else {
    query = query.gte('published_at', cutoff)
  }

  query = query
    .order('published_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (pillar) query = query.eq('pillar', pillar)
  if (lane)   query = query.eq('lane',   lane)
  if (source) query = query.eq('source_name', source)

  const { data, error, count } = await query

  if (error) {
    if (error.code === 'PGRST103' || error.message?.includes('Requested range not satisfiable')) {
      return NextResponse.json({
        items:      [],
        total:      count ?? 0,
        page,
        pageSize:   PAGE_SIZE,
        totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
      })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    items:      data ?? [],
    total:      count ?? 0,
    page,
    pageSize:   PAGE_SIZE,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  })
}
