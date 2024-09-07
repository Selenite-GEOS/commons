/**
 * Frequently used types and type helpers for TypeScript.
 * @module
 */

/**
 * Make selected properties in T optional.
 * @typeParam T - The type to make partial.
 * @typeParam K - The keys of T to make optional.
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Get the return type of the toJSON method of an object.
 * @typeParam T - The object type.
 */
export type SaveData<T extends { toJSON: () => unknown }> = ReturnType<T['toJSON']>;


export type ArrayKeys<T> = { [K in keyof T]: T[K] extends unknown[] ? K : never }[keyof T];