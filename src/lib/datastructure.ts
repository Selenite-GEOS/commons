export type Point=  {
	x: number;
	y: number;
};
export type Vector2D = {
	x: number;
	y: number;
};

export namespace Vector2D {
	export const Zero = () => ({
		x: 0,
		y: 0,
	} as Vector2D);
	
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
		this.handleEmptyOut("Can't peek, queue is empty.")
		return this.#outStack.at(-1)!;
	}

	remove(): T {
        this.handleEmptyOut("Can't remove an element, queue is empty.");
		return this.#outStack.pop()!;
	}

	take(amount: number): T[] {
		const res = []
		for (let i = 0; i < amount; i++) {
			res.push(this.remove())
		}
		return res
	}

	takeAll(): T[] {
		return this.take(this.size)
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
		let mem = this.#outStack;
		this.#outStack = this.#inStack;
		this.#inStack = mem;
		this.#outStack.reverse();
	}
}
