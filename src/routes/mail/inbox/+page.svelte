<script lang="ts">
	import { Mail5, type Mail5Email } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import { onMount } from 'svelte';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import MailNav from '$lib/components/MailNav.svelte';
	import MailContent from '$lib/components/MailContent.svelte';
	import Header from '$lib/components/Header.svelte';
	import { fade } from 'svelte/transition';

	const toastStore = getToastStore();
	const mail5 = new Mail5($accountStore);

	let emails: Promise<Mail5Email[]> = mail5.inbox();
	let selectedEmail: Mail5Email;

	onMount(async () => {
		// setInterval(() => {
		// 	emails = mail5.inbox();
		// }, 1000 * 30);
	});

	async function deleteEmail(event: any) {
		const email: Mail5Email = event.detail;
		const rs = await mail5.softDelete(email?.record?.id);

		if (rs?.status.code == 202) {
			// success
			toastStore.trigger({
				message: 'Deleted successfully!',
				background: 'variant-filled-success'
			});

			emails = mail5.inbox();
		} else {
			toastStore.trigger({
				message: rs?.status.detail || 'unknown error',
				background: 'variant-filled-error'
			});
		}
	}

	async function selectEmail(event: any) {
		const email: Mail5Email = event.detail;
		selectedEmail = email;
	}
</script>

<div class="flex flex-col">
	<Header />

	<div class="grid grid-cols-[auto_1fr]" in:fade={{ duration: 400 }}>
		<div class="overflow-y-auto">
			<MailNav {emails} on:deleteEmail={deleteEmail} on:selectEmail={selectEmail} />
		</div>
		<div class="">
			<MailContent title="Inbox" editable={false} replyable={true} email={selectedEmail} on:deleteEmail={deleteEmail} />
		</div>
	</div>
</div>
