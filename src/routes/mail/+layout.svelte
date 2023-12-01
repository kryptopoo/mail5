<script lang="ts">
	import { Web5 } from '@web5/api';
	import { onMount } from 'svelte';
	import { Mail5 } from '$lib/mail5';
	import { fade } from 'svelte/transition';

	import '../../app.postcss';
	import { AppShell, AppBar, AppRailAnchor, AppRail } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	import process from 'process';
	import { Buffer } from 'buffer';
	import EventEmitter from 'events';
	import { browser } from '$app/environment';
	import { accountStore } from '$lib/store';
	import { saveAsFile } from '$lib/utils';
	import Logo from '$lib/components/Logo.svelte';

	// if (browser) {
	// 	window.Buffer = Buffer;
	// 	window.process = process;
	// 	(window as any).EventEmitter = EventEmitter;
	// 	window.global = window;
	// }

	// let myID: string;
	// let importAccountContent: string;

	// const createAccount = async () => {
	// 	const mail5 = new Mail5();
	// 	const newAccount = await mail5.createAccount();
	// 	mail5.account = newAccount;
	// 	accountStore.set(newAccount);

	// 	myID = mail5.account.did;
	// };

	// function saveAsFile(filename: string, data: any) {
	// 	const blob = new Blob([data]);
	// 	const link = document.createElement('a');
	// 	link.download = filename;
	// 	link.href = window.URL.createObjectURL(blob);
	// 	link.click();
	// }

	// const importAccount = async () => {
	// 	// window.open(
	// 	// 	URL.createObjectURL(new Blob([JSON.stringify({ id: 1 })], { type: 'application/binary' }))
	// 	// );
	// 	const mail5 = new Mail5();
	// 	const acc = await mail5.importAccount(importAccountContent);
	// 	console.log('import acc', acc);
	// };

	onMount(() => {
		if (!$accountStore) goto('/');
	});
</script>

<AppShell>
	<!-- <svelte:fragment slot="header"
		>
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase" />
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<textarea bind:value={importAccountContent} />
				<input value={myID} />
				<button on:click={createAccount}>create account</button>
				<button on:click={importAccount}>import account</button>
			</svelte:fragment>
		</AppBar></svelte:fragment
	> -->

	<svelte:fragment slot="sidebarLeft">
		<div class="w-56 h-full text-lg">
			<AppRail width="w-full" gap="gap-0" regionDefault="m-4" active="bg-primary-active-token rounded-md" hover="bg-primary-hover-token rounded-md">
				<svelte:fragment slot="lead">
					<div class="p-4">
						<Logo />
					</div>
				</svelte:fragment>

				<div class="mb-4">
					<a href="/mail/compose" class="btn variant-filled-primary w-full text-lg rounded-md">New email</a>
				</div>

				<div class="my-2">
					<AppRailAnchor
						regionLabel="!text-base text-left ml-4"
						aspectRatio="aspect-[5/1]"
						href="/mail/inbox"
						selected={$page.url.pathname === '/mail/inbox'}><i class="fa-solid fa-inbox mr-3" />Inbox</AppRailAnchor
					>
				</div>

				<div class="my-2">
					<AppRailAnchor
						regionLabel="!text-base text-left ml-4"
						aspectRatio="aspect-[5/1]"
						href="/mail/drafts"
						selected={$page.url.pathname === '/mail/drafts'}><i class="fa-regular fa-file-lines mr-4" />Drafts</AppRailAnchor
					>
				</div>

				<div class="my-2">
					<AppRailAnchor
						regionLabel="!text-base text-left ml-4"
						aspectRatio="aspect-[5/1]"
						href="/mail/outbox"
						selected={$page.url.pathname === '/mail/outbox'}><i class="fa-regular fa-paper-plane mr-3" />Sent</AppRailAnchor
					>
				</div>

				<div class="my-2">
					<AppRailAnchor
						regionLabel="!text-base text-left ml-4"
						aspectRatio="aspect-[5/1]"
						href="/mail/trash"
						selected={$page.url.pathname === '/mail/trash'}><i class="fa-regular fa-trash-can mr-3" />Trash</AppRailAnchor
					>
				</div>

				<div class="my-2">
					<AppRailAnchor
						regionLabel="!text-base text-left ml-4"
						aspectRatio="aspect-[5/1]"
						href="/mail/contact"
						selected={$page.url.pathname === '/mail/contact'}><i class="fa-regular fa-address-book mr-3" />Contact</AppRailAnchor
					>
				</div>
			</AppRail>
		</div>
	</svelte:fragment>

	<!-- (sidebarRight) -->
	<!-- (pageHeader) -->
	<!-- Router Slot -->
	<slot />
	<!-- ---- / ---- -->

	<!-- (pageFooter) -->
	<!-- <svelte:fragment slot="footer">Footer</svelte:fragment> -->
</AppShell>

<style>
</style>
