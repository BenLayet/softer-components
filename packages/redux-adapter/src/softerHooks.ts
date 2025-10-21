import {useDispatch, useSelector} from "react-redux";
import {
    Children,
    ComponentDef,
    Event,
    Selector,
    State,
    Value,
} from "@softer-components/types";

/////////////////////
// useSofterDispatchers
/////////////////////
type ExtractDispatchers<TUiEvents extends Event> = {
    [K in TUiEvents["type"]]: (
        payload: Extract<TUiEvents, { type: K }>["payload"],
    ) => void;
};

export const useSofterEvents = <TUiEvents extends Event>(
    path: string,
    componentDef: ComponentDef<any, any, any, any, TUiEvents>,
): ExtractDispatchers<TUiEvents> => {
    const dispatch = useDispatch();
    return componentDef.uiEventTypes?.reduce(
        (res, event) => ({
            ...res,
            [event]: (payload: any) =>
                dispatch({
                    type: `${path}${event}`,
                    payload,
                }),
        }),
        {},
    ) as any;
};

/////////////////////
// useSofterSelectors
/////////////////////
type ResolvedSelectors<TSelectors extends Record<string, Selector<any>>> = {
    [K in keyof TSelectors]: ReturnType<TSelectors[K]>;
};

export const useSofterSelectors = <
    TSelectors extends Record<string, Selector<any>>,
>(
    path: string,
    componentDef: ComponentDef<any, any, TSelectors>,
): ResolvedSelectors<TSelectors> => {
    const selectors = componentDef.selectors ?? ({} as TSelectors);
    return Object.fromEntries(
        Object.entries(selectors)
            .map(([key, selector]) => [key, toRootSelector(path)(selector)])
            .map(([key, selector]) => [key, useSelector(selector)]),
    );
};
const toRootSelector = (path: string) => (selector: Selector<Value>) =>
    ((rootState: Record<string, State>) =>
        selector(toComponentState(path)(rootState))) as any;

const toComponentState = (path: string) => (rootState: Record<string, State>) =>
    rootState[path];

/////////////////////
// useSofterChildrenPath
/////////////////////
type ExtractChildrenPath<TChildren extends Children<any, any>> = {
    [K in keyof TChildren]: TChildren[K] extends {
            isCollection: true;
        }
        ? string[]
        : string
};
export const useSofterChildrenPath = <TChildren extends Children<any, any>>(
    path: string,
    componentDef: ComponentDef<any, any, any, any, any, TChildren>,
): ExtractChildrenPath<TChildren> => {
    const componentState = useSelector((state: any) => state[path]);
    const children = componentDef.children ?? {} as Record<string, any>;
    return Object.entries(children).reduce((res, [childName, childDef]) => {
        if (childDef.isCollection == true) {
            const childCount = childDef.count ? childDef.count(componentState) : 1;
            const childrenNames = [];
            for (let i = 0; i < childCount; i++) {
                const childKey = childDef.childKey(componentState, i);
                childrenNames.push(`${path}${childName}:${childKey}/`);
            }
            res[childName] = childrenNames;
        } else {
            res[childName] = `${path}${childName}/`;
        }
        return res;
    }, {}) as any;
}
/////////////////////
// useSofter
/////////////////////
export const useSofter = <
    TSelectors extends Record<string, Selector<any>>,
    TUiEvents extends Event,
    TChildren extends Children<any, any>
>(
    path: string,
    componentDef: ComponentDef<any, any, TSelectors, any, TUiEvents, TChildren>,
): [
    ResolvedSelectors<TSelectors>,
    ExtractDispatchers<TUiEvents>,
    ExtractChildrenPath<TChildren>,
] => {
    return [
        useSofterSelectors(path, componentDef),
        useSofterEvents(path, componentDef),
        useSofterChildrenPath(path, componentDef),
    ];
};
