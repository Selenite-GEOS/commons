import { describe, it, expect } from 'vitest';
import { localId, uuid } from './ids';

describe('ids', () => {
	describe('localId', () => {
		it('should generate a new local ID', () => {
			expect(localId()).toMatch(/local-unique-id-\d+/);
		});
		it('should generate a new local ID with a prefix', () => {
			expect(localId('test')).toMatch(/test-\d+/);
		});
	});
	describe('uuid', () => {
		it('should generate a new UUID', () => {
			expect(uuid()).toMatch(/[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[\da-f]{4}-[\da-f]{12}/);
		});
		it('should generate a new UUID with a prefix', () => {
			expect(uuid('test')).toMatch(/test-[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[\da-f]{4}-[\da-f]{12}/);
		});
	});
});
