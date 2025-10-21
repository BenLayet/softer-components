import {describe, expect, it} from "vitest";
import {
    extractComponentDefPath,
    findComponentDef,
    findEventForwarders,
    findStateUpdater,
} from "./softerUtils";
import type {ComponentDef} from "@softer-components/types";

describe("mapComponentTree", () => {

    it("extract path from fullType", () => {
        // GIVEN a fullType string with multiple slashes
        const fullType = "/parent/child:1/eventType";

        // WHEN extractPath is called with the fullType
        const result = extractComponentDefPath(fullType);

        // THEN it should return the path up to and including the last slash
        expect(result).toEqual(["parent", "child"]);
    });

    it("should find component definition by path", () => {
        // GIVEN a component tree
        const grandChild: ComponentDef<any, any, any, any> = {};
        const child: ComponentDef<any, any, any, any> = {children: {grandChild}};
        const root: ComponentDef<any, any, any, any> = {children: {child}};

        // WHEN findComponentDef is called with the path to grandChild
        const path = ["child", "grandChild"];
        const result = findComponentDef(root, path);

        // THEN it should return the grandChild component definition
        expect(result).toBe(grandChild);
    });

    it("should find root state updater by action type", () => {
        // GIVEN a component tree
        const stateUpdater = (state) => ({...state});
        const root: ComponentDef<any, any, any, any> = {stateUpdaters: {stateUpdater}};

        // WHEN findComponentDef is called with the path to grandChild
        const result = findStateUpdater(root, "/stateUpdater");

        // THEN it should return the grandChild component definition
        expect(result).toBe(stateUpdater);
    });
    it("should find another state updater by action type", () => {
        // GIVEN a component tree
        const stateUpdater = (state) => ({...state});
        const grandChild: ComponentDef<any, any, any, any> = {stateUpdaters: {stateUpdater}};
        const child: ComponentDef<any, any, any, any> = {children: {grandChild}};
        const root: ComponentDef<any, any, any, any> = {children: {child}};

        // WHEN findComponentDef is called with the path to grandChild
        const result = findStateUpdater(root, "/child/grandChild/stateUpdater");

        // THEN it should return the grandChild component definition
        expect(result).toBe(stateUpdater);
    });


    it("should find event forwarder by action type", () => {
        // GIVEN a component tree
        const eventForwarder = {onEvent: "triggerEvent", thenDispatch: () => "newEvent"};
        const root: ComponentDef<any, any, any, any> = {eventForwarders: [eventForwarder]};
        // WHEN findComponentDef is called with the path to grandChild
        const result = findEventForwarders(root, "/triggerEvent");
        // THEN it should return the grandChild component definition
        expect(result).toEqual([{
            ...eventForwarder,
            componentPath: '/'
        },]);
    });
    it("should find event forwarder at grandChild level by action type", () => {
        // GIVEN a component tree
        const eventForwarder = {onEvent: "triggerEvent", thenDispatch: () => "newEvent"};
        const grandChild: ComponentDef<any, any, any, any> = {eventForwarders: [eventForwarder]};
        const child: ComponentDef<any, any, any, any> = {children: {grandChild}};
        const root: ComponentDef<any, any, any, any> = {children: {child}};
        // WHEN findComponentDef is called with the path to grandChild
        const result = findEventForwarders(root, "/child/grandChild/triggerEvent");
        // THEN it should return the grandChild component definition
        expect(result).toEqual([{
            ...eventForwarder,
            componentPath: '/child/grandChild/'
        },]);
    });
    it("should find event forwarder at child level by action type", () => {
        // GIVEN a component tree
        const eventForwarder = {onEvent: "grandChild/triggerEvent", thenDispatch: () => "newEvent"};
        const grandChild: ComponentDef<any, any, any, any> = {};
        const child: ComponentDef<any, any, any, any> = {children: {grandChild}, eventForwarders: [eventForwarder],};
        const root: ComponentDef<any, any, any, any> = {children: {child}};
        // WHEN findComponentDef is called with the path to grandChild
        const result = findEventForwarders(root, "/child/grandChild/triggerEvent");
        // THEN it should return the grandChild component definition
        expect(result).toEqual([{
            ...eventForwarder,
            componentPath: '/child/'
        },]);
    });
    it("should find event forwarder at ALL levels by action type", () => {
        // GIVEN a component tree
        const grandChildEventForwarder = {onEvent: "triggerEvent", thenDispatch: () => "newEvent"};
        const grandChild: ComponentDef<any, any, any, any> = {eventForwarders: [grandChildEventForwarder]};
        const childEventForwarder = {onEvent: "grandChild/triggerEvent", thenDispatch: () => "newEvent"};
        const child: ComponentDef<any, any, any, any> = {
            children: {grandChild},
            eventForwarders: [childEventForwarder]
        };
        const rootEventForwarder = {onEvent: "child/grandChild/triggerEvent", thenDispatch: () => "newEvent"};
        const root: ComponentDef<any, any, any, any> = {children: {child}, eventForwarders: [rootEventForwarder]};
        // WHEN findComponentDef is called with the path to grandChild
        const result = findEventForwarders(root, "/child/grandChild/triggerEvent");
        // THEN it should return the grandChild component definition
        expect(result).toEqual([{
            ...rootEventForwarder,
            componentPath: '/'
        }, {
            ...childEventForwarder,
            componentPath: '/child/'
        }, {
            ...grandChildEventForwarder,
            componentPath: '/child/grandChild/'
        },]);
    });
});
