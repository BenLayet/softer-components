/**
 * Example counter component demonstrating best practices for using
 * the softer-components library with full type safety and composability.
 */

import {
  ComponentDef,
  Event,
  EventCreators,
  createEventCreators,
  createEventChain,
  createMemoizedSelector,
  Selector,
} from './types';

// ============================================================================
// State Definition
// ============================================================================

/**
 * The state shape for our counter component.
 * Keeps state minimal and focused on the component's responsibility.
 */
export interface CounterState {
  readonly value: number;
  readonly step: number;
  readonly isLoading: boolean;
  readonly lastUpdated: number;
  readonly history: readonly number[];
}

/**
 * Initial state for the counter component.
 */
export const initialCounterState: CounterState = {
  value: 0,
  step: 1,
  isLoading: false,
  lastUpdated: Date.now(),
  history: [],
};

// ============================================================================
// Event Definitions
// ============================================================================

/**
 * Map of event types to their payload types.
 * This provides the foundation for type-safe event handling.
 */
export interface CounterEventMap {
  INCREMENT: void;
  DECREMENT: void;
  SET_VALUE: number;
  SET_STEP: number;
  RESET: void;
  START_LOADING: void;
  STOP_LOADING: void;
  ADD_TO_HISTORY: number;
}

/**
 * Union type of all counter events.
 * This ensures type safety when handling events in the reducer.
 */
export type CounterEvent = {
  [K in keyof CounterEventMap]: Event<CounterEventMap[K]>;
}[keyof CounterEventMap];

/**
 * Event creators for all counter events.
 * These provide a type-safe way to create events.
 */
export const counterEvents: EventCreators<CounterEventMap> = createEventCreators([
  'INCREMENT',
  'DECREMENT',
  'SET_VALUE',
  'SET_STEP',
  'RESET',
  'START_LOADING',
  'STOP_LOADING',
  'ADD_TO_HISTORY',
]);

// ============================================================================
// Reducer Implementation
// ============================================================================

/**
 * Pure reducer function that handles all counter events.
 * Each case handles a specific event type and returns a new state.
 */
export function counterReducer(
  state: CounterState,
  event: CounterEvent
): CounterState {
  const baseUpdate = {
    lastUpdated: Date.now(),
  };

  switch (event.type) {
    case 'INCREMENT':
      return {
        ...state,
        ...baseUpdate,
        value: state.value + state.step,
      };

    case 'DECREMENT':
      return {
        ...state,
        ...baseUpdate,
        value: state.value - state.step,
      };

    case 'SET_VALUE':
      return {
        ...state,
        ...baseUpdate,
        value: event.payload as number,
      };

    case 'SET_STEP':
      return {
        ...state,
        ...baseUpdate,
        step: Math.max(1, event.payload as number), // Ensure step is always positive
      };

    case 'RESET':
      return {
        ...initialCounterState,
        lastUpdated: Date.now(),
      };

    case 'START_LOADING':
      return {
        ...state,
        ...baseUpdate,
        isLoading: true,
      };

    case 'STOP_LOADING':
      return {
        ...state,
        ...baseUpdate,
        isLoading: false,
      };

    case 'ADD_TO_HISTORY':
      return {
        ...state,
        ...baseUpdate,
        history: [...state.history, event.payload as number].slice(-10), // Keep last 10 entries
      };

    default:
      return state;
  }
}

// ============================================================================
// Selectors
// ============================================================================

/**
 * Basic selectors for accessing counter state.
 * These provide a clean interface for reading state values.
 */
export const counterSelectors = {
  /**
   * Get the current counter value.
   */
  getValue: (state: CounterState): number => state.value,

  /**
   * Get the current step size.
   */
  getStep: (state: CounterState): number => state.step,

  /**
   * Check if the counter is currently loading.
   */
  getIsLoading: (state: CounterState): boolean => state.isLoading,

  /**
   * Get the timestamp of the last update.
   */
  getLastUpdated: (state: CounterState): number => state.lastUpdated,

  /**
   * Get the value history.
   */
  getHistory: (state: CounterState): readonly number[] => state.history,

  /**
   * Get the current value formatted as a string.
   */
  getFormattedValue: createMemoizedSelector(
    (state: CounterState): string => {
      return new Intl.NumberFormat().format(state.value);
    }
  ),

  /**
   * Check if the counter is at zero.
   */
  isAtZero: createMemoizedSelector(
    (state: CounterState): boolean => state.value === 0
  ),

  /**
   * Check if the counter is positive.
   */
  isPositive: createMemoizedSelector(
    (state: CounterState): boolean => state.value > 0
  ),

  /**
   * Check if the counter is negative.
   */
  isNegative: createMemoizedSelector(
    (state: CounterState): boolean => state.value < 0
  ),

  /**
   * Get statistics about the counter history.
   */
  getHistoryStats: createMemoizedSelector(
    (state: CounterState): { min: number; max: number; average: number } | null => {
      if (state.history.length === 0) {
        return null;
      }
      
      const min = Math.min(...state.history);
      const max = Math.max(...state.history);
      const average = state.history.reduce((sum, val) => sum + val, 0) / state.history.length;
      
      return { min, max, average };
    }
  ),
};

