import { useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { shallowEqual } from "react-redux";
import {
  ComponentContract,
  ComponentValuesContract,
  ComponentEventsContract,
  ComponentChildrenContract,
  EventsContractToUiDispatchers,
} from "@softer-components/types";
import { findSubTree, findComponentDef } from "@softer-components/utils";
import {
  StateTree,
  OWN_STATE_KEY,
  CHILDREN_BRANCHES_KEY,
} from "@softer-components/utils";
import { softerRootState } from "./mappers";

/**
 * 🧵 useSofterSelectors with proper memoization
 *
 * Uses equality function to prevent unnecessary re-renders
 */
export const useSofterSelectors = <
  TValueContract extends ComponentValuesContract,
>(
  componentPath: string
): TValueContract => {
  // Selector function that extracts and computes values
  const selectValues = useCallback(
    (state: any): TValueContract => {
      const rootState = softerRootState(state);
      if (!rootState) return {} as TValueContract;

      const subTree = findSubTree(rootState, componentPath);
      if (!subTree) return {} as TValueContract;

      const ownState = subTree[OWN_STATE_KEY];
      if (!ownState) return {} as TValueContract;

      // Get component definition to access selectors
      const store = state as any;
      const componentDef = findComponentDef(
        store.rootComponentDef,
        componentPath
      );

      // Compute all selector values
      const values: any = {};
      if (componentDef.selectors) {
        for (const [name, selector] of Object.entries(componentDef.selectors)) {
          values[name] = selector(ownState);
        }
      }

      return values as TValueContract;
    },
    [componentPath]
  );

  // Use shallow equality to prevent re-renders when values haven't changed
  return useSelector(selectValues, shallowEqual);
};

/**
 * 🧵 useSofterEvents with stable references
 */
export const useSofterEvents = <
  TEventsContract extends ComponentEventsContract,
>(
  componentPath: string
): EventsContractToUiDispatchers<TEventsContract> => {
  const dispatch = useDispatch();

  // Get component definition to know which events are available
  const componentDef = useSelector((state: any) => {
    return findComponentDef(state.rootComponentDef, componentPath);
  }, shallowEqual);

  // Create stable event dispatchers
  const events = useMemo(() => {
    const eventNames = componentDef?.uiEvents || [];
    const dispatchers: any = {};

    for (const eventName of eventNames) {
      dispatchers[eventName] = (payload: any) => {
        dispatch({
          type: "softer/event",
          payload: {
            componentPath,
            name: eventName,
            payload,
          },
        });
      };
    }

    return dispatchers as EventsContractToUiDispatchers<TEventsContract>;
  }, [dispatch, componentPath, componentDef?.uiEvents]);

  return events;
};

/**
 * 🧵 useSofterChildrenPath with memoization
 */
export const useSofterChildrenPath = <
  TChildrenContract extends ComponentChildrenContract,
>(
  componentPath: string
): ExtractChildrenPath<TChildrenContract> => {
  // Selector function that extracts children paths
  const selectChildrenPaths = useCallback(
    (state: any): ExtractChildrenPath<TChildrenContract> => {
      const rootState = softerRootState(state);
      if (!rootState) return {} as ExtractChildrenPath<TChildrenContract>;

      const subTree = findSubTree(rootState, componentPath);
      if (!subTree) return {} as ExtractChildrenPath<TChildrenContract>;

      const childrenState = subTree[CHILDREN_BRANCHES_KEY];
      if (!childrenState) return {} as ExtractChildrenPath<TChildrenContract>;

      const paths: any = {};

      for (const [childName, childState] of Object.entries(childrenState)) {
        // Check if it's a collection (has numeric/string keys)
        const keys = Object.keys(childState);
        if (keys.length > 0 && typeof childState === "object") {
          // Determine if collection by checking structure
          const firstKey = keys[0];
          const firstValue = childState[firstKey];

          if (
            firstValue &&
            typeof firstValue === "object" &&
            OWN_STATE_KEY in firstValue
          ) {
            // Collection child
            paths[childName] = keys.map(
              (key) => `${componentPath}/${childName}:${key}`
            );
          } else {
            // Single child
            paths[childName] = `${componentPath}/${childName}`;
          }
        }
      }

      return paths as ExtractChildrenPath<TChildrenContract>;
    },
    [componentPath]
  );

  // Use shallow equality for stable reference
  return useSelector(selectChildrenPaths, shallowEqual);
};

/**
 * 🧵 useSofter - Main hook combining all three
 */
export const useSofter = <TComponentContract extends ComponentContract>(
  path: string
): [
  TComponentContract["values"],
  EventsContractToUiDispatchers<TComponentContract["events"]>,
  ExtractChildrenPath<TComponentContract["children"]>,
] => [
  useSofterSelectors<TComponentContract["values"]>(path),
  useSofterEvents<TComponentContract["events"]>(path),
  useSofterChildrenPath<TComponentContract["children"]>(path),
];

// Helper type
type ExtractChildrenPath<TChildrenContract extends ComponentChildrenContract> =
  {
    [K in keyof TChildrenContract]: TChildrenContract[K]["isCollection"] extends true
      ? string[]
      : string;
  };
