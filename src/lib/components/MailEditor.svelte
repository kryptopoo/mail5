<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->
<script lang="ts">
	import Editor from '@tinymce/tinymce-svelte';
	import { Mail5, type Mail5Email } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import { FileButton } from '@skeletonlabs/skeleton';
	import Header from '$lib/components/Header.svelte';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import MailContent from '$lib/components/MailContent.svelte';
	import { goto } from '$app/navigation';

	const toastStore = getToastStore();

	const mail5 = new Mail5($accountStore);
	let files: FileList;

	let conf = {
		toolbar: 'fontfamily fontsize forecolor | bold italic underline strikethrough | alignleft aligncenter alignright',
		menubar: false,
		branding: false
	};

	// let email: Mail5Email = {
	// 	from: $accountStore?.did,
	// 	to: '',
	// 	subject: 'hello',
	// 	content: 'hello world',
	// 	attachments: []
	// };

	export let email: Mail5Email;
	export let replyEmail: Mail5Email | undefined = undefined;
	export let forwardEmail: Mail5Email | undefined = undefined;

	async function send() {
		console.log('email', email);
		console.log('replyEmail', replyEmail);
		console.log('forwardEmail', forwardEmail);

		let rs;
		if (replyEmail) {
			rs = await mail5.reply(email, replyEmail);
			console.log('reply rs', rs);
		} else if (forwardEmail) {
			rs = await mail5.forward(email, forwardEmail);
			console.log('forward rs', rs);
		} else {
			rs = await mail5.send(email);
			console.log('send rs', rs);
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
		// email.content = email.content.replace(/\\/g, '&#92;');
		console.log('email', email);
		console.log('email content', email.content);
		console.log('JSON email', JSON.stringify(email));

		const rs = await mail5.saveDraft(email);
		console.log('saveDraft rs', rs);

		if (rs.status.code == 202) {
			// success
			toastStore.trigger({
				message: 'Your email has been saved successfully!',
				background: 'variant-filled-success'
			});
		} else {
			toastStore.trigger({
				message: rs.status.detail,
				background: 'variant-filled-error'
			});
		}
	}

	function onFileChanged(e: Event): void {
		// console.log('file data:', e);
		console.log('file files:', files);

		// reader.readAsBinaryString(files[0]);

		for (let i = 0; i < files.length; i++) {
			const reader = new FileReader();
			reader.addEventListener('load', async function (e: any) {
				// console.log('e.target', e);
				// const filecontent = e.target.result;
				// console.log('filecontent', filecontent);

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
		<input class="input variant-form-material" title="To" type="text" placeholder="DID" bind:value={email.to} />
	</div>

	<div class="flex flex-row items-center">
		<div class="w-24">Subject:</div>
		<input class="input variant-form-material" title="Subject" type="text" placeholder="Subject" bind:value={email.subject} />
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

	<!-- <input class="input" type="file" multiple /> -->
	<input class="input" type="file" multiple bind:files on:change={onFileChanged} />

	<div class="flex flex-row-reverse gap-1">
		<!-- <button type="button" class="btn variant-filled-primary" on:click={send}>Send</button>
		<button type="button" class="btn variant-filled-primary" on:click={saveDraft}>Save as Draft</button> -->

		<button class="btn variant-filled-primary" on:click={send}><i class="fa fa-paper-plane" /><span>Send</span></button>
		<button class="btn variant-soft" on:click={saveDraft}><i class="fa fa-floppy-disk" /><span>Save as Draft</span></button>
	</div>
</div>
