import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CounterSliceState {
  value: number;
}

const initialState: CounterSliceState = {
  value: 0,
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
  selectors: {
    selectCount: (state) => state.value,
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export const { selectCount } = counterSlice.selectors
export default counterSlice.reducer;