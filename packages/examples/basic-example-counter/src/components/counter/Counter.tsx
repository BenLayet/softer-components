import {counterComponentDef} from "./counter.component.ts";
import {useSofter} from "@softer-components/redux-adapter";

export const Counter = ({path = "/"}) => {
    const [{count}, {incrementRequested, decrementRequested}] = useSofter(path, counterComponentDef);
    return (
        <div className="horizontal">
            <button
                aria-label="Decrement value"
                onClick={() => decrementRequested()}
            >
                -
            </button>
            <label>{count}</label>
            <button
                aria-label="Increment value"
                onClick={() => incrementRequested()}
            >
                +
            </button>
        </div>
    );
};
