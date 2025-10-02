import { createSofterSlice } from './redux-adapter';
import { counterComponent } from './counterComponent';

export const counterSlice = createSofterSlice(counterComponent)

export const { increment, decrement } = counterSlice.actions;
export const { selectCount } = counterSlice.selectors as any;
export default counterSlice.reducer;