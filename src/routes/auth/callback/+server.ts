/**
 * Clearix Lens — /auth/callback
 * Token Relay Receiver — Padrao SSO do Ecossistema Clearix by DIGIAI
 *
 * V1 (legacy): Gateway envia access_token + refresh_token via query params.
 * V2 (ticket): Gateway envia ticket opaco trocado server-to-server.
 *
 * Este handler cria a sessao local com cookies HttpOnly e navega
 * para a rota original via HTML 200 (nao 303 redirect).
 *
 * Netlify CDN pode remover Set-Cookie de respostas 3xx (redirect).
 * Usar HTML 200 com meta refresh garante que os cookies de sessao
 * sejam preservados.
 */

import { createServerClient } from '@supabase/ssr';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { PUBLIC_SIS_GATEWAY_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import { SSO_APP_KEY, SSO_TICKET_PARAM, normalizeSsoNext, SSO_DEFAULT_NEXT } from '$lib/auth/sso';
import { supabaseAppHeaders } from '$lib/supabase-app-headers';

async function exchangeSsoTicket(ticket: string): Promise<{
  accessToken: string;
  refreshToken: string;
  next: string;
} | null> {
  const gatewayUrl = PUBLIC_SIS_GATEWAY_URL;
  if (!gatewayUrl) {
    return null;
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  });

  const sharedSecret = env.SSO_EXCHANGE_SHARED_SECRET;
  if (sharedSecret) {
    headers.set('x-sso-exchange-secret', sharedSecret);
  }

  const response = await fetch(new URL('/api/sso/exchange', gatewayUrl), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ticket,
      app_key: SSO_APP_KEY,
    }),
  });

  if (!response.ok) {
    console.error(`[SSO] Ticket exchange failed: ${response.status} ${response.statusText}`);
    return null;
  }

  const payload = await response.json().catch(() => null);
  const accessToken = payload?.session?.access_token;
  const refreshToken = payload?.session?.refresh_token;

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    next: normalizeSsoNext(payload?.next, SSO_DEFAULT_NEXT),
  };
}

export const GET: RequestHandler = async ({ url, cookies }) => {
  const ticket = url.searchParams.get(SSO_TICKET_PARAM);
  const legacyAccessToken = url.searchParams.get('access_token');
  const legacyRefreshToken = url.searchParams.get('refresh_token');
  let access_token = legacyAccessToken;
  let refresh_token = legacyRefreshToken;
  let next = normalizeSsoNext(url.searchParams.get('next'), SSO_DEFAULT_NEXT);

  // V2: Ticket-based exchange
  if (ticket) {
    const exchanged = await exchangeSsoTicket(ticket);

    if (!exchanged) {
      // NAO redirecionar para / (authGuard mandaria de volta ao Gateway → loop infinito)
      const gatewayUrl = PUBLIC_SIS_GATEWAY_URL || 'https://clearixhub.netlify.app';
      const retryUrl = `${gatewayUrl}/login?app=clearix_lens&app_key=clearix_lens&next=${encodeURIComponent(next)}`;
      return new Response(
        `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Erro SSO</title></head>
<body style="display:grid;place-items:center;min-height:100vh;margin:0;font-family:system-ui;background:#fef2f2">
  <div style="text-align:center;padding:32px;border-radius:16px;background:white;box-shadow:0 4px 24px rgba(0,0,0,.08)">
    <p style="font-size:18px;font-weight:600;color:#dc2626">Falha na autenticacao</p>
    <p style="color:#6b7280;margin:12px 0">O ticket SSO nao pode ser validado.</p>
    <a href="${retryUrl}" style="display:inline-block;margin-top:8px;padding:10px 24px;background:#2563eb;color:white;border-radius:8px;text-decoration:none">Tentar novamente</a>
  </div>
</body></html>`,
        { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } }
      );
    }

    access_token = exchanged.accessToken;
    refresh_token = exchanged.refreshToken;
    next = exchanged.next;
  }

  if (access_token && refresh_token) {
    const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
      global: { headers: supabaseAppHeaders },
      cookies: {
        getAll()  { return cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookies.set(name, value, { ...options, path: '/' })
          );
        }
      }
    });

    const { error } = await supabase.auth.setSession({ access_token, refresh_token });

    if (!error) {
      return new Response(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${next}">
  <title>Autenticando...</title>
</head>
<body>
  <p>Autenticando...</p>
  <script>window.location.href = ${JSON.stringify(next)};</script>
</body>
</html>`,
        {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }
      );
    }

    console.error('[auth/callback] Erro ao estabelecer sessao:', error.message);
  }

  // Tokens invalidos ou ausentes — redirecionar direto para Gateway (nao para / que causaria loop)
  const gatewayUrl = PUBLIC_SIS_GATEWAY_URL || 'https://clearixhub.netlify.app';
  throw redirect(303, `${gatewayUrl}/login?app=clearix_lens&app_key=clearix_lens&next=${encodeURIComponent(next)}`);
};
