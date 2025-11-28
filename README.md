# 🧵 Softer Components

A state-manager-agnostic component library built with TypeScript in a monorepo structure, designed for creating reusable UI components.

## 🤔 Why Softer Components?

Front-end applications tend to become very complex very fast, as they have to tackle:

- handling many events in random order (user input, HTTP responses, timeout etc...)
- interacting with the DOM (time consuming rendering, dependency to the rendering logic)
- juggling with different data models (backend data model (DTO), display data model and form data model), and knowing when each data is updated in each model

The 1st step to address these challenges is to use a state manager:

- no more ambiguity about what is updated when
- excellent to separate behaviour logic from presentation logic
- but this brings new challenges:
  - yet another data model (store data model)
  - concentration of complexity in one place (reducers, selectors, and effects/thunks)
  - components are less reusable, as their own behaviour logic is mixed up with all other component logic
  - lazy loading of part of the application
  - your codebase is tied into a library, and dependant of its evolutions (for better or worth)

To address these new issues the 2nd step is to slice the global store into "feature stores":

- data model of each feature store is closer to the data model of form and display
- lazy loading becomes simple
- but again new challenges :
  - duplication of data between features stores
  - communication between features adds boilerplate
  - difficulties to know between features which one depends on which one, with risk of circular dependencies
  - difficulties to know how to group components into features: risk of different developper using different practices, and an inconsistent codebase

Softer Components goes one step further:

- Each 'softer component' declares the full behaviour logic of one UI component
- Complete break down of application logic into simple component logic, while keeping a unique global state
- The library enable one 'feature store' per component, without tying your whole codebase to a specific state manager and with minimal boilerplate
- Clear dependencies: a component only knows about the 'contract' of its children
  - it 'knows nothing' about its parent or the rest of the application
- Strict separation of concerns:
  - Display logic in UI components
  - Behaviour in 'softer component',
  - Interaction with external systems in effects (HTTP, localstorage, service worker etc...)

## ✨ Features

- **🔒 Full Type Safety**: Complete TypeScript support with strict typing
- **⚡ Minimal Runtime Dependencies**: Lightweight core types package
- **🌐 State-Manager Agnostic**: Core types work with any state management solution
- **🔄 Redux Integration**: Built-in Redux adapter with Immer support
- **📖 Well Documented**: Comprehensive documentation with real examples
- **🧩 Composable**: Build complex apps from simple components, that encapsulate their own logic
- **♻️ Reusable**: Designed so components can be reused in different contexts
- **🔄 Event Forwarding**: Support for parent-child communication via listeners and commands

## 🧠 Core Concepts

### Component Definition (`ComponentDef`)

Defines the behaviour and structure of a component type.

- One `ComponentDef` can be used by multiple components at runtime
- Each component have its own state:
  - publishes views of its own state with selectors

### Events

Each component communicates with the rest of the application through events, that can be triggered:

- **by the UI**: e.g. `buttonClicked`, `inputChanged`
- **by an effect**: e.g. `httpFetchSucceeded`, `timeoutExpired`
- **by a parent component**: e.g. `selectAllRequested` from a checkboxList => `selectRequested` for each checkbox
- **by listening to a child component**: e.g. `pageSelected` from a pager => `fetchPageRequested` from a table
- **by internal event chain**: e.g. `buttonClicked` => `submitRequested` to encourage good event hygiene (separation of UI event and behaviour events), and flexibility about UI interaction

Events are not 'actions': they describe something that has happened (in the past), and they know nothing about who consumes them.

## 📦 Installation

```bash
# Install core types
pnpm add -D @softer-components/types

# Install Redux adapter (if using Redux)
pnpm add @softer-components/redux-adapter

```

## 🚀 Quick Start

### 1. Define Your Component Contract

```typescript
import { ComponentContract } from "@softer-components/types";

// Define the contract for a counter component
type CounterContract = {
  // Component state
  state: {
    count: number;
  };

  // Computed values (from selectors)
  values: {
    doubled: number;
    isEven: boolean;
  };

  // Events the component can handle
  events: {
    increment: { payload: undefined };
    decrement: { payload: undefined };
    set: { payload: number };
  };

  // Child components
  children: {};
};
```

### 2. Create Component Definition

```typescript
import { ComponentDef } from "@softer-components/types";

export const counterDef: ComponentDef<CounterContract> = {
  // Initial state
  initialState: { count: 0 },

  // Selectors - compute derived values
  selectors: {
    doubled: (state) => state.count * 2,
    isEven: (state) => state.count % 2 === 0,
  },

  // UI events that can be dispatched from the component
  uiEvents: ["increment", "decrement", "set"],

  // Updaters - handle events and update state
  updaters: {
    increment: ({ state }) => {
      state.count += 1; // ✅ Immer allows mutation
    },
    decrement: ({ state }) => {
      state.count -= 1;
    },
    set: ({ state, payload }) => {
      state.count = payload;
    },
  },
};
```

### 3. Use with Redux

```typescript
import { configureSofterStore } from "@softer-components/redux-adapter";
import { Provider } from "react-redux";

// Create Redux store with Softer Components
const store = configureSofterStore(counterDef);

// Wrap your app with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}
```

or create your own adapter for your own state manager using `@softer-components/utils` (and share it !)

### 4. Use in React Component

```typescript
import { useSofter } from "@softer-components/redux-adapter";

interface CounterProps {
  path?: string;
}

export const Counter = ({ path = "" }: CounterProps) => {
  // 🧵 Get values, events, and children paths
  const [values, events] = useSofter<CounterContract>(path);

  return (
    <div>
      <h1>Count: {values.doubled}</h1>
      <p>{values.isEven ? "Even" : "Odd"}</p>
      <button onClick={events.increment}>+</button>
      <button onClick={events.decrement}>-</button>
      <button onClick={() => events.set(0)}>Reset</button>
    </div>
  );
};
```

## 🔄 Detailed Features

### Event Forwarding (Internal)

Forward events within the same component:

```typescript
export const counterDef: ComponentDef<CounterContract> = {
  initialState: { count: 0, isResetting: false },

  selectors: {
    count: (state) => state.count,
  },

  uiEvents: ["startReset"],

  updaters: {
    startReset: ({ state }) => {
      state.isResetting = true;
    },
    reset: ({ state }) => {
      state.count = 0;
      state.isResetting = false;
    },
  },

  // 🔄 Forward startReset -> reset
  eventForwarders: [
    {
      from: "startReset",
      to: "reset",
    },
  ],
};
```

### Parent-Child Communication

#### Child-to-Parent (Listeners)

```typescript
type ItemContract = {
  state: { name: string };
  values: { displayName: string };
  events: {
    removed: { payload: undefined };
  };
  children: {};
};

type ListContract = {
  state: { items: string[] };
  values: { itemCount: number };
  events: {
    itemRemoved: { payload: string };
  };
  children: {
    items: ItemContract & { isCollection: true };
  };
};

export const listDef: ComponentDef<ListContract> = {
  initialState: { items: [] },

  selectors: {
    itemCount: (state) => state.items.length,
  },

  updaters: {
    itemRemoved: ({ state, payload }) => {
      state.items = state.items.filter((id) => id !== payload);
    },
  },

  childrenComponents: {
    items: itemDef,
  },

  childrenConfig: {
    items: {
      isCollection: true,

      // 👂 Listen to child events
      listeners: [
        {
          from: "removed", // Child event
          to: "itemRemoved", // Parent event
          withPayload: ({ fromChildKey }) => fromChildKey,
        },
      ],
    },
  },
};
```

#### Parent-to-Child (Commands)

```typescript
export const listDef: ComponentDef<ListContract> = {
  // ...existing code...

  childrenConfig: {
    items: {
      isCollection: true,

      // 📢 Send commands to children
      commands: [
        {
          from: "clearAll", // Parent event
          to: "clear", // Child event
          // Send to all children
          toKeys: ({ children }) => Object.keys(children.items),
        },
      ],
    },
  },
};
```

### Conditional Event Forwarding

```typescript
eventForwarders: [
  {
    from: "itemClicked",
    to: "itemSelected",
    // Only forward if condition is met
    onCondition: ({ values, payload }) => {
      return values.isEnabled && payload !== null;
    },
    // Transform payload
    withPayload: ({ payload }) => {
      return { id: payload, timestamp: Date.now() };
    },
  },
],
```

### Managing Children Nodes

