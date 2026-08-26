// ============================================================================
// Clearix Lens — Header de identificação do app nos clients Supabase
//
// Padrão do ecossistema Clearix by DIGIAI: TODA chamada ao Supabase carrega
// `x-clearix-app` para que o banco (logs, telemetria, auditoria) saiba de qual
// app veio a requisição. Referências: clearix_marketing lib/supabase/app-header.ts
// e clearix_estoque lib/supabase-app-headers.ts.
//
// REGRA: constante única, usada em TODOS os pontos de criação de client —
// browser, server (hooks), layout universal e callback de SSO. Nunca escrever
// o literal 'clearix_lens' solto em outro arquivo; importar daqui.
// ============================================================================

/** Identificador deste app nas requisições ao Supabase. */
export const CLEARIX_APP = 'clearix_lens' as const;

/** Nome do header acordado no ecossistema. */
export const CLEARIX_APP_HEADER = 'x-clearix-app' as const;

/** Headers a injetar em `global.headers` de qualquer client Supabase. */
export const supabaseAppHeaders: Record<string, string> = {
  [CLEARIX_APP_HEADER]: CLEARIX_APP
};

/**
 * Mescla os headers do app com um `global` já existente, preservando o que
 * o chamador passou (ex.: `fetch` do SvelteKit no layout universal).
 */
export function withAppHeaders<T extends { headers?: Record<string, string> }>(
  global?: T
): T & { headers: Record<string, string> } {
  return {
    ...(global ?? ({} as T)),
    headers: { ...supabaseAppHeaders, ...(global?.headers ?? {}) }
  };
}
