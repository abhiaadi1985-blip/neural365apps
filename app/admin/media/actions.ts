'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function approveMedia(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('pulse_items')
    .update({ status: 'live' })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/media')
  revalidatePath('/pulse')
}

export async function rejectMedia(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('pulse_items')
    .update({ status: 'draft' })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/media')
  revalidatePath('/admin/review')
}
