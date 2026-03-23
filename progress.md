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
