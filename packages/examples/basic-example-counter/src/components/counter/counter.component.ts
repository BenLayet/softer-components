import { componentDefBuilder } from "@softer-components/types";

export const counterComponentDef = componentDefBuilder
.initialState({ 
        count: 0,
    })
    .selectors({
        count: (state) => state.count,
    })
    .events<{
        incrementRequested: undefined;
        decrementRequested: undefined;
    }>({
        incrementRequested: {
            stateUpdater: (state) => ({...state, count: state.count + 1}),
        },
        decrementRequested: {
            stateUpdater: (state) => ({...state, count: state.count - 1}),
        }
    })
    .build();
