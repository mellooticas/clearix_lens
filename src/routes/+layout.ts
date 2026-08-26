/**
 * Clearix Lens — Layout Universal (client + server)
 * Padrão Supabase SSR para SvelteKit — Ecossistema Clearix by DIGIAI
 *
 * Cria o browser client (singleton) e inicializa a sessão a partir dos
 * cookies definidos pelo server. Sem este arquivo, o browser client
 * (importado via $lib/supabase.ts) não tem sessão → queries vão como anon
 * → 401 + "permission denied for function current_tenant_id".
 *
 * O createBrowserClient é singleton: mesma URL/key retorna a mesma instância.
 * Inicializar aqui = inicializar o mesmo client que $lib/supabase.ts exporta.
 */

import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { supabaseAppHeaders } from '$lib/supabase-app-headers';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
  /**
   * depends('supabase:auth') permite que qualquer parte do app chame
   * invalidate('supabase:auth') para forçar re-execução deste load.
   */
  depends('supabase:auth');

  const supabase = isBrowser()
    ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch, headers: supabaseAppHeaders },
      })
    : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch, headers: supabaseAppHeaders },
        cookies: {
          getAll() {
            return data.cookies;
          },
        },
      });

  /**
   * getSession() inicializa o client com os tokens dos cookies.
   * No browser, isso faz o singleton ficar autenticado → queries
   * subsequentes vão com Authorization: Bearer <access_token>.
   */
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    session,
    supabase,
    user: data.user,
  };
};
