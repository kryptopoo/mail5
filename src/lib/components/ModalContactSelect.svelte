<script lang="ts">
	import { onMount } from 'svelte';
	import type { SvelteComponent } from 'svelte';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { Table, tableMapperValues, type TableSource } from '@skeletonlabs/skeleton';

	import { Mail5 } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import { shortDID } from '$lib/utils';

	const modalStore = getModalStore();
	const mail5 = new Mail5($accountStore);

	const tableSimple: TableSource = {
		head: ['Name', 'DID'],
		body: tableMapperValues([], ['name', 'shortDid']),
		meta: tableMapperValues([], ['name', 'did', 'recordId'])
	};

	export let parent: SvelteComponent;

	// Form Data
	export let formData = {
		name: '',
		did: '',
		action: 'select'
	};

	function onSelect(e: any): void {
		console.log('row', e.detail);
		formData.action = 'select';
		formData.name = e.detail[0];
		formData.did = e.detail[1];
		if ($modalStore[0].response) $modalStore[0].response(formData);
		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4 h-';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';

	async function getContacts() {
		let contacts = [];
		const { records } = await mail5.contacts();
		if (records) {
			for (let index = 0; index < records.length; index++) {
				const record = records[index];
				let contactData = await record.data.json();
				contactData.recordId = record.id;
				contactData.shortDid = shortDID(contactData.did, 54);
				contacts.push(contactData);
			}
		}

		tableSimple.body = tableMapperValues(contacts, ['name', 'shortDid']);
		tableSimple.meta = tableMapperValues(contacts, ['name', 'did', 'recordId']);
	}

	onMount(async () => {
		await getContacts();
	});
</script>

{#if $modalStore[0]}
	<div class="{cBase} min-h-[20rem] max-h-[40rem]">
		<header class={cHeader}>{$modalStore[0].title ?? 'Contact'}</header>

		<Table regionCell="break-all min-w-[8rem]" source={tableSimple} interactive={true} on:selected={onSelect} />
	</div>
{/if}
