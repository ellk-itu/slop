<script lang="ts">
	import { onMount } from 'svelte';
	import { learningStore } from '#lib/stores/learning';
	import { apiKeyStore, setApiKey, loadApiKeyFromStorage, clearApiKey } from '#lib/stores/apiKey';
	import TopicInput from '#lib/components/TopicInput.svelte';
	import Lecture from '#lib/components/Lecture.svelte';
	import Quiz from '#lib/components/Quiz.svelte';
	import Evaluation from '#lib/components/Evaluation.svelte';

	let apiKeyInput = $state('');
	let showKeyInput = $state(false);

	onMount(() => {
		loadApiKeyFromStorage();
		if (!$apiKeyStore.isSet) {
			showKeyInput = true;
		}
	});

	function handleSetApiKey() {
		if (apiKeyInput.trim()) {
			setApiKey(apiKeyInput);
			showKeyInput = false;
		}
	}

	function handleChangeApiKey() {
		clearApiKey();
		apiKeyInput = '';
		showKeyInput = true;
	}
</script>

<svelte:head>
	<title>AI Learning Assistant</title>
</svelte:head>

{#if showKeyInput}
	<div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
		<div class="card bg-base-100 shadow-xl w-full max-w-md">
			<div class="card-body">
				<h1 class="card-title text-2xl mb-4">Enter API Key</h1>
				<div class="alert alert-info mb-4">
					<div>
						<h3 class="font-bold">Anthropic API Key Required</h3>
						<div class="text-sm">
							Enter your Anthropic API key to use this learning assistant. Your key is stored locally in your browser.
						</div>
					</div>
				</div>

				<div class="form-control w-full mb-4">
					<label class="label" for="api-key-input">
						<span class="label-text">API Key</span>
					</label>
					<input
						id="api-key-input"
						type="password"
						placeholder="sk-ant-..."
						class="input input-bordered w-full"
						bind:value={apiKeyInput}
						onkeydown={(e) => e.key === 'Enter' && handleSetApiKey()}
					/>
					<label class="label" for="api-key-input">
						<span class="label-text-alt">
							<a href="https://console.anthropic.com" class="link link-primary text-xs" target="_blank">
								Get your API key from Anthropic Console
							</a>
						</span>
					</label>
				</div>

				<button class="btn btn-primary w-full" onclick={handleSetApiKey} disabled={!apiKeyInput.trim()}>
					Set API Key
				</button>
			</div>
		</div>
	</div>
{:else}
	<div class="flex flex-col h-full">
		{#if $learningStore.phase === 'topic'}
			<TopicInput />
		{:else if $learningStore.phase === 'lecture'}
			<Lecture />
		{:else if $learningStore.phase === 'quiz'}
			<Quiz />
		{:else if $learningStore.phase === 'evaluation'}
			<Evaluation />
		{/if}
	</div>
{/if}
