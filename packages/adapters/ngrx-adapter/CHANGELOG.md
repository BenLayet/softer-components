# @softer-components/ngrx-adapter

## 0.9.1

### Patch Changes

- 2d8a0c3: fixes the published type declarations, which imported the sources of the monorepo ('../../types/src') instead of the "@softer-components/..." packages, so that the types were silently resolved as any in projects using them

  - adds the missing type declarations of ngrx-adapter
  - imports @softer-components/base-adapter instead of bundling a copy of it in redux-adapter, ngrx-adapter and test-utilities
  - declares @softer-components/types as a peer dependency of the packages whose types import it, so that the application and the packages share one single version of the types

- Updated dependencies [2d8a0c3]
  - @softer-components/base-adapter@0.9.1

## 0.9.0

### Minor Changes

- ad1f667: breaks packages into independant ones

### Patch Changes

- Updated dependencies [ad1f667]
  - @softer-components/base-adapter@0.9.0

## 0.8.0

### Minor Changes

- b2bbcd4: Version 0.8.0 to follow other @softer-components package versions

## 0.2.0

### Minor Changes

- 80abdc8: ngrx adapter added and minor fixes for redux adapter

### Patch Changes

- Updated services [80abdc8]
  - @softer-components/types@0.8.0
  - @softer-components/utils@0.8.0
