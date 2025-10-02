import { ComponentDef } from "@softer-components/types"
import { PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  value: 0,
};

type CounterState = typeof initialState;

export const counterComponent: ComponentDef<CounterState> = {
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
  selectors: {
    selectCount: (state) => state.value,
  },
}