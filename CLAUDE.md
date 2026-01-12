# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the Fluent UI monorepo - Microsoft's design system and component library for building web applications. It contains three main projects:

1. **Fluent UI React v9** (`@fluentui/react-components`) - **PRIMARY FOCUS**: Current stable version, actively developed
2. **Fluent UI React v8** (`@fluentui/react`) - **MAINTENANCE ONLY**: Legacy version, critical bug fixes only
3. **Fluent UI Web Components** (`@fluentui/web-components`) - Framework-agnostic web standards implementation

**Key Technologies:**

- Monorepo: Nx workspace with custom plugins
- Package Manager: Yarn v1 (NOT v2+)
- Node.js: ^22.0.0 or ^24.0.0
- Languages: TypeScript (strict mode), React 19
- Styling: Griffel (compile-time CSS-in-JS with atomic classes)
- Testing: Jest, Cypress, Storybook + StoryWright
- Version Management: Beachball

## Essential Commands

### Initial Setup

```bash
yarn                                    # Install dependencies and link packages
yarn clean                              # Clean all build artifacts
```

### Development Workflow

```bash
yarn start                              # Interactive prompt to choose project to run
yarn nx run <project>:build             # Build specific project with dependencies
yarn nx run-many -t build               # Build multiple projects
yarn nx run <project>:test              # Run tests for specific project
yarn nx run <project>:test -u           # Update Jest snapshots
yarn nx run <project>:start             # Start Storybook for component
yarn nx run <project>:lint              # Lint specific project
```

### Testing Commands

```bash
# Unit tests
yarn nx run react-button:test           # Run unit tests for react-button
yarn nx run react-button:test -u        # Update snapshots

# E2E tests
yarn nx run react-components:e2e        # Run Cypress E2E tests

# Visual regression tests
yarn nx run vr-tests-react-components:test-vr

# SSR compatibility tests
yarn nx run ssr-tests-v9:test-ssr

# Cross-version React compatibility tests
yarn nx run rit-tests-v9:test-rit
yarn nx run react-text:test-rit
```

### Component Generation (v9 only)

```bash
yarn create-component                   # Interactive component generator
```

### Release Management

```bash
yarn change                             # Create beachball change file (REQUIRED for PRs)
yarn check:change                       # Verify change files exist
```

### Discovery

```bash
yarn nx show projects                   # List all projects
```

## Repository Structure

```
fluentui/
├── packages/
│   ├── react-components/               # v9 components (PRIMARY FOCUS)
│   │   ├── react-button/
│   │   │   ├── library/src/            # Implementation
│   │   │   └── stories/src/            # Storybook stories
│   │   ├── react-avatar/
│   │   └── react-components/           # Suite package (exports all)
│   ├── react/                          # v8 components (MAINTENANCE ONLY)
│   ├── web-components/                 # Web Components implementation
│   └── charts/                         # Charting components (v8 and v9)
├── apps/
│   ├── public-docsite-v9/              # v9 Storybook documentation site
│   ├── public-docsite/                 # v8 documentation site
│   └── perf-test-react-components/     # Performance testing
├── scripts/                            # Build scripts and tooling
├── tools/
│   └── workspace-plugin/               # Custom Nx workspace plugins
├── docs/
│   └── react-v9/contributing/          # v9 contribution guides
├── nx.json                             # Nx workspace configuration
└── tsconfig.base.json                  # Base TypeScript configuration
```

## v9 Component Architecture (CRITICAL PATTERN)

Every v9 component follows this **EXACT** hook-based architectural pattern:

