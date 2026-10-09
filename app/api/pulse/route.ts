import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const pillar = searchParams.get('pillar') ?? undefined
  const lane   = searchParams.get('lane')   ?? undefined
  const source = searchParams.get('source') ?? undefined
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)


  let query = supabase
    .from('pulse_items')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (pillar) query = query.eq('pillar', pillar)
  if (lane)   query = query.eq('lane',   lane)
  if (source) query = query.eq('source_name', source)

  const { data, error, count } = await query

  if (error) {
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
