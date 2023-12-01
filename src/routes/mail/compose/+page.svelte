<script lang="ts">
	import type { Mail5Email } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import MailEditor from '$lib/components/MailEditor.svelte';
	import Header from '$lib/components/Header.svelte';
	import { fade } from 'svelte/transition';

	let email: Mail5Email = {
		from: $accountStore ? $accountStore.did : '',
		to: '',
		subject: '',
		content: '',
		attachments: [],
		status: ''
	};
</script>

<Header />

<div in:fade={{ duration: 400 }}>
	<MailEditor {email} />
</div>
