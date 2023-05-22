<script lang="ts">
	import { page } from '$app/stores';
	import { anonSignIn, signInWith, signOut } from '$lib/client/firebase';

</script>
<svelte:window on:load={() => setTimeout(() => {
	if(page && !page.data.userSession){
		anonSignIn()
	}
}, 1000)} />

{#if $page.data.userSession}
	<button on:click={() => signOut()}>Sign Out</button>
	{$page.data.userSession.uid} ({$page.data.userSession.email})
{:else}
	<button on:click={() => anonSignIn()}>Sign In</button>
	(visitor)
{/if}
