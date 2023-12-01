<script lang="ts">
	import { Mail5, type Mail5Email } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import MailNav from '$lib/components/MailNav.svelte';
	import MailContent from '$lib/components/MailContent.svelte';
	import Header from '$lib/components/Header.svelte';

	import { getToastStore } from '@skeletonlabs/skeleton';
	import { fade } from 'svelte/transition';

	const toastStore = getToastStore();
	const mail5 = new Mail5($accountStore);

	let emails: Promise<Mail5Email[]> = mail5.outbox();
	let selectedEmail: Mail5Email;

	async function deleteEmail(event: any) {
		const email: Mail5Email = event.detail;
		const rs = await mail5.softDelete(email?.record?.id);

		if (rs?.status.code == 202) {
			// success
			toastStore.trigger({
				message: 'Deleted successfully!',
				background: 'variant-filled-success'
			});

			emails = mail5.outbox();
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
			<MailContent title="Sent" editable={false} replyable={false} email={selectedEmail} on:deleteEmail={deleteEmail} />
		</div>
	</div>
</div>