```
packages/react-components/react-component-name/
├── library/src/                        # Implementation source
│   ├── index.ts                        # Re-exports everything
│   ├── ComponentName.tsx               # Main component export
│   ├── components/ComponentName/       # Core implementation
│   │   ├── ComponentName.test.tsx      # Unit tests (adjacent to implementation)
│   │   ├── ComponentName.tsx           # ForwardRefComponent
│   │   ├── ComponentName.types.ts      # Props, State, Slots types
│   │   ├── index.ts                    # Local exports
│   │   ├── renderComponentName.tsx     # JSX rendering logic
│   │   ├── useComponentName.ts         # State management hook
│   │   └── useComponentNameStyles.styles.ts  # Griffel styling
│   ├── testing/                        # Test utilities
│   └── utils/                          # Reusable utilities (if needed)
└── stories/src/                        # Storybook documentation
    ├── ComponentName.stories.tsx       # Component stories
    └── ComponentNameDefault.stories.tsx # Default story
```

### Three Core Hooks Pattern

All v9 components use three core hooks:

1. **`useComponent_unstable(props, ref)`** - Processes props, creates slots, manages state
2. **`useComponentStyles_unstable(state)`** - Applies Griffel CSS-in-JS styling
3. **`renderComponent_unstable(state)`** - Pure JSX rendering from state

### Slot System

The slot system is fundamental to v9 component extensibility:

```tsx
// ComponentName.types.ts
type ComponentSlots = {
  root: Slot<'div'>;
  icon?: Slot<'span'>; // Optional slot
};

type ComponentState = {
  components: ComponentSlots;
  // ... other state properties
};

// useComponentName.ts
const state: ComponentState = {
  root: slot.always(props.root, { elementType: 'div' }),
  icon: slot.optional(props.icon, { elementType: 'span' }),
  // ... other state
};

// renderComponentName.tsx
export const renderComponent_unstable = (state: ComponentState) => {
  assertSlots<ComponentSlots>(state);
  return (
    <state.root>
      {state.icon && <state.icon />}
      {state.root.children}
    </state.root>
  );
};
```

### Griffel Styling (Compile-Time CSS-in-JS)

v9 uses Griffel for build-time CSS generation. Styles are extracted into atomic CSS classes at **build time**, not runtime:

```tsx
// useComponentStyles.styles.ts
import { makeStyles } from '@griffel/react';
import { tokens } from '@fluentui/react-theme';

export const useComponentStyles = makeStyles({
  root: {
    // ALWAYS use design tokens, not hardcoded values
    color: tokens.colorNeutralForeground1,
    backgroundColor: tokens.colorNeutralBackground1,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,

    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },

  // Size variations
  small: { padding: tokens.spacingVerticalXS },
  large: { padding: tokens.spacingVerticalL },
});

// Apply in component hook
export const useComponent_unstable = (props, ref) => {
  const classes = useComponentStyles();
  const state = {
    /* ... */
  };

  state.root.className = mergeClasses(
    classes.root,
    props.size === 'small' && classes.small,
    state.root.className, // ALWAYS preserve user className
  );

  return state;
};
```

### Design Tokens

**ALWAYS use design tokens** from `@fluentui/react-theme` instead of hardcoded values:

```tsx
// ✅ CORRECT
color: tokens.colorBrandForeground1;
padding: tokens.spacingVerticalM;
borderRadius: tokens.borderRadiusMedium;

// ❌ AVOID - breaks theming
color: '#0078d4';
padding: '8px';
```

## TypeScript Patterns (v9)

Required type structure for all v9 components:

```tsx
// ComponentName.types.ts
export type ComponentProps = ComponentPropsWithRef<'div'> & {
  appearance?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
};

export type ComponentState = Required<Pick<ComponentProps, 'appearance' | 'size'>> & {
  components: ComponentSlots;
  root: SlotProps<'div'>;
};

export type ComponentSlots = {
  root: Slot<'div'>;
  icon?: Slot<'span'>;
};

// ComponentName.tsx - Main component MUST use ForwardRefComponent
export const Component: ForwardRefComponent<ComponentProps> = React.forwardRef((props, ref) => {
  const state = useComponent_unstable(props, ref);
  useComponentStyles_unstable(state);
  return renderComponent_unstable(state);
});
```

