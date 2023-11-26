<script lang="ts">
	import { Web5 } from '@web5/api';
	import { onMount } from 'svelte';
	import { Mail5 } from '$lib/mail5';

	import '../app.postcss';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { AppShell, AppBar, AppRailAnchor, AppRail, Toast } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';

	import process from 'process';
	import { Buffer } from 'buffer';
	import EventEmitter from 'events';
	import { browser } from '$app/environment';
	import { accountStore } from '$lib/store';
	import { initializeStores } from '@skeletonlabs/skeleton';

	initializeStores();

	if (browser) {
		window.Buffer = Buffer;
		window.process = process;
		(window as any).EventEmitter = EventEmitter;
		window.global = window;
	}

	onMount(async () => {});
</script>

<Toast position="b" buttonDismiss="" />
<slot />
