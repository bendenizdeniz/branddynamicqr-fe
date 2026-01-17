
---

# Brand QR Management System - Frontend

A modern, high-performance Admin Dashboard built with **React**, **Vite**, and **Tailwind CSS v4**. This application serves as the centralized management interface for QR-based menu systems, allowing companies and brands to manage their products, branches, and user permissions efficiently.

## 🚀 Tech Stack

* **Framework:** [React 18](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (using the new `@tailwindcss/postcss` engine)
* **Routing:** [React Router 6](https://reactrouter.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **HTTP Client:** [Axios](https://axios-http.com/) with Interceptors for JWT management.

---

## ✨ Key Features

### 🔐 Authentication & Security

* **JWT Based Auth:** Secure login flow with token-based session management.
* **Protected Routes:** Higher-Order Component (HOC) logic to prevent unauthorized access to management pages.
* **Role-Based Access (RBAC):** Dynamic navigation and content visibility based on user roles (`ADMIN`, `BRAND`, etc.).

### 📂 Management Modules

* **Company & Brand Management:** Global control for multi-tenant structures.
* **Branch (Subvendor) Management:** Manage individual locations and their specific settings.
* **Product & Category Engine:** Localized product listing and management with real-time price synchronization.
* **User & Permission System:** Advanced role management and user assignment.

### 🎨 UI/UX Design

* **Responsive Layout:** A persistent sidebar navigation with a fluid content area.
* **Modern Aesthetics:** Clean, minimalist design using Tailwind's latest color palettes and spacing utilities.
* **Stateful Feedback:** Loading states, error handling with toast-style notifications, and empty state illustrations.

---

## 🛠️ Project Structure

```text
frontend/
├── src/
│   ├── api/            # Axios instance and interceptors
│   ├── components/     # Reusable UI components (Layout, ProtectedRoute, etc.)
│   ├── pages/          # Full-page components (Login, Dashboard, Products)
│   ├── assets/         # Static images and global styles
│   ├── App.tsx         # Root component with routing logic
│   └── main.tsx        # Entry point
├── postcss.config.js   # Tailwind v4 PostCSS configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts

```

---

## 🚦 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn

### Installation

1. Clone the repository and navigate to the frontend folder:
```bash
cd frontend

```


2. Install dependencies:
```bash
npm install

```



### Development

Start the development server:

```bash
npm run dev

```

### Production Build

Generate a production-ready bundle:

```bash
npm run build

```

---

## 📡 API Integration

The frontend communicates with a RESTful backend. Global settings for the API can be found in `src/api/axios.ts`.

**Security Note:** All requests to protected endpoints automatically include the `Authorization: Bearer <token>` header via Axios interceptors.

---

## 📝 License

This project is private and confidential. Unauthorized copying or distribution is strictly prohibited.

---
