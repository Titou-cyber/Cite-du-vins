# Terroir - Wine Experience Platform for La Cité Du Vin

An immersive wine exploration platform developed for La Cité Du Vin, featuring interactive wine region mapping, AI sommelier recommendations, virtual tastings, and a comprehensive wine knowledge graph.

## Overview

Terroir is more than a wine marketplace - it's a complete educational and sensory journey into the world of wine. This application aligns with La Cité Du Vin's mission to share the cultural heritage of wine with audiences worldwide through innovative technology and interactive experiences.

## Features

- **Interactive Wine Map**: Explore wine regions globally with 3D visualization
- **AI Sommelier**: Get personalized wine recommendations based on your preferences
- **Virtual Tastings**: Join live tastings or follow self-guided tasting experiences
- **Wine Knowledge Graph**: Discover the interconnected world of wine through our interactive database
- **Wine Marketplace**: Browse and purchase wines with detailed information and expert notes

## Technologies Used

### Frontend
- Next.js (React framework)
- TailwindCSS for styling
- Three.js & React-Globe.gl for 3D visualization
- Framer Motion for animations

### Backend
- Node.js with Express
- MongoDB for database
- Redis for caching
- JWT for authentication

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (only needed for local development without Docker)
- MongoDB (only needed for local development without Docker)

### Running with Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/terroir-wine-experience.git
   cd terroir-wine-experience
   ```

2. Create a `.env` file in the root directory (you can copy from the provided example):
   ```bash
   cp .env.example .env
   ```

3. Start the application using Docker Compose:
   ```bash
   docker-compose up
   ```

4. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - MongoDB: mongodb://localhost:27017
   - Redis: redis://localhost:6379

### Running Without Docker (Development)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/terroir-wine-experience.git
   cd terroir-wine-experience
   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   ```

3. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   ```

4. Create a `.env` file in the root directory and configure it for your environment.

5. Start the backend server:
   ```bash
   cd ../backend
   npm run dev
   ```

6. In a separate terminal, start the frontend:
   ```bash
   cd ../frontend
   npm run dev
   ```

7. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## Setting up the Dataset

The application uses a MongoDB database to store wine data. The starter wines.json file should be placed in the `backend/data` directory.

To seed the database:
```bash
docker-compose exec backend npm run seed
```

Or if not using Docker:
```bash
cd backend
npm run seed
```

## Project Structure

```
terroir-wine-experience/
├── docker-compose.yml       # Docker Compose configuration
├── .env                     # Environment variables
├── frontend/                # Next.js frontend application
│   ├── src/                 # Source code
│   │   ├── app/             # Next.js app directory
│   │   ├── components/      # React components
│   │   ├── lib/             # Utility functions
│   │   └── hooks/           # Custom React hooks
├── backend/                 # Node.js/Express backend
│   ├── src/                 # Source code
│   │   ├── index.js         # Entry point
│   │   ├── api/             # API routes & controllers
│   │   ├── models/          # MongoDB models
│   │   ├── services/        # Business logic
│   │   └── db/              # Database connection & utilities
│   └── data/                # Initial data for MongoDB
└── nginx/                   # Nginx configuration (for production)
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- La Cité Du Vin for the inspiration and wine expertise
- The open-source community for the amazing libraries and tools