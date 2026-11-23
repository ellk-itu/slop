<script lang="ts">
	import { learningStore } from '#lib/stores/learning';

	let thinkingElement = $state<HTMLDivElement | undefined>();
	let responseElement = $state<HTMLDivElement | undefined>();

	$effect(() => {
		if (thinkingElement) {
			thinkingElement.scrollTop = thinkingElement.scrollHeight;
		}
		if (responseElement) {
			responseElement.scrollTop = responseElement.scrollHeight;
		}
	});
</script>

<div class="space-y-6">
	{#if $learningStore.thinking}
		<div class="card bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl border border-blue-200">
			<div class="card-body">
				<div class="flex items-center gap-3 mb-4">
					<div class="p-2 rounded-lg bg-blue-200/50">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5a4 4 0 100-8 4 4 0 000 8z" />
						</svg>
					</div>
					<h2 class="card-title text-lg text-blue-900">Claude's Thinking Process</h2>
					<div class="loading loading-spinner loading-sm ml-auto text-blue-600"></div>
				</div>
				<div
					bind:this={thinkingElement}
					class="bg-white p-4 rounded-lg text-sm overflow-y-auto max-h-96 font-mono text-slate-700 border border-blue-100 shadow-inner"
				>
					{$learningStore.thinking}
				</div>
			</div>
		</div>
	{/if}

	{#if $learningStore.responseText}
		<div class="card bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl border border-emerald-200">
			<div class="card-body">
				<div class="flex items-center gap-3 mb-4">
					<div class="p-2 rounded-lg bg-emerald-200/50">
						<svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
						</svg>
					</div>
					<h2 class="card-title text-lg text-emerald-900">Generating Response</h2>
					<div class="loading loading-spinner loading-sm ml-auto text-emerald-600"></div>
				</div>
				<div
					bind:this={responseElement}
					class="bg-white p-4 rounded-lg text-sm overflow-y-auto max-h-96 whitespace-pre-wrap text-slate-700 border border-emerald-100 shadow-inner"
				>
					{$learningStore.responseText}
				</div>
			</div>
		</div>
	{/if}

	<div class="card bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg border border-purple-200">
		<div class="card-body">
			<div class="flex items-center gap-3">
				<div class="loading loading-bars loading-sm text-purple-600"></div>
				<span class="text-sm font-semibold text-purple-700">Processing your request...</span>
				<div class="ml-auto text-xs text-purple-600 font-mono">Running adaptive thinking</div>
			</div>
		</div>
	</div>
</div>
