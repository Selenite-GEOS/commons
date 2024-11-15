/**
 * String utils for common string manipulation.
 *
 * Examples are {@link capitalize} and {@link splitCamelCase}....
 * @module
 */

// polyfill for set intersection
import 'core-js/actual/set/intersection';
import { escapeRegExp, upperFirst } from 'lodash-es';

// Can't export pluralize functions directly
// because pluralize is common js
import pluralizePackage from 'pluralize';
const pluralize = pluralizePackage;
const { singular, isPlural, isSingular, plural } = pluralizePackage;
export { singular, isPlural, isSingular, plural, pluralize };

export function capitalize(str: string): string {
	return upperFirst(str);
}

export function capitalizeWords(str: string): string {
	return str.split(' ').map(upperFirst).join(' ');
}

export function isAlphaNumChar(str: string) {
	return /^[a-z0-9]$/i.test(str);
}

export const words = capitalizeWords;

// split on capital letters that are followed by non capital letters or
// preceded by non capital letters
// and join with spaces
export function titlelize(str: string): string {
	return str
		.split(/(?=(?<=[^A-Z])[A-Z])/)

		.map(capitalize)
		.join(' ');
}

// returns the first two capital letters of a string or the first two letters if there is not enough capital letters
export function initials(str: string): string {
	str = capitalizeWords(str);
	const capitalLetters = str.match(/^([A-Z])(?:\S*?\s+|\S*?)([A-Z])/);
	if (capitalLetters == null) {
		return str.slice(0, 2);
	}

	return capitalLetters[1] + capitalLetters[2];
}

// export function titlelize(str: string): string {
// 	return str
// 		.split(/(?=[A-Z])/)
// 		.map(capitalize)
// 		.join(' ');
// }

/** Transforms a string into CamelCase. */
export function camlelcaseize(str: string): string {
	const capitalized = str
		.split(' ')
		.map((s, i) => {
			if (i === 0) {
				const pieces = splitCamelCase(s);
				if (pieces.length > 0) {
					pieces[0] = pieces[0].toLowerCase();
				}
				return pieces.join('');
			}
			return upperFirst(s);
		})
		.join('');
	return capitalized;
}
/** Transforms a Camelcase string into a normal space seperated string. */
export function unCamelCase(str: string): string {
	return splitCamelCase(str).join(' ');
}

function isWhitespaceChar(c: string) {
	return (
		c === ' ' ||
		c === '\n' ||
		c === '\t' ||
		c === '\r' ||
		c === '\f' ||
		c === '\v' ||
		c === '\u00a0' ||
		c === '\u1680' ||
		c === '\u2000' ||
		c === '\u200a' ||
		c === '\u2028' ||
		c === '\u2029' ||
		c === '\u202f' ||
		c === '\u205f' ||
		c === '\u3000' ||
		c === '\ufeff'
	);
}

/**
 * Splits a camel case string into an array of words.
 * @param str Camel case string to split.
 * @returns Array of words.
 */
export function splitCamelCase(str: string): string[] {
	const res: string[] = [];

	let i = 0;
	let nextCapIsWordStart = false;
	let nextLowerAfterCapIsWordEnd = false;
	for (let j = 0; j < str.length; j++) {
		const c = str[j];

		// Whitespace
		if (isWhitespaceChar(c)) {
			if (nextCapIsWordStart) {
				res.push(str.slice(i, j));
				nextCapIsWordStart = false;
			}
			i = j + 1;
			continue;
		}

		// Lowercase letter
		if (c === c.toLowerCase()) {
			if (!isNaN(parseInt(c))) continue;
			nextCapIsWordStart = true;
			if (nextLowerAfterCapIsWordEnd) {
				const k = j - 1;
				if (k - i > 0) {
					nextLowerAfterCapIsWordEnd = false;
					res.push(str.slice(i, k));
					i = k;
				}
			}
			nextLowerAfterCapIsWordEnd = false;
		}
		// Uppercase letter
		else {
			nextLowerAfterCapIsWordEnd = true;
			if (nextCapIsWordStart) {
				res.push(str.slice(i, j));
				i = j;
				nextCapIsWordStart = false;
			}
		}
	}

	if (i < str.length) {
		res.push(str.slice(i));
	}

	return res;
}

/**
 * Turns an array of strings into an array of their shared words.
 * @param strings
 */
export function getSharedWords(strings: string[]): string[];
/**
 * Turns an words of strings into an array of their shared words.
 * @param stringsWords
 */
export function getSharedWords(stringsWords: string[][]): string[];

/** @ignore */
export function getSharedWords(strings: string[][] | string[]): string[] {
	if (strings.length === 0) return [];
	let stringsWords: string[][];
	if (!Array.isArray(strings[0])) {
		stringsWords = (strings as string[]).map((s) =>
			s
				.split(' ')
				.flatMap(splitCamelCase)
				.map((s) => singular(s))
		);
	} else {
		stringsWords = strings as string[][];
	}

	let res = new Set(stringsWords[0]);

	for (const [i, words] of stringsWords.entries()) {
		if (i === 0) continue;

		res = res.intersection(new Set(words));
	}
	return Array.from(res);
}

export function getSharedString(
	strings: string[] | string[][],
	options: { camelcase?: boolean; pluralize?: boolean } = {}
): string {
	const words = getSharedWords(strings as string[][]);
	let res: string;
	if (options.camelcase) {
		if (words.length === 0) return '';
		const firstWord = words.splice(0, 1)[0];
		res = words.reduce((acc, s) => acc + upperFirst(s), firstWord);
	} else {
		res = words.join(' ');
	}
	return options.pluralize ? plural(res) : res;
}
export function getVarsFromFormatString(formatString: string): string[] {
	// return all matches of the regex
	return Array.from(formatString.matchAll(/{(\w+).*?}/g)).map((match) => match[1]);
}

export function matchingParts(
	s: string,
	ref: string,
	options: { caseInsensitive?: boolean } = {}
): { part: string; match: boolean }[] {
	let flags = 's';
	if (options.caseInsensitive) {
		flags += 'i';
	}
	const re = new RegExp(`(.*?)(${escapeRegExp(ref)})`, flags);

	let remainder = s;
	const res: ReturnType<typeof matchingParts> = [];
	let match: RegExpExecArray | null;

	while ((match = re.exec(remainder))) {
		if (match[0].length === 0) break;
		if (match[1])
			res.push({
				part: match[1],
				match: false
			});
		res.push({
			part: match[2],
			match: true
		});
		remainder = remainder.slice(match[0].length);
	}
	if (remainder)
		res.push({
			part: remainder,
			match: false
		});
	return res;
}
