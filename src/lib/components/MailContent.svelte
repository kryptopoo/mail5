<script lang="ts">
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';

	import type { Mail5Email } from '$lib/mail5';
	import { copyClipboard, download, shortDID } from '$lib/utils';
	import MailContent from '$lib/components/MailContent.svelte';

	const dispatch = createEventDispatcher();

	export let email: Mail5Email | undefined;
	export let editable: boolean;
	export let replyable: boolean;
	export let deletable: boolean = true;
	export let title: string = '';
</script>

{#if email}
	<div class="p-4">
		{#if email.subject}
			<div class="flex justify-between items-center h-12">
				<h3 class="h3 ml-1">{email.subject}</h3>

				<div class="flex gap-1">
					{#if replyable}
						<a href={`/mail/reply/${email?.record?.id}`} class="btn-sm variant-soft"
							><i class="fa fa-mail-reply mr-1" />
							<span>Reply</span>
						</a>

						<a href={`/mail/forward/${email?.record?.id}`} class="btn-sm variant-soft"
							><i class="fa fa-mail-forward mr-1" />
							<span>Forward</span>
						</a>
					{/if}

					{#if editable == true}
						<a href={`/mail/compose/${email?.record?.id}`} class="btn-sm variant-soft"
							><i class="fa-solid fa-pen-to-square mr-1" />
							<span>Edit</span>
						</a>
					{/if}

					{#if deletable}
						<button on:click={() => dispatch('deleteEmail', email)} class="btn-sm variant-soft"
							><i class="fa fa-trash mr-1" />
							<span>Delete</span>
						</button>
					{/if}
				</div>
			</div>
		{/if}

		{#if email?.parent}
			<div class="variant-soft-surface rounded-md mt-2">
				<Accordion>
					<AccordionItem>
						<svelte:fragment slot="lead" />
						<svelte:fragment slot="summary">&gt; {email?.parent?.subject}</svelte:fragment>
						<svelte:fragment slot="content">
							<div class="">
								<MailContent title={''} email={email?.parent} editable={false} replyable={false} deletable={false} />
							</div>
						</svelte:fragment>
					</AccordionItem>
				</Accordion>
			</div>
		{/if}

		<div class="border-[1px] rounded-md p-4 mt-2 bg-white">
			{#if email.from}
				<div>
					<span class="w-12 inline-block font-medium">From:</span> <span class="inline-block min-w-[29.5rem]">{shortDID(email.from, 54)}</span>
					<button class="btn btn-sm" on:click={() => copyClipboard(email ? email.from : '')}><i class="fa-regular fa-copy" /></button>
				</div>
			{/if}
			{#if email.to}
				<div>
					<span class="w-12 inline-block font-medium">To:</span> <span class="inline-block min-w-[29.5rem]">{shortDID(email.to, 54)}</span>
					<button class="btn btn-sm" on:click={() => copyClipboard(email ? email.to : '')}><i class="fa-regular fa-copy" /></button>
				</div>
			{/if}

			<hr class="my-4" />

			{#if email.content}
				<div class="p-4 w-full">{@html email.content}</div>
			{/if}

			{#if email.attachments && email.attachments.length > 0}
				<hr class="my-4" />
				<div class="">
					{#each email.attachments as attachment}
						<!-- {attachment} -->
						<!-- <button on:click={() => download(attachment)}>Download</button> -->
						<button class="btn btn-sm variant-soft mr-1" on:click={() => download(attachment.name, attachment.base64)}
							><i class="fa-solid fa-paperclip mr-2" />{attachment.name}</button
						>
					{/each}
				</div>
			{/if}
		</div>
		<!-- 
		<div class="flex flex-row-reverse gap-2">
			<button class="btn variant-filled-primary"><i class="fa fa-paper-plane" /><span>Send</span></button>
			<button class="btn variant-soft"><i class="fa fa-floppy-disk" /><span>Save</span></button>
		</div> -->
	</div>
{:else}
	<div class="flex items-center justify-center text-center m-[15%]">
		<div>
			<h3 class="h3">{title}</h3>
			<div class="my-4"><img src="/images/bg-conversation.svg" alt="" /></div>
			<div>You have no conversations stored in this folder</div>
		</div>
	</div>
{/if}
