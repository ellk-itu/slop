<script lang="ts">
	import { learningStore, resetSession } from '#lib/stores/learning';

	function getScoreColor(score: number) {
		if (score >= 80) return 'success';
		if (score >= 60) return 'warning';
		return 'error';
	}

	function handleStartOver() {
		resetSession();
	}
</script>

{#if $learningStore.evaluation}
	<div class="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 p-4 flex flex-col items-center justify-center">
		<!-- Decorative elements -->
		<div class="absolute inset-0 overflow-hidden pointer-events-none">
			<div class="absolute top-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
			<div class="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
		</div>

		<div class="relative z-10 w-full max-w-3xl">
			<!-- Success Celebration Card -->
			<div class="card bg-white/95 backdrop-blur shadow-2xl border border-white/20 overflow-hidden">
				<!-- Decorative top bar -->
				<div class="h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>

				<div class="card-body space-y-8">
					<!-- Header -->
					<div class="text-center space-y-2">
						<h1 class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
							Quiz Complete! 🎉
						</h1>
						<p class="text-lg text-base-600 font-semibold">{$learningStore.topic}</p>
					</div>

					<!-- Score Section - Large and Prominent -->
					<div class="stats stats-vertical lg:stats-horizontal w-full bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg border border-green-200">
						<div class="stat flex-1">
							<div class="stat-title text-base font-bold">Your Score</div>
							<div class="stat-value text-5xl font-bold">
								<span class="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
									{$learningStore.evaluation.score}%
								</span>
							</div>
							<div class="stat-desc text-base">
								{#if $learningStore.evaluation.score >= 80}
									<span class="font-bold text-green-600">🌟 Excellent work!</span>
								{:else if $learningStore.evaluation.score >= 60}
									<span class="font-bold text-amber-600">👍 Good effort!</span>
								{:else}
									<span class="font-bold text-orange-600">💪 Keep practicing!</span>
								{/if}
							</div>
						</div>
					</div>

					<!-- Divider -->
					<div class="divider"></div>

					<!-- Feedback Section -->
					<div class="card bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
						<div class="card-body">
							<h2 class="card-title text-xl text-blue-900 flex items-center gap-2">
								<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								Feedback
							</h2>
							<p class="text-base text-base-700 leading-relaxed">{$learningStore.evaluation.feedback}</p>
						</div>
					</div>

					<!-- Two Column Layout for Strengths and Areas -->
					<div class="grid md:grid-cols-2 gap-6">
						<!-- Strengths -->
						<div class="card bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
							<div class="card-body">
								<h2 class="card-title text-lg text-green-900 flex items-center gap-2">
									<svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
										<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
									</svg>
									Strengths
								</h2>
								<ul class="space-y-3">
									{#each $learningStore.evaluation.strengths as strength}
										<li class="flex gap-3 items-start p-2 rounded-lg bg-white/60">
											<svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
												<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
											</svg>
											<span class="text-base text-base-700">{strength}</span>
										</li>
									{/each}
								</ul>
							</div>
						</div>

						<!-- Areas for Improvement -->
						<div class="card bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
							<div class="card-body">
								<h2 class="card-title text-lg text-amber-900 flex items-center gap-2">
									<svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
									</svg>
									Room to Grow
								</h2>
								<ul class="space-y-3">
									{#each $learningStore.evaluation.areasForImprovement as area}
										<li class="flex gap-3 items-start p-2 rounded-lg bg-white/60">
											<svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
											</svg>
											<span class="text-base text-base-700">{area}</span>
										</li>
									{/each}
								</ul>
							</div>
						</div>
					</div>

					<!-- Actions -->
					<div class="card-actions justify-between gap-4 pt-4">
						<button class="btn btn-lg btn-ghost gap-2 font-semibold" onclick={handleStartOver}>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							Learn Something Else
						</button>
						<a href="/" class="btn btn-lg btn-primary gap-2 font-semibold shadow-lg">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4" />
							</svg>
							Home
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
