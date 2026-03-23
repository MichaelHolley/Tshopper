## Completed Tasks

### Task 1: Add Store entity, configure EF relationships, apply migration
- Created `TshopperService/TshopperService/Data/Store.cs` with `Id`, `Name`, `Color` fields and `Items` navigation property
- Added nullable `StoreId` FK and `Store?` navigation property to `ShoppingItem`
- Updated `ShoppingListDbContext` to register `Stores` DbSet and configure the `Store` → `ShoppingItem` relationship with `OnDelete(DeleteBehavior.SetNull)`
- Generated and applied EF migration `AddStoreEntity` (adds `Stores` table, `StoreId` column on `ShoppingItems`, and FK with SET NULL on delete)

### Task 2: Create IStoreService / StoreService and StoreController with full CRUD
- Created `TshopperService/TshopperService/Services/IStoreService.cs` with `GetAllStoresAsync`, `GetStoreByIdAsync`, `AddStoreAsync`, `UpdateStoreAsync`, `DeleteStoreAsync`
- Created `TshopperService/TshopperService/Services/StoreService.cs` implementing `IStoreService` with EF Core queries; stores sorted by `Name`; validation via `BusinessException`
- Created `TshopperService/TshopperService/Controllers/StoreController.cs` with `[Authorize]` REST endpoints: `GET /api/Store`, `GET /api/Store/{id}`, `POST /api/Store`, `PUT /api/Store/{id}`, `DELETE /api/Store/{id}`
- Registered `IStoreService` / `StoreService` as a scoped service in `Program.cs`
- Build passes with 0 errors

### Task 3: Update ShoppingListService and ShoppingListHub to scope operations to storeId (nullable)
- Updated `IShoppingListService` to add `int? storeId` parameter to `GetAllItemsAsync`, `AddItemAsync`, `DeleteAllCheckedItemsAsync`, and `ReorderItemsAsync`
- Updated `ShoppingListService` to filter all queries by `StoreId == storeId` (EF Core handles NULL equality correctly); `AddItemAsync` now sets `StoreId` on the new item; `UncheckItemAsync` scopes its `maxSortOrder` query to the item's own store
- Updated `ShoppingListHub` to accept and forward `storeId` on `GetAllItems`, `AddItem`, `DeleteAllCheckedItems`, `DeleteItem`, and `ReorderItems`; `CheckItem` and `UncheckItem` derive `storeId` from the returned item; `ReceiveUpdate` now broadcasts `(storeId, items)` so clients can refresh only the affected store
- Build passes with 0 errors

### Task 4: Add Store interface to types.d.ts and create StoreStore.ts Pinia store
- Added `Store` interface (`id`, `name`, `color`) to `Tshopper-web/src/types.d.ts`
- Added optional `storeId?: number | null` field to `ShoppingItem` interface in `types.d.ts`
- Created `Tshopper-web/src/stores/StoreStore.ts` with `useStoreStore` Pinia store containing:
  - State: `stores: Store[]`, `activeStoreId: number | null`
  - Getter: `activeStore` (resolves active store object from `activeStoreId`)
  - Actions: `getStores`, `addStore`, `updateStore`, `deleteStore` (full REST CRUD against `/api/Store`), `setActiveStore`
  - `deleteStore` clears `activeStoreId` if the active store is deleted; local list is kept sorted by name after add/update
- Frontend type-check (`vue-tsc`) and production build pass with 0 errors

### Task 5: Update ShoppingListStore.ts to scope operations to activeStoreId
- Imported `useStoreStore` into `ShoppingListStore.ts`
- Updated `ReceiveUpdate` SignalR listener to accept `(storeId, items)` signature; items are only written to state when `storeId` matches `activeStoreId` (ignores broadcasts for other stores)
- Updated `getAllItems` to invoke `GetAllItems(activeStoreId)` on the hub
- Updated `addItem` to invoke `AddItem(item, quantity, activeStoreId)`
- Updated `deleteItem` to invoke `DeleteItem(itemId, activeStoreId)`
- Updated `deleteAllCheckedItems` to invoke `DeleteAllCheckedItems(activeStoreId)`
- Updated `reorderItems` to invoke `ReorderItems(orderedItemIds, activeStoreId)`
- Added `setActiveStore(id)` action that delegates to `StoreStore.setActiveStore`, clears `items`, and reloads items for the new store
- Frontend type-check and production build pass with 0 errors

### Task 6: Rework navigation — SideDrawer, StoreNav, updated NavBar and App
- Created `Tshopper-web/src/components/StoreNav.vue`: renders an "All items" entry (sets `activeStoreId` to `null`) plus one button per store (colored dot + name); a divider then a "Data Transfer" nav link; selecting any option calls `ShoppingListStore.setActiveStore`, navigates to `/`, and closes the drawer
- Created `Tshopper-web/src/components/SideDrawer.vue`: fixed slide-in panel (Tailwind CSS transition) with animated backdrop overlay; header shows "Tshopper" title and close button; body contains `<StoreNav>`; footer has a logout button that disconnects SignalR and redirects to `/login`; `open` prop + `close` emit
- Updated `Tshopper-web/src/components/NavBar.vue`: added hamburger `UButton` (emits `open-drawer`) hidden on login screen; title now shows active store name (or "All items") instead of static "Tshopper"; connection status and item count remain on the right
- Updated `Tshopper-web/src/App.vue`: imports `SideDrawer`, adds `drawerOpen` ref; passes `open` to `SideDrawer` and listens for `close`; added `storeStore.getStores()` call on authentication; removed `<TabNavigation>` from template; `NavBar` emits `open-drawer` to set `drawerOpen = true`
- `TabNavigation.vue` is no longer referenced anywhere in the codebase (kept on disk but unused)
- `vue-tsc` type-check and `vite build` production build pass with 0 errors