// ============================================================================
// Component Definition
// ============================================================================

/**
 * Complete counter component definition.
 * This ties together all aspects of the counter component.
 */
export const counterComponent: ComponentDef<
  CounterState,
  CounterEvent,
  typeof counterSelectors
> = {
  name: 'counter',
  initialState: initialCounterState,
  reducer: counterReducer,
  selectors: counterSelectors,
  eventHandling: {
    supportedEvents: [
      'INCREMENT',
      'DECREMENT',
      'SET_VALUE',
      'SET_STEP',
      'RESET',
      'START_LOADING',
      'STOP_LOADING',
      'ADD_TO_HISTORY',
    ],
    chainSupport: true,
    middleware: [],
  },
  metadata: {
    version: '1.0.0',
    description: 'A simple counter component with history tracking',
    dependencies: [],
  },
};

// ============================================================================
// Complex Event Chains
// ============================================================================

/**
 * Example event chains that demonstrate complex operations.
 * These show how multiple events can be composed to create higher-level operations.
 */
export const counterEventChains = {
  /**
   * Increments the counter and adds the new value to history.
   */
  incrementWithHistory: () => createEventChain([
    counterEvents.INCREMENT(),
    counterEvents.ADD_TO_HISTORY(0), // Will be replaced with actual value in middleware
  ], {
    id: 'increment-with-history',
    source: 'counterEventChains',
  }),

  /**
   * Performs an async-like operation with loading states.
   */
  asyncIncrement: () => createEventChain([
    counterEvents.START_LOADING(),
    // In a real scenario, you would use middleware to handle the delay
    counterEvents.INCREMENT(),
    counterEvents.STOP_LOADING(),
    counterEvents.ADD_TO_HISTORY(0), // Will be replaced with actual value
  ], {
    id: 'async-increment',
    source: 'counterEventChains',
  }),

  /**
   * Resets the counter and sets a new step size.
   */
  resetWithNewStep: (newStep: number) => createEventChain([
    counterEvents.RESET(),
    counterEvents.SET_STEP(newStep),
  ], {
    id: 'reset-with-new-step',
    source: 'counterEventChains',
  }),

  /**
   * Performs multiple increments in sequence.
   */
  multipleIncrements: (count: number) => createEventChain(
    Array(count).fill(null).map(() => counterEvents.INCREMENT()),
    {
      id: 'multiple-increments',
      source: 'counterEventChains',
    }
  ),
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Utility functions for working with the counter component.
 * These demonstrate common patterns and best practices.
 */
export const counterUtils = {
  /**
   * Creates a selector that compares the current value to a target.
   */
  createValueComparison: (target: number): Selector<CounterState, { 
    isEqual: boolean; 
    difference: number; 
    percentage: number; 
  }> => {
    return createMemoizedSelector((state: CounterState) => ({
      isEqual: state.value === target,
      difference: state.value - target,
      percentage: target === 0 ? 0 : ((state.value - target) / target) * 100,
    }));
  },

  /**
   * Creates an event to set the counter to a specific value and record it in history.
   */
  setValueWithHistory: (value: number) => createEventChain([
    counterEvents.SET_VALUE(value),
    counterEvents.ADD_TO_HISTORY(value),
  ], {
    id: 'set-value-with-history',
    source: 'counterUtils',
  }),

  /**
   * Validates that a counter state is in a valid condition.
   */
  validateState: (state: CounterState): boolean => {
    return (
      typeof state.value === 'number' &&
      typeof state.step === 'number' &&
      state.step > 0 &&
      typeof state.isLoading === 'boolean' &&
      typeof state.lastUpdated === 'number' &&
      Array.isArray(state.history) &&
      state.history.every(val => typeof val === 'number')
    );
  },
};

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Export helper types for external consumption.
 */
export type CounterComponentDef = typeof counterComponent;
export type CounterSelectors = typeof counterSelectors;
export type CounterEventCreators = typeof counterEvents;