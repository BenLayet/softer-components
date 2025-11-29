import {
  ComponentDef,
  ExtractComponentChildrenContract,
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
  children: ExtractComponentChildrenContract<typeof childrenComponents>;
};

export const listDef: ComponentDef<ListContract> = {
  initialState: { listName: "", nextItemName: "" },
  selectors: listSelectors,
  uiEvents: ["nextItemNameChanged", "nextItemSubmitted"],
  updaters: {
    initialize: ({ payload: list, childrenKeys }) => {
      childrenKeys.items = list.items.map(item => `${item.id}`);
      return { listName: list.name, nextItemName: "" };
    },
    nextItemNameChanged: ({ state, payload: nextItemName }) => {
      state.nextItemName = nextItemName;
    },
    addItemRequested: ({ state }) => {
      state.nextItemName = "";
    },
    createItemRequested: ({ childrenKeys: { items }, payload: { id } }) => {
      items.push(`${id}`);
    },
    removeItemRequested: ({ childrenKeys: { items }, payload: idToRemove }) => {
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
  initialChildrenKeys: { items: [] },
  childrenConfig: {
    items: {
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
