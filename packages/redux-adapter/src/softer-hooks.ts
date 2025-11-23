import {
  ComponentChildrenContract,
  ComponentContract,
  ComponentEventsContract,
  ComponentValuesContract,
  State,
} from "@softer-components/types";
import {
  ComponentPath,
  getChildrenNodes,
  findComponentDef,
  findSubStateTree,
  OWN_STATE_KEY,
} from "@softer-components/utils";
import { useDispatch, useSelector, useStore, shallowEqual } from "react-redux";
import {
  componentPathToString,
  eventToAction,
  softerRootState,
  stringToComponentPath,
} from "./softer-mappers";
import { SofterStore } from "./softer-store";
import { useMemo } from "react";
import { createSelector } from "reselect";

/////////////////////
// useSofterSelectors
/////////////////////

export const useSofterSelectors = <
  TValueContract extends ComponentValuesContract,
>(
  pathStr: string
): TValueContract =>
  useSelector((globalState) => {
    const store = useStore() as SofterStore;
    const componentPath = stringToComponentPath(pathStr);
    const componentDef = findComponentDef(
      store.rootComponentDef,
      componentPath
    );
    const selectors = componentDef.selectors ?? {};
    return Object.fromEntries(
      Object.entries(selectors)
        .map(
          ([selectorName, localSelector]) =>
            [
              selectorName,
              toGlobalStateSelector(componentPath)(localSelector),
            ] as const
        )
        .map(([selectorName, globalSelector]) => [
          selectorName,
          useSelector(globalSelector),
        ])
    ) as any;
  });
const toGlobalStateSelector =
  (path: ComponentPath) =>
  (selector: (componentState: State) => any) =>
  (globalState: any) =>
    selector(
      findSubStateTree(softerRootState(globalState), path)?.[OWN_STATE_KEY]
    );

/////////////////////
// useSofterDispatchers
/////////////////////
type EventsContractToUiDispatchers<
  TEventsContract extends ComponentEventsContract,
> = {
  [K in keyof TEventsContract &
    string]: TEventsContract[K]["payload"] extends undefined
    ? () => void
    : (payload: TEventsContract[K]["payload"]) => void;
};

export const useSofterEvents = <
  TEventsContract extends ComponentEventsContract,
>(
  pathStr: string
): EventsContractToUiDispatchers<TEventsContract> => {
  const componentPath = stringToComponentPath(pathStr);
  const dispatch = useDispatch();
  const store = useStore() as SofterStore;
  const componentDef = findComponentDef(store.rootComponentDef, componentPath);
  return Object.fromEntries(
    (componentDef.uiEvents ?? []).map((eventName: string) => {
      return [
        eventName,
        (payload: any) =>
          dispatch(
            eventToAction({
              componentPath,
              name: eventName,
              payload,
            })
          ),
      ];
    })
  ) as any;
};

/////////////////////
// useSofterChildrenPath
/////////////////////
type ExtractChildrenPath<TChildrenContract extends ComponentChildrenContract> =
  {
    [K in keyof TChildrenContract]: TChildrenContract[K] extends {
      isCollection: true;
    }
      ? string[]
      : string | null;
  };
export const useSofterChildrenPath = <
  TChildrenContract extends ComponentChildrenContract,
>(
  pathStr: string
): ExtractChildrenPath<TChildrenContract> => {
  const componentPath = stringToComponentPath(pathStr);
  const store = useStore() as SofterStore;
  // TODO make sure this is not re-created on each render
  const selector = (globalState) => {
    const componentState = findSubStateTree(
      softerRootState(globalState),
      componentPath
    );
    const componentDef = findComponentDef(
      store.rootComponentDef,
      componentPath
    );
    const childrenNodes = getChildrenNodes(componentDef, componentState);
    return Object.fromEntries(
      Object.entries(childrenNodes).map(([childName, childNode]) => {
        if (componentDef.childrenConfig?.[childName]?.isCollection) {
          const keys = childNode as string[];
          const paths = keys
            .map(
              (key) =>
                [...componentPath, [childName, key] as const] as ComponentPath
            )
            .map(componentPathToString);
          return [childName, paths];
        } else {
          const exists = childNode as boolean;
          const path = exists
            ? componentPathToString([
                ...componentPath,
                [childName, undefined] as const,
              ] as ComponentPath)
            : null;
          return [childName, path];
        }
      })
    ) as any;
  };
  return useSelector(selector);
};

/////////////////////
// useSofter
/////////////////////
export const useSofter = <TComponentContract extends ComponentContract>(
  pathStr: string
): [
  TComponentContract["values"],
  EventsContractToUiDispatchers<TComponentContract["events"]>,
  ExtractChildrenPath<TComponentContract["children"]>,
] => [
  useSofterSelectors<TComponentContract["values"]>(pathStr),
  useSofterEvents<TComponentContract["events"]>(pathStr),
  useSofterChildrenPath<TComponentContract["children"]>(pathStr),
];
