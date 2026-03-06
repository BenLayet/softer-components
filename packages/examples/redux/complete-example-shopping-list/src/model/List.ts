import { Item } from "./Item";

export type ListId = string;
export type List = {
  id: ListId;
  name: string;
  listItems: ListItem[];
};
export type ListItem = { item: Item; quantity: number };
