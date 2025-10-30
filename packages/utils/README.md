# @softer-components/utils

This package manages a global state consisting of a Record of component state objects, where the keys are the paths to the components.

## State Structure

```ts
{
  "/": { pagetitle: { title: "My Shopping App" } },
  "/shoppingList": { name: "Grocery list" },
  "/shoppingList/items:1/": "milk",
  "/shoppingList/items:2/": "eggs",
}
```

## Event Routing

- Event with type in component path format: `"/shoppingList/items:1/"` or `"/shoppingList/items/"`

## API

### State Initialization

- `initialStateTree(componentDef)` - Creates initial state tree from component definition
- `reinitialiseStateTree(existingState, path, componentDef)` - Updates existing state tree

### Component Mapping

- `createComponentDefMap(componentDef)` - Creates flat map of component definitions
- `getComponentByPath(map, path)` - Gets component by path
- `getAllPaths(map)` - Gets all component paths

## Usage

```ts
import {
  initialStateTree,
  createComponentDefMap,
} from "@softer-components/utils";
import { componentDefBuilder } from "@softer-components/types";

const componentDef = componentDefBuilder
  .initialState({ title: "My App" })
  .children({
    shoppingList: {
      componentDef: listComponentDef,
    },
  })
  .build();

const state = initialStateTree(componentDef);
const componentMap = createComponentDefMap(componentDef);
```
