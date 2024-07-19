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

