<script lang="ts">
	import { learningStore, setTopic, setPhase, setLoading, setError, setLecture, clearProgress, appendThinking, appendResponseText } from '#lib/stores/learning';
	import { generateLecture } from '#lib/api/claude';
	import ThinkingDisplay from './ThinkingDisplay.svelte';

	let topic = $state('');
	let isSubmitting = $state(false);

	async function handleSubmit() {
		if (!topic.trim()) {
			return;
		}

		isSubmitting = true;
		setLoading(true);
		setError(null);
		clearProgress();

		try {
			setTopic(topic);
			const lecture = await generateLecture(topic, (data) => {
				if (data.type === 'thinking') {
					appendThinking(data.content);
				} else if (data.type === 'text') {
					appendResponseText(data.content);
				}
			});
			setLecture(lecture);
			setPhase('lecture');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to generate lecture';
			setError(message);
		} finally {
			isSubmitting = false;
			setLoading(false);
		}
	}
</script>

{#if isSubmitting && ($learningStore.thinking || $learningStore.responseText)}
	<div class="min-h-screen bg-base-200 p-4">
		<div class="max-w-4xl mx-auto">
			<ThinkingDisplay />
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex flex-col items-center justify-center p-4">
		<!-- Decorative elements -->
		<div class="absolute inset-0 overflow-hidden pointer-events-none">
			<div class="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
			<div class="absolute bottom-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
		</div>

		<div class="relative z-10 w-full max-w-md">
			<!-- Header Section -->
			<div class="text-center mb-8">
				<div class="inline-block p-4 rounded-2xl bg-white/10 backdrop-blur-md mb-4">
					<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.753 2 16.5 2 20.1 4.9 23 8.5 23h7c3.6 0 6.5-2.9 6.5-6.5 0-5.747-4.5-10.247-10-10.247z" />
					</svg>
				</div>
				<h1 class="text-4xl font-bold text-white mb-2">Learn Something New</h1>
				<p class="text-white/80 text-lg">Start your learning journey today</p>
			</div>

			<!-- Main Card -->
			<div class="card bg-base-100/95 backdrop-blur shadow-2xl border border-white/10">
				<div class="card-body space-y-6">
					<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
						<div class="form-control">
							<label class="label pb-3" for="topic">
								<span class="label-text font-bold text-base">What topic interests you?</span>
							</label>
							<div class="relative">
								<svg class="absolute left-4 top-4 w-5 h-5 text-primary pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
								<input
									id="topic"
									type="text"
									placeholder="e.g., Quantum Computing, Photosynthesis..."
									class="input input-bordered input-lg w-full pl-12 focus:input-primary"
									bind:value={topic}
									disabled={isSubmitting}
									autocomplete="off"
								/>
							</div>
						</div>

						<button
							type="submit"
							class="btn btn-primary btn-lg w-full gap-2 font-semibold shadow-lg hover:shadow-xl"
							disabled={isSubmitting || !topic.trim()}
						>
							{#if isSubmitting}
								<span class="loading loading-spinner loading-sm"></span>
								<span>Generating Lecture...</span>
							{:else}
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
								<span>Get Started</span>
							{/if}
						</button>
					</form>

					{#if $learningStore.error}
						<div class="alert alert-error shadow-lg">
							<svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>{$learningStore.error}</span>
						</div>
					{/if}

					<!-- Tips Section -->
					<div class="pt-4 border-t border-base-200">
						<p class="text-xs font-semibold text-base-500 uppercase tracking-wider mb-3">Try topics like:</p>
						<div class="flex flex-wrap gap-2">
							<div class="badge badge-lg badge-outline">Machine Learning</div>
							<div class="badge badge-lg badge-outline">Ancient Rome</div>
							<div class="badge badge-lg badge-outline">Climate Change</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
