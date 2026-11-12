'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function restoreToDraft(type: 'pulse' | 'blog', id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const table = type === 'pulse' ? 'pulse_items' : 'blog_posts'

  const { error } = await supabase
    .from(table)
    .update({
      status: 'draft',
      review_feedback: null,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/feedback')
  revalidatePath('/admin/review')
  revalidatePath('/admin/blog-review')
}
