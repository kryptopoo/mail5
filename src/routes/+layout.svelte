<script lang="ts">
	import '../app.postcss';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { Toast } from '@skeletonlabs/skeleton';
	import process from 'process';
	import { Buffer } from 'buffer';
	import EventEmitter from 'events';
	import { browser } from '$app/environment';
	import { initializeStores } from '@skeletonlabs/skeleton';

	initializeStores();

	if (browser) {
		window.Buffer = Buffer;
		window.process = process;
		(window as any).EventEmitter = EventEmitter;
		window.global = window;
	}
</script>

<Toast position="b" buttonDismiss="" />
<slot />
