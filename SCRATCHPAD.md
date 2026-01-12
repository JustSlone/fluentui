# SkeletonItem Size Fix - Plan

## Issue

Fix for #35633 - SkeletonItem size does not match line-height

## What We've Done So Far

### ✅ Completed

1. Added missing size values (14, 22, 52, 92) to `SkeletonItemSize` type in `SkeletonItem.types.ts`
2. Added corresponding styles for new sizes in `useSkeletonItemStyles.styles.ts`:
   - Updated `useRectangleStyles` with new height values
   - Updated `useSizeStyles` with new width/height combinations
3. Ran tests - all passing (42 tests)
4. Created beachball change file (patch)
5. Pushed branch `fix/skeleton-item-typography-sizes` to fork (JustSlone/fluentui)

### Commits

- `8dfbc8e5da` - fix(react-skeleton): Add missing SkeletonItem sizes to match typography line-heights
- `6f8fb9dceb` - Change files

## What's Left To Do

### 1. Update Storybook Stories

**Location:** `packages/react-components/react-skeleton/stories/src/Skeleton/`

Files to potentially update:

- `SkeletonItemSize.stories.tsx` - Main size demonstration story
- Other relevant stories that showcase sizes

**Goal:** Demonstrate all available sizes including the new ones (14, 22, 52, 92)

**Approach:**

- Review existing `SkeletonItemSize.stories.tsx` to understand current pattern
- Add examples for sizes 14, 22, 52, and 92
- Ensure they're clearly labeled as matching typography line-heights
- Consider adding a story that specifically shows typography + skeleton alignment

### 2. Test Storybook Locally

**Command:** `yarn nx run react-skeleton:start`

**Verify:**

- All size options appear in controls
- New sizes (14, 22, 52, 92) render correctly
- Rectangle, square, and circle shapes work with new sizes
- Stories look good visually

### 3. Update Documentation (if needed)

Check if there's any documentation that lists available sizes:

- `packages/react-components/react-skeleton/library/README.md`
- `packages/react-components/react-skeleton/library/docs/Spec.md`
- Story descriptions in `.stories.tsx` files

### 4. Run Full Test Suite

Before creating PR:

```bash
yarn nx run react-skeleton:test        # Unit tests
yarn nx run react-skeleton:lint        # Lint check
yarn nx run react-skeleton:type-check  # TypeScript check
```

### 5. Create Pull Request

**Target:** `microsoft/fluentui:master`
**From:** `JustSlone/fluentui:fix/skeleton-item-typography-sizes`

**PR Title:**

```
fix(react-skeleton): Add missing SkeletonItem sizes to match typography line-heights
```

**PR Description Template:**

```markdown
## Summary

Adds missing size values (14, 22, 52, and 92) to `SkeletonItem` to support all typography line-heights in the Fluent UI design system.

## Typography Line-Heights vs SkeletonItem Sizes

**Typography line-heights:** 14px, 16px, 20px, 22px, 28px, 32px, 36px, 40px, 52px, 92px
**Previous SkeletonItem sizes:** 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 120, 128
**Missing sizes (now added):** 14, 22, 52, 92

## Changes

- Added sizes `14`, `22`, `52`, and `92` to `SkeletonItemSize` type
- Added corresponding styles in `useRectangleStyles` and `useSizeStyles`
- Updated Storybook stories to demonstrate new sizes
- All tests passing ✅

## Test Plan

- ✅ Unit tests pass
- ✅ Storybook renders new sizes correctly
- ✅ All shapes (rectangle, square, circle) work with new sizes

## Fixes

Fixes #35633
```

## Technical Details

### Files Modified

1. `packages/react-components/react-skeleton/library/src/components/SkeletonItem/SkeletonItem.types.ts`

   - Line 10: Updated `SkeletonItemSize` type to include 14, 22, 52, 92

2. `packages/react-components/react-skeleton/library/src/components/SkeletonItem/useSkeletonItemStyles.styles.ts`
   - Lines 106, 109, 116, 120: Added height styles for rectangles
   - Lines 129, 132, 139, 143: Added width/height styles for squares/circles

### Typography Line-Heights Reference

From Fluent UI design system: 14px, 16px, 20px, 22px, 28px, 32px, 36px, 40px, 52px, 92px

### Testing Notes

- Used React Testing Library (NOT Enzyme)
- All 42 existing tests pass without modification
- No breaking changes - only additive

## Next Immediate Step

Review and update `SkeletonItemSize.stories.tsx` to showcase the new sizes.
