import {
  ComponentDef,
  ComponentEventsContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { List } from "../../../model";
import {
  CreateListContract,
  CreateListDependencies,
  createListDef,
} from "./create-list/create-list.component";
import {
  ListsContract,
  ListsDependencies,
  listsDef,
} from "./lists/lists.component";

// Children components definition
type ChildrenContract = {
  lists: ListsContract;
  createList: CreateListContract;
};

// Initial state definition
const initialState = {};
type State = typeof initialState;

const selectors = {
  listCount: (_, children) => children.lists.values.listCount(),
  hasAnyList: (_, children) => children.lists.values.listCount() > 0,
} satisfies Selectors<State, ChildrenContract>;

// Events type declaration
type eventNames =
  | "displayed"
  | "emptyListCreated"
  | "listSelected"
  | "listNamesChanged";

type ListSelectEvents = ComponentEventsContract<
  eventNames,
  {
    emptyListCreated: List;
    listSelected: List;
    listNamesChanged: string[];
  }
>;

type Contract = {
  values: ExtractComponentValuesContract<typeof selectors>;
  events: ListSelectEvents;
  children: ChildrenContract;
};

type Dependencies = CreateListDependencies & ListsDependencies;

// Component definition
const componentDef: (
  dependencies: Dependencies,
) => ComponentDef<Contract, State> = dependencies => ({
  selectors,
  uiEvents: ["displayed"],
  eventForwarders: [
    {
      from: "emptyListCreated",
      to: "listSelected",
    },
  ],
  childrenComponentDefs: {
    lists: listsDef(dependencies),
    createList: createListDef(dependencies),
  },
  childrenConfig: {
    lists: {
      commands: [{ from: "displayed", to: "initializeRequested" }],
      listeners: [
        { from: "listSelected", to: "listSelected" },
        { from: "listNamesChanged", to: "listNamesChanged" },
      ],
    },
    createList: {
      commands: [
        {
          from: "listNamesChanged",
          to: "setExistingListNames",
        },
      ],
      listeners: [{ from: "createNewListSucceeded", to: "emptyListCreated" }],
    },
  },
});

// Exporting the component definition as a function to allow dependencies injection
export const listManagerDef = componentDef;
export type ListManagerContract = Contract;
export type ListManagerDependencies = Dependencies;
