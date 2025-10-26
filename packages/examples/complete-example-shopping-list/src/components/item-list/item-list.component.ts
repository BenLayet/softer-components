import { componentDefBuilder } from "@softer-components/types";
import { Item } from "../../model/Item.ts";
import { itemRowDef } from "../item-row/item-row.component.ts";
import { List } from "../../model/List.ts";

export const itemListDef = componentDefBuilder
    .initialState({
        name: "",
        items: [] as Item[],
    })
    .selectors({
        name: state => state.name,
    })
    .events<{
        addItemRequested: Item;
        removeItemRequested: Item;
    }>({
        addItemRequested: {
            stateUpdater: (state, item) => ({
                ...state,
                items: [item, ...state.items],
            }),
        },
        removeItemRequested: {
            stateUpdater: (state, item) => ({
                ...state,
                items: state.items.filter(i => i.id !== item.id),
            }),
        },
    })
    .children({
        itemRows: {
            componentDef: itemRowDef,
            isCollection: true,
            count: state => state.items.length,
            childKey: (state, index) => state.items[index]["id"],
            initialStateFactoryWithKey: (state, id) =>
            ({
                item: state.items.find(i => i.id == id) as Item,
            }),
        } ,
    })
    .input([
        {
            onEvent: "itemRows/removeItemRequested",
            thenDispatch: "removeItemRequested"
        }
    ])
    .build();
