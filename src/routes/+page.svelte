<script lang="ts">
	import { onMount } from 'svelte';
	import { Web5 } from '@web5/api';
	import { Mail5 } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import { FileButton, ProgressBar } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';

	const mail5 = new Mail5();
	let files: FileList;
	let loading = false;

	async function connectDID() {
		loading = true;

		const newAccount = await mail5.createAccount();
		mail5.account = newAccount;
		accountStore.set(newAccount);

		const { protocol, status } = await mail5.defineProtocol();
		console.log('protocol', protocol, status);

		loading = false;
		if (status.code === 202 || status.code === 200) {
			goto('/mail/inbox');
		}
	}

	onMount(async () => {});

	function onFileChanged(e: Event): void {
		loading = true;

		console.log('file data:', e);
		console.log('file files:', files);

		const reader = new FileReader();
		reader.addEventListener('load', async function (e: any) {
			const filecontent = e.target.result;
			console.log('filecontent', filecontent);

			// TODO: import DID
			const mail5 = new Mail5();
			const acc = await mail5.importAccount(filecontent);
			console.log('import acc', acc);

			loading = false;
		});

		reader.readAsBinaryString(files[0]);
	}
</script>

<div class="flex flex-col h-full pt-48 items-center">
	<div class="card p-0 w-1/3">
		<header class="card-header px-8 pt-8 pb-6">
			<Logo />
		</header>
		<section class="px-8 pb-12 flex flex-col gap-3">
			<div>
				<button class="btn variant-filled-primary w-full" on:click={connectDID}>Connect local</button>
			</div>
			<div>
				<FileButton name="files" bind:files button="btn variant-filled-primary w-full" on:change={onFileChanged}>Import DID by keystore</FileButton>
			</div>
		</section>
		{#if loading}
			<ProgressBar value={undefined} meter="variant-filled-surface" />
		{/if}
	</div>
</div>
