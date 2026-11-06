# Sment — Smart Waste Management

Sment is a waste-management application that helps users identify waste categories from photos and supports waste-management activities through web and mobile interfaces. The project includes a React web application, an Expo mobile application, a Convex backend, and a machine-learning API for image classification.

## Project Components

| Component | Description | Documentation |
|---|---|---|
| **Sment Web** | Web interface built with React, TypeScript, Vite, and Tailwind CSS | [Web setup guide](web-sment/sment-web/README.md) |
| **Sment App** | Android/iOS application built with React Native and Expo | [Mobile setup guide](mobile-sment/sment-app/README.md) |
| **Convex Backend** | Database, backend functions, and authentication | [Convex directory](convex/) |
| **Machine Learning API** | FastAPI service for waste image classification using MobileNetV2 | [ML documentation](ml/README.md) |

## Features

- Waste image classification into Organic Waste, Paper Waste, and Plastic Waste categories.
- Mobile application with camera/image selection and location-related capabilities.
- Web application with dashboards and report visualizations.
- Authentication and data services powered by Convex.
- REST API for model inference.

> Feature availability can depend on the current backend and ML API configuration.

## Technology Stack

- **Web:** React, TypeScript, Vite, React Router, Tailwind CSS v4, Recharts
- **Mobile:** React Native, Expo, Expo Router, TypeScript
- **Backend:** Convex, Convex Auth
- **Machine Learning:** Python, TensorFlow/Keras, MobileNetV2, FastAPI
- **Deployment:** Vercel (web configuration included), Docker-compatible ML API, Expo EAS Build

## Repository Structure

```text
Sment/
├── convex/                    # Convex backend and schema
├── ml/                        # ML model, API, training notebook, and evaluation
├── mobile-sment/
│   └── sment-app/             # Expo mobile application
├── web-sment/
│   └── sment-web/             # React web application
├── package.json               # Root Convex dependencies
└── README.md
```

## Requirements

Install the following before running the project:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (LTS recommended) and npm
- [Python](https://www.python.org/) 3.10–3.12 for the ML API (TensorFlow compatibility may vary)
- [Expo prerequisites](https://docs.expo.dev/get-started/set-up-your-environment/) for Android/iOS development
- A Convex account and project for backend services

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mulyalubis/Sment.git
cd Sment
```

### 2. Configure and run the Convex backend

Install root dependencies:

```bash
npm install
```

Authenticate with Convex and start the development deployment:

```bash
npx convex dev
```

Follow the CLI prompts to connect this project to your Convex account and deployment. Keep the deployment URL available for the web and mobile clients. Configure any required environment variables/secrets in the Convex dashboard according to the backend functions and authentication configuration. Never commit credentials or secret keys.

### 3. Run the web application

Follow the [Sment Web installation guide](web-sment/sment-web/README.md).

### 4. Run the mobile application

Follow the [Sment App installation guide](mobile-sment/sment-app/README.md).

### 5. Run the Machine Learning API

Follow [ML API instructions](ml/README.md). For mobile device testing, the API must be reachable from the device; a localhost address on the development computer is not directly reachable from a physical phone.

## Environment Configuration

Client environment values should be configured locally and not committed. Refer to each component's guide and the relevant source configuration for the required variable names.

- Convex deployment URL for client connections
- ML API base URL for prediction requests
- Any provider credentials required by authentication or email workflows

Use example placeholders in documentation; do not publish real tokens, private keys, or credentials.

## Build & Deployment

- **Web:** Run `npm run build` from `web-sment/sment-web`. The Vite production output is generated in `dist/`. A `vercel.json` configuration is present in the web project.
- **Mobile:** Use Expo EAS Build. Refer to the mobile README and `eas.json` for the configured preview APK profile.
- **ML API:** Use the included `ml/Dockerfile` for container deployment or follow the ML README for a supported hosting platform.
- **Convex:** Deploy functions to the selected Convex deployment using the Convex CLI.

## Documentation

- [Web application setup and commands](web-sment/sment-web/README.md)
- [Mobile application setup, Android testing, and APK build](mobile-sment/sment-app/README.md)
- [Machine learning model, API endpoints, and training](ml/README.md)

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test them locally.
4. Submit a pull request with a clear description.

## License

See the license file in the relevant project directory. If no repository-wide license is provided, please contact the project owner before redistributing.
