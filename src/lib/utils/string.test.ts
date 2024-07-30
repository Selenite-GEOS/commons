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
		it('should handle number between upper chars', () => {
			expect(String.splitCamelCase('iLoveH2OInDesert')).toEqual([
				'i',
				'Love',
				'H2O',
				'In',
				'Desert'
			]);
		});
		it('should handle numbers between upper chars', () => {
			expect(String.splitCamelCase('iLoveH22OInDesert')).toEqual([
				'i',
				'Love',
				'H22O',
				'In',
				'Desert'
			]);
		});
		it('should handle numbers between lower chars', () => {
			expect(String.splitCamelCase('r22d22Robot')).toEqual(['r22d22', 'Robot']);
		});
		it('should split camelcase strings which start with a cap', () => {
			expect(String.splitCamelCase('HelloNEWWorld')).toEqual(['Hello', 'NEW', 'World']);
		});
		it('should return empty array for empty strings', () => {
			expect(String.splitCamelCase('')).toEqual([]);
		});
	});
	describe('getSharedWords', () => {
		it(`should return empty array on empty strings' words`, () => {
			expect(String.getSharedWords([])).toEqual([]);
		});
		it('should get shared words', () => {
			expect(
				String.getSharedWords([
					['beautiful', 'hello', 'world'],
					['beautiful', 'world', 'in', 'space']
				])
			).toEqual(['beautiful', 'world']);
		});
		it('should get shared words from strings', () => {
			expect(String.getSharedWords(['beautiful hello World', 'beautifulWorldsInSpace'])).toEqual([
				'beautiful',
				'World'
			]);
		});
	});
	describe('getSharedString', () => {
		it('should return shared string', () => {
			expect(String.getSharedString(['beautiful hello World', 'beautifulWorldsInSpace'])).toEqual(
				'beautiful World'
			);
		});
		it('can return camelcase shared string', () => {
			expect(
				String.getSharedString(['beautiful hello world', 'beautiful worlds inSpace'], {
					camelcase: true
				})
			).toEqual('beautifulWorld');
		});
	});
});
