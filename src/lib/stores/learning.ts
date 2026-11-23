import { writable } from 'svelte/store';
import type { LectureResponse, QuizQuestion, EvaluationResponse } from '../api/claude';

export type Phase = 'topic' | 'lecture' | 'quiz' | 'evaluation';

export interface LearningSession {
	phase: Phase;
	topic: string;
	lecture: LectureResponse | null;
	quiz: QuizQuestion[] | null;
	answers: (number | null)[];
	evaluation: EvaluationResponse | null;
	loading: boolean;
	error: string | null;
	thinking: string;
	responseText: string;
}

const initialState: LearningSession = {
	phase: 'topic',
	topic: '',
	lecture: null,
	quiz: null,
	answers: [],
	evaluation: null,
	loading: false,
	error: null,
	thinking: '',
	responseText: ''
};

export const learningStore = writable<LearningSession>(initialState);

export function resetSession() {
	learningStore.set(initialState);
}

export function setPhase(phase: Phase) {
	learningStore.update((state) => ({ ...state, phase }));
}

export function setTopic(topic: string) {
	learningStore.update((state) => ({ ...state, topic }));
}

export function setLecture(lecture: LectureResponse) {
	learningStore.update((state) => ({ ...state, lecture }));
}

export function setQuiz(quiz: QuizQuestion[]) {
	learningStore.update((state) => ({
		...state,
		quiz,
		answers: new Array(quiz.length).fill(null)
	}));
}

export function setAnswer(questionIndex: number, answerIndex: number) {
	learningStore.update((state) => {
		const newAnswers = [...state.answers];
		newAnswers[questionIndex] = answerIndex;
		return { ...state, answers: newAnswers };
	});
}

export function setEvaluation(evaluation: EvaluationResponse) {
	learningStore.update((state) => ({ ...state, evaluation }));
}

export function setLoading(loading: boolean) {
	learningStore.update((state) => ({ ...state, loading }));
}

export function setError(error: string | null) {
	learningStore.update((state) => ({ ...state, error }));
}

export function setThinking(thinking: string) {
	learningStore.update((state) => ({ ...state, thinking }));
}

export function appendThinking(content: string) {
	learningStore.update((state) => ({ ...state, thinking: state.thinking + content }));
}

export function setResponseText(responseText: string) {
	learningStore.update((state) => ({ ...state, responseText }));
}

export function appendResponseText(content: string) {
	learningStore.update((state) => ({ ...state, responseText: state.responseText + content }));
}

export function clearProgress() {
	learningStore.update((state) => ({ ...state, thinking: '', responseText: '' }));
}
