# Softer Components

Softer Components is a React component library project built with TypeScript, designed for creating reusable UI components with modern development practices.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Initial Repository Setup
Since this is a new repository, you'll need to bootstrap it first:

```bash
# Initialize the project as a Node.js package
npm init -y

# Install core dependencies - takes ~1 second
npm install react react-dom typescript @types/react @types/react-dom

# Install development dependencies - takes ~10 seconds. NEVER CANCEL.
npm install --save-dev webpack webpack-cli jest @testing-library/react @testing-library/jest-dom babel-loader @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin @types/jest ts-jest jsdom jest-environment-jsdom @eslint/js

# Initialize TypeScript configuration - takes <1 second
npx tsc --init
```

**CRITICAL**: After setup, you MUST update package.json to add `"type": "module"` and proper scripts. The validated package.json should include:
```json
{
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "test": "jest", 
    "lint": "eslint src/",
    "format": "prettier --write src/"
  }
}
```

### Required Configuration Files
After npm init, create these essential config files (validated working versions):

**tsconfig.json** (replace the generated one):
```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "esnext",
    "target": "es2020",
    "lib": ["es2020", "dom"],
    "types": ["jest", "node"],
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "strict": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "isolatedModules": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**jest.config.js**:
```js
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jest-environment-jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx|js|jsx)'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', {
      useESM: true,
    }],
  },
};
```

**src/setupTests.ts**:
```ts
import '@testing-library/jest-dom';
```

### Build and Development
- **Build**: `npm run build` (takes ~1.5 seconds)
- **Test**: `npm test` (takes ~1.5 seconds)
- **Lint**: `npm run lint` (takes ~1 second)
- **Format**: `npx prettier --write src/` (takes <1 second)
- **Type Check**: `npx tsc --noEmit` (takes ~1.7 seconds)

## Validation

### CRITICAL: Always Test Component Functionality
After making changes to components:
1. **Build the project**: `npm run build` - ensure no compilation errors (1.5s)
2. **Run tests**: `npm test` - verify all tests pass (1.5s)
3. **Test component rendering**: Create a test file to verify the component renders correctly
4. **Lint code**: `npm run lint` - ensure code style compliance (1s)
5. **Type check**: `npx tsc --noEmit` - verify TypeScript types are correct (1.7s)

**TOTAL VALIDATION TIME: ~5.7 seconds**

### Manual Validation Scenarios
For UI components, always:
- Import and render the component in a test environment using React Testing Library
- Verify props are passed correctly using proper TypeScript interfaces
- Test interactive elements with fireEvent from @testing-library/react
- Check that component exports are working from index.ts files
- Validate that the component can be imported from the main package index

### Before Committing
ALWAYS run these commands before committing:
```bash
npm run lint    # 1 second - Fix linting issues
npm run format  # <1 second - Format code  
npm run build   # 1.5 seconds - Check build
npm test        # 1.5 seconds - Run all tests
```

## Repository Structure

### Validated Working Structure
```
softer-components/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── types/
│   ├── utils/
│   ├── setupTests.ts
│   └── index.ts
├── dist/           # Built output (auto-generated)
├── package.json
├── tsconfig.json
├── jest.config.js
├── eslint.config.js
└── .gitignore
```

## Common Tasks

### Creating a New Component (Validated Pattern)
1. Create component directory: `mkdir -p src/components/ComponentName`
2. Create `ComponentName.tsx` with proper TypeScript interface:
```tsx
import React from 'react';

export interface ComponentNameProps {
  children: React.ReactNode;
  // other props
}

export const ComponentName: React.FC<ComponentNameProps> = ({ children }) => {
  return <div>{children}</div>;
};

