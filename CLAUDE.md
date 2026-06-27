# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the repo root unless noted:

```bash
pnpm build          # build all packages (sequential, respects dependency order)
pnpm test           # run test:ci in all packages
pnpm lint           # lint all packages
pnpm format         # format all packages with Prettier
pnpm format:check   # check formatting without writing
pnpm clean          # remove all lib/ outputs

# Within a single package directory:
pnpm test           # vitest in watch mode
pnpm test:ci        # vitest run (single pass, used in CI)
pnpm build:watch    # vite build --watch
pnpm tsc            # type-check only (no emit)
```

To run a single test file: `cd packages/adapters/base-adapter && pnpm exec vitest run src/events/reducer.test.ts`

Full CI sequence: `pnpm ci` (install → clean → format → build → lint → test)

## Package layout

```
packages/
  types/                          @softer-components/types        — pure TypeScript types, zero runtime deps
  adapters/
    base-adapter/                 @softer-components/base-adapter — runtime engine (reducer, forwarding, effects)
    redux-adapter/                @softer-components/redux-adapter — Redux + React hooks
    ngrx-adapter/                 @softer-components/ngrx-adapter  — NgRx + Angular base class
  utilities/
    app-utilities/                @softer-components/app-utilities  — helpers: createBaseSelectors, SofterContext
    test-utilities/               @softer-components/test-utilities — TestStore for unit/integration tests
  examples/
    redux/{basic-example-counter,complete-example-shopping-list}
    ngrx/{basic-example-counter,complete-example-shopping-list}
```

Dependency chain: `types` → `base-adapter` → `redux-adapter` | `ngrx-adapter`; `types` → `app-utilities`; `base-adapter` → `test-utilities`.

All packages are ESM (`"type": "module"`), built with Vite + `vite-plugin-dts`, tested with Vitest. Versioning is managed by Changesets; CI publishes on push to `main`.

## Architecture

### Core abstractions (packages/types)

**`ComponentContract`** is the public API of a component type:
- `values`: record of selector names → types (what the UI can read)
- `events`: `EventsContract` declaring all event names, payload types, and which are `uiEvents` (dispatchable by the UI)
- `children`: record of child contract types, each optionally tagged `{ type: "unique" | "optional" | "collection" }`

**`ComponentDef<TContract, TState>`** is the implementation:
- `initialState`, `selectors` — define state shape and how to derive values
- `uiEvents` — subset of events the UI can dispatch
- `stateUpdaters` — `{ [eventName]: ({ state, values, payload }) => void | newState }` — uses Immer, so mutation is fine
- `childrenUpdaters` — same signature but mutates `children` (boolean or string[]) to add/remove child instances
- `eventForwarders.internal` — forward one event to another within the same component
- `eventForwarders.children.listeners` — react to a child event and generate a parent event
- `eventForwarders.children.commands` — push events down to children instances
- `eventForwarders.contexts` — send events to context components (identified by Symbol)
- `config.effects` — `{ [eventName]: (dispatchers, input) => Promise }` for async side effects
- `config.childrenDefs` — map child name → `ComponentDef` for each declared child
- `config.contextsPath` — map Symbol → state path string to locate context components
- `initialChildren` — initial instance configuration for each child

### State tree (packages/adapters/base-adapter)

The runtime state is a single nested **`StateTree`**:
```
{ 🫒: ownState, 🪾: { childName: { instanceKey: StateTree } } }
```
`CHILDREN_BRANCHES_KEY = "🪾"`, `OWN_VALUE_KEY = "🫒"`. Unique/optional children use the implicit key `"0"`.

**State paths** are strings like `"/ComponentA:instance1/ComponentB"`. The root is `""`. `:0` can be omitted for unique children. Internally, paths are `StatePath = [ComponentName, ChildKey][]`.

### Event processing cycle (per event)

1. **Reducer** — `updateSofterRootState`: runs `stateUpdaters` then `childrenUpdaters` for the component at the event's path. Immer `produce` wraps mutations.
2. **Event forwarding** — `generateEventsToForward`: generates additional events for children (commands), parent (listeners), internal forwarders, and contexts.
3. **Effects** — `EffectsManager.eventOccurred`: runs async effect if defined, passes typed dispatchers.
4. Forwarded events are dispatched and the cycle repeats for each.

### Redux adapter (packages/adapters/redux-adapter)

- `configureSofterStore(rootDef)` — wraps RTK `configureStore` with a softer reducer and `createListenerMiddleware` that runs event forwarding and effects.
- `useSofter<Contract>(path)` → `[values, events, childrenPaths]`
- `useSofterSelectors / useSofterEvents / useSofterChildrenPaths` for granular subscriptions.

### NgRx adapter (packages/adapters/ngrx-adapter)

- `provideSofterState({ rootComponentDef })` — call in `app.config.ts` alongside `provideStore()`.
- `AbstractSofterComponent<Contract>` — Angular `@Directive` base class; exposes `v$` (values observable), `e` (event dispatchers), `c$` (children paths observable). Angular components extend this and bind via `path` input.

### Testing pattern (packages/utilities/test-utilities)

All behavior tests use `TestStore` directly against `ComponentDef`, with no Redux/NgRx/Angular involved:

```ts
const store = initTestStore(appDef);
await store.when({ name: "incrementRequested", statePath: [], payload: null });
await store.and({ name: "...", statePath: [], payload: null });
expect(store.getValues("").count()).toBe(1);
expect(store.isStateDefined("/listManager/list:item1")).toBe(true);
```

`store.when` and `store.and` are aliases; both return a `Promise` that resolves after all forwarded events and effects complete, making assertions straightforward.

### Contexts

Contexts let a component read state from / send events to an ancestor component without knowing the exact path. A context is defined by a `Symbol`. The component declares `config.contextsPath: { [symbol]: "/absolute/path" }` (or a relative path for children). `SofterContext` from `app-utilities` is a helper class for building these path maps with type safety.
