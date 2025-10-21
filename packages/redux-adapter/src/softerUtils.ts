import {ComponentDef, EventForwarderDef, State} from "@softer-components/types";

export const initialStateTree = (componentDef: ComponentDef<any, any, any, any>): State => {
    return refreshStateTree({}, componentDef);
}
export const refreshStateTree = (
    previousGlobalState: Record<string, State> = {},
    componentDef: ComponentDef<any, any, any, any>,
    componentPath: string = "/",
    initialStateFn: () => State = () => (componentDef.initialState ?? {}),
    globalState: Record<string, State> = {},
): State => {
    const componentState = previousGlobalState[componentPath] ?? initialStateFn();
    globalState[componentPath] = componentState;
    const childrenDef = componentDef.children ?? {};
    Object.entries(childrenDef).map(
        ([childName, childDef]) => {
            if (childDef.isCollection == true) {
                const childCount = childDef.count(componentState);
                for (let i = 0; i < childCount; i++) {
                    const childKey = childDef.childKey(componentState, i);
                    const childPath = `${componentPath}${childName}:${childKey}/`;
                    const initialChildStateFactory =
                        () => childDef.initialStateFactory(componentState, childKey) ?? childDef.initialState;
                    refreshStateTree(previousGlobalState, childDef, childPath, initialChildStateFactory, globalState);
                }
            } else {
                const childPath = `${componentPath}${childName}/`;
                const initialChildStateFactory = () => childDef.initialStateFactory ? childDef.initialStateFactory(componentState) : childDef.initialState;
                refreshStateTree(previousGlobalState, childDef, childPath, initialChildStateFactory, globalState);
            }
        },
    );
    return globalState;
}

export const extractComponentPathStr = (fullType: string): string => {
    return fullType.slice(0, fullType.lastIndexOf("/") + 1);
};
export const extractComponentDefPath = (fullType: string): string[] => {
    const parts = fullType.split("/");
    if (parts.length < 2) {
        return [];
    }
    return parts.slice(1, -1).map((part) => part.split(":")[0]);
};

export const extractEventName = (fullType: string): string => {
    const lastSlashIndex = fullType.lastIndexOf("/");
    if (lastSlashIndex === -1) {
        return "";
    }
    return fullType.slice(lastSlashIndex + 1);
};

export const findComponentDef = (
    componentDef: ComponentDef<any, any, any, any>,
    path: string[]
): ComponentDef<any, any, any, any> | undefined => {
    if (path.length === 0) {
        return componentDef;
    }
    const children = componentDef.children ?? {};
    const childName = path[0];
    const child = children[childName];
    if (!child) {
        throw new Error(`invalid path: childName = ${childName} not found in children = ${JSON.stringify(Object.keys(children))}`)
    }
    return findComponentDef(child, path.slice(1));
};

export const findStateUpdater = (rootComponentDef: ComponentDef<any, any, any, any>, actionType: string) => {
    const componentDef = findComponentDef(rootComponentDef, extractComponentDefPath(actionType));
    const stateUpdaters = componentDef?.stateUpdaters ?? {};
    const eventName = extractEventName(actionType);
    return stateUpdaters[eventName];
}
export const findEventForwarders = (rootComponentDef: ComponentDef<any, any, any, any>, actionType: string) => {
    const result: EventForwarderDef<any, any>[] = [];
    const parts = actionType.split("/");
    for (let i = 0; i < parts.length - 1; i++) {
        const pathStr = parts.slice(0, i + 1).join("/") + '/';
        const componentPath = extractComponentDefPath(pathStr);
        const relativeActionType = parts.slice(i + 1).join("/");
        const componentDef = findComponentDef(rootComponentDef, componentPath);
        addEventForwarders(componentDef, pathStr, relativeActionType, result);
    }
    return result;
}

const addEventForwarders = (componentDef: ComponentDef<any, any, any, any>, componentPath: string, relativeActionType: string, result: any[]) => {
    const eventForwarders = componentDef?.eventForwarders ?? [];
    eventForwarders
        .filter(ef => isActionTypeMatch(ef.onEvent, relativeActionType))
        .forEach(ef => {
            result.push({...ef, componentPath})
        });
}

const isActionTypeMatch = (actionType1: string, actionType2: string) => {
    const parts1 = actionType1.split("/");
    const parts2 = actionType2.split("/");
    if (parts1.length !== parts2.length) {
        return false;
    }
    return parts1.every((part1, i) => isComponentPartMatch(part1, parts2[i]));
}
const isComponentPartMatch = (part1: string, part2: string) => {
    const [componentName1, componentKey1] = part1.split(":");
    const [componentName2, componentKey2] = part2.split(":");
    if (componentName1 !== componentName2) {
        return false;
    }
    if (componentKey1 && componentKey2) {
        return componentKey1 === componentKey2;
    }
    //if one is not defined, it's a wildcard'
    return true;

}