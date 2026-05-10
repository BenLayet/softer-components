import {
  INPUTTED_BY_USER,
  stringToStatePath,
} from "@softer-components/base-adapter";
import type { EventsContract } from "@softer-components/types";
import { describe, expect, it } from "vitest";

import { eventSequenceFactory } from "./test-event-factory";

describe("eventSequenceFactory", () => {
  it("uses input directly as payload when withPayload is not specified, with implicit default path", () => {
    type ShoppingListComponentContract = {
      events: EventsContract<["listNameChanged"], { listNameChanged: string }>;
    };

    const setListName = eventSequenceFactory<
      ShoppingListComponentContract,
      string
    >().events("listNameChanged");

    expect(setListName("Groceries")).toEqual([
      {
        name: "listNameChanged",
        statePath: stringToStatePath(""),
        payload: "Groceries",
        source: INPUTTED_BY_USER,
      },
    ]);
  });
  it("uses input directly as payload when withPayload specified", () => {
    type ShoppingListComponentContract = {
      events: EventsContract<["listNameChanged"], { listNameChanged: string }>;
    };
    const setListName = eventSequenceFactory<
      ShoppingListComponentContract,
      string
    >()
      .events("listNameChanged")
      .withPayloads(input => input.toLocaleUpperCase());

    expect(setListName("Groceries")).toEqual([
      {
        name: "listNameChanged",
        statePath: stringToStatePath(""),
        payload: "GROCERIES",
        source: INPUTTED_BY_USER,
      },
    ]);
  });
  it("uses input directly as payload for all events when withPayloads is not specified", () => {
    type ShoppingListComponentContract = {
      events: EventsContract<["done"]>;
      children: {
        createList: {
          events: EventsContract<
            ["listNameChanged"],
            { listNameChanged: string }
          >;
        };
      };
    };
    const setListName = eventSequenceFactory<
      ShoppingListComponentContract,
      string
    >()
      .atPath("/createList")
      .events("listNameChanged")
      .thenAtPath("/")
      .events("done");
    expect(setListName("Groceries")).toEqual([
      {
        name: "listNameChanged",
        statePath: stringToStatePath("/createList"),
        payload: "Groceries",
        source: INPUTTED_BY_USER,
      },
      {
        name: "done",
        // Default is always identity — type system prevents *wrong* withPayloads
        // return types but does not suppress the default payload at runtime.
        // Call .withPayloads(() => undefined) explicitly to suppress it.
        payload: "Groceries",
        statePath: stringToStatePath("/"),
        source: INPUTTED_BY_USER,
      },
    ]);
  });

  it("creates the same sign-in sequence as manual events", () => {
    type ShoppingListComponentContract = {
      children: {
        userMenu: {
          events: EventsContract<["goToSignInFormRequested"]>;
        };
        signInForm: {
          events: EventsContract<
            ["usernameChanged", "passwordChanged", "signInFormSubmitted"],
            { usernameChanged: string; passwordChanged: string }
          >;
        };
        createList: {
          events: EventsContract<
            ["listNameChanged"],
            { listNameChanged: string }
          >;
        };
      };
    };
    const userSignsIn = eventSequenceFactory<
      ShoppingListComponentContract,
      {
        username: string;
        password: string;
      }
    >()
      .atPath("/userMenu")
      .events("goToSignInFormRequested")
      .thenAtPath("/signInForm")
      .events("usernameChanged")
      .withPayloads(input => input.username)
      .thenAtPath("/signInForm")
      .events("passwordChanged")
      .withPayloads(input => input.password)
      .thenAtPath("/signInForm")
      .events("signInFormSubmitted");

    const input = { username: "alice", password: "demo" };
    expect(userSignsIn(input)).toEqual([
      {
        name: "goToSignInFormRequested",
        statePath: stringToStatePath("/userMenu"),
        payload: input,
        source: INPUTTED_BY_USER,
      },
      {
        name: "usernameChanged",
        statePath: stringToStatePath("/signInForm"),
        payload: "alice",
        source: INPUTTED_BY_USER,
      },
      {
        name: "passwordChanged",
        statePath: stringToStatePath("/signInForm"),
        payload: "demo",
        source: INPUTTED_BY_USER,
      },
      {
        name: "signInFormSubmitted",
        statePath: stringToStatePath("/signInForm"),
        payload: input,
        source: INPUTTED_BY_USER,
      },
    ]);
  });
});
