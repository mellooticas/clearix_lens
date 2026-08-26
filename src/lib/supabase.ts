// ============================================================================
// Clearix Lens — Supabase Browser Client
// Usa @supabase/ssr com PUBLIC_* (padrão SvelteKit + ecossistema Clearix by DIGIAI)
//
// Para uso server-side: event.locals.supabase (criado em hooks.server.ts)
// Para uso client-side: importar este módulo
// ============================================================================

import { createBrowserClient } from '@supabase/ssr';
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
} from '$env/static/public';
import { supabaseAppHeaders } from '$lib/supabase-app-headers';

// Singleton browser client
export const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
  global: { headers: supabaseAppHeaders }
});

// Helper: sessão atual (client-side)
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('[supabase] Erro ao buscar sessão:', error);
    return null;
  }
  return data.session;
}

// Helper: tenant_id do JWT (sem chamada de API)
export function getTenantId(session: { access_token?: string } | null): string | null {
  if (!session?.access_token) return null;
  try {
    const payload = JSON.parse(atob(session.access_token.split('.')[1]));
    return payload.tenant_id ?? null;
  } catch {
    return null;
  }
}

// Helper: role_code do JWT (super_admin | admin | manager | staff)
export function getRoleCode(session: { access_token?: string } | null): string {
  if (!session?.access_token) return 'staff';
  try {
    const payload = JSON.parse(atob(session.access_token.split('.')[1]));
    return payload.role_code ?? 'staff';
  } catch {
    return 'staff';
  }
}
