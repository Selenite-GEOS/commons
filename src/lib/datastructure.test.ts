import { describe, test, expect } from 'vitest';
import { Queue } from './datastructure';

describe('datastructures', () => {
	describe('queue', () => {
        test('queue sizes should be valid', () => {
            const queue = new Queue<number>()
            expect(queue.size).toBe(0)
            queue.add(1)
            expect(queue.size).toBe(1)
            queue.add(2)
            expect(queue.size).toBe(2)
            queue.remove()
            expect(queue.size).toBe(1)
            queue.remove()
            expect(queue.size).toBe(0)
        })
		test('should be FIFO', () => {
			const queue = new Queue([1, 2, 3]);
			let res: number[] = [];
            let c = 0
			while (queue.size > 0) {
                c++
                if (c > 3) {
                    throw new Error("Too many iterations.")
                }
				res.push(queue.remove());
			}
			expect(res).toEqual([1, 2, 3]);
		});
		test('should error on peek empty queue', () => {
			const queue = new Queue();
			expect(() => queue.peek()).toThrowError("Can't peek, queue is empty.");
		});
        test('should error on remove empty queue', () => {
			const queue = new Queue();
			expect(() => queue.remove()).toThrowError("Can't remove an element, queue is empty.");
		})
		test('peek should return first element without changing queue', () => {
			const queue = new Queue([1, 2, 3]);
			expect(queue.peek()).toBe(1);
			expect(queue.size).toBe(3);
		});
		test('pop should remove first element and return it', () => {
			const queue = new Queue([1, 2, 3]);
			expect(queue.remove()).toBe(1);
			expect(queue.size).toBe(2);
		});
		test('take should take the right number of elements', () => {
			const queue = new Queue([1,2,3])
			expect(queue.take(2)).toEqual([1,2])
			expect(queue.size).toBe(1)
		})
		test('take all should take all elements', () => {
			const queue = new Queue([1,2,3])
			expect(queue.takeAll()).toEqual([1,2,3])
			expect(queue.size).toBe(0)
		})
	});
});
