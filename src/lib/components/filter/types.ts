import type { HTMLInputAttributes } from "svelte/elements";

export interface Filter<T> {
	key: keyof T;
	value: unknown;
    active: boolean;
}

export type FilterDefinition<T> = {
	key: keyof T;
	type?: HTMLInputAttributes['type'];
}
