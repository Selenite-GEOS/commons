export type EventModifier<E extends Event = Event> = (e: E) => E

export const stopPropagation: EventModifier = (e) => {
	e.stopPropagation();
	return e
}

export const preventDefault: EventModifier = (e) => {
	e.preventDefault();
	return e
}