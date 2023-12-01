<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { FileButton, ProgressBar, type ModalSettings, Modal } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';

	import { Mail5 } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import Logo from '$lib/components/Logo.svelte';
	import { saveAsFile } from '$lib/utils';

	const mail5 = new Mail5();
	let files: FileList;
	let loading = false;
	let loadingText = '';

	const modalStore = getModalStore();
	const modal: ModalSettings = {
		type: 'confirm',
		title: 'Backup Keystore',
		body: "You're being first launch to connect to Local Agent. <br />Do you want to backup DID keystore?",
		buttonTextCancel: 'No',
		buttonTextConfirm: 'Yes',

		response: async (r: boolean) => {
			await connectWithDID(r);
		}
	};

	async function connectLocalAgent() {
		const firstLaunch = await mail5.firstLaunch();
		if (firstLaunch) {
			modalStore.trigger(modal);
		} else {
			await connectWithDID(false);
		}
	}

	async function connectWithDID(backup: boolean) {
		loading = true;
		loadingText = 'connecting DID...';

		// backup keystore
		if (backup) {
			const keySet = await mail5.generateKeySet();
			await mail5.connectAccountWithDid(keySet, undefined);
			accountStore.set(mail5.account);

			const keystore = mail5.exportAccount(keySet, mail5.account.did);
			saveAsFile('did_keystore.json', new Blob([keystore]));
		} else {
			await mail5.connectAccount();
			accountStore.set(mail5.account);
		}

		loadingText = 'configuring protocol...';
		const { protocol, status } = await mail5.configureProtocol();
		console.log('protocol', protocol, status);

		// navigate to inbox as default
		loading = false;
		loadingText = '';
		if (status.code === 202 || status.code === 200) {
			goto('/mail/inbox');
		}
	}

	function onFileChanged(e: Event): void {
		loading = true;
		loadingText = 'importing keystore...';

		const reader = new FileReader();
		reader.addEventListener('load', async function (e: any) {
			const filecontent = e.target.result;

			// import DID
			const mail5 = new Mail5();
			const acc = await mail5.importAccount(filecontent);
			mail5.account = acc;
			accountStore.set(acc);

			loadingText = 'configuring protocol...';
			const { protocol, status } = await mail5.configureProtocol();
			console.log('protocol', protocol, status);

			loading = false;
			if (status.code === 202 || status.code === 200) {
				goto('/mail/inbox');
			}
		});

		reader.readAsBinaryString(files[0]);
	}
</script>

<div class="flex flex-col h-full pt-48 items-center">
	<div class="card p-0 w-1/3">
		<header class="card-header px-8 pt-8 pb-6">
			<Logo size="large" />
		</header>
		<section class="px-8 pb-12 flex flex-col gap-3">
			<div>
				<button class="btn btn-lg variant-filled-primary w-full" on:click={connectLocalAgent}>Connect to Local Agent</button>
			</div>
			<div>
				<FileButton name="files" bind:files button="btn btn-lg variant-filled-primary w-full" on:change={onFileChanged}
					>Import DID Keystore</FileButton
				>
			</div>
		</section>
		{#if loading}
			<div class="p-1 text-sm">{loadingText}</div>
			<ProgressBar value={undefined} meter="variant-filled-surface" />
		{/if}
	</div>
</div>
<Modal width="w-modal-slim" />
