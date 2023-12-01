<script lang="ts">
	import { formatDate, shortDID } from '$lib/utils';
	import { Mail5 } from '$lib/mail5';
	import type { Mail5Email } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import MailContent from './MailContent.svelte';
	import Header from './Header.svelte';
	import { ProgressRadial, getToastStore } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';
	import Loading from './Loading.svelte';

	export let emails: Promise<Mail5Email[]>;

	let selectedEmail: Mail5Email | undefined;

	const dispatch = createEventDispatcher();

	function selectEmail(email: Mail5Email) {
		selectedEmail = email;
		dispatch('selectEmail', email);
	}
</script>

<nav class="list-nav h-[calc(100vh-4rem)] min-w-[300px] border-r-[1px] p-2">
	<ul>
		{#await emails}
			{#each Array(8) as i}
				<li class="text-center">
					<div class="card p-3 space-y-3 cursor-pointer">
						<div class="grid grid-cols-3 gap-2">
							<div class="placeholder animate-pulse col-span-2" />
							<div class="placeholder animate-pulse" />
						</div>
						<div class="placeholder animate-pulse" />
					</div>
				</li>
			{/each}
		{:then emails}
			{#if emails.length > 0}
				{#each emails as email}
					<li class="group">
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div class="card p-3 space-y-1 cursor-pointer {selectedEmail == email ? 'active' : ''}" on:click={() => selectEmail(email)}>
							<div class="grid grid-cols-3 gap-2 items-center">
								<div class="col-span-2">{shortDID(email.from)}</div>
								<div class="text-xs text-right">{formatDate(email.record?.dateCreated)}</div>
							</div>
							<div class="text-base grid grid-cols-2 w-full items-center">
								<div>{email.subject}</div>
								<div class="text-right"><i on:click={() => dispatch('deleteEmail', email)} class="fa fa-trash invisible group-hover:visible" /></div>
							</div>
						</div>

						<!-- <button class="btn variant-soft flex flex-col p-0 w-full" style="align-items: start;" on:click={() => dispatch('selectEmail', email)}>
							<div class="flex justify-between w-full items-center">
								<div>{shortDID(email.from)}</div>
								<div class="text-xs">{formatDate(email.record?.dateCreated)}</div>
							</div>
							<div class="flex justify-between w-full items-center text-lg" style="margin-left: 0;">
								<div>{email.subject}</div>
								<i on:click={() => dispatch('deleteEmail', email)} class="fa fa-trash invisible group-hover:visible" />
							</div>
						</button> -->
					</li>
				{/each}
				<li class="invisible">{dispatch('selectEmail', emails[0])}</li>
			{:else}
				<li class="text-center my-4">No emails found</li>
			{/if}
		{:catch error}
			<li>{error.message}</li>
		{/await}
	</ul>
</nav>

<style>
	.card:hover {
		color: rgb(var(--on-primary));
		background-color: rgb(var(--color-primary-500)) !important ;
	}
	.active {
		color: rgb(var(--on-primary));
		background-color: rgb(var(--color-primary-500)) !important ;
	}
</style>
