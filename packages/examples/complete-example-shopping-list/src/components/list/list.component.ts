import {
  ComponentDef,
  CreateComponentChildrenContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import { Item } from "../../model/Item.ts";
import { itemRowDef } from "../item-row/item-row.component.ts";
import { List } from "../../model/List.ts";

type ListState = {
  listName: string;
  nextItemName: string;
};
type ListEvents = {
  initialize: { payload: List };
  nextItemNameChanged: { payload: string };
  nextItemSubmitted: { payload: undefined };
  addItemRequested: { payload: string };
  resetItemNameRequested: { payload: undefined };
  incrementItemQuantityRequested: { payload: number };
  createItemRequested: { payload: Item };
  removeItemRequested: { payload: number };
};

const childrenComponents = {
  items: itemRowDef,
};

const listSelectors = {
  listName: state => state.listName,
  nextItemName: state => state.nextItemName.trim(),
} satisfies Selectors<ListState>;

export type ListContract = {
  state: ListState;
  values: ExtractComponentValuesContract<typeof listSelectors>;
  events: ListEvents;
  children: CreateComponentChildrenContract<
    typeof childrenComponents,
    { items: "isCollection" }
  >;
};

export const listDef: ComponentDef<ListContract> = {
  selectors: listSelectors,
  uiEvents: ["nextItemNameChanged", "nextItemSubmitted"],
  updaters: {
    initialize: ({ payload: list, childrenNodes }) => {
      childrenNodes.items = list.items.map(item => `${item.id}`);
      return { listName: list.name, nextItemName: "" };
    },
    nextItemNameChanged: ({ state, payload: nextItemName }) => {
      state.nextItemName = nextItemName;
    },
    addItemRequested: ({ state }) => {
      state.nextItemName = "";
    },
    createItemRequested: ({ childrenNodes: { items }, payload: { id } }) => {
      items.push(`${id}`);
    },
    removeItemRequested: ({
      childrenNodes: { items },
      payload: idToRemove,
    }) => {
      items.splice(items.indexOf(`${idToRemove}`), 1);
    },
  },
  eventForwarders: [
    {
      from: "nextItemSubmitted",
      to: "addItemRequested",
      withPayload: ({ values: selectors }) => selectors.nextItemName().trim(),
      onCondition: ({ values: selectors }) =>
        selectors.nextItemName().trim() !== "",
    },
    {
      from: "addItemRequested",
      to: "createItemRequested",
      onCondition: ({ children: { items }, payload: itemName }) =>
        Object.values(items).every(item => item.values.name() !== itemName),
      withPayload: ({ payload: itemName, children: { items } }) => ({
        name: itemName,
        id:
          Object.keys(items)
            .map(Number)
            .reduce((maxId, id) => (id > maxId ? id : maxId), 0) + 1,
      }),
    },
    {
      from: "addItemRequested",
      to: "incrementItemQuantityRequested",
      onCondition: ({ children: { items }, payload: itemName }) =>
        Object.values(items).some(item => item.values.name() === itemName),
      withPayload: ({ children: { items }, payload: itemName }) =>
        Object.entries(items)
          .filter(([, item]) => item.values.name() === itemName)
          .map(([key]) => key)
          .map(Number)[0],
    },
    {
      from: "addItemRequested",
      to: "resetItemNameRequested",
    },
  ],
  childrenComponents,
  childrenConfig: {
    items: {
      isCollection: true,
      commands: [
        {
          from: "incrementItemQuantityRequested",
          to: "incrementRequested",
          toKeys: ({ payload: id }) => [`${id}`],
        },
        {
          from: "createItemRequested",
          to: "initialize",
          toKeys: ({ payload: { id } }) => [`${id}`],
        },
      ],
      listeners: [
        {
          from: "removeItemRequested",
          to: "removeItemRequested",
          withPayload: ({ fromChildKey }) => parseInt(fromChildKey),
        },
      ],
    },
  },
};
