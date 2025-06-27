#!/bin/bash
set -e

# Apply database migrations
dotnet ef database update

# Start the application
exec dotnet TshopperService.dll
