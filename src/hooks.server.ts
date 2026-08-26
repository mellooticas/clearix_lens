// ============================================================================
// Clearix Lens — hooks.server.ts
// Auth via @supabase/ssr + redirect para Clearix Hub SSO
//
// SvelteKit env convention:
//   PUBLIC_*  → $env/static/public  (cliente + servidor)
//   VITE_*    → import.meta.env.*   (build-time, legado)
// ============================================================================

import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SIS_GATEWAY_URL
} from '$env/static/public';
import { supabaseAppHeaders } from '$lib/supabase-app-headers';

// ============================================================================
// Handle 1: Inicializar cliente Supabase com cookies HttpOnly
// ============================================================================
const supabaseHandle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: supabaseAppHeaders },
    cookies: {
      getAll() {
        return event.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' });
        });
      }
    }
  });

  /**
   * safeGetSession: valida o token com getUser() (server-side)
   * Não confia apenas em getSession() — pode ser falsificado no cliente.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { session }
    } = await event.locals.supabase.auth.getSession();

    if (!session) {
      return { session: null, user: null };
    }

    const {
      data: { user },
      error
    } = await event.locals.supabase.auth.getUser();

    if (error) {
      // JWT inválido ou expirado
      return { session: null, user: null };
    }

    return { session, user };
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
};

// ============================================================================
// Handle 2: Auth Guard — redireciona para Clearix Hub se não autenticado
//
// ENFORCE_AUTH = false  →  modo soft (dev / staging sem Gateway)
// ENFORCE_AUTH = true   →  produção — requer Gateway a tratar ?returnTo=
//
// ✅  Gateway atualizado — returnTo implementado em middleware + login-form + callback
// ============================================================================
const ENFORCE_AUTH = true;

/**
 * Portao de acesso ao app. A decisao mora no banco, nao aqui.
 *
 * rpc_iam_can_use_app_feature encadeia camada comercial (pacote do tenant, que
 * o digiai libera) -> usuario ativo -> papel (o Hub grava em
 * iam.roles_permissions -> apps.clearix_lens.access). Sem p_feature, a rotina
 * responde so "este papel tem o app?".
 *
 * Ate aqui o authGuard conferia apenas sessao: qualquer pessoa logada no
 * ecossistema entrava por URL direta, mesmo com o app desligado para o papel
 * dela no Hub. O interruptor do Hub filtrava so o lancador.
 *
 * Roda dentro de ENFORCE_AUTH pelo mesmo motivo da guarda de sessao: em modo
 * soft (dev/staging sem Gateway) nao ha sessao para avaliar.
 *
 * Falha de leitura NAO libera: portao que abre no erro nao e portao (R-037).
 */
async function podeUsarApp(
  supabase: ReturnType<typeof createServerClient>
): Promise<boolean> {
  try {
    const { data } = await supabase.rpc('rpc_iam_can_use_app_feature', {
      p_app_key: 'clearix_lens'
    });
    return data === true;
  } catch {
    return false;
  }
}

// Rotas que NÃO precisam de autenticação
// Nota: /login foi removido do app — auth é 100% via Clearix Hub
const PUBLIC_PATHS = ['/auth', '/api/'];

const authGuard: Handle = async ({ event, resolve }) => {
  // ── Gateway SSO: interceptar tokens/tickets em qualquer URL ─────────────
  // V2: ticket opaco que é trocado server-to-server
  // V1 (legacy): access_token + refresh_token nos query params
  const ticket = event.url.searchParams.get('ticket');
  const accessToken = event.url.searchParams.get('access_token');
  const refreshToken = event.url.searchParams.get('refresh_token');

  if (!event.url.pathname.startsWith('/auth')) {
    if (ticket) {
      const next = event.url.searchParams.get('next') ?? '/';
      const params = new URLSearchParams({ ticket, next });
      const appKey = event.url.searchParams.get('app_key');
      if (appKey) params.set('app_key', appKey);
      throw redirect(303, `/auth/callback?${params.toString()}`);
    }
    if (accessToken && refreshToken) {
      const next = event.url.searchParams.get('next') ?? '/';
      throw redirect(303, `/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}&next=${encodeURIComponent(next)}`);
    }
  }

  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  if (ENFORCE_AUTH) {
    const isPublicPath = PUBLIC_PATHS.some((p) => event.url.pathname.startsWith(p));

    if (!session && !isPublicPath) {
      const appNext = `${event.url.pathname}${event.url.search}`;
      const returnTo = encodeURIComponent(`${event.url.origin}/auth/callback`);
      throw redirect(303, `${PUBLIC_SIS_GATEWAY_URL}/login?app=clearix_lens&app_key=clearix_lens&next=${encodeURIComponent(appNext)}&returnTo=${returnTo}`);
    }

    // Devolve ao Hub em vez de mostrar tela vazia. Nao e bloqueio definitivo:
    // quem tiver acesso legitimo volta pelo SSO com a permissao corrigida.
    if (session && !isPublicPath && !(await podeUsarApp(event.locals.supabase))) {
      throw redirect(303, PUBLIC_SIS_GATEWAY_URL || '/auth/callback');
    }
  }

  return resolve(event);
};

export const handle = sequence(supabaseHandle, authGuard);
