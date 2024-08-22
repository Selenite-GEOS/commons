/**
 * Utils for working with promises.
 *
 * Promises are used in JavaScript to handle asynchronous operations. They are a way to handle the result of an asynchronous operation once it completes.
 *
 * You can await the completion of a promise using the `await` keyword. This will pause the execution of the current function until the promise resolves.
 * @module
 */

/**
 * Returns a promise that resolves after a delay.
 * @param ms - the number of miliseconds to wait before resolving the promise. Defaults to 0.
 * @returns Promise that resolves after the specified delay.
 */
export function sleep(ms?: number) {
	return new Promise((r) => setTimeout(r, ms ?? 0));
}

export function animationFrame(n?: number): Promise<void> {
	return new Promise((resolve) => {
		if (typeof requestAnimationFrame === 'undefined') {
			resolve();
			return;
		}
		let count = n ?? 1;

		function rec() {
			if (count <= 0) {
				resolve();
				return;
			}

			count--;
			requestAnimationFrame(rec);
		}
		rec();
	});
}
