<script lang="ts">
	import { onMount } from 'svelte';
	import { learningStore } from '#lib/stores/learning';
	import TopicInput from '#lib/components/TopicInput.svelte';
	import Lecture from '#lib/components/Lecture.svelte';
	import Quiz from '#lib/components/Quiz.svelte';
	import Evaluation from '#lib/components/Evaluation.svelte';

	let apiKeyMissing = $state(false);

	onMount(() => {
		const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
		if (!apiKey) {
			apiKeyMissing = true;
		}
	});
</script>

<svelte:head>
	<title>AI Learning Assistant</title>
</svelte:head>

{#if apiKeyMissing}
	<div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
		<div class="card bg-base-100 shadow-xl w-full max-w-md">
			<div class="card-body">
				<h1 class="card-title text-2xl mb-4">Configuration Required</h1>
				<div class="alert alert-warning mb-4">
					<div>
						<h3 class="font-bold">API Key Missing</h3>
						<div class="text-sm">
							To use this learning assistant, you need to set up your Anthropic API key.
						</div>
					</div>
				</div>

				<div class="bg-base-200 p-4 rounded-lg mb-4">
					<p class="text-sm mb-3 font-semibold">Set up your environment:</p>
					<ol class="text-sm space-y-2 list-decimal list-inside">
						<li>Get your API key from <a href="https://console.anthropic.com" class="link link-primary" target="_blank">Anthropic Console</a></li>
						<li>Create a <code class="bg-base-100 px-2 py-1 rounded">.env.local</code> file in the project root</li>
						<li>Add: <code class="bg-base-100 px-2 py-1 rounded">VITE_ANTHROPIC_API_KEY=your_key_here</code></li>
						<li>Restart the development server</li>
					</ol>
				</div>

				<a href="https://console.anthropic.com" class="btn btn-primary w-full" target="_blank">
					Get Your API Key
				</a>
			</div>
		</div>
	</div>
{:else if $learningStore.phase === 'topic'}
	<TopicInput />
{:else if $learningStore.phase === 'lecture'}
	<Lecture />
{:else if $learningStore.phase === 'quiz'}
	<Quiz />
{:else if $learningStore.phase === 'evaluation'}
	<Evaluation />
{/if}
