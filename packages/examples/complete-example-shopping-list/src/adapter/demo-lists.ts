import { List } from "../model";

export const demoLists: Record<string, List[]> = {
  anonymous: [],
  alice: [
    {
      id: "1",
      name: "Groceries",
      listItems: [
        { item: { id: 1, name: "Milk" }, quantity: 1 },
        { item: { id: 2, name: "Bread" }, quantity: 2 },
        { item: { id: 3, name: "Eggs" }, quantity: 12 },
      ],
    },
    {
      id: "2",
      name: "Hardware Store",
      listItems: [
        { item: { id: 4, name: "Nails" }, quantity: 100 },
        { item: { id: 5, name: "Hammer" }, quantity: 1 },
        { item: { id: 6, name: "Screwdriver" }, quantity: 1 },
      ],
    },
  ],
  bob: [
    {
      id: "3",
      name: "Books to Read",
      listItems: [
        {
          item: { id: 7, name: "Hitchhiker's Guide to the Galaxy" },
          quantity: 1,
        },
        { item: { id: 8, name: "To Kill a Mockingbird" }, quantity: 1 },
        { item: { id: 9, name: "1984" }, quantity: 1 },
      ],
    },
  ],
};
