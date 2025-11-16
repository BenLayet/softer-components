import { ComponentDef, ExtractComponentChildrenContract, ExtractComponentValuesContract } from "./softer-component-types";
type ItemState = {
    name: string;
    quantity: number;
};
type ItemEvents = {
    removeRequested: {
        payload: undefined;
    };
    incrementQuantityRequested: {
        payload: undefined;
    };
    decrementQuantityRequested: {
        payload: undefined;
    };
    initialize: {
        payload: string;
    };
};
declare const selectors: {
    name: (state: ItemState) => string;
    quantity: (state: ItemState) => number;
    isEmpty: (state: ItemState) => boolean;
};
export type ItemContract = {
    values: ExtractComponentValuesContract<typeof selectors>;
    events: ItemEvents;
    children: {};
    state: ItemState;
};
declare const initialState: {
    listName: string;
    nextItemName: string;
    lastItemId: number;
};
type ListState = typeof initialState;
type ListEvents = {
    nextItemNameChanged: {
        payload: string;
    };
    nextItemSubmitted: {
        payload: undefined;
    };
    addItemRequested: {
        payload: string;
    };
    resetItemNameRequested: {
        payload: undefined;
    };
    incrementItemQuantityRequested: {
        payload: number;
    };
    createItemRequested: {
        payload: {
            itemName: string;
            itemId: number;
        };
    };
    removeItemRequested: {
        payload: number;
    };
};
declare const childrenComponents: {
    items: ComponentDef<ItemContract>;
};
declare const listSelectors: {
    listName: (state: {
        listName: string;
        nextItemName: string;
        lastItemId: number;
    }) => string;
    nextItemName: (state: {
        listName: string;
        nextItemName: string;
        lastItemId: number;
    }) => string;
    nextItemId: (state: {
        listName: string;
        nextItemName: string;
        lastItemId: number;
    }) => number;
};
export type ListContract = {
    state: ListState;
    values: ExtractComponentValuesContract<typeof listSelectors>;
    events: ListEvents;
    children: ExtractComponentChildrenContract<typeof childrenComponents, {
        items: "isCollection";
    }>;
};
export declare const listDef: ComponentDef<ListContract>;
export {};
//# sourceMappingURL=softer-component-types.test.d.ts.map