'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function markModuleComplete(moduleSlug: string): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: module } = await supabase
    .from('modules')
    .select('id')
    .eq('slug', moduleSlug)
    .single()

  if (!module) return

  await supabase.from('progress').upsert(
    {
      user_id: user.id,
      module_id: module.id,
      status: 'complete',
      checkpoint_passed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,module_id' }
  )

  revalidatePath('/dashboard')
}
