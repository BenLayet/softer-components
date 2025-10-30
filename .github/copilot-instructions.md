# Softer Components

Softer Components is a state-manager-agnostic component library built with TypeScript in a monorepo structure, designed for creating reusable UI components with modern development practices.
**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Monorepo Structure

```
softer-components/
├── packages/
│   ├── types/                    # Core type definitions
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── utils/                    # Utility functions
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── redux-adapter/            # Redux integration
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── examples/
│       └── complete-example-shopping-list/
├── .github/copilot-instructions.md
├── package.json                  # Root workspace config
├── pnpm-workspace.yaml
└── tsconfig.json                 # Root project references
```

## Validated Development Workflow (5.7 seconds total)

### Per Package Validation

```bash
cd packages/utils  # Or any package
npm run lint    # 1 second - Check code style
npm run build   # 1.5 seconds - Verify compilation
npm test        # 1.5 seconds - Run tests
npx tsc --noEmit # 1.7 seconds - Type check
```

### Workspace-Level Commands

```bash
# From repository root
pnpm run build --filter="@softer-components/*"  # Build all packages
pnpm run test --filter="@softer-components/*"   # Test all packages
pnpm run lint --filter="@softer-components/*"   # Lint all packages
```
