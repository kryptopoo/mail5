<script lang="ts">
	import Editor from '@tinymce/tinymce-svelte';
	import { Mail5, type Mail5Email } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { Modal, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import MailContent from '$lib/components/MailContent.svelte';
	import { goto } from '$app/navigation';
	import ModalContactSelect from './ModalContactSelect.svelte';

	const modalStore = getModalStore();
	const modalComponent: ModalComponent = { ref: ModalContactSelect };
	const modal: ModalSettings = {
		type: 'component',
		component: modalComponent,
		response: async (r: any) => {
			if (r) {
				if (r.action == 'select') {
					email.to = r.did;
				}
			}
		}
	};

	const toastStore = getToastStore();

	const mail5 = new Mail5($accountStore);
	let files: FileList;

	let conf = {
		toolbar: 'fontfamily fontsize forecolor | bold italic underline strikethrough | alignleft aligncenter alignright',
		menubar: false,
		branding: false
	};

	export let email: Mail5Email;
	export let replyEmail: Mail5Email | undefined = undefined;
	export let forwardEmail: Mail5Email | undefined = undefined;

	async function send() {
		let rs;
		if (replyEmail) {
			rs = await mail5.reply(email, replyEmail);
		} else if (forwardEmail) {
			rs = await mail5.forward(email, forwardEmail);
		} else {
			rs = await mail5.send(email);
		}

		if (rs.status.code === 202) {
			// success
			toastStore.trigger({
				message: 'Your email has been sent successfully!',
				background: 'variant-filled-success'
			});

			setTimeout(() => {
				goto('/mail/outbox');
			}, 2000);
		} else {
			toastStore.trigger({
				message: rs.status.detail,
				background: 'variant-filled-error'
			});
		}
	}

	async function saveDraft() {
		const rs = await mail5.saveDraft(email);
		console.log('saveDraft rs', rs);

		if (rs.status.code == 202) {
			// success
			toastStore.trigger({
				message: 'Your email has been saved successfully!',
				background: 'variant-filled-success'
			});

			setTimeout(() => {
				goto('/mail/drafts');
			}, 2000);
		} else {
			toastStore.trigger({
				message: rs.status.detail,
				background: 'variant-filled-error'
			});
		}
	}

	function onFileChanged(e: Event): void {
		for (let i = 0; i < files.length; i++) {
			const reader = new FileReader();
			reader.addEventListener('load', async function (e: any) {
				email.attachments.push({
					name: files[i].name,
					type: files[i].type,
					base64: e.target.result
				});
			});
			reader.readAsDataURL(files[i]);
		}
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<div class="flex flex-row items-center">
		<div class="w-24">From:</div>
		<input class="input variant-form-material" title="From" type="text" placeholder="DID" bind:value={email.from} />
	</div>

	<div class="flex flex-row items-center">
		<div class="w-24">To:</div>
		<div class="flex w-full gap-2">
			<input class="input variant-form-material" title="To" type="text" placeholder="DID" bind:value={email.to} />
			<button class="btn variant-ringed-primary" on:click={() => modalStore.trigger(modal)}><i class="fa-regular fa-address-book" /></button>
		</div>
	</div>

	<div class="flex flex-row items-center">
		<div class="w-24">Subject:</div>
		<input class="input variant-form-material mr-2" title="Subject" type="text" placeholder="Subject" bind:value={email.subject} />
	</div>

	<!-- <input class="input" title="CC" type="text" placeholder="CC" /> -->

	{#if replyEmail}
		<div class="variant-soft-surface rounded-md mt-2">
			<Accordion>
				<AccordionItem>
					<svelte:fragment slot="lead" />
					<svelte:fragment slot="summary">&gt; {replyEmail?.subject}</svelte:fragment>
					<svelte:fragment slot="content">
						<div class="">
							<MailContent title={''} email={replyEmail} editable={false} replyable={false} deletable={false} />
						</div>
					</svelte:fragment>
				</AccordionItem>
			</Accordion>
		</div>
	{/if}

	<div class="">
		<Editor apiKey="j3p1cvqh71km1umwa7tuun4ydc6tm0tvxlzs8t9qfexheyx6" {conf} bind:value={email.content} />
	</div>

	<input class="input" type="file" multiple bind:files on:change={onFileChanged} />

	<div class="flex flex-row-reverse gap-1">
		<button class="btn variant-filled-primary" on:click={send}><i class="fa fa-paper-plane" /><span>Send</span></button>
		<button class="btn variant-soft" on:click={saveDraft}><i class="fa fa-floppy-disk" /><span>Save as Draft</span></button>
	</div>
</div>

<Modal />
