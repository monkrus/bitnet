# BitNet - B2B Networking App

A comprehensive B2B networking platform that connects professionals and facilitates business relationships through events, messaging, and profile management.

## Project Structure

```
bitnet/
├── mobile/          # React Native (Expo) mobile application
├── backend/         # Node.js/Express API server
├── .gitignore       # Root-level git ignore rules
└── README.md        # This file
```

## Features

- **User Authentication & Profiles**: Secure user registration and profile management
- **Event Management**: Create, discover, and attend networking events
- **Professional Networking**: Connect with other professionals in your industry
- **Messaging System**: Direct communication between connected professionals
- **Company Profiles**: Showcase company information and employees

## Technology Stack

### Backend (Node.js/Express)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT tokens with bcrypt password hashing
- **Security**: Helmet, CORS protection
- **Logging**: Morgan HTTP request logging

### Mobile App (React Native/Expo)
- **Framework**: React Native with Expo
- **Platform**: Cross-platform (iOS & Android)
- **Build Tool**: Expo CLI

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and JWT secret.

4. Set up the PostgreSQL database:
   ```bash
   npm run setup-db
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend server will run on `http://localhost:3000`

### Mobile App Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm start
   ```

4. Use the Expo Go app on your mobile device or an emulator to run the app.

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User profiles and authentication
- `companies` - Company information
- `events` - Networking events
- `event_attendees` - Event registration tracking
- `connections` - Professional networking relationships
- `messages` - Direct messaging between users

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search for users

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/register` - Register for event

### Connections
- `GET /api/connections` - List connections
- `POST /api/connections/request` - Send connection request
- `PUT /api/connections/:id/accept` - Accept connection request

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Mobile app tests (if configured)
cd mobile
npm test
```

### Environment Variables

#### Backend (.env)
```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bitnet_db
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the GitHub repository.