<script lang="ts">
	import { learningStore, setPhase, setLoading, setError, setQuiz, clearProgress, appendThinking, appendResponseText } from '#lib/stores/learning';
	import { generateQuiz } from '#lib/api/claude';
	import ThinkingDisplay from './ThinkingDisplay.svelte';

	let isGeneratingQuiz = $state(false);

	async function handleStartQuiz() {
		if (!$learningStore.lecture) return;

		isGeneratingQuiz = true;
		setLoading(true);
		setError(null);
		clearProgress();

		try {
			const quiz = await generateQuiz($learningStore.topic, $learningStore.lecture.content, (data) => {
				if (data.type === 'thinking') {
					appendThinking(data.content);
				} else if (data.type === 'text') {
					appendResponseText(data.content);
				}
			});
			setQuiz(quiz.questions);
			setPhase('quiz');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to generate quiz';
			setError(message);
		} finally {
			isGeneratingQuiz = false;
			setLoading(false);
		}
	}

	function handleGoBack() {
		setPhase('topic');
	}
</script>

{#if isGeneratingQuiz && ($learningStore.thinking || $learningStore.responseText)}
	<div class="min-h-screen bg-gradient-to-b from-base-200 to-base-100 p-4">
		<div class="max-w-4xl mx-auto">
			<ThinkingDisplay />
		</div>
	</div>
{:else if $learningStore.lecture}
	<div class="min-h-screen bg-gradient-to-b from-base-200 to-base-100 p-4">
		<div class="max-w-4xl mx-auto">
			<!-- Header with Back Button -->
			<div class="mb-8 flex items-center justify-between">
				<button
					class="btn btn-ghost btn-lg gap-2 text-lg"
					onclick={handleGoBack}
					disabled={$learningStore.loading}
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
					Back
				</button>
				<div class="badge badge-lg badge-primary">{$learningStore.topic}</div>
			</div>

			<!-- Main Lecture Card -->
			<article class="card bg-gradient-to-br from-white to-blue-50 shadow-2xl border border-blue-100 overflow-hidden">
				<!-- Decorative Header -->
				<div class="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
				
				<div class="card-body prose prose-lg max-w-none">
					<!-- Title Section -->
					<div class="not-prose mb-8">
						<h1 class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
							{$learningStore.lecture.title}
						</h1>
						<div class="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
					</div>

					<!-- Content with better formatting -->
					<div class="space-y-4 text-base-content leading-relaxed">
						{@html $learningStore.lecture.content
							.split('\n')
							.filter((p) => p.trim())
							.map((paragraph) => {
								// Improve paragraph styling
								const sanitized = paragraph
									.replace(/^## /g, '<strong style="font-size: 1.3em; color: #1f2937;">')
									.replace(/## $/g, '</strong>');
								return `<p class="mb-4">${sanitized}</p>`;
							})
							.join('')}
					</div>

					<!-- Divider -->
					<div class="divider my-8"></div>

					<!-- Action Section -->
					<div class="not-prose flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 bg-gradient-to-r from-blue-50 to-purple-50 -mx-6 -mb-6 px-6 py-6 rounded-b-lg">
						<div class="text-sm font-semibold text-base-600">Ready to test your knowledge?</div>
						<button 
							class="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-xl min-w-xs"
							onclick={handleStartQuiz} 
							disabled={isGeneratingQuiz}
						>
							{#if isGeneratingQuiz}
								<span class="loading loading-spinner loading-sm"></span>
								<span>Generating Quiz...</span>
							{:else}
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span>Start Quiz</span>
							{/if}
						</button>
					</div>
				</div>
			</article>

			{#if $learningStore.error}
				<div class="alert alert-error mt-6 shadow-lg">
					<svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0v.01M12 2.25a9.75 9.75 0 100 19.5A9.75 9.75 0 0012 2.25z" />
					</svg>
					<span>{$learningStore.error}</span>
				</div>
			{/if}
		</div>
	</div>
{/if}
