<script lang="ts">
	import { Mail5 } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import { copyClipboard, saveAsFile, shortDID } from '$lib/utils';

	import { popup } from '@skeletonlabs/skeleton';
	import type { PopupSettings } from '@skeletonlabs/skeleton';

	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let did: string = $accountStore ? $accountStore.did : '';

	const popupFeatured: PopupSettings = {
		// Represents the type of event that opens/closed the popup
		event: 'click',
		// Matches the data-popup value on your popup element
		target: 'popupFeatured',
		// Defines which side of your trigger the popup will appear
		placement: 'bottom'
	};

	// async function copyDIDClipboard() {
	// 	await navigator.clipboard.writeText(did);
	// }

	async function exportAccount() {
		const mail5 = new Mail5($accountStore);
		const exportAcc = await mail5.exportAccount();

		saveAsFile('did_keystore.json', new Blob([exportAcc]));
	}

	async function signout() {
		accountStore.set(undefined);
		goto('/');
	}
</script>

<div class="flex justify-between py-2 px-2 h-16 border-b-[1px]">
	<div><input class="input w-72" title="Input (search)" type="search" placeholder="Search..." /></div>
	<div>
		<button class="btn variant-filled-primary" on:click={() => copyClipboard(did)} use:popup={popupFeatured}
			>{shortDID(did)}<i class="fa-solid fa-caret-down ml-2" /></button
		>
		<div class="card p-4 w-80 shadow-xl" data-popup="popupFeatured">
			<div class="w-72 break-all pb-4 flex items-center gap-2">
				<div>{shortDID(did, 54)}</div>
				<div><button class="btn btn-sm variant-ringed w-8 h-8"><i class="fa-regular fa-copy" /></button></div>
			</div>
			<button class="btn variant-ringed w-full mb-2" on:click={() => exportAccount()}>Backup</button>
			<button class="btn variant-filled-primary w-full" on:click={() => signout()}>Sign out</button>
		</div>
	</div>
</div>
