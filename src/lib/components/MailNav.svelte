<script lang="ts">
	import { formatDate, shortDID } from '$lib/utils';
	import { Mail5 } from '$lib/mail5';
	import type { Mail5Email } from '$lib/mail5';
	import { accountStore } from '$lib/store';
	import MailContent from './MailContent.svelte';
	import Header from './Header.svelte';
	import { ProgressRadial, getToastStore } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';
	import Loading from './Loading.svelte';

	export let emails: Promise<Mail5Email[]>;

	const dispatch = createEventDispatcher();
</script>

<nav class="list-nav h-[calc(100vh-4rem)] min-w-[300px] border-r-[1px]  p-2">
	<ul>
		{#await emails}
			<li class="text-center"><Loading /></li>
		{:then emails}
			{#if emails.length > 0}
				{#each emails as email}
					<li class="group">
						<button class="btn variant-soft flex flex-col p-0 w-full" style="align-items: start;" on:click={() => dispatch('selectEmail', email)}>
							<div class="flex justify-between w-full items-center">
								<div>{shortDID(email.from)}</div>
								<div class="text-xs">{formatDate(email.record?.dateCreated)}</div>
							</div>
							<div class="flex justify-between w-full items-center text-lg" style="margin-left: 0;">
								<div>{email.subject}</div>
								<!-- <button  on:click={()=> mail5.delete(email.record?.id)}></button>			 -->
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<!-- svelte-ignore a11y-no-static-element-interactions -->
								<i on:click={() => dispatch('deleteEmail', email)} class="fa fa-trash invisible group-hover:visible" />
							</div>
						</button>
					</li>
				{/each}
				<li class="invisible">{dispatch('selectEmail', emails[0])}</li>
			{:else}
				<li class="text-center my-4">No emails found</li>
			{/if}
		{:catch error}
			<li>{error.message}</li>
		{/await}
	</ul>
</nav>
