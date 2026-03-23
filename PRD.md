# PRD: Multiple Shopping Lists Organized by Store

**Issue**: #20
**Status**: Planned

## Problem

The app has a single shared shopping list with no way to organize items by retailer. Users shopping at multiple stores have no way to separate or target items per destination.

## Solution

Introduce Stores — named lists that items can optionally belong to. Items without a store remain accessible as unassigned. Navigation is reworked to make switching between stores the primary interaction on both mobile and desktop.

## Rules & Constraints

- `StoreId` on `ShoppingItem` is **nullable** — items can exist without a store
- Deleting a store does **not** cascade; it sets `StoreId` to `null` on affected items
- No default/seed store is required

## Implementation Todos

1. Add `Store` EF model, add nullable `StoreId` FK to `ShoppingItem`, configure no-cascade (set null on delete), and apply the migration
2. Create `IStoreService` / `StoreService` and `StoreController` with full CRUD
3. Update `ShoppingListService` and `ShoppingListHub` to scope operations to `storeId` (nullable)
4. Add `Store` type to `types.d.ts` and create `StoreStore.ts` Pinia store
5. Update `ShoppingListStore.ts` to scope item operations and SignalR listeners to `activeStoreId`
6. Rework navigation: create `SideDrawer.vue`, `StoreNav.vue`, update `App.vue` / `NavBar.vue`, remove old `TabNavigation`
7. Add "Manage Stores" modal in the side drawer (create, rename, delete)
8. Update `ShoppingListView.vue` and `ShoppingListForm.vue` to use the active store