```typescript
type ListContract = {
  state: { nextId: number };
  values: { itemCount: number };
  events: {
    addItem: { payload: string };
    removeItem: { payload: string };
  };
  children: {
    items: ItemContract & { isCollection: true };
  };
};

export const listDef: ComponentDef<ListContract> = {
  initialState: { nextId: 0 },

  // Initial children nodes
  initialChildrenNodes: {
    items: [], // Start with no items
  },

  updaters: {
    addItem: ({ state, childrenNodes, payload }) => {
      const newId = String(state.nextId);
      state.nextId += 1;

      // 🔧 Mutate childrenNodes to add child
      childrenNodes.items.push(newId);
    },

    removeItem: ({ childrenNodes, payload }) => {
      // 🔧 Mutate childrenNodes to remove child
      const index = childrenNodes.items.indexOf(payload);
      if (index > -1) {
        childrenNodes.items.splice(index, 1);
      }
    },
  },

  childrenComponents: {
    items: itemDef,
  },

  childrenConfig: {
    items: {
      isCollection: true,
    },
  },
};
```

## 🎯 Complete Example: Shopping List

```typescript
import { ComponentDef, ComponentContract } from "@softer-components/types";

// 📝 Item Contract
type ItemContract = {
  state: {
    name: string;
    count: number;
  };
  values: {
    displayName: string;
  };
  events: {
    incremented: { payload: undefined };
    removed: { payload: undefined };
  };
  children: {};
};

// 📝 List Contract
type ListContract = {
  state: {
    listName: string;
    nextItemName: string;
    lastItemId: number;
  };
  values: {
    listName: string;
    nextItemName: string;
    itemCount: number;
  };
  events: {
    nextItemNameChanged: { payload: string };
    nextItemSubmitted: { payload: undefined };
    itemRemoved: { payload: string };
  };
  children: {
    items: ItemContract & { isCollection: true };
  };
};

// 🔧 Item Definition
export const itemDef: ComponentDef<ItemContract> = {
  initialState: {
    name: "",
    count: 0,
  },

  selectors: {
    displayName: (state) => `${state.name} (${state.count})`,
  },

  uiEvents: ["incremented", "removed"],

  updaters: {
    incremented: ({ state }) => {
      state.count += 1;
    },
  },
};

// 🔧 List Definition
export const listDef: ComponentDef<ListContract> = {
  initialState: {
    listName: "My Shopping List",
    nextItemName: "",
    lastItemId: 0,
  },

  initialChildrenNodes: {
    items: [],
  },

  selectors: {
    listName: (state) => state.listName,
    nextItemName: (state) => state.nextItemName,
    itemCount: (state) => state.lastItemId,
  },

  uiEvents: ["nextItemNameChanged", "nextItemSubmitted"],

  updaters: {
    nextItemNameChanged: ({ state, payload }) => {
      state.nextItemName = payload;
    },

    nextItemSubmitted: ({ state, childrenNodes }) => {
      if (state.nextItemName.trim()) {
        const newId = String(state.lastItemId + 1);
        state.lastItemId += 1;

        // Add new item
        childrenNodes.items.push(newId);

        // Clear input
        state.nextItemName = "";
      }
    },

    itemRemoved: ({ childrenNodes, payload }) => {
      // Remove item from children
      const index = childrenNodes.items.indexOf(payload);
      if (index > -1) {
        childrenNodes.items.splice(index, 1);
      }
    },
  },

  childrenComponents: {
    items: itemDef,
  },

  childrenConfig: {
    items: {
      isCollection: true,

      // Listen to item removal
      listeners: [
        {
          from: "removed",
          to: "itemRemoved",
          withPayload: ({ fromChildKey }) => fromChildKey,
        },
      ],
    },
  },
};
```

### Using the Shopping List

```typescript
import { useSofter } from "@softer-components/redux-adapter";

export const List = ({ path = "" }: { path?: string }) => {
  const [
    { listName, nextItemName },
    { nextItemNameChanged, nextItemSubmitted },
    { items },
  ] = useSofter<ListContract>(path);

  return (
    <div>
      <h1>{listName}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          nextItemSubmitted();
        }}
      >
        <input
          type="text"
          value={nextItemName}
          onChange={(e) => nextItemNameChanged(e.target.value)}
          placeholder="Enter item name"
        />
        <button type="submit">Add Item</button>
      </form>

      <div>
        {items.map((itemPath) => (
          <ItemRow key={itemPath} path={itemPath} />
        ))}
      </div>
    </div>
  );
};

export const ItemRow = ({ path }: { path: string }) => {
  const [{ displayName }, { incremented, removed }] =
    useSofter<ItemContract>(path);

  return (
    <div>
      <span>{displayName}</span>
      <button onClick={incremented}>+</button>
      <button onClick={removed}>Remove</button>
    </div>
  );
};
```

