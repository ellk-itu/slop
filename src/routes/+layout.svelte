<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="navbar bg-base-100 shadow-sm sticky top-0 z-40">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl">
			Learning Assistant
		</a>
	</div>
</div>

{@render children()}