## Testing Requirements

### Unit Tests (Jest + React Testing Library)

- Place tests adjacent to implementation: `ComponentName.test.tsx`
- Use React Testing Library (NOT Enzyme or react-test-renderer)
- Minimum 80% coverage expected
- Test files should cover: default behavior, all props, slots, accessibility, edge cases

```tsx
// ComponentName.test.tsx
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  it('renders correctly', () => {
    const { getByRole } = render(<ComponentName>Content</ComponentName>);
    expect(getByRole('button')).toBeTruthy();
  });

  it('handles onClick', async () => {
    const onClick = jest.fn();
    const { getByRole } = render(<ComponentName onClick={onClick} />);
    await userEvent.click(getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Accessibility Requirements

**WCAG 2.1 compliance required** for all interactive components:

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

### Storybook Stories

All components require comprehensive Storybook stories demonstrating:

- Default behavior
- All prop variations
- Slot customization examples
- Accessibility features

## Nx Workspace Guidelines

- **ALWAYS** run tasks through `nx` (not underlying tooling directly)
- Use `nx run`, `nx run-many`, or `nx affected` for task execution
- Understand project dependencies via: `yarn nx show project <project-name>`
- The workspace uses custom Nx plugins in `tools/workspace-plugin/`

## Development Best Practices

1. **Focus on v9**: Prioritize v9 components for new work. v8 is maintenance-only.

2. **Follow the Hook Pattern**: Use the three-hook pattern religiously for all v9 components.

3. **Use Slots for Extensibility**: All customizable parts should be slots.

4. **Design Tokens Only**: Never use hardcoded colors, spacing, or other values.

5. **Test Adjacent to Code**: Place `.test.tsx` files next to implementation.

6. **Create Change Files**: Run `yarn change` before creating PRs (required).

7. **API Documentation**: Run `yarn nx run <project>:generate-api` after API changes.

8. **Accessibility First**: Test with screen readers and keyboard navigation.

9. **Type Safety**: Use strict TypeScript with proper slot and state types.

10. **Build Dependencies**: v9 tests don't require build step, but it may run due to v8 presence.

## Git Workflow

1. Fork the repository (required for external contributors)
2. Clone your fork and set upstream:
   ```bash
   git clone https://github.com/<username>/fluentui.git
   git remote add upstream https://github.com/microsoft/fluentui.git
   ```
3. Create feature branch from `master`
4. Make changes, following component patterns
5. Run tests and lint
6. Create beachball change file: `yarn change`
7. Commit with co-author:
   ```
   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
   ```
8. Push to your fork and create PR against `master`

## Important Notes

- **Platform**: Team uses macOS or WSL, not native Windows
- **Yarn v1 Only**: DO NOT use Yarn v2 or higher
- **Node Version**: Must use ^22.0.0 or ^24.0.0
- **Main Branch**: `master` (not `main`)
- **Strict Mode**: All TypeScript must be in strict mode
- **No New v8 Features**: Only critical bug fixes for v8
- **Bundle Size**: Automated tracking via CI pipeline

## Common Issues

1. **Build step taking long**: Use `yarn workspace <package> test` for v9 packages to skip unnecessary builds
2. **Test watch mode**: Use `yarn test --watch` for v9 (not `yarn start-test`)
3. **Missing dependencies**: Run `yarn` from workspace root
4. **Stale cache**: Run `yarn clean` to clear build artifacts
5. **Type errors**: Ensure you're using correct Node version (22 or 24)

## Additional Resources

- **v9 Docs**: https://react.fluentui.dev/
- **v8 Docs**: https://aka.ms/fluentui-react
- **Web Components**: https://aka.ms/fluentui-web-components
- **Contributing Guide**: `docs/react-v9/contributing/README.md`
- **Component Implementation**: `docs/react-v9/contributing/component-implementation-guide.md`
- **Design Specs**: `specs/` directory