export default ComponentName;
```
3. Create `ComponentName.test.tsx` using React Testing Library
4. Create `index.ts`: `export { ComponentName, type ComponentNameProps } from './ComponentName'; export { default } from './ComponentName';`
5. Update `src/components/index.ts` to export new component

### Package Management
- **Install dependency**: `npm install <package>` (3-10 seconds)
- **Install dev dependency**: `npm install --save-dev <package>` (3-10 seconds)

### Environment Information
- **Node.js version**: v20.19.5
- **npm version**: 10.8.2
- **Yarn available**: v1.22.22 (alternative)
- **Git version**: 2.51.0

## Build Timing Expectations (Validated)

| Command | Actual Time | Timeout Recommendation |
|---------|-------------|------------------------|
| `npm install` (core deps) | 1 second | 30 seconds |
| `npm install` (dev deps) | 10 seconds | 60 seconds |
| `npm run build` | 1.5 seconds | 30 seconds |
| `npm test` | 1.5 seconds | 30 seconds |
| `npm run lint` | 1 second | 30 seconds |
| `npx tsc --noEmit` | 1.7 seconds | 30 seconds |
| Full validation workflow | 5.7 seconds | 60 seconds |

**NEVER CANCEL build or install commands.** Wait for completion.

## Development Workflow

### Feature Development
1. Create feature branch: `git checkout -b feature/component-name`
2. Install dependencies if first time: Follow "Initial Repository Setup"
3. Create component files following the validated structure above
4. Write tests: Use `@testing-library/react` with proper jest configuration
5. Validate changes: Run full validation workflow (5.7 seconds total)
6. Commit changes with descriptive message
7. Push and create pull request

### Debugging Common Issues
- **"Cannot use import statement"**: Ensure `"type": "module"` is in package.json
- **Jest environment errors**: Ensure jest-environment-jsdom is installed
- **TypeScript module errors**: Use the validated tsconfig.json configuration above
- **ESLint v9 errors**: Use eslint.config.js (new format), not .eslintrc.*
- **Import/export issues**: Verify index.ts files properly export components
- **Test failures**: Ensure setupTests.ts is configured and imports jest-dom

## Available Tools and Alternatives

### Package Managers
- **Primary**: npm (recommended, all timings validated with npm)
- **Alternative**: yarn (available if needed)

### Testing
- **Unit Tests**: Jest 30.x with React Testing Library
- **Test Environment**: jest-environment-jsdom
- **Type Checking**: TypeScript compiler

### Code Quality
- **Linting**: ESLint 9.x with TypeScript support (new flat config format)
- **Formatting**: Prettier
- **Type Safety**: TypeScript with strict mode enabled

## Project-Specific Notes

- This is a component library built with ES modules
- All configurations have been validated to work together
- Build output goes to `dist/` directory
- Tests must be in `src/` directory to avoid dist conflicts
- Use React 19.x with modern JSX transform
- TypeScript strict mode is enabled for better type safety

## Frequently Used Commands Output (Current State)

### Repository Root After Setup
```bash
$ ls -la
total 44
drwxr-xr-x 7 runner runner 4096 Sep 19 14:40 .
drwxr-xr-x 3 runner runner 4096 Sep 19 14:31 ..
drwxrwxr-x 7 runner runner 4096 Sep 19 14:32 .git
drwxrwxr-x 2 runner runner 4096 Sep 19 14:37 .github
-rw-rw-r-- 1 runner runner   13 Sep 19 14:32 .gitignore
drwxrwxr-x 3 runner runner 4096 Sep 19 14:40 dist
-rw-rw-r-- 1 runner runner 1273 Sep 19 14:39 eslint.config.js
-rw-rw-r-- 1 runner runner  458 Sep 19 14:39 jest.config.js
drwxrwxr-x 693 runner runner 28672 Sep 19 14:38 node_modules
-rw-rw-r-- 1 runner runner 1322 Sep 19 14:38 package.json
-rw-rw-r-- 1 runner runner 20140 Sep 19 14:38 package-lock.json
drwxrwxr-x 4 runner runner 4096 Sep 19 14:39 src
-rw-rw-r-- 1 runner runner  609 Sep 19 14:38 tsconfig.json
```

### .gitignore Content
```
node_modules
```

### Test Output (Working)
```bash
$ npm test
 PASS  src/components/Button/Button.test.tsx
  Button
    ✓ renders children correctly (23 ms)
    ✓ calls onClick when clicked (6 ms) 
    ✓ applies correct variant class (3 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

## Getting Help

If commands don't work as expected:
1. Ensure all dependencies from "Initial Repository Setup" are installed
2. Verify package.json includes `"type": "module"`
3. Use the exact configuration files provided above
4. Check Node.js version matches: v20.19.5
5. Clear cache: `rm -rf node_modules package-lock.json && npm install`