/**
 * Core types for state-manager-agnostic component definitions.
 * These types provide the foundation for reusable and composable components,
 * compatible with any state manager.
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
 * Defines a reusable, typed, and composable component.
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
