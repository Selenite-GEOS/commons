import { expect, describe, it } from 'vitest';
import { preventDefault, stopPropagation } from './eventModifier';

describe('eventModifier', () => {
	describe('preventDefault', () => {
		it('should prevent default on cancelable events', () => {
			let e = new Event('test', { cancelable: true });
			expect(e.defaultPrevented).toBe(false);
			e = preventDefault(e);
			expect(e.defaultPrevented).toBe(true);
		});
	});
	describe('stopPropagation', () => {
		it('should stop propagation', () => {
			// Must redefine Event.prototype.stopPropagation to spy on it
			// for testing
			let nativeStopPropagationCalled = false;
			const nativeStopPropagation = Event.prototype.stopPropagation;

			Event.prototype.stopPropagation = function () {
				nativeStopPropagation.call(this);
				nativeStopPropagationCalled = true;
			};

			const e = new Event('test');
			expect(nativeStopPropagationCalled);
			stopPropagation(e);
			expect(nativeStopPropagationCalled).toBe(true);
			Event.prototype.stopPropagation = nativeStopPropagation;
		});
	});
});
