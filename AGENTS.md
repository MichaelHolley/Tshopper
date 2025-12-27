# Agent Guidelines for Tshopper

This document provides guidelines for AI coding agents working in the Tshopper repository.

## Project Overview

Tshopper is a real-time shopping list application with:
- **Frontend**: Vue 3 + TypeScript + Vite (Tshopper-web/)
- **Backend**: .NET 8 ASP.NET Core with SignalR (TshopperService/)
- **Database**: SQLite with Entity Framework Core
- **Real-time**: SignalR for live updates across clients

## Build, Lint, and Test Commands

### Frontend (Tshopper-web/)

```bash
# Development
cd Tshopper-web
pnpm dev              # Start dev server

# Build & Type Check
pnpm build            # Full build with type checking
pnpm build-only       # Build without type checking
pnpm type-check       # Run TypeScript compiler check only

# Code Quality
pnpm lint             # Run ESLint with auto-fix
pnpm format           # Format code with Prettier

# Preview
pnpm preview          # Preview production build
```

### Backend (TshopperService/)

```bash
# Build
cd TshopperService
dotnet build          # Build solution
dotnet build --configuration Release

# Run
dotnet run --project TshopperService/TshopperService.csproj

# Test (when tests are added)
dotnet test                           # Run all tests
dotnet test --filter FullyQualifiedName~ServiceTests  # Single test class
dotnet test --filter Name~AddItemAsync                # Single test method

# Database migrations
dotnet ef migrations add MigrationName --project TshopperService
dotnet ef database update --project TshopperService
```

## Code Style Guidelines

### Frontend (TypeScript/Vue)

#### Formatting & Linting
- **Prettier**: Semi-colons disabled, single quotes, 100 char line width
- **ESLint**: Vue 3 essential rules + TypeScript recommended config
- **Auto-fix**: Always run `pnpm lint` before committing

#### TypeScript
- **Strict Mode**: `useUnknownInCatchVariables: true` in tsconfig
- **Type Imports**: Use `import type` for type-only imports
  ```typescript
  import type { ShoppingItem, Category } from '@/types'
  import { HubConnectionBuilder } from '@microsoft/signalr'
  ```
- **No `any`**: Always provide explicit types, prefer `unknown` in catch blocks
- **Vue Props/Emits**: Use TypeScript syntax with `defineProps<>()` and `defineEmits<>()`

#### Imports Order
1. Vue core imports
2. Type imports (`import type`)
3. Third-party libraries (e.g., SignalR, Pinia)
4. Local stores/composables
5. Local types/utilities

Example:
```typescript
import { computed } from 'vue'
import type { ShoppingItem } from '@/types'
import { HubConnectionBuilder } from '@microsoft/signalr'
import { defineStore } from 'pinia'
import { useAuthStore } from './AuthStore'
```

#### Naming Conventions
- **Variables/Functions**: camelCase (`shoppingItems`, `addItem`)
- **Types/Interfaces**: PascalCase (`ShoppingItem`, `Category`)
- **Constants**: SCREAMING_SNAKE_CASE or camelCase for local constants
- **Vue Components**: PascalCase files (`ShoppingListItem.vue`)
- **Stores**: PascalCase with "Store" suffix (`useShoppingListStore`)

#### Vue Components
- **Script Setup**: Always use `<script setup lang="ts">`
- **Props**: Destructure with `defineProps<{ ... }>()`
- **Emits**: Define with explicit types using `defineEmits<{ ... }>()`
- **Computed**: Use `computed()` for derived state
- **Template**: Use Tailwind CSS classes, avoid inline styles

#### Error Handling
- **Console Logging**: Use emoji prefixes for visibility (✅, ❌, 🆕)
  ```typescript
  console.log('✅ Item Added!')
  console.error('❌ Error adding item:', err)
  ```
- **Try-Catch**: Always wrap async SignalR calls in try-catch
- **Return Status**: Return boolean for success/failure in store actions

#### State Management
- **Pinia**: Use for global state (auth, shopping list, categories)
- **Store Pattern**: 
  - `state()`: Define reactive state
  - `getters`: Computed derived state
  - `actions`: Async methods for API/SignalR calls
