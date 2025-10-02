import {ComponentDef, State} from '@softer-components/types'
import { createSlice } from '@reduxjs/toolkit';

let idCounter = 1;  
const resolveDefaults = <TState extends State>(componentDef: ComponentDef<TState>):Required<ComponentDef<TState>>  => {
  return {
    name: "softer-component#" + (idCounter++),
    initialState: componentDef.initialState ?? {} as TState,
    reducers: {
    },
    selectors: {
    } ,
    children: {},
    chainedEvents: [],
    ...componentDef,
  };
}

export const createSofterSlice = (componentDef: ComponentDef<any>) => {
  const resolvedComponentDef = resolveDefaults(componentDef);
  return createSlice(resolvedComponentDef);
}