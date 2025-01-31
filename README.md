# Canvas

This repository utilizes TypeScript and Vite for secure and fast web applications with monorepo structure using Yarn Workspaces.

## Features

- **TypeScript**: Strongly typed language for building robust applications.
- **Vite**: Fast and secure web applications.
- **Tailwind CSS**: Utility-first CSS framework for building custom designs.
- **Yarn Workspaces**: Monorepo management for multiple packages
- **Docker**: Containerized development environment

## Getting Started

### Prerequisites

- Node.js
- Yarn
- Docker

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/minagishl/canvas.git
   cd canvas
   ```

2. Install dependencies:
   ```sh
   yarn install
   ```

### Usage

1. Start the development server:
   ```sh
   docker compose up
   ```

This will start:

- Web frontend at http://localhost:5173
- API backend at http://localhost:8787

## Project Structure

```
apps/
  ├── web/          # Frontend application
  │   ├── src/
  │   ├── public/
  │   └── package.json
  └── api/          # Backend API
      ├── src/
      └── package.json
```

## Available Scripts

### Root Directory

- `yarn install`: Install all dependencies.

### API

- `yarn dev`: Start the development server.
- `yarn deploy`: Deploy to Cloudflare Workers
- `yarn migration:local`: Run local database migrations
- `yarn migration:remote`: Run remote database migrations

### Web Application

- `yarn dev`: Start the development server.
- `yarn lint`: Lints the code.
- `yarn format`: Formats the code.
- `yarn build`: Builds the application for production.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
