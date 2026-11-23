import { writable } from 'svelte/store';

export interface ApiKeyStore {
	key: string;
	isSet: boolean;
}

const initialState: ApiKeyStore = {
	key: '',
	isSet: false
};

export const apiKeyStore = writable<ApiKeyStore>(initialState);

export function setApiKey(key: string) {
	const trimmedKey = key.trim();
	apiKeyStore.set({
		key: trimmedKey,
		isSet: trimmedKey.length > 0
	});
	// Store in localStorage for persistence
	if (trimmedKey) {
		localStorage.setItem('anthropic_api_key', trimmedKey);
	}
}

export function loadApiKeyFromStorage() {
	const storedKey = localStorage.getItem('anthropic_api_key');
	if (storedKey) {
		apiKeyStore.set({
			key: storedKey,
			isSet: true
		});
	}
}

export function clearApiKey() {
	apiKeyStore.set(initialState);
	localStorage.removeItem('anthropic_api_key');
}
