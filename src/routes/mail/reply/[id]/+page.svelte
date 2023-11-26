<script lang="ts">
	import { page } from '$app/stores';
	import { Mail5, type Mail5Email } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import MailEditor from '$lib/components/MailEditor.svelte';
	import Header from '$lib/components/Header.svelte';
	import { onMount } from 'svelte';

	// {$page.params.id}
	const mail5 = new Mail5($accountStore);
	let email: Mail5Email = { subject: '', content: '', from: '', to: '', attachments: [], status: '' };
	let replyEmail: Mail5Email = { subject: '', content: '', from: '', to: '', attachments: [], status: '' };
	onMount(async () => {
		const emailById = await mail5.getById($page.params.id);
		console.log('emailById', emailById);
		if (emailById) {
			replyEmail = emailById;

			email.from = replyEmail.to;
			email.to = replyEmail.from;
			email.subject = `Re: ${replyEmail.subject}`;
		}
	});
</script>

<Header />
<MailEditor {email} {replyEmail} />
