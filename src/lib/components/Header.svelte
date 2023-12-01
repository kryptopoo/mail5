<script lang="ts">
	import { popup } from '@skeletonlabs/skeleton';
	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';

	import { Mail5 } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import { copyClipboard, shortDID } from '$lib/utils';
	import { onMount } from 'svelte';

	const mail5 = new Mail5($accountStore);

	let did: string = $accountStore ? $accountStore.did : '';
	let protocolStatus: string = 'inactive';

	const popupFeatured: PopupSettings = {
		event: 'click',
		target: 'popupFeatured',
		placement: 'bottom'
	};

	async function signout() {
		accountStore.set(undefined);
		goto('/');
	}

	onMount(async () => {
		protocolStatus = await mail5.getProtocolStatus();
	});
</script>

<div class="flex justify-between py-2 px-2 h-16 border-b-[1px]">
	<div><input class="input w-72" title="Input (search)" type="search" placeholder="Search..." /></div>
	<div>
		<button class="btn variant-filled-primary" on:click={() => copyClipboard(did)} use:popup={popupFeatured}
			>{shortDID(did)}<i class="fa-solid fa-caret-down ml-2" /></button
		>
		<div class="card p-4 w-80 shadow-xl z-10" data-popup="popupFeatured">
			<div class="font-bold">Protocol:</div>
			<div class="w-72 break-all pb-4 flex items-center gap-2 justify-between">
				<div>{mail5.protocolSchema}</div>
				<div>
					<button
						class="btn btn-sm {protocolStatus == 'inactive'
							? 'variant-soft-error'
							: 'variant-soft-success'} w-14 h-8 text-sm font-semibold capitalize">{protocolStatus}</button
					>
				</div>
			</div>

			<div class="font-bold">DID:</div>
			<div class="w-72 break-all pb-4 flex items-center gap-2 justify-between">
				<div>{shortDID(did, 54)}</div>
				<div><button class="btn btn-sm variant-soft w-8 h-8"><i class="fa-regular fa-copy" /></button></div>
			</div>

			<!-- <button class="btn variant-ringed w-full mb-2" on:click={() => exportAccount()}>Backup</button> -->
			<button class="btn variant-filled-primary w-full" on:click={() => signout()}
				><i class="fa-solid fa-arrow-right-from-bracket mr-2" />Disconnect</button
			>
		</div>
	</div>
</div>
