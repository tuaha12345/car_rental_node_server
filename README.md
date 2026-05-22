# B13 A9 Car Rental Server

This repository contains the backend server for the **B13 A9 Car Rental** website. The API is built with Node.js and Express, uses MongoDB for data storage, and integrates JWT verification using `jose-cjs` for secure routes.

## Live Client Site URL

- **Live client site URL:** ``


## Features

- Secure car management routes with JWT authentication
- Add, update, delete, and fetch car listings
- Search cars by name with case-insensitive matching
- Book cars with date validation and overlapping booking protection
- Uses MongoDB for rental and booking collections

## Technologies Used

- Node.js
- Express
- MongoDB
- `jose-cjs` for JWT verification
- `cors` for cross-origin support
- `dotenv` for environment variable loading

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd car_rental_server
```

2. Install dependencies:

```bash
npm install
```

3. Install the specific server packages used in this project:

```bash
npm install express cors dotenv mongodb jose-cjs
```

## Environment Variables

Create a `.env` file in the project root and add the following values:

```env
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
CLIENT_URL=https://your-client-site.example.com
```

## Running the Server

nodemon index.js



## API Endpoints

- `GET /` - Health check route
- `GET /cars` - Get all cars
- `GET /cars/:id` - Get a specific car by ID
- `GET /cars/search/:name` - Search cars by name
- `GET /cars/user/:userId` - Get cars owned by a user (requires auth)
- `POST /cars` - Add a new car (requires auth)
- `PATCH /cars/:id` - Update a car (requires auth)
- `DELETE /cars/:id` - Delete a car (requires auth)
- `POST /bookings` - Create a booking (requires auth)


