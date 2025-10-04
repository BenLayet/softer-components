import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    incrementRequested: (state) => ({
      ...state,
        value: state.value + 1,
    }),
    decrementRequested: (state) => ({
        ...state,
        value: state.value - 1,
    }),
    incrementByAmountRequested: (state, action: PayloadAction<number>) => ({
        ...state,
        value: state.value + action.payload,
    }),
  },
  selectors: {
    selectCount: (state) => state.value,
  },
});

export const { incrementRequested, decrementRequested, incrementByAmountRequested } = counterSlice.actions;
export const { selectCount } = counterSlice.selectors
export default counterSlice.reducer;