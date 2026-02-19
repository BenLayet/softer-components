import {
  ChildrenContract,
  ComponentContract,
  EventsContract,
} from "@softer-components/types";
import { useDispatch, useSelector, useStore } from "react-redux";

import { SofterStore } from "./softer-store";

type ExtractUiDispatchers<TComponentContract extends ComponentContract> =
  TComponentContract["events"] extends EventsContract
    ? {
        [K in keyof TComponentContract["events"] &
          string]: TComponentContract["events"][K]["payload"] extends undefined
          ? () => void
          : (payload: TComponentContract["events"][K]["payload"]) => void;
      }
    : {};

type ExtractChildrenPaths<TComponentContract extends ComponentContract> =
  TComponentContract["children"] extends ChildrenContract
    ? {
        [K in keyof TComponentContract["children"]]: string[];
      }
    : {};
type ExtractSingleChildrenPaths<TComponentContract extends ComponentContract> =
  TComponentContract["children"] extends ChildrenContract
    ? {
        [K in keyof TComponentContract["children"]]: TComponentContract["children"][K] extends {
          type: "optional";
        }
          ? string | undefined
          : string;
      }
    : {};

export const useSofterSelectors = <
  TComponentContract extends ComponentContract,
>(
  pathStr: string,
): TComponentContract["values"] => {
  const store = useStore() as SofterStore;
  // Subscribe to Redux state with useSelector
  return useSelector(
    store.softerViewModel.valuesSelector(pathStr),
  ) as TComponentContract["values"];
};

export const useSofterEvents = <TComponentContract extends ComponentContract>(
  pathStr: string,
): ExtractUiDispatchers<TComponentContract> => {
  const store = useStore() as SofterStore;
  return store.softerViewModel.dispatchers(
    pathStr,
    useDispatch(),
  ) as ExtractUiDispatchers<TComponentContract>;
};

export const useSofterChildrenPaths = <
  TChildrenContract extends Record<string, ComponentContract>,
>(
  pathStr: string,
): ExtractChildrenPaths<TChildrenContract> => {
  const store = useStore() as SofterStore;
  // Subscribe to Redux state with useSelector
  return useSelector(
    store.softerViewModel.childrenPathsSelector(pathStr),
  ) as ExtractChildrenPaths<TChildrenContract>;
};
export const useSofterSingleChildrenPaths = <
  TChildrenContract extends Record<string, ComponentContract>,
>(
  pathStr: string,
): ExtractSingleChildrenPaths<TChildrenContract> => {
  const store = useStore() as SofterStore;
  // Subscribe to Redux state with useSelector
  return useSelector(
    store.softerViewModel.pathOfFirstInstanceOfEachChildSelector(pathStr),
  ) as ExtractSingleChildrenPaths<TChildrenContract>;
};

export const useSofter = <TComponentContract extends ComponentContract>(
  pathStr: string,
): [
  TComponentContract["values"],
  ExtractUiDispatchers<TComponentContract>,
  ExtractSingleChildrenPaths<TComponentContract>,
  ExtractChildrenPaths<TComponentContract>,
] => [
  useSofterSelectors<TComponentContract>(pathStr),
  useSofterEvents<TComponentContract>(pathStr),
  useSofterSingleChildrenPaths<TComponentContract>(pathStr),
  useSofterChildrenPaths<TComponentContract>(pathStr),
];
