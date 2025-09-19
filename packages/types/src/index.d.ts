/**
 * Core types for state-manager-agnostic component definitions.
 * These types fournissent la base pour des composants réutilisables et composables,
 * compatibles avec tout gestionnaire d’état.
 */

export interface Event<TPayload = any> {
	readonly type: string;
	readonly payload: TPayload;
}

export type EventCreator<TPayload = void> = TPayload extends void
	? () => Event<undefined>
	: (payload: TPayload) => Event<TPayload>;

export type Reducer<TState, TEvent extends Event = Event> = (
	state: TState,
	event: TEvent
) => TState;

export type Selector<TState, TResult = any> = (state: TState) => TResult;

export interface EventChain<TEvent extends Event = Event> {
	readonly events: readonly TEvent[];
	readonly metadata?: {
		readonly id?: string;
		readonly timestamp?: number;
		readonly source?: string;
	};
}

export interface EventHandling<TEvent extends Event = Event> {
	readonly supportedEvents: readonly string[];
	readonly chainSupport?: boolean;
}

/**
 * Définit un composant réutilisable, typé et composable.
 * Le champ `name` est désormais dans `metadata` pour :
 *   - l’identification unique du composant dans des outils, logs, ou pour la composition dynamique
 *   - la génération de clés de stockage ou de sous-états dans des contextes multi-composants
 *   - la traçabilité et le debug (affichage dans les DevTools, logs, etc.)
 * Il n’est pas utilisé à l’exécution par la librairie, mais fortement utile pour l’écosystème et l’intégration.
 */
export interface ComponentDef<
	TState = any,
	TEvent extends Event = Event,
	TSelectors = Record<string, Selector<TState>>
> {
	readonly initialState: TState;
	readonly reducer: Reducer<TState, TEvent>;
	readonly selectors: TSelectors;
	readonly eventHandling: EventHandling<TEvent>;
	readonly metadata?: {
		/**
		 * Nom unique du composant pour l’identification, la traçabilité, la génération de clés, etc.
		 */
		readonly name?: string;
		readonly version?: string;
		readonly description?: string;
		readonly dependencies?: readonly string[];
	};
}

export type ComponentState<T> = T extends ComponentDef<infer TState, any, any>
	? TState
	: never;

export type ComponentEvent<T> = T extends ComponentDef<any, infer TEvent, any>
	? TEvent
	: never;

export type ComponentSelectors<T> = T extends ComponentDef<any, any, infer TSelectors>
	? TSelectors
	: never;

export type EventCreators<TEventMap extends Record<string, any>> = {
	readonly [K in keyof TEventMap]: EventCreator<TEventMap[K]>;
};
