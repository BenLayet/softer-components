# Usage Examples

This document provides practical examples of how to use Softer Components in real-world scenarios.

## Basic Counter Example

```typescript
import { counterComponent, counterEvents } from "softer-components";

// Use the built-in counter component
let state = counterComponent.initialState;
console.log("Initial:", state.value); // 0

// Increment the counter
state = counterComponent.reducer(state, counterEvents.INCREMENT());
console.log("After increment:", state.value); // 1

// Use selectors
const isPositive = counterComponent.selectors.isPositive(state);
console.log("Is positive:", isPositive); // true
```

## Redux Integration

```typescript
import { createStore } from "redux";
import {
  createReduxReducer,
  createReduxSelectors,
  counterComponent,
} from "softer-components";

// Create Redux store
const store = createStore(createReduxReducer(counterComponent));

// Create selectors
const selectors = createReduxSelectors(counterComponent);

// Dispatch actions
store.dispatch({ type: "INCREMENT", payload: undefined });
store.dispatch({ type: "SET_VALUE", payload: 42 });

// Use selectors
console.log("Current value:", selectors.getValue(store.getState()));
console.log("Formatted:", selectors.getFormattedValue(store.getState()));
```

## Custom Component Definition

```typescript
import { ComponentDef, Event, createEventCreators } from "softer-components";

// Define your state
interface TodoState {
  items: Array<{ id: string; text: string; completed: boolean }>;
  filter: "all" | "active" | "completed";
}

// Define your events
interface TodoEventMap {
  ADD_TODO: { text: string };
  TOGGLE_TODO: { id: string };
  DELETE_TODO: { id: string };
  SET_FILTER: { filter: "all" | "active" | "completed" };
}

type TodoEvent = {
  [K in keyof TodoEventMap]: Event<TodoEventMap[K]>;
}[keyof TodoEventMap];

// Create event creators
const todoEvents = createEventCreators<TodoEventMap>([
  "ADD_TODO",
  "TOGGLE_TODO",
  "DELETE_TODO",
  "SET_FILTER",
]);

// Define the component
const todoComponent: ComponentDef<TodoState, TodoEvent> = {
  name: "todos",
  initialState: {
    items: [],
    filter: "all",
  },
  reducer: (state, event) => {
    switch (event.type) {
      case "ADD_TODO":
        return {
          ...state,
          items: [
            ...state.items,
            {
              id: Date.now().toString(),
              text: event.payload.text,
              completed: false,
            },
          ],
        };

      case "TOGGLE_TODO":
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === event.payload.id
              ? { ...item, completed: !item.completed }
              : item,
          ),
        };

      case "DELETE_TODO":
        return {
          ...state,
          items: state.items.filter((item) => item.id !== event.payload.id),
        };

      case "SET_FILTER":
        return {
          ...state,
          filter: event.payload.filter,
        };

      default:
        return state;
    }
  },
  selectors: {
    getAllTodos: (state) => state.items,
    getActiveTodos: (state) => state.items.filter((item) => !item.completed),
    getCompletedTodos: (state) => state.items.filter((item) => item.completed),
    getVisibleTodos: (state) => {
      switch (state.filter) {
        case "active":
          return state.items.filter((item) => !item.completed);
        case "completed":
          return state.items.filter((item) => item.completed);
        default:
          return state.items;
      }
    },
    getTodoById: (id: string) => (state: TodoState) =>
      state.items.find((item) => item.id === id),
    getActiveCount: (state) =>
      state.items.filter((item) => !item.completed).length,
    getCompletedCount: (state) =>
      state.items.filter((item) => item.completed).length,
  },
  eventHandling: {
    supportedEvents: ["ADD_TODO", "TOGGLE_TODO", "DELETE_TODO", "SET_FILTER"],
    chainSupport: true,
  },
  metadata: {
    version: "1.0.0",
    description: "A todo list component",
  },
};

// Usage
let todoState = todoComponent.initialState;

// Add a todo
todoState = todoComponent.reducer(
  todoState,
  todoEvents.ADD_TODO({ text: "Learn Softer Components" }),
);

// Get visible todos
const visibleTodos = todoComponent.selectors.getVisibleTodos(todoState);
console.log("Visible todos:", visibleTodos);
```

