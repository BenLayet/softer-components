const selectors = {
    name: (state) => state.name,
    quantity: (state) => state.quantity,
    isEmpty: (state) => state.quantity < 1,
};
const itemDef = {
    selectors,
    uiEvents: ["incrementQuantityRequested", "decrementQuantityRequested"],
    updaters: {
        initialize: ({ payload: name }) => ({
            name: name,
            quantity: 1,
        }),
        incrementQuantityRequested: ({ state }) => {
            state.quantity++;
        },
        decrementQuantityRequested: ({ state }) => {
            state.quantity--;
        },
    },
    eventForwarders: [
        {
            from: "decrementQuantityRequested",
            to: "removeRequested",
            onCondition: ({ selectors }) => selectors.isEmpty(),
        },
    ],
};
/////////////////////
// List
////////////////////
const initialState = {
    listName: "My Shopping List",
    nextItemName: "",
    lastItemId: 0,
};
const childrenComponents = {
    items: itemDef,
};
const listSelectors = {
    listName: (state) => state.listName,
    nextItemName: (state) => state.nextItemName.trim(),
    nextItemId: (state) => state.lastItemId + 1,
};
export const listDef = {
    initialState,
    selectors: listSelectors,
    uiEvents: ["nextItemNameChanged", "addItemRequested"],
    updaters: {
        nextItemNameChanged: ({ state, payload: nextItemName }) => {
            state.nextItemName = nextItemName;
        },
        addItemRequested: ({ state }) => {
            state.nextItemName = "";
        },
        createItemRequested: ({ childrenNodes: { items }, payload: { itemId }, state, }) => {
            items.push(`${itemId}`);
            state.lastItemId = itemId;
        },
        removeItemRequested: ({ childrenNodes: { items }, payload: idToRemove, }) => {
            items.splice(items.indexOf(`${idToRemove}`), 1);
        },
    },
    eventForwarders: [
        {
            from: "nextItemSubmitted",
            to: "addItemRequested",
            withPayload: ({ selectors }) => selectors.nextItemName().trim(),
            onCondition: ({ selectors }) => selectors.nextItemName().trim() !== "",
        },
        {
            from: "addItemRequested",
            to: "createItemRequested",
            onCondition: ({ children: { items }, payload: itemName }) => Object.values(items).every((item) => item.selectors.name() !== itemName),
            withPayload: ({ selectors, payload: itemName }) => ({
                itemName,
                itemId: selectors.nextItemId(),
            }),
        },
        {
            from: "addItemRequested",
            to: "incrementItemQuantityRequested",
            onCondition: ({ children: { items }, payload: itemName }) => Object.values(items).some((item) => item.selectors.name() === itemName),
            withPayload: ({ children: { items }, payload: itemName }) => Object.entries(items)
                .filter(([, item]) => item.selectors.name() === itemName)
                .map(([key]) => parseInt(key))[0],
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
                    to: "incrementQuantityRequested",
                    toKeys: ({ payload: itemId }) => [`${itemId}`],
                },
                {
                    from: "createItemRequested",
                    to: "initialize",
                    withPayload: ({ payload: { itemName } }) => itemName,
                    toKeys: ({ payload: { itemId } }) => [`${itemId}`],
                },
            ],
            listeners: [
                {
                    from: "removeRequested",
                    to: "removeItemRequested",
                    withPayload: ({ fromChildKey }) => parseInt(fromChildKey),
                },
            ],
        },
    },
};
//# sourceMappingURL=softer-component-types.test.js.map