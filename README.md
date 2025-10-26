# Betting App Demo

A full-stack betting application similar to Hard Rock with user authentication, parlay betting, and admin reporting features.

## Features

### User Features
- **User Registration & Login** - Secure authentication with JWT tokens
- **$100 Welcome Bonus** - New users start with $100 in credits
- **Parlay Betting** - Place bets with multiple selections and accurate odds calculations
- **Betting History** - Track all your bets and performance
- **Real-time Credit Updates** - See your available credits update instantly

### Admin Features
- **Daily Reports** - View house win/loss statistics for any date
- **User Management** - Monitor all registered users and their credits
- **Bet Monitoring** - Track all bets placed on the platform
- **Financial Analytics** - Comprehensive reporting on platform performance

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database for data persistence
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **React** with TypeScript
- **React Router** for navigation
- **Axios** for API calls
- **Modern CSS** with responsive design

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
```bash
cd server
npm install
npm run dev
```

The server will start on `http://localhost:5000`

### Frontend Setup
```bash
cd client
npm install
npm start
```

The frontend will start on `http://localhost:3000`

### Database
The SQLite database (`betting.db`) will be created automatically when you start the server.

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/profile` - Get user profile

### Betting
- `POST /api/bet/parlay` - Place a parlay bet
- `GET /api/bets/history` - Get user's betting history

### Admin
- `GET /api/admin/daily-report` - Get daily financial report
- `GET /api/admin/users` - Get all users
- `GET /api/admin/bets` - Get all bets
- `POST /api/admin/create-admin` - Create admin user

## How to Use

### For Users
1. **Register** - Create a new account to get $100 in credits
2. **Login** - Access your account
3. **Place Bets** - Go to the Betting page and select multiple options for a parlay bet
4. **View History** - Check your betting history and performance

### For Admins
1. **Create Admin Account** - Use the `/api/admin/create-admin` endpoint
2. **Access Admin Dashboard** - Login with admin credentials
3. **Monitor Activity** - View daily reports, users, and all bets
4. **Track Performance** - Monitor house profit/loss

## Parlay Betting Rules

- **Minimum 2 selections** required for a parlay bet
- **Odds calculation** - All individual odds are multiplied together
- **Winning condition** - ALL selections must be correct to win
- **Potential winnings** - Stake × Total Odds

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password` - Hashed password
- `credits` - Available betting credits
- `created_at` - Account creation timestamp

### Bets Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `bet_type` - Type of bet (parlay)
- `selections` - JSON array of selected options
- `odds` - Calculated total odds
- `stake` - Amount wagered
- `potential_win` - Potential winnings
- `status` - Bet status (pending/won/lost)
- `created_at` - Bet placement timestamp

### Daily Reports Table
- `id` - Primary key
- `date` - Report date
- `total_bets` - Number of bets placed
- `total_stakes` - Total amount wagered
- `total_winnings` - Total winnings paid out
- `house_profit` - House profit/loss

## Security Features

- **Password hashing** with bcryptjs
- **JWT token authentication**
- **Input validation** and sanitization
- **CORS protection**
- **SQL injection prevention**

## Development

### Running in Development Mode
```bash
# Install all dependencies
npm run install-all

# Start both frontend and backend
npm run dev
```

### Project Structure
```
betting-app-demo/
├── server/                 # Backend API
│   ├── index.js           # Main server file
│   ├── package.json       # Backend dependencies
│   └── betting.db         # SQLite database (created on first run)
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── App.tsx        # Main app component
│   │   └── index.tsx      # App entry point
│   ├── public/            # Static files
│   └── package.json       # Frontend dependencies
└── package.json           # Root package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Demo Credentials

### Regular User
- Username: `demo`
- Password: `password123`
- Credits: $100

### Admin User
- Username: `admin`
- Password: `admin123`
- Access: Full admin dashboard

---

**Note**: This is a demo application for educational purposes. It does not include real money transactions or actual betting functionality.