## Event Chains

```typescript
import { createEventChain, todoEvents } from "./your-todo-component";

// Complex operation: Add todo and set filter to show only active
const addAndShowActive = createEventChain(
  [
    todoEvents.ADD_TODO({ text: "New task" }),
    todoEvents.SET_FILTER({ filter: "active" }),
  ],
  {
    id: "add-and-show-active",
    source: "user-action",
  },
);

// Process the chain
let state = todoComponent.initialState;
for (const event of addAndShowActive.events) {
  state = todoComponent.reducer(state, event);
}
```

## With Redux Store Enhancement

```typescript
import { enhanceStoreWithComponents } from "softer-components";

const store = createStore(createReduxReducer(todoComponent));
const enhancedStore = enhanceStoreWithComponents(store);

// Register the component
const { reducer, selectors } = enhancedStore.registerComponent(todoComponent);

// Use event chains
enhancedStore.dispatchEventChain(addAndShowActive);

// Create bound selectors
const getBoundActiveTodos = enhancedStore.createBoundSelector(
  todoComponent.selectors.getActiveTodos,
);

console.log("Active todos:", getBoundActiveTodos());
```

## Middleware Example

```typescript
import {
  createComponentLoggingMiddleware,
  createEventValidationMiddleware,
} from "softer-components";

// Logging middleware
const logger = createComponentLoggingMiddleware();

// Validation middleware
const validator = createEventValidationMiddleware((event) => {
  if (event.type === "ADD_TODO" && !event.payload.text.trim()) {
    return "Todo text cannot be empty";
  }
  return true;
});

// Use with Redux adapter
const reducer = createReduxReducer(todoComponent, {
  middleware: [validator, logger],
});
```

## Testing Components

```typescript
// Test your component logic
describe("Todo Component", () => {
  let state: TodoState;

  beforeEach(() => {
    state = todoComponent.initialState;
  });

  it("should add a todo", () => {
    const newState = todoComponent.reducer(
      state,
      todoEvents.ADD_TODO({ text: "Test todo" }),
    );

    expect(newState.items).toHaveLength(1);
    expect(newState.items[0].text).toBe("Test todo");
    expect(newState.items[0].completed).toBe(false);
  });

  it("should toggle a todo", () => {
    // First add a todo
    state = todoComponent.reducer(
      state,
      todoEvents.ADD_TODO({ text: "Test todo" }),
    );

    const todoId = state.items[0].id;

    // Then toggle it
    const newState = todoComponent.reducer(
      state,
      todoEvents.TOGGLE_TODO({ id: todoId }),
    );

    expect(newState.items[0].completed).toBe(true);
  });

  it("should filter todos correctly", () => {
    // Add completed and active todos
    state = todoComponent.reducer(
      state,
      todoEvents.ADD_TODO({ text: "Active todo" }),
    );

    state = todoComponent.reducer(
      state,
      todoEvents.ADD_TODO({ text: "Completed todo" }),
    );

    state = todoComponent.reducer(
      state,
      todoEvents.TOGGLE_TODO({ id: state.items[1].id }),
    );

    // Test filtering
    const activeTodos = todoComponent.selectors.getActiveTodos(state);
    const completedTodos = todoComponent.selectors.getCompletedTodos(state);

    expect(activeTodos).toHaveLength(1);
    expect(completedTodos).toHaveLength(1);
    expect(activeTodos[0].text).toBe("Active todo");
    expect(completedTodos[0].text).toBe("Completed todo");
  });
});
```

## Best Practices

1. **Keep State Minimal**: Only store what you need in state. Derive computed values using selectors.

2. **Use TypeScript**: Take advantage of full type safety by properly typing your state, events, and selectors.

3. **Compose Components**: Break down complex components into smaller, focused components that can be composed together.

4. **Use Event Chains**: For complex operations that require multiple state changes, use event chains instead of complex reducers.

5. **Test Components**: Your component logic is pure functions, making them easy to test in isolation.

6. **Leverage Selectors**: Use memoized selectors for expensive computations to optimize performance.

7. **Middleware for Cross-Cutting Concerns**: Use middleware for logging, validation, analytics, and other cross-cutting concerns.
