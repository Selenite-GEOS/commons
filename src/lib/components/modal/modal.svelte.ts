import type { Component, Snippet, SvelteComponent } from 'svelte';

type ButtonLevel = 'primary' | 'secondary' | 'danger' | 'neutral' | 'warning';

export type ModalButton = {
	level?: ButtonLevel;
	label: string;
	description?: string;
	onclick: () => void;
};
export const modalButtonTypes = ['cancel', 'promptConfirm', 'close', 'submit'] as const;
export type ModalButtonType = (typeof modalButtonTypes)[number];
export type ModalButtonSettings =
	| ModalButton
	| ModalButtonType
	| ({ type: ModalButtonType } & Partial<ModalButton>)
	| { formId: string };
export type BaseModalSettings = {
	divider?: boolean;
	title?: string | Snippet;
	buttons?: ModalButtonSettings[];
	response?: (r: unknown) => void;
};
type Props = Record<string, unknown>;
export type ComponentModalSettings<P extends Props = Props> = {
	component: Component<P & { modal: ComponentModalSettings }, { getResponse?: () => unknown }>;
	props: P;
} & BaseModalSettings;

export type SnippetModalSettings<P extends Props = Props> = {
	snippet: Snippet<[P]>;
	props: P;
} & BaseModalSettings;

export type PromptModalSettings = { prompt: string; initial?: string } & BaseModalSettings;

export type ModalSettings<P extends Props = Props> =
	| PromptModalSettings
	| ComponentModalSettings<P>
	| SnippetModalSettings<P>;

export function isComponentModalSettings<P extends Props>(
	modal: ModalSettings<P>
): modal is ComponentModalSettings<P> {
	return 'component' in modal;
}
export function isSnippetModalSettings<P extends Props>(
	modal: ModalSettings<P>
): modal is SnippetModalSettings<P> {
	return 'snippet' in modal;
}

export function isPromptModalSettings(modal: ModalSettings): modal is PromptModalSettings {
	return 'prompt' in modal;
}

export function modalButtonTypeToButton(type: ModalButtonType): ModalButton {
	switch (type) {
		case 'cancel':
			return {
				label: 'Cancel',
				onclick: () => modals.close()
			};
		case 'close':
			return {
				label: 'Close',
				level: 'neutral',
				onclick: () => modals.close()
			};
		case 'submit':
			return {
				label: 'Submit',
				level: 'primary',
				onclick: async () => {
					const contentContainer = Modal.instance.contentContainer;
					if (contentContainer) {
						const forms = contentContainer.querySelectorAll('form');
						for (const form of forms) if (!form.reportValidity()) return;
					}
					const r = await Modal.instance.childComponent?.getResponse?.();
					Modal.instance.lastModal?.response?.(r);
					modals.close();
				}
			};
		case 'promptConfirm':
			return {
				label: 'Confirm',
				level: 'primary',
				onclick: () => {
					Modal.instance.lastModal?.response?.(Modal.instance.promptInput?.value);
					modals.close();
				}
			};
	}
}

/**
 * Singleton that manages modals.
 *
 * The singleton can be accessed with `Modal.instance`.
 */
export class Modal {
	static #instance: Modal | undefined;
	static get instance(): Modal {
		if (!this.#instance) {
			this.#instance = new Modal();
		}
		return this.#instance;
	}

	queue: ModalSettings[] = $state([]);

	lastModal = $derived(this.queue.at(-1));

	promptInput = $state<HTMLInputElement>();

	contentContainer = $state<HTMLElement>();

	childComponent = $state<SvelteComponent & { getResponse?: () => Promise<unknown> | unknown }>();

	resolvedButtons: ModalButton[] | undefined = $derived(
		this.lastModal?.buttons === undefined
			? undefined
			: this.lastModal.buttons.map((btn) => {
					if (typeof btn === 'string') {
						return modalButtonTypeToButton(btn);
					}
					if ('type' in btn) {
						return {
							...modalButtonTypeToButton(btn.type),
							...btn
						};
					}

					if ('formId' in btn) {
						return {
							label: 'Submit',
							level: 'primary',
							onclick: () => {
								const form = document.getElementById(btn.formId) as HTMLFormElement;
								if (form) {
									form.requestSubmit();
								}
							}
						};
					}
					return btn;
				})
	);

	private constructor() {}

	show<P extends Props>(params: ModalSettings<P>) {
		console.debug('Show modal', params);
		if ('prompt' in params) {
			params.buttons = params.buttons || ['cancel', 'promptConfirm'];
			params.title = params.title || params.prompt;
		}
		this.queue.push(params as unknown as ModalSettings);
	}

	close() {
		console.debug('Close modal');
		this.queue.pop();
	}
}

export const modals = Modal.instance;
