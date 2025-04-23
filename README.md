# Web Application

This project is a full-stack web application with a backend built using Express and a frontend with a separate React application. The backend communicates with a MySQL database, and both the server and client can be started concurrently.

## Table of Contents

- [Installation](#installation)
- [Scripts](#scripts)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [License](#license)

## Installation

To get started with this project, follow these steps:

1. Clone the repository to your local machine:
   ```bash
   git clone <repository-url>
   cd web
   ```

2. Install the dependencies for both the backend and the frontend:

   - For the backend:
     ```bash
     cd backend
     npm install
     ```

   - For the frontend:
     ```bash
     cd frontend
     npm install
     ```

3. After installing the dependencies, return to the root directory of the project and install `concurrently` to run both the backend and frontend at the same time:
   ```bash
   cd ..
   npm install
   ```

## Scripts

This project uses `npm` scripts to manage different parts of the application. The following scripts are available:

- **`npm run server`**: Installs the backend dependencies and starts the backend server.
- **`npm run client`**: Installs the frontend dependencies and starts the frontend client (React).
- **`npm start`**: Installs `concurrently` (if not installed) and runs both the backend and frontend servers concurrently.

To start both the backend and frontend together, run:
```bash
npm start
```

## Usage

Once you've installed the dependencies and started both servers, you can open your browser and access the following:

- **Backend**: Usually runs on `http://localhost:5000` (or whichever port you configure).
- **Frontend**: Usually runs on `http://localhost:3000`.

The application should now be up and running. You can interact with the API through the backend, and the frontend will display data fetched from it.

## Dependencies

- **`bcrypt`**: A library for hashing passwords.
- **`cors`**: A middleware to enable Cross-Origin Resource Sharing.
- **`express`**: A web framework for building the backend.
- **`mysql`**: A MySQL client for connecting to the database.
- **`mysql2`**: A MySQL client with improved features for Node.js.
- **`concurrently`**: A tool to run multiple npm scripts concurrently.

## License

This project is licensed under the ISC License.
