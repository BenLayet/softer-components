import { ComponentDef, Event, Payload, State } from "@softer-components/types";
import {
  extractEventName,
  findComponentDefFromPathArray,
} from "./component-def-map";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FORWARDING EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export function generateEventsToForward(
  rootComponentDef: ComponentDef<any, any, any>,
  globalState: Record<string, State>,
  triggeringEvent: Event
) {
  const result: Event[] = [];

  const eventName = extractEventName(triggeringEvent.type);
  //remove first slash and last slash + event name to get component path array of non empty strings
  const componentPathArray = triggeringEvent.type.split("/").slice(1, -1);
  const [componentPath, componentState, componentDef] =
    findStateAndComponentDef(rootComponentDef, globalState, componentPathArray);

  // Create events to forward for the component that the event was dispatched to
  result.push(
    ...generateEventsFromForwarders(
      componentDef,
      eventName,
      componentState,
      triggeringEvent.payload,
      componentPath
    )
  );
  if (componentPathArray.length > 0) {
    // Create events to forward for the parent component listening to child events
    const parentPathArray = componentPathArray.slice(0, -1);
    const [parentComponentPath, parentComponentState, parentComponentDef] =
      findStateAndComponentDef(rootComponentDef, globalState, parentPathArray);
    const childName = componentPathArray[componentPathArray.length - 1];

    result.push(
      ...generateEventFromChildListeners(
        parentComponentDef,
        parentComponentState,
        parentComponentPath,
        childName,
        eventName,
        triggeringEvent.payload
      )
    );
  }

  // Create events to forward for the component that the event was dispatched to
  result.push(
    ...generateCommandsToChildren(
      componentDef,
      eventName,
      componentState,
      triggeringEvent.payload,
      componentPath
    )
  );

  return result;
}

function findStateAndComponentDef(
  rootComponentDef: ComponentDef<any, any>,
  globalState: Record<string, State>,
  componentPathArray: string[]
): [string, State, ComponentDef] {
  const componentPath =
    `/${componentPathArray.join("/")}` +
    (componentPathArray.length > 0 ? "/" : "");
  const componentState = globalState[componentPath];
  const componentDef = findComponentDefFromPathArray(
    rootComponentDef,
    componentPathArray
  );

  if (!componentState || !componentDef) {
    throw new Error(
      `Could not find component state or definition for path: ${componentPath}`
    );
  }
  return [componentPath, componentState, componentDef];
}

////////////////////////////
// Internal event forwarders
////////////////////////////
function generateEventsFromForwarders(
  componentDef: ComponentDef,
  eventName: string,
  componentState: State,
  payload: Payload,
  componentPath: string
) {
  const forwarders = componentDef.eventForwarders ?? [];
  return forwarders
    .filter((forwarder) => forwarder.from === eventName)
    .filter(
      (forwarder) =>
        !forwarder.onCondition || forwarder.onCondition(componentState, payload)
    )
    .map((forwarder) => ({
      type: `${componentPath}${forwarder.to}`,
      payload: forwarder.withPayload
        ? forwarder.withPayload(componentState, payload)
        : payload,
    }));
}
////////////////////////////
// Commands to children
////////////////////////////
function generateCommandsToChildren(
  componentDef: ComponentDef,
  eventName: string,
  componentState: State,
  payload: Payload,
  componentPath: string
) {
  return Object.entries(componentDef.children ?? {}).flatMap(
    ([childName, childDef]) =>
      (childDef.commands ?? [])
        .filter((command) => command.from === eventName)
        .filter(
          (command) =>
            !command.onCondition || command.onCondition(componentState, payload)
        )
        .map((command) => ({
          type: `${componentPath}${childName}/${command.to}`,
          payload:
            typeof command.withPayload === "function"
              ? command.withPayload(componentState, payload as never)
              : payload,
        }))
  );
}

////////////////////////////
// Child listeners
////////////////////////////
function generateEventFromChildListeners(
  parentComponentDef: ComponentDef,
  parentComponentState: State,
  parentComponentPath: string,
  childName: string,
  eventName: string,
  payload: Payload
) {
  return Object.entries(parentComponentDef.children ?? {})
    .filter(([name]) => name === childName)
    .flatMap(([_name, childDef]) =>
      (childDef.listeners ?? [])
        .filter((listener) => listener.from === eventName)
        .filter(
          (listener) =>
            !listener.onCondition ||
            listener.onCondition(parentComponentState, payload)
        )
        .map((listener) => ({
          type: `${parentComponentPath}${listener.to}`,
          payload:
            typeof listener.withPayload === "function"
              ? listener.withPayload(parentComponentState, payload)
              : payload,
        }))
    );
}
