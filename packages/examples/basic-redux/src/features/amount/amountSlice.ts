import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AmountState {
  amount: number;
}

const initialState: AmountState = {
  amount: 5,
};

export const amountSlice = createSlice({
  name: 'amount',
  initialState,
  reducers: {
      setAmountRequested: (_state, action: PayloadAction<number>) => ({
        amount: action.payload,
    }),
  },
  selectors: {
    selectAmount: (state) => state.amount,
  },
});

export const { setAmountRequested } = amountSlice.actions;
export const { selectAmount } = amountSlice.selectors