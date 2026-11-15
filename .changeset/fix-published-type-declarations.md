---
"@softer-components/base-adapter": patch
"@softer-components/redux-adapter": patch
"@softer-components/ngrx-adapter": patch
"@softer-components/app-utilities": patch
"@softer-components/test-utilities": patch
---

fixes the published type declarations, which imported the sources of the monorepo ('../../types/src') instead of the "@softer-components/..." packages, so that the types were silently resolved as any in projects using them

- adds the missing type declarations of ngrx-adapter
- imports @softer-components/base-adapter instead of bundling a copy of it in redux-adapter, ngrx-adapter and test-utilities
- declares @softer-components/types as a peer dependency of the packages whose types import it, so that the application and the packages share one single version of the types
