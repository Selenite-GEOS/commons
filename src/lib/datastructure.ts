export type Point = {
	x: number;
	y: number;
};
export type Vector2D = {
	x: number;
	y: number;
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Vector2D {
	export const Zero = () =>
		({
			x: 0,
			y: 0
		}) as Vector2D;

	/** Adds two vector2D together. */
	export const add = (a: Vector2D, b: Vector2D) =>
		({
			x: a.x + b.x,
			y: a.y + b.y
		}) as Vector2D;

	export const multiply = (a: Vector2D, b: number) =>
		({
			x: a.x * b,
			y: a.y * b
		}) as Vector2D;

	export const divide = (a: Vector2D, b: number) =>
		({
			x: a.x / b,
			y: a.y / b
		}) as Vector2D;

	export const subtract = (a: Vector2D, b: Vector2D) =>
		({
			x: a.x - b.x,
			y: a.y - b.y
		}) as Vector2D;

	export const length = (a: Vector2D) => Math.sqrt(a.x ** 2 + a.y ** 2);

	export const normalize = (a: Vector2D) => divide(a, length(a));

	export const distance = (a: Vector2D, b: Vector2D) => length(subtract(a, b));

	export const dot = (a: Vector2D, b: Vector2D) => a.x * b.x + a.y * b.y;

	export const cross = (a: Vector2D, b: Vector2D) => a.x * b.y - a.y * b.x;

	export const angle = (a: Vector2D, b: Vector2D) => Math.acos(dot(a, b) / (length(a) * length(b)));

	export const rotate = (a: Vector2D, angle: number) =>
		({
			x: a.x * Math.cos(angle) - a.y * Math.sin(angle),
			y: a.x * Math.sin(angle) + a.y * Math.cos(angle)
		}) as Vector2D;
}

export class Queue<T> {
	#inStack: T[] = [];
	#outStack: T[] = [];

	constructor(iterable?: Iterable<T>) {
		if (iterable) this.#inStack.push(...iterable);
	}

	add(e: T) {
		this.#inStack.push(e);
	}

	peek(): T {
		this.handleEmptyOut("Can't peek, queue is empty.");
		return this.#outStack.at(-1)!;
	}

	remove(): T {
		this.handleEmptyOut("Can't remove an element, queue is empty.");
		return this.#outStack.pop()!;
	}

	take(amount: number): T[] {
		const res = [];
		for (let i = 0; i < amount; i++) {
			res.push(this.remove());
		}
		return res;
	}

	takeAll(): T[] {
		return this.take(this.size);
	}

	private handleEmptyOut(errMsg: string) {
		if (this.#outStack.length === 0) {
			this.swapStacks();
		}
		if (this.#outStack.length === 0) {
			throw new Error(errMsg);
		}
	}

	get size() {
		return this.#inStack.length + this.#outStack.length;
	}

	private swapStacks() {
		const mem = this.#outStack;
		this.#outStack = this.#inStack;
		this.#inStack = mem;
		this.#outStack.reverse();
	}
}
