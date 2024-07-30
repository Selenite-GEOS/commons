import { describe, it, expect } from 'vitest';
import * as String from './string';

describe('string utils', () => {
	describe('splitCamelcase', () => {
		it('should split camelcase strings', () => {
			expect(String.splitCamelCase('helloWorld')).toEqual(['hello', 'World']);
		});
		it('should handle multiple capital letters in a row', () => {
			expect(String.splitCamelCase('helloWORLD')).toEqual(['hello', 'WORLD']);
		});
		it('should handle multiple capital letters in a row followed by a word', () => {
			expect(String.splitCamelCase('helloNEWWorld')).toEqual(['hello', 'NEW', 'World']);
		});
		it('should split camelcase strings which start with a cap', () => {
			expect(String.splitCamelCase('HelloNEWWorld')).toEqual(['Hello', 'NEW', 'World']);
		});
        it('should return empty array for empty strings', () => {
            expect(String.splitCamelCase('')).toEqual([]);
        })
	});
});
