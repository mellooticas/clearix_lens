import adapterNetlify from '@sveltejs/adapter-netlify';
import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Dois destinos ao mesmo tempo (migracao 22/09/2026): o Netlify continua no ar como rede de
// seguranca e o Cloudflare roda em paralelo. Quem define o destino e DEPLOY_TARGET, so no painel
// do Cloudflare; sem ela, o build sai igual ao de sempre (Netlify).
const adapter = process.env.DEPLOY_TARGET === 'cloudflare' ? adapterCloudflare : adapterNetlify;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter()
	}
};

export default config;
