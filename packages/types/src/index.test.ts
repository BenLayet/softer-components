import {EventForwarderDef, Event} from "./index";

const ef_any_a_to_b: EventForwarderDef<{}, any> = {onEvent: "a", thenDispatch: () => "b"};
const ef_any_a_to_a: EventForwarderDef<{}, any> = {onEvent: "a", thenDispatch: () => "a"};
const ef_a_to_b: EventForwarderDef<{}, Event<"a"> | Event<"b">> = {onEvent: "a", thenDispatch: () => "b"};


// @ts-ignore Expects ERROR
const ef_a_to_a: EventForwarderDef<{}, Event<"a"> | Event<"b">> = {onEvent: "a", thenDispatch: () => "a"};