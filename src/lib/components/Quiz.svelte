<script lang="ts">
    import {
        learningStore,
        setAnswer,
        setPhase,
        setLoading,
        setError,
        setEvaluation,
        clearProgress,
        appendThinking,
        appendResponseText,
    } from "#lib/stores/learning";
    import { evaluateAnswers } from "#lib/api/claude";
    import ThinkingDisplay from "./ThinkingDisplay.svelte";

    let isSubmitting = $state(false);

    function getAnswerStatus(questionIndex: number) {
        if (!$learningStore.quiz) return null;
        const question = $learningStore.quiz[questionIndex];
        const selectedAnswer = $learningStore.answers[questionIndex];
        const isCorrect = selectedAnswer === question.correctAnswer;
        const answered = selectedAnswer !== null;

        return { isCorrect, answered, selectedAnswer };
    }

    async function handleSubmit() {
        if (!$learningStore.quiz) return;

        const allAnswered = $learningStore.answers.every((a) => a !== null);
        if (!allAnswered) {
            setError("Please answer all questions before submitting");
            return;
        }

        isSubmitting = true;
        setLoading(true);
        setError(null);
        clearProgress();

        try {
            const answers = $learningStore.quiz.map((q, index) => ({
                questionIndex: index,
                selectedAnswer: $learningStore.answers[index] ?? 0,
                correctAnswer: q.correctAnswer,
            }));

            const evaluation = await evaluateAnswers(
                $learningStore.topic,
                $learningStore.lecture?.content || "",
                answers,
                (data) => {
                    if (data.type === "thinking") {
                        appendThinking(data.content);
                    } else if (data.type === "text") {
                        appendResponseText(data.content);
                    }
                },
            );

            setEvaluation(evaluation);
            setPhase("evaluation");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to evaluate answers";
            setError(message);
        } finally {
            isSubmitting = false;
            setLoading(false);
        }
    }

    function handleGoBack() {
        setPhase("lecture");
    }
</script>

{#if isSubmitting && ($learningStore.thinking || $learningStore.responseText)}
    <div class="min-h-screen bg-gradient-to-b from-base-200 to-base-100 p-4">
        <div class="max-w-4xl mx-auto">
            <ThinkingDisplay />
        </div>
    </div>
{:else if $learningStore.quiz}
    <div class="min-h-screen bg-gradient-to-b from-base-200 to-base-100 p-4">
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="mb-8 flex items-center justify-between">
                <button
                    class="btn btn-ghost btn-lg gap-2 text-lg"
                    onclick={handleGoBack}
                    disabled={$learningStore.loading}
                >
                    <svg
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back
                </button>
                <div class="badge badge-lg badge-secondary">
                    {$learningStore.topic}
                </div>
            </div>

            <!-- Quiz Header Card -->
            <div
                class="card bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg border border-orange-200 mb-8"
            >
                <div class="card-body">
                    <div class="flex items-center gap-3 mb-2">
                        <svg
                            class="w-8 h-8 text-orange-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M9 3a1 1 0 11-2 0 1 1 0 012 0zm0 4a1 1 0 11-2 0 1 1 0 012 0zm0 4a1 1 0 11-2 0 1 1 0 012 0zm0 4a1 1 0 11-2 0 1 1 0 012 0zm8-12a1 1 0 11-2 0 1 1 0 012 0zm0 4a1 1 0 11-2 0 1 1 0 012 0zm0 4a1 1 0 11-2 0 1 1 0 012 0zm0 4a1 1 0 11-2 0 1 1 0 012 0z"
                            />
                        </svg>
                        <div>
                            <h1 class="card-title text-2xl text-orange-900">
                                Quiz
                            </h1>
                            <p class="text-sm text-orange-700 font-semibold">
                                {$learningStore.quiz.length} questions • Answer all
                                to continue
                            </p>
                        </div>
                    </div>
                    <!-- Progress -->
                    <progress
                        class="progress progress-warning w-full mt-4"
                        value={$learningStore.answers.filter((a) => a !== null)
                            .length}
                        max={$learningStore.quiz.length}
                    ></progress>
                </div>
            </div>

            <!-- Questions -->
            <div class="space-y-6 mb-8">
                {#each $learningStore.quiz as question, questionIndex}
                    <div
                        class="card bg-white shadow-md border border-blue-100 hover:shadow-lg transition-shadow"
                    >
                        <div class="card-body">
                            <div class="flex items-start gap-4 mb-4">
                                <div
                                    class="badge badge-primary badge-lg font-bold"
                                >
                                    {questionIndex + 1}
                                </div>
                                <h2 class="card-title text-xl flex-1">
                                    {question.question}
                                </h2>
                            </div>

                            <div class="space-y-4 flex flex-col">
                                {#each question.options as option, optionIndex}
                                    {@const status =
                                        getAnswerStatus(questionIndex)}
                                    {@const isSelected =
                                        $learningStore.answers[
                                            questionIndex
                                        ] === optionIndex}
                                    <label
                                        class="label cursor-pointer border-2 rounded-lg p-3 transition-all min-h-14 justify-start gap-3"
                                        class:border-success={status?.answered &&
                                            isSelected &&
                                            status?.isCorrect}
                                        class:bg-green-50={status?.answered &&
                                            isSelected &&
                                            status?.isCorrect}
                                        class:border-error={status?.answered &&
                                            isSelected &&
                                            !status?.isCorrect}
                                        class:bg-red-50={status?.answered &&
                                            isSelected &&
                                            !status?.isCorrect}
                                        class:border-base-300={!isSelected}
                                        class:bg-base-100={!isSelected}
                                        class:hover:border-primary={!status?.answered}
                                        class:hover:bg-blue-50={!status?.answered}
                                    >
                                        <div class="flex-1">
                                            <span class="label-text text-base"
                                                >{option}</span
                                            >
                                            <input
                                                type="radio"
                                                name="question-{questionIndex}"
                                                class="radio"
                                                checked={isSelected}
                                                onchange={() =>
                                                    setAnswer(
                                                        questionIndex,
                                                        optionIndex,
                                                    )}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </label>
                                {/each}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Submit Section -->
            <div
                class="card bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg border border-green-200"
            >
                <div class="card-body">
                    <div
                        class="flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                        <div class="text-sm font-semibold text-green-700">
                            {$learningStore.answers.filter((a) => a !== null)
                                .length} / {$learningStore.quiz.length} answered
                        </div>
                        <button
                            class="btn btn-success btn-lg gap-2 shadow-lg hover:shadow-xl"
                            onclick={handleSubmit}
                            disabled={isSubmitting ||
                                $learningStore.answers.some((a) => a === null)}
                        >
                            {#if isSubmitting}
                                <span class="loading loading-spinner loading-sm"
                                ></span>
                                <span>Evaluating...</span>
                            {:else}
                                <svg
                                    class="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>Submit Quiz</span>
                            {/if}
                        </button>
                    </div>
                </div>
            </div>

            {#if $learningStore.error}
                <div class="alert alert-error mt-6 shadow-lg">
                    <svg
                        class="w-6 h-6 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4v2m0 0v.01M12 2.25a9.75 9.75 0 100 19.5A9.75 9.75 0 0012 2.25z"
                        />
                    </svg>
                    <span>{$learningStore.error}</span>
                </div>
            {/if}
        </div>
    </div>
{/if}
