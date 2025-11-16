import {
  ComponentChildrenContract,
  ComponentContract,
  ComponentEventsContract,
  ComponentValuesContract,
  State,
} from "@softer-components/types";
import {
  ComponentPath,
  extractChildrenNodes,
  findComponentDef,
  findSubStateTree,
  OWN_STATE_KEY,
} from "@softer-components/utils";
import { useDispatch, useSelector, useStore } from "react-redux";
import { eventToAction, softerRootState } from "./softer-mappers";
import { SofterStore } from "./softer-store";

/////////////////////
// useSofterSelectors
/////////////////////

export const useSofterSelectors = <
  TValueContract extends ComponentValuesContract,
>(
  componentPath: ComponentPath
): TValueContract => {
  const store = useStore() as SofterStore;
  const componentDef = findComponentDef(store.rootComponentDef, componentPath);
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
};
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
  componentPath: ComponentPath
): EventsContractToUiDispatchers<TEventsContract> => {
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
      ? ComponentPath[]
      : ComponentPath | null;
  };
export const useSofterChildrenPath = <
  TChildrenContract extends ComponentChildrenContract,
>(
  componentPath: ComponentPath
): ExtractChildrenPath<TChildrenContract> => {
  const componentState = useSelector((globalState) =>
    findSubStateTree(softerRootState(globalState), componentPath)
  );
  const store = useStore() as SofterStore;
  const componentDef = findComponentDef(store.rootComponentDef, componentPath);
  const childrenNodes = extractChildrenNodes(componentDef, componentState);
  return Object.fromEntries(
    Object.entries(childrenNodes).map(([childName, childNode]) => {
      if (componentDef.childrenConfig?.[childName]?.isCollection) {
        const keys = childNode as string[];
        return keys.map(
          (key) =>
            [...componentPath, [childName, key] as const] as ComponentPath
        );
      } else {
        const exists = childNode as boolean;
        return exists
          ? ([
              ...componentPath,
              [childName, undefined] as const,
            ] as ComponentPath)
          : null;
      }
    })
  ) as any;
};

/////////////////////
// useSofter
/////////////////////
export const useSofter = <TComponentContract extends ComponentContract>(
  path: ComponentPath
): [
  TComponentContract["values"],
  EventsContractToUiDispatchers<TComponentContract["events"]>,
  ExtractChildrenPath<TComponentContract["children"]>,
] => [
  useSofterSelectors<TComponentContract["values"]>(path),
  useSofterEvents<TComponentContract["events"]>(path),
  useSofterChildrenPath<TComponentContract["children"]>(path),
];
