import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createSupabaseClient(
    'https://eozleqwzhgcziwjteaht.supabase.co',
    'sb_publishable_3e9DvUS0Xz3j1yWSq0RhAw_71CmI4Go' // paste same anon key here
  )
}