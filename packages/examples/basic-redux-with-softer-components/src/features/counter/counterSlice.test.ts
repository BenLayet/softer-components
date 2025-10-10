import type { AppStore } from "../../app/store"
import { makeStore } from "../../app/store"
import type { CounterState } from "../counter/counterComponent.ts"
import {
  counterSlice,
  decrementRequested,
  incrementRequested,
  incrementByAmountRequested,
  selectCount,
} from "./counterSlice"

type LocalTestContext = {
  store: AppStore
}

describe("counter reducer", () => {
  beforeEach<LocalTestContext>(context => {
    const initialState: CounterState = {
      value: 3,
      nextAmount: 2,
    }

    const store = makeStore({ counter: initialState })

    context.store = store
  })

  it("should handle initial state", () => {
    expect(counterSlice.reducer(undefined, { type: "unknown" })).toStrictEqual({
      value: 0,
    })
  })

  it<LocalTestContext>("should handle increment", ({ store }) => {
    expect(selectCount(store.getState())).toBe(3)

    store.dispatch(incrementRequested())

    expect(selectCount(store.getState())).toBe(4)
  })

  it<LocalTestContext>("should handle decrement", ({ store }) => {
    expect(selectCount(store.getState())).toBe(3)

    store.dispatch(decrementRequested())

    expect(selectCount(store.getState())).toBe(2)
  })

  it<LocalTestContext>("should handle incrementByAmount", ({ store }) => {
    expect(selectCount(store.getState())).toBe(3)

    store.dispatch(incrementByAmountRequested())

    expect(selectCount(store.getState())).toBe(5)
  })
})
