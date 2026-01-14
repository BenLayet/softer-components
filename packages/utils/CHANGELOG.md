# @softer-components/utils

## 0.4.0

### Minor Changes

- 6291eed: Simplifies API for single children: no more need to use key "0" for single children.

  Breaking changes:
  - In `ComponentContract.children`, each child can define 2 options `isCollection` and `isOptional`
  - `ComponentDef.initialChildrenKeys` renamed to `ComponentDef.initialChildren` that defines:
    - `string[]` for the keys of children defined with `isCollection:true`
    - `boolean` for (exists or not) children defined with `isOptional:true`
  - renamed `selectors` to `values` in event context
  - renamed `selectors` to `values` in event context
  - `ComponentDef.childrenComponents` renamed to `ComponentDef.childrenComponentDefs`

### Patch Changes

- Updated dependencies [6291eed]
  - @softer-components/types@0.4.0

## 0.3.3

### Patch Changes

- 6a0fca0: fixes minor typing issues
- Updated dependencies [6a0fca0]
  - @softer-components/types@0.3.3

## 0.3.2

### Patch Changes

- ead9fb8: fixes selectors (part 2)
- Updated dependencies [ead9fb8]
  - @softer-components/types@0.3.2

## 0.3.1

### Patch Changes

- fixes selectors that use children values
- Updated dependencies
  - @softer-components/types@0.3.1

## 0.3.0

### Minor Changes

- parent selectors definition can use children selectors as parameters
- aac9205: Adds effects manager and test utilities

### Patch Changes

- Updated dependencies
- Updated dependencies [aac9205]
  - @softer-components/types@0.3.0
