# Sment Web

Sment Web is the browser-based interface for the Sment smart waste-management project. It is built with React, TypeScript, Vite, React Router, Tailwind CSS v4, Recharts, and Convex.

## Requirements

- Node.js (LTS recommended)
- npm
- A configured Convex deployment for features that require backend data/authentication

## Installation

From the repository root:

```bash
cd web-sment/sment-web
npm install
```

## Environment Configuration

The web client needs to connect to the Convex deployment. Check the Convex client initialization in the source code and use the environment variable name expected there.

Create a local `.env.local` file if the source configuration expects Vite environment variables. Example placeholder (replace with the exact variable name used by the app):

```env
VITE_CONVEX_URL=https://<your-deployment>.convex.cloud
```

Do not commit `.env.local`, access tokens, or secret values. Vite only exposes variables with the `VITE_` prefix to client-side code; never place secrets in client variables.

## Run in Development

```bash
npm run dev
```

Vite prints the local development URL in the terminal (usually http://localhost:5173).

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run TypeScript project build and create production assets |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Production Build

```bash
npm run build
npm run preview
```

The production bundle is generated in the `dist/` directory.

## Deployment (Vercel)

The project contains a `vercel.json` configuration.

1. Import the repository into Vercel.
2. Set the **Root Directory** to `web-sment/sment-web`.
3. Set the required client environment variable(s) in the Vercel project settings, using the exact names expected by the source code.
4. Use `npm install` as the install command and `npm run build` as the build command.
5. Deploy the project.

If deploying from a monorepo, confirm that the selected root directory is the web app directory.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS v4
- Recharts
- Convex / Convex Auth

## Related Documentation

- [Main Sment repository](../../README.md)
- [Sment Mobile App](../../mobile-sment/sment-app/README.md)
- [Convex backend](../../convex/)
- [Machine Learning API](../../ml/README.md)
