import { componentDefBuilder } from "@softer-components/types";
import { newItemFormDef } from "../new-item-form/new-item-form.component";
import { itemListDef } from "../item-list/item-list.component";
import { Item } from "../../model/Item.ts";

export const shoppingListComponentDef = componentDefBuilder
    .events<{ newItemSubmitted: Item }>({
        newItemSubmitted: {}
    })
    .children({
        newItemForm: { componentDef: newItemFormDef },
        itemList: { componentDef: itemListDef }
    })
    .input([
        {
            onEvent: "newItemForm/newItemSubmitted",
            thenDispatch: "newItemSubmitted",
            withPayload: (_: {}, name: string) =>
                ({ id: new Date().getTime().toString(), name })
        }
    ])
    .output([
        {
            onEvent: "newItemSubmitted",
            thenDispatch: "itemList/addItemRequested"
        }
    ])
    .build();
