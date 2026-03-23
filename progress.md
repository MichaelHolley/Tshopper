## Completed Tasks

### Task 1: Add Store entity, configure EF relationships, apply migration
- Created `TshopperService/TshopperService/Data/Store.cs` with `Id`, `Name`, `Color` fields and `Items` navigation property
- Added nullable `StoreId` FK and `Store?` navigation property to `ShoppingItem`
- Updated `ShoppingListDbContext` to register `Stores` DbSet and configure the `Store` → `ShoppingItem` relationship with `OnDelete(DeleteBehavior.SetNull)`
- Generated and applied EF migration `AddStoreEntity` (adds `Stores` table, `StoreId` column on `ShoppingItems`, and FK with SET NULL on delete)
