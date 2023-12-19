<script lang="ts">
	import { onMount } from 'svelte';
	import '../../app.postcss';
	import { AppShell, AppBar, AppRailAnchor, AppRail } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	import { accountStore } from '$lib/store';
	import Logo from '$lib/components/Logo.svelte';

	onMount(() => {
		if (!$accountStore) goto('/');
	});
</script>

<AppShell>
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
