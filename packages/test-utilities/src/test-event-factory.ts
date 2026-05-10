import {
  INPUTTED_BY_USER,
  type SofterEvent,
  stringToStatePath,
} from "@softer-components/base-adapter";
import type { ComponentContract, Payload } from "@softer-components/types";

import type {
  ComponentTreePaths,
  EventNameAtPath,
  PayloadAtPathAndEvent,
} from "./component-path";

type SequenceArgs<TInput> = TInput extends undefined
  ? []
  : TInput extends unknown[]
    ? TInput
    : [TInput];
type PayloadResolver<TInput> = (...input: SequenceArgs<TInput>) => Payload;
type SequenceStep<TInput> = {
  name: string;
  path: string;
  payloadResolver: PayloadResolver<TInput>;
};

type AfterThenAtPathStage<
  TRootComponentContract extends ComponentContract,
  TPath extends string,
  TInput,
> = {
  events: <
    TSelectedEventName extends EventNameAtPath<TRootComponentContract, TPath>,
  >(
    firstEventName: TSelectedEventName,
    ...otherEventNames: TSelectedEventName[]
  ) => AfterEventsStage<
    TRootComponentContract,
    TPath,
    TSelectedEventName,
    TInput
  >;
};

type AfterWithPayloadsStage<
  TRootComponentContract extends ComponentContract,
  TPath extends string,
  TInput,
> = ((...input: SequenceArgs<TInput>) => SofterEvent[]) & {
  thenAtPath: <TNextPath extends ComponentTreePaths<TRootComponentContract>>(
    path: TNextPath,
  ) => AfterThenAtPathStage<TRootComponentContract, TNextPath, TInput>;
};

type AfterEventsStage<
  TRootComponentContract extends ComponentContract,
  TPath extends string,
  TEventName extends EventNameAtPath<TRootComponentContract, TPath>,
  TInput,
> = ((...input: SequenceArgs<TInput>) => SofterEvent[]) & {
  withPayloads: (
    payloadResolver: (
      ...input: SequenceArgs<TInput>
    ) => PayloadAtPathAndEvent<TRootComponentContract, TPath, TEventName>,
  ) => AfterWithPayloadsStage<TRootComponentContract, TPath, TInput>;
  thenAtPath: <TNextPath extends ComponentTreePaths<TRootComponentContract>>(
    path: TNextPath,
  ) => AfterThenAtPathStage<TRootComponentContract, TNextPath, TInput>;
};

type InitialStage<TRootComponentContract extends ComponentContract, TInput> = {
  atPath: <TPath extends ComponentTreePaths<TRootComponentContract>>(
    path: TPath,
  ) => AfterThenAtPathStage<TRootComponentContract, TPath, TInput>;
  events: <
    TSelectedEventName extends EventNameAtPath<TRootComponentContract, "">,
  >(
    firstEventName: TSelectedEventName,
    ...otherEventNames: TSelectedEventName[]
  ) => AfterEventsStage<
    TRootComponentContract,
    "",
    TSelectedEventName,
    TInput
  >;
};

const defaultPayloadResolver = <TInput>(
  ...args: SequenceArgs<TInput>
): Payload => args[0] as Payload;

export const eventSequenceFactory = <
  TRootComponentContract extends ComponentContract = ComponentContract,
  TInput = undefined,
>() => {
  const steps: SequenceStep<TInput>[] = [];
  let currentPath: string = "";
  let pendingPayloadIndexes: number[] = [];

  const createEvents = (...input: SequenceArgs<TInput>) =>
    steps.map(
      step =>
        ({
          name: step.name,
          statePath: stringToStatePath(step.path),
          payload: step.payloadResolver(...input),
          source: INPUTTED_BY_USER,
        }) satisfies SofterEvent,
    );

  const eventsAtPath = <TPath extends string>(
    _typedPath: TPath,
    firstEventName: EventNameAtPath<TRootComponentContract, TPath>,
    ...otherEventNames: EventNameAtPath<TRootComponentContract, TPath>[]
  ): AfterEventsStage<
    TRootComponentContract,
    TPath,
    EventNameAtPath<TRootComponentContract, TPath>,
    TInput
  > => {
    const path = currentPath;

    pendingPayloadIndexes = [firstEventName, ...otherEventNames].map(name => {
      steps.push({
        name,
        path,
        payloadResolver: defaultPayloadResolver<TInput>,
      });
      return steps.length - 1;
    });

    return createAfterEvents<
      TPath,
      EventNameAtPath<TRootComponentContract, TPath>
    >();
  };

  const withPayloads = <
    TPath extends string,
    TEventName extends EventNameAtPath<TRootComponentContract, TPath>,
  >(
    payloadResolver: (
      ...input: SequenceArgs<TInput>
    ) => PayloadAtPathAndEvent<TRootComponentContract, TPath, TEventName>,
  ): AfterWithPayloadsStage<TRootComponentContract, TPath, TInput> => {
    if (pendingPayloadIndexes.length === 0) {
      throw new Error("withPayloads can only be called right after events().");
    }

    for (const stepIndex of pendingPayloadIndexes) {
      steps[stepIndex].payloadResolver = payloadResolver;
    }

    pendingPayloadIndexes = [];
    return createAfterWithPayloads<TPath>();
  };

  const thenAtPath = <TPath extends ComponentTreePaths<TRootComponentContract>>(
    path: TPath,
  ): AfterThenAtPathStage<TRootComponentContract, TPath, TInput> => {
    currentPath = path;
    return createAfterThenAtPath(path);
  };

  const createAfterEvents = <
    TPath extends string,
    TEventName extends EventNameAtPath<TRootComponentContract, TPath>,
  >(): AfterEventsStage<TRootComponentContract, TPath, TEventName, TInput> =>
    Object.assign(createEvents, {
      withPayloads: (
        payloadResolver: (
          ...input: SequenceArgs<TInput>
        ) => PayloadAtPathAndEvent<TRootComponentContract, TPath, TEventName>,
      ) => withPayloads<TPath, TEventName>(payloadResolver),
      thenAtPath,
    }) as AfterEventsStage<TRootComponentContract, TPath, TEventName, TInput>;

  const createAfterThenAtPath = <TPath extends string>(
    typedPath: TPath,
  ): AfterThenAtPathStage<TRootComponentContract, TPath, TInput> => ({
    events: <
      TSelectedEventName extends EventNameAtPath<TRootComponentContract, TPath>,
    >(
      firstEventName: TSelectedEventName,
      ...otherEventNames: TSelectedEventName[]
    ) => {
      eventsAtPath(typedPath, firstEventName, ...otherEventNames);
      return createAfterEvents<TPath, TSelectedEventName>();
    },
  });

  const createAfterWithPayloads = <
    TPath extends string,
  >(): AfterWithPayloadsStage<TRootComponentContract, TPath, TInput> =>
    Object.assign(createEvents, {
      thenAtPath,
    }) as AfterWithPayloadsStage<TRootComponentContract, TPath, TInput>;

  const initialStage: InitialStage<TRootComponentContract, TInput> = {
    atPath: thenAtPath,
    events: <
      TSelectedEventName extends EventNameAtPath<TRootComponentContract, "">,
    >(
      firstEventName: TSelectedEventName,
      ...otherEventNames: TSelectedEventName[]
    ) => {
      eventsAtPath("", firstEventName, ...otherEventNames);
      return createAfterEvents<"", TSelectedEventName>();
    },
  };

  return initialStage;
};
