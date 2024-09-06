import { describe, it, expect } from 'vitest';
import * as String from './string';
const avatar =
	"I'm blown away\n\
Like a layer of dust on the floor\n\
Of the hall where we first met\n\
Trust was the first thing we lost that day";
describe('string utils', () => {
	describe('capitalize', () => {
		it('should capitalize strings', () => {
			expect(String.capitalize('hello')).toBe('Hello');
		});
		it('should handle empty strings', () => {
			expect(String.capitalize('')).toBe('');
		});
		it('should handle strings with spaces', () => {
			expect(String.capitalize('hello world')).toBe('Hello world');
		});
	});
	describe('capitalize words', () => {
		it('should capitalize words', () => {
			expect(String.capitalizeWords('hello world')).toBe('Hello World');
		});
		it('should handle empty strings', () => {
			expect(String.capitalizeWords('')).toBe('');
		});
	});
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
		it('should handle strings with spaces', () => {
			expect(String.splitCamelCase('hey myBoy   MyLove')).toEqual([
				'hey',
				'my',
				'Boy',
				'My',
				'Love'
			]);
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

	describe('camelcaseize', () => {
		it('should camelcaseize strings', () => {
			expect(String.camlelcaseize('hello world')).toBe('helloWorld');
		});
		it('should handle all acronyms', () => {
			expect(String.camlelcaseize('VTK')).toBe('vtk');
		});
		it('should handle acronyms', () => {
			expect(String.camlelcaseize('VTKMesh')).toBe('vtkMesh');
		});
		it('should handle partial camelcase', () => {
			expect(String.camlelcaseize('helloDarling myWorld')).toBe('helloDarlingMyWorld');
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
		it('can return pluralized result', () => {
			expect(
				String.getSharedString(['who let the dog out', 'beware scary dog out there'], {
					pluralize: true
				})
			).toBe('dog outs');
		});
		it('can return pluralized camelcase result', () => {
			expect(
				String.getSharedString(['who let the dog out', 'beware scary dog out there'], {
					pluralize: true,
					camelcase: true
				})
			).toBe('dogOuts');
		});
	});

	describe('matchingParts', () => {
		const matchingParts = String.matchingParts;
		it('should return one matching part', () => {
			expect(matchingParts('hello world', 'world')).toEqual([
				{ part: 'hello ', match: false },
				{ part: 'world', match: true }
			]);
		});
		it('should return two matching parts', () => {
			expect(matchingParts('world helloworld', 'world')).toEqual([
				{ part: 'world', match: true },
				{ part: ' hello', match: false },
				{ part: 'world', match: true }
			]);
		});
		it('should return one matching part with no case sensitivity', () => {
			expect(matchingParts('hello world', 'WORLD', { caseInsensitive: true })).toEqual([
				{ part: 'hello ', match: false },
				{ part: 'world', match: true }
			]);
		});
		it('should handle multi lines', () => {
			expect(matchingParts('hello\nworld', 'world')).toEqual([
				{ part: 'hello\n', match: false },
				{ part: 'world', match: true }
			]);
		});
		it('should handle no matching parts', () => {
			expect(matchingParts('hello world', 'planet')).toEqual([
				{ part: 'hello world', match: false }
			]);
		});
		it('should handle no matching parts multiline', () => {
			expect(matchingParts('hello\nworld', 'planet')).toEqual([
				{ part: 'hello\nworld', match: false }
			]);
		});
		it('should handle avatar', () => {
			expect(matchingParts(avatar, 'avatar')).toEqual([{ part: avatar, match: false }]);
			expect(matchingParts(avatar, '')).toEqual([{ part: avatar, match: false }]);
		});
		it('should handle backslashes', () => {
			expect(matchingParts('hello\\n world\\', 'world\\')).toEqual([
				{ part: 'hello\\n ', match: false },
				{ part: 'world\\', match: true }
			]);
		})
	});
});
