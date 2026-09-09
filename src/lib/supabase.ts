import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lvkbpjtghxsyuicycrwx.supabase.co';
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_uglGEUXQONkruddfSJCG1A_KluPiuom';

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabasePublishableKey) {
  throw new Error('Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

export const isRealSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || supabaseUrl;
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    supabasePublishableKey;
  return Boolean(
    url &&
    key &&
    !url.includes('demo-student-portal') &&
    url.includes('supabase.co')
  );
};
