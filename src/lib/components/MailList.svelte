<!-- <script lang="ts">
	import { formatDate, shortDID } from '$lib/utils';
	import { Mail5 } from '$lib/mail5';
	import type { Mail5Email } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import MailContent from './MailContent.svelte';
	import Header from './Header.svelte';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';

	const toastStore = getToastStore();

	const mail5 = new Mail5($accountStore);

	export let emails: Promise<Mail5Email[]>;

	let selectedEmail: Mail5Email | undefined;

	async function deleteEmail(email: Mail5Email) {
		// const rs = await mail5.delete(email?.record?.id);

		// if (rs?.status.code == 202) {
		// 	// success
		// 	toastStore.trigger({
		// 		message: 'Your message has been saved successfully!',
		// 		background: 'variant-filled-success'
		// 	});
		// } else {
		// 	toastStore.trigger({
		// 		message: rs?.status.detail || 'unknown error',
		// 		background: 'variant-filled-error'
		// 	});
		// }

		selectedEmail = undefined;

		dispatch('deleteEmail', email);
	}

	const dispatch = createEventDispatcher();
</script>

<div class="flex flex-col w-full h-full">
	<Header />

	<div class="w-full h-full grid grid-cols-[auto_1fr] border-t-2">
		{#await emails}
			<p>loading...</p>
		{:then emails}
			{#if emails.length > 0}
				<div class="">
					<nav class="list-nav h-full min-w-[300px] border-r-2 border-l-2 p-2">
						<ul>
							{#each emails as email}
								<li class="group">
									<button class="btn variant-ghost flex flex-col p-0 w-full" style="align-items: start;" on:click={() => (selectedEmail = email)}>
										<div class="flex justify-between w-full items-center">
											<div>{shortDID(email.from)}</div>
											<div class="text-xs">{formatDate(email.record?.dateCreated)}</div>
										</div>
										<div class="flex justify-between w-full items-center text-lg" style="margin-left: 0;">
											<div>{email.subject}</div>
											<i on:click={() => deleteEmail(email)} class="fa fa-trash invisible group-hover:visible" />
										</div>
									</button>
								</li>
							{/each}
						</ul>
					</nav>
				</div>
				<div class="p-4">
					<MailContent email={selectedEmail} on:deleteEmail={} />
				</div>
			{:else}
				<div>Empty</div>
			{/if}
		{:catch error}
			<p>{error.message}</p>
		{/await}
	</div>
</div> -->
