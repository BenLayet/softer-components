import { INPUTTED_BY_USER, stringToStatePath } from "@softer-components/base-adapter";
import { describe, expect, it } from "vitest";

import { eventSequenceFactory } from "./test-event-factory";

describe("eventSequenceFactory", () => {
  it("uses input directly as payload when withPayload is not specified", () => {
    const setListName = eventSequenceFactory<string>()
      .atPath("/createList")
      .events("listNameChanged");

    expect(setListName("Groceries")).toEqual([
      {
        name: "listNameChanged",
        statePath: stringToStatePath("/createList"),
        payload: "Groceries",
        source: INPUTTED_BY_USER,
      },
    ]);
  });

  it("creates the same sign-in sequence as manual events", () => {
    const userSignsIn = eventSequenceFactory<{
      username: string;
      password: string;
    }>()
      .atPath("/userMenu")
      .events("goToSignInFormRequested")
      .thenAtPath("/signInForm")
      .events("usernameChanged")
      .withPayload(input => input.username)
      .events("passwordChanged")
      .withPayload(input => input.password)
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

  it("supports tuple args so generated functions can mirror regular signatures", () => {
    const userSignsIn = eventSequenceFactory<[username: string, password: string]>()
      .atPath("/userMenu")
      .events("goToSignInFormRequested")
      .thenAtPath("/signInForm")
      .events("usernameChanged")
      .withPayload(username => username)
      .events("passwordChanged")
      .withPayload((_username, password) => password)
      .events("signInFormSubmitted");

    expect(userSignsIn("alice", "demo")).toEqual([
      {
        name: "goToSignInFormRequested",
        statePath: stringToStatePath("/userMenu"),
        payload: "alice",
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
        payload: "alice",
        source: INPUTTED_BY_USER,
      },
    ]);
  });
});

