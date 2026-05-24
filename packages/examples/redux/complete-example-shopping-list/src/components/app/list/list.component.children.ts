import type { ItemRowContract } from "./item-row/item-row.component";

export type Children = { itemRows: ItemRowContract & { type: "collection" } };
