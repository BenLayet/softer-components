# @softer-components/base-adapter

## 0.9.0

### Minor Changes

- ad1f667: breaks packages into independant ones

### Patch Changes

- Updated dependencies [ad1f667]
  - @softer-components/types@0.9.0

## 0.8.0

### Minor Changes

- 80abdc8: ngrx adapter added and minor fixes for redux adapter

### Patch Changes

- Updated services [80abdc8]
  - @softer-components/types@0.8.0

## 0.7.0

### Minor Changes

- 1ece9bb: minor improvements https://github.com/BenLayet/softer-components/issues/31

### Patch Changes

- Updated services [1ece9bb]
  - @softer-components/types@0.7.0

## 0.6.1

### Patch Changes

- 02df225: fixes test-utilities exports
- Updated services [02df225]
  - @softer-components/types@0.6.1

## 0.6.0

### Minor Changes

- 69d77db: Components can be passed down the component tree as 'context'

### Patch Changes

- Updated services [69d77db]
  - @softer-components/types@0.6.0

## 0.5.0

### Minor Changes

- e518a7c: Simplifies effect registration
- cc07468: Configures effects at configuration time

### Patch Changes

- Updated services [e518a7c]
- Updated services [cc07468]
  - @softer-components/types@0.5.0

## 0.4.2

### Patch Changes

- 3afefc0: fixes packing (excludes src)
- Updated services [3afefc0]
  - @softer-components/types@0.4.2

## 0.4.1

### Patch Changes

- 5a64dc6: removes src from export
- Updated services [5a64dc6]
  - @softer-components/types@0.4.1

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

- Updated services [6291eed]
  - @softer-components/types@0.4.0

## 0.3.3

### Patch Changes

- 6a0fca0: fixes minor typing issues
- Updated services [6a0fca0]
  - @softer-components/types@0.3.3

## 0.3.2

### Patch Changes

- ead9fb8: fixes selectors (part 2)
- Updated services [ead9fb8]
  - @softer-components/types@0.3.2

## 0.3.1

### Patch Changes

- fixes selectors that use children values
- Updated services
  - @softer-components/types@0.3.1

## 0.3.0

### Minor Changes

- parent selectors definition can use children selectors as parameters
- aac9205: Adds effects manager and test utilities

### Patch Changes

- Updated services
- Updated services [aac9205]
  - @softer-components/types@0.3.0
