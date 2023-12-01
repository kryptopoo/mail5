<script lang="ts">
	import type { SvelteComponent } from 'svelte';
	import { getModalStore } from '@skeletonlabs/skeleton';

	export let parent: SvelteComponent;

	const modalStore = getModalStore();

	// Form Data
	export let formData = {
		name: '',
		did: '',

		// save | delete | cancel
		action: ''
	};

	function onSave(): void {
		formData.action = 'save';
		if ($modalStore[0].response) $modalStore[0].response(formData);
		modalStore.close();
	}

	function onDelete(): void {
		formData.action = 'delete';
		if ($modalStore[0].response) $modalStore[0].response(formData);
		modalStore.close();
	}

	function onCancel(): void {
		formData.action = 'cancel';
		if ($modalStore[0].response) $modalStore[0].response(formData);
		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? 'Contact'}</header>
		<!-- <article>{$modalStore[0].body ?? '(body missing)'}</article> -->
		<form class="modal-form {cForm}">
			<label class="label">
				<span>Name</span>
				<input class="input" type="text" bind:value={formData.name} placeholder="Enter name..." />
			</label>
			<label class="label">
				<span>DID</span>
				<textarea class="input" rows="10" bind:value={formData.did} placeholder="Enter DID..." />
			</label>
		</form>

		<footer class="modal-footer {parent.regionFooter} flex justify-between">
			<button class="btn variant-filled-error w-24" on:click={onDelete}>Delete</button>
			<div>
				<button class="btn {parent.buttonNeutral} w-24" on:click={onCancel}>Cancel</button>
				<button class="btn variant-filled-primary ml-2 w-24" on:click={onSave}>Save</button>
			</div>
		</footer>
	</div>
{/if}