## 🏗️ Monorepo Structure

```
softer-components/
├── packages/
│   ├── types/                    # 🧵 Core type definitions
│   │   ├── src/
│   │   │   └── softer-component-types.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── utils/                    # 🛠️ Utility functions
│   │   ├── src/
│   │   │   ├── reducer.ts       # State update logic
│   │   │   ├── state.ts         # State tree utilities
│   │   │   └── predicate.functions.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── redux-adapter/            # 🎯 Redux integration
│   │   ├── src/
│   │   │   ├── softer-store.ts  # Redux store setup
│   │   │   ├── softer-hooks.ts  # React hooks
│   │   │   └── mappers.ts       # Redux mappers
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── examples/
│       └── complete-example-shopping-list/
│           └── src/
│               ├── components/
│               │   ├── list/
│               │   └── item-row/
│               └── main.tsx
├── .github/
│   └── copilot-instructions.md
├── package.json                  # Root workspace config
├── pnpm-workspace.yaml
└── tsconfig.json                 # Root project references
```

## 🔧 API Reference

### Core Types

#### `ComponentContract`

```typescript
type ComponentContract = {
  state: OptionalValue;
  values: ComponentValuesContract;
  events: ComponentEventsContract;
  children: ComponentChildrenContract;
};
```

#### `ComponentDef<TComponentContract>`

```typescript
type ComponentDef<TComponentContract extends ComponentContract> = {
  initialState?: TComponentContract["state"];
  initialChildrenNodes?: ChildrenNodes<TComponentContract["children"]>;
  selectors?: {
    [K in keyof TComponentContract["values"]]: (
      state: TComponentContract["state"]
    ) => TComponentContract["values"][K];
  };
  uiEvents?: (keyof TComponentContract["events"])[];
  updaters?: {
    [K in keyof TComponentContract["events"]]?: (
      params: UpdaterParams
    ) => void | TComponentContract["state"];
  };
  eventForwarders?: InternalEventForwarders<TComponentContract>;
  childrenComponents?: {
    [K in keyof TComponentContract["children"]]: ComponentDef<
      TComponentContract["children"][K]
    >;
  };
  childrenConfig?: {
    [K in keyof TComponentContract["children"]]?: ChildConfig<
      TComponentContract,
      TComponentContract["children"][K]
    >;
  };
};
```

#### `Values<TComponentContract>`

Runtime interface for accessing component values:

```typescript
type Values<TComponentContract extends ComponentContract> = {
  values: {
    [K in keyof TComponentContract["values"]]: () => TComponentContract["values"][K];
  };
  children: ChildrenValues<TComponentContract>;
};
```

### Redux Adapter

#### `configureSofterStore(rootComponentDef)`

Creates a Redux store with Softer Components integration:

```typescript
const store = configureSofterStore(counterDef);
```

#### `useSofter<TComponentContract>(path)`

React hook for accessing component state, events, and children:

```typescript
const [values, events, children] = useSofter<CounterContract>("");
```

#### `useSofterSelectors<TValuesContract>(path)`

Hook for accessing only computed values:

```typescript
const values = useSofterSelectors<CounterContract["values"]>("");
```

#### `useSofterEvents<TEventsContract>(path)`

Hook for accessing only event dispatchers:

```typescript
const events = useSofterEvents<CounterContract["events"]>("");
```

#### `useSofterChildrenPath<TChildrenContract>(path)`

Hook for accessing only children paths:

```typescript
const children = useSofterChildrenPath<CounterContract["children"]>("");
```

## 🚀 Development

### Validated Development Workflow (5.7 seconds total)

```bash
# Per package validation
cd packages/redux-adapter

npm run lint    # 1 second - Check code style
npm run build   # 1.5 seconds - Verify compilation
npm test        # 1.5 seconds - Run tests
npx tsc --noEmit # 1.7 seconds - Type check
```

### Workspace-Level Commands

```bash
# From repository root
pnpm run build --filter="@softer-components/*"  # Build all packages
pnpm run test --filter="@softer-components/*"   # Test all packages
pnpm run lint --filter="@softer-components/*"   # Lint all packages
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have questions or need help, please open an issue on GitHub.

---
