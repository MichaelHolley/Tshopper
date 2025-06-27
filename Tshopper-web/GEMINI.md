# Gemini Guidelines for Tshopper-web

This document provides guidelines for interacting with the Tshopper-web project, a Vue 3 application built with Vite, Pinia, and NuxtUI.

## Getting Started

To get started with the project, install the dependencies and run the development server:

```bash
pnpm install
pnpm run dev
```

## Development

The following commands are available for development:

- `pnpm run dev`: Starts the development server with hot-reloading.
- `pnpm run build`: Compiles and minifies the application for production.
- `pnpm run preview`: Serves the production build locally for previewing.
- `pnpm run type-check`: Performs a type check on the codebase.
- `pnpm run lint`: Lints the codebase and automatically fixes issues.
- `pnpm run format`: Formats the codebase with Prettier.

## Project Structure

The project follows a standard Vue 3 structure:

- `src/`: Contains the application source code.
- `src/assets/`: Contains static assets like images and CSS.
- `src/components/`: Contains reusable Vue components.
- `src/stores/`: Contains Pinia stores for state management.
- `src/views/`: Contains the application's views or pages.
- `public/`: Contains static assets that are not processed by Vite.

## Dependencies

The project uses the following key dependencies:

- **Vue 3:** The core framework for building the user interface.
- **Vite:** The build tool and development server.
- **Pinia:** The state management library for Vue 3.
- **Vue Router:** The official router for Vue 3.
- **NuxtUI:** The UI library for building the user interface.
- **Tailwind CSS:** A utility-first CSS framework for styling.
- **TypeScript:** The programming language used for the application.
- **ESLint:** The linter for identifying and fixing problems in the code.
- **Prettier:** The code formatter for maintaining a consistent code style.
