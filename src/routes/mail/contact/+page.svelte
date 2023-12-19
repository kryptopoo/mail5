<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Table, tableMapperValues, type ModalComponent, type TableSource, type ModalSettings, Modal, getToastStore } from '@skeletonlabs/skeleton';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	import { Mail5 } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import Header from '$lib/components/Header.svelte';
	import ModalContactForm from '$lib/components/ModalContactForm.svelte';
	import { shortDID } from '$lib/utils';

	const modalStore = getModalStore();
	const toastStore = getToastStore();

	const mail5 = new Mail5($accountStore);

	const modalComponent: ModalComponent = { ref: ModalContactForm };
	const modal: ModalSettings = {
		type: 'component',
		component: modalComponent,
		response: async (r: any) => {
			if (r) {
				// save
				if (r.action == 'save') {
					if (r.recordId == undefined) {
						const { record, status } = await mail5.addContact(r.did, r.name);

						// success
						toastStore.trigger({
							message: 'Added contact successfully!',
							background: 'variant-filled-success'
						});

						await getContacts();
					} else {
						// update
					}
				}
				// delete
				else if (r.action == 'delete') {
					const rs = await mail5.delete(r.recordId);

					// success
					toastStore.trigger({
						message: 'Deleted contact successfully!',
						background: 'variant-filled-success'
					});

					await getContacts();
				}
			}
		}
	};

	const tableSimple: TableSource = {
		// A list of heading labels.
		head: ['Name', 'DID'],
		// The data visibly shown in your table body UI.
		body: tableMapperValues([], ['name', 'shortDid']),
		// // Optional: The data returned when interactive is enabled and a row is clicked.
		meta: tableMapperValues([], ['name', 'did', 'recordId'])
		// // Optional: A list of footer labels.
		// foot: ['Total', '', '<code class="code">5</code>']
	};

	function editContact(e: any) {
		console.log('row', e.detail);
		modalComponent.props = { formData: { name: e.detail[0], did: e.detail[1], recordId: e.detail[2] } };
		modalStore.trigger(modal);
	}

	function addContact() {
		modalComponent.props = { formData: { name: '', did: '', recordId: undefined } };
		modalStore.trigger(modal);
	}

	async function getContacts() {
		// const results = await Promise.all(records.map(async (record) => record.data.json()));
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

<Header />

<div in:fade={{ duration: 400 }} class="p-2">
	<div class="flex justify-between items-center h-12">
		<h3 class="h3 ml-1">Contact</h3>
		<div class="flex gap-1">
			<button class="btn-sm variant-soft" on:click={addContact}
				><i class="fa-solid fa-user-plus mr-1" />
				<span>New Contact</span>
			</button>
		</div>
	</div>

	<Table regionCell="break-all min-w-[10rem]" source={tableSimple} interactive={true} on:selected={editContact} />
</div>

<Modal />