- **SignalR**: Manage connection lifecycle in store actions

### Backend (C#/.NET)

#### C# Conventions
- **Nullable**: Enabled (`<Nullable>enable</Nullable>`)
- **Implicit Usings**: Enabled for common namespaces
- **Target Framework**: .NET 8.0

#### Naming Conventions
- **Classes/Interfaces**: PascalCase (`ShoppingListService`, `IShoppingListService`)
- **Methods**: PascalCase (`GetAllItemsAsync`, `AddItemAsync`)
- **Private Fields**: `_camelCase` with underscore prefix (`_dbContext`)
- **Parameters**: camelCase (`itemId`, `categoryName`)
- **Async Methods**: Suffix with `Async`

#### Imports Organization
- System namespaces first
- Microsoft namespaces
- Third-party packages
- Local project namespaces (alphabetical)

Example:
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TshopperService.Data;
using TshopperService.Exceptions;
```

#### Controllers
- **Route**: `[Route("/api/[controller]")]`
- **Attributes**: `[HttpGet]`, `[HttpPost]`, `[Authorize]` as needed
- **Return Types**: `IActionResult`, `Ok()`, `Unauthorized()`, `NotFound()`
- **Dependency Injection**: Constructor injection for services

#### Services
- **Interface**: Always create an interface (`IShoppingListService`)
- **Async**: All database operations should be async with `Task<T>`
- **DbContext**: Inject via constructor, use `_dbContext` naming

#### Error Handling
- **Custom Exceptions**: Use `BusinessException` for business logic errors
- **Error Codes**: Use `BusinessErrorCodes` enum for categorization
- **Middleware**: `BusinessExceptionMiddleware` handles exceptions globally
- **Validation**: Validate input early, throw `BusinessException` for invalid data
  ```csharp
  if (string.IsNullOrWhiteSpace(item))
  {
      throw new BusinessException("Item name cannot be empty", BusinessErrorCodes.INVALID_INPUT);
  }
  ```
- **Null Checks**: Always check for null after `FindAsync()` before operations

#### Entity Framework
- **Include Relations**: Use `.Include()` for related data
- **Queries**: Use LINQ with async methods (`.ToListAsync()`, `.FirstOrDefaultAsync()`)
- **Ordering**: Chain `.OrderBy()`, `.ThenBy()` for complex sorting
- **Save Changes**: Always `await _dbContext.SaveChangesAsync()`

#### SignalR Hubs
- **Base Class**: Inherit from `Hub`
- **Methods**: Public async methods invokable from clients
- **Broadcasting**: Use `Clients.All.SendAsync()` for updates
- **Groups**: Use `Groups.AddToGroupAsync()` for targeted messaging

## Project Structure

```
Tshopper/
├── Tshopper-web/           # Vue 3 frontend
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── stores/         # Pinia stores
│   │   ├── views/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── types.d.ts      # TypeScript type definitions
│   └── package.json
└── TshopperService/        # .NET backend
    └── TshopperService/
        ├── Controllers/    # API controllers
        ├── Services/       # Business logic
        ├── Data/           # Entity models
        ├── Dtos/           # Data transfer objects
        ├── Hubs/           # SignalR hubs
        ├── Middleware/     # Custom middleware
        └── Migrations/     # EF Core migrations
```

## General Practices

- **Async/Await**: Use async/await for all I/O operations
- **Path Alias**: Use `@/` for absolute imports in frontend (maps to `src/`)
- **Environment Variables**: 
  - Frontend: `import.meta.env.VITE_API_URL`
  - Backend: `IConfiguration` injection
- **Authentication**: JWT tokens with 72-hour expiry
- **Real-time Updates**: All state mutations broadcast via SignalR
- **Docker**: Both services containerized, see Dockerfiles

## Testing (Future)

When adding tests:
- **Frontend**: Vitest + Vue Test Utils
- **Backend**: xUnit + Moq for service tests
- **Run**: `pnpm test` (frontend), `dotnet test` (backend)
