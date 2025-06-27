FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["TshopperService/TshopperService.csproj", "TshopperService/"]
RUN dotnet restore "TshopperService/TshopperService.csproj"
COPY . .
WORKDIR "/src/TshopperService"
RUN dotnet build "TshopperService.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "TshopperService.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Install dotnet-ef
RUN dotnet tool install --global dotnet-ef --version 8.0.6
ENV PATH="$PATH:/root/.dotnet/tools"

COPY TshopperService/entrypoint.sh .
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
