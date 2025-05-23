# Project Structure: Budget Mobile App

This project will be a monorepo or two separate projects (frontend and backend). For simplicity in discussion, we can imagine them in a single root directory.

```
/budget-app
|
|-- /frontend (React Native App)
|   |-- /app                 # Main app directory (if using Expo Router or similar)
|   |   |-- /(tabs)          # Example: Tab-based navigation
|   |   |   |-- _layout.js
|   |   |   |-- index.js     # Home screen for entries
|   |   |   |-- add.js       # Screen to add new entry
|   |   |   |-- settings.js
|   |   |-- _layout.js       # Root layout
|   |   |-- index.js         # Entry point or redirect
|   |-- /components          # Reusable UI components
|   |   |-- BudgetEntryForm.js
|   |   |-- EntryListItem.js
|   |   |-- CategorySelector.js
|   |   |-- CustomModal.js
|   |   |-- StyledText.js
|   |   |-- Button.js
|   |-- /constants           # Colors, styles, layout dimensions
|   |   |-- Colors.js
|   |   |-- Layout.js
|   |-- /hooks               # Custom React Hooks
|   |   |-- useAPI.js        # Hook for API calls
|   |-- /navigation          # Navigation setup (if not using file-based routing)
|   |-- /screens             # Screen components (alternative to file-based routing)
|   |   |-- HomeScreen.js
|   |   |-- AddEntryScreen.js
|   |   |-- EditEntryScreen.js
|   |   |-- CategoryManagementScreen.js
|   |-- /services            # API service calls, utility functions
|   |   |-- api.js
|   |-- /store               # State management (e.g., Redux, Zustand, Context API)
|   |   |-- budgetStore.js
|   |-- /assets              # Images, fonts, etc.
|   |   |-- /fonts
|   |   |-- /images
|   |-- App.js               # Main application component (entry point for React Native)
|   |-- babel.config.js      # Babel configuration
|   |-- metro.config.js      # Metro bundler configuration
|   |-- package.json         # Frontend dependencies and scripts
|   |-- eas.json             # Expo Application Services config (if using Expo)
|   |-- .env.example         # Example environment variables (e.g., API_URL)
|
|-- /backend (Node.js API)
|   |-- /config              # Configuration files (database URI, JWT secret, etc.)
|   |   |-- db.js
|   |   |-- index.js
|   |-- /controllers         # Request handling logic (connects routes to services/models)
|   |   |-- entryController.js
|   |   |-- categoryController.js
|   |   |-- userController.js  (if authentication is added)
|   |-- /middleware          # Custom middleware (e.g., auth, error handling, logging)
|   |   |-- authMiddleware.js
|   |   |-- errorMiddleware.js
|   |-- /models              # MongoDB data schemas (Mongoose models)
|   |   |-- Entry.js
|   |   |-- Category.js
|   |   |-- User.js (if authentication is added)
|   |-- /routes              # API route definitions
|   |   |-- entryRoutes.js
|   |   |-- categoryRoutes.js
|   |   |-- authRoutes.js (if authentication is added)
|   |   |-- index.js         # Main router to combine all other routes
|   |-- /services            # Business logic separated from controllers
|   |   |-- entryService.js
|   |   |-- categoryService.js
|   |-- /utils               # Utility functions
|   |-- .env                 # Environment variables (NEVER commit this file)
|   |-- .env.example         # Example environment variables
|   |-- server.js            # Main backend server setup and entry point
|   |-- package.json         # Backend dependencies and scripts
|
|-- .gitignore
|-- README.md
```

## Key Parts:

### Frontend (React Native)
-   **`App.js` / `/app` directory (Expo Router):** Main entry point and navigation structure.
-   **`/components`:** Reusable UI elements (forms, list items, buttons).
-   **`/screens` or `/app/**`:** Views for different parts of the app.
-   **`/services/api.js`:** Functions to make requests to your Node.js backend.
-   **`/store`:** For managing application state (e.g., list of entries, current balance). Could use Context API for simpler cases, or Zustand/Redux for more complex state.
-   **`package.json`:** Lists frontend libraries like React, React Native, Expo (if used), navigation libraries, UI kits, etc.

### Backend (Node.js)
-   **`server.js`:** Initializes the Express app, connects to MongoDB, and starts the server.
-   **`/models`:** Defines the structure of your data in MongoDB using Mongoose schemas.
-   **`/routes`:** Defines the API endpoints (e.g., `/api/entries`, `/api/categories`).
-   **`/controllers`:** Contains the logic for handling requests to your API routes and interacting with models/services.
-   **`/middleware`:** Functions that can process requests before they reach the route handlers (e.g., for authentication, logging, error handling).
-   **`/config`:** Database connection strings, secrets, etc. Often managed with `.env` files.
-   **`package.json`:** Lists backend libraries like Express.js, Mongoose, dotenv, bcrypt (for passwords),jsonwebtoken (for auth tokens), etc.

This structure promotes separation of concerns and makes the codebase easier to manage as it grows.
We'll start by defining some models and routes on the backend, and then show how the React Native frontend would interact with them. 