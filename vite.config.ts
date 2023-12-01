import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	// define: {
	// 	// global: 'globalThis',
	// 	'process.env': import.meta.env,
	// 	'process.nextTick': function() {
	// 		return null;
	// 	  }
	// },
	// resolve: {
	// 	alias: {
	// 		crypto: 'crypto-browserify',
	// 		stream: 'stream-browserify'
	// 	}
	// },
	plugins: [sveltekit(), purgeCss()]
});
