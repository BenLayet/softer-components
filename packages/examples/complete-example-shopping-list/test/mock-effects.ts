export const mockEffects = {
  "/listSelect:0/": {
    createNewListRequested: (dispatchers: any, { payload }: any) =>
      dispatchers.createNewListSucceeded({
        name: payload,
        id: "fake-uuid",
        listItems: [],
      }),
  },
};
