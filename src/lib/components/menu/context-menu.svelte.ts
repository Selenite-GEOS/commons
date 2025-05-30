// import type { ShowContextMenu } from '$graph-editor/plugins/context-menu';

import type { Position } from '$lib/utils';
import type { MenuItem } from './types';

/**
 * This class is a singleton that represents the state of the context menu.
 *
 * It autohides based on the hovered state and filters items based on a query.
 */
export class ContextMenuState {
	triggerFirstItem() {
		this.triggerItem(0);
	}
	triggerItem(i: number) {
		const item = this.filteredItems.at(i);
		if (!item) {
			console.warn(`Tried to trigger a non existing item at ${i}.`);
			return;
		}
		item.action();
		this.visible = false;
	}
	/** Singleton instance */
	static #instance: ContextMenuState;

	/** Returns the singleton instance. */
	static get instance() {
		if (!this.#instance) {
			this.#instance = new ContextMenuState();
		}
		return this.#instance;
	}

	target = $state<HTMLElement>();

	/** Position of the menu, in client coordinates. */
	pos = $state<Position>({ x: 0, y: 0 });

	minHeight = $state<number>();
	minWidth = $state<number>();

	/** Visibility of the menu. */
	#visible = $state(false);

	get visible() {
		return this.#visible;
	}
	set visible(v: boolean) {
		this.#visible = v;
		if (!v) {
			if (this.onHide) {
				this.onHide();
				this.onHide = undefined;
			}
			this.minHeight = undefined;
			this.minWidth = undefined;
			this.query = '';
			this.target = undefined;
			this.expanded = false;
		}
	}

	/** Delay before hiding menu in miliseconds. */
	hidingDelay = $state(100);

	/** Visibility of the searchbar. */
	searchbar = $state(false);

	onHide = $state<() => void>();

	/** Items of the menu. */
	items = $state<MenuItem[]>([]);

	/** Is menu fully expanded */
	expanded = $state(false);

	/** Query string to filter items. */
	#query = $state('');
	get query() {
		return this.#query;
	}
	set query(q: string) {
		this.#query = q.trim();
		this.expanded = q.trim() !== '';
	}

	sort = $state(false);

	/** Filtered items. */
	filteredItems = $derived.by(() => {
		const query = this.query.toLowerCase().trim();
		if (query === '') {
			return this.items;
		}
		// Filter and sort items based on the query
		return (
			this.items
				.map((item) => {
					// Compute a score based on the position of the query in the item
					const repr = [item.label, ...item.tags, ...item.path].map((s) => s.toLowerCase());
					const score = repr.reduce((acc, s) => {
						const pos = s.indexOf(query);
						return acc + (pos === -1 ? 0 : 1 / (pos + 1));
					}, 0);
					return { item, score };
				})
				// Keep only items with a positive score
				.filter(({ score }) => score > 0)
				.sort((a, b) => b.score - a.score)
				.map(({ item }) => item)
		);
	});

	#focused = $state(false);
	get focused() {
		return this.#focused;
	}
	set focused(f: boolean) {
		this.#focused = f;
		// this.updateAutohide();
	}
	/** Is the context menu hovered. */
	#hovered = $state(false);

	/** Timeout to hide the menu. */
	#hideTimeout: NodeJS.Timeout | null = null;

	#autohide = $state(true);

	get autohide() {
		return this.#autohide;
	}

	set autohide(v: boolean) {
		this.#autohide = v;
		this.updateAutohide();
	}

	private updateAutohide() {
		if (this.#hovered || !this.#autohide) {
			if (this.#hideTimeout) {
				clearTimeout(this.#hideTimeout);
				this.#hideTimeout = null;
			}
		} else {
			if (!this.#autohide) {
				return;
			}
			this.#hideTimeout = setTimeout(() => {
				if (!this.#hovered) {
					this.visible = false;
				}
			}, this.hidingDelay);
		}
	}

	/** Sets hovered state and manages autohide. */
	set hovered(v: boolean) {
		this.#hovered = v;
		this.updateAutohide();
	}

	/** Returns hovered state. */
	get hovered() {
		return this.#hovered;
	}

	private constructor() {}
}

export const contextMenu = ContextMenuState.instance;

export type ShowContextMenu = (params: {
	expand?: boolean;
	pos: Position;
	/** Whether to sort the items. Default to false. */
	sort?: boolean;
	items: Partial<MenuItem>[];
	searchbar?: boolean;
	onHide?: () => void;
	autoHide?: boolean;
	target?: HTMLElement;
}) => void;

/**
 * Shows the context menu with the given items at the given position.
 *
 * Helper function to use the context menu singleton.
 */
export const showContextMenu: ShowContextMenu = ({
	items,
	pos,
	sort = false,
	searchbar = false,
	onHide,
	expand = false,
	autoHide: autohide = true,
	target
}) => {
	const menu = ContextMenuState.instance;
	menu.autohide = autohide;
	menu.minHeight = undefined;
	menu.minWidth = undefined;
	menu.target = target;
	menu.expanded = expand;
	menu.visible = true;
	menu.pos = pos;
	menu.sort = sort;
	menu.searchbar = searchbar;
	menu.items = items.map((item, i) => {
		return {
			label: String(i),
			id: String(i),
			description: '',
			action: () => {
				console.warn('Missing action for menu item', item.label ?? String(i));
			},
			path: [],
			tags: [],
			...item
		};
	});
	menu.onHide = onHide;
};
