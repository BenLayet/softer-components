---
"@softer-components/redux-adapter": minor
"@softer-components/types": minor
"@softer-components/utils": minor
---

Simplifies API for single children: no more need to use key "0" for single children.

Breaking changes:

- In `ComponentContract.children`, each child can define 2 options `isCollection` and `isOptional`
- `ComponentDef.initialChildrenKeys` renamed to `ComponentDef.initialChildren` that defines:
  - `string[]` for the keys of children defined with `isCollection:true`
  - `boolean` for (exists or not) children defined with `isOptional:true`
- renamed `selectors` to `values` in event context
- renamed `selectors` to `values` in event context
- `ComponentDef.childrenComponents` renamed to `ComponentDef.childrenComponentDefs`
