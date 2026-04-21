import { ItemRowContract } from "./item-row";

export type Children = { itemRows: ItemRowContract & { type: "collection" } };
