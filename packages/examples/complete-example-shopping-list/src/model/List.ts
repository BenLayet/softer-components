import { Item } from "./Item.ts";

export type List = {
  id: number;
  name: string;
  items: Item[];
};
