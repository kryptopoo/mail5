<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	import { Mail5, type Mail5Email } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import MailEditor from '$lib/components/MailEditor.svelte';
	import Header from '$lib/components/Header.svelte';

	const mail5 = new Mail5($accountStore);
	let email: Mail5Email = { subject: '', content: '', from: '', to: '', attachments: [], status: '' };
	onMount(async () => {
		const emailById = await mail5.getById($page.params.id);
		if (emailById) email = emailById;
	});
</script>

<Header />

<div in:fade={{ duration: 400 }}>
	<MailEditor {email} />
</div>
