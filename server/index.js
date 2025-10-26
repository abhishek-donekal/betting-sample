const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ODDS_API_KEY = 'af9a528bb40bd1b9e249fd6ffdd71b33';
const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./betting.db');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    credits REAL DEFAULT 100.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Bets table
  db.run(`CREATE TABLE IF NOT EXISTS bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    bet_type TEXT NOT NULL,
    selections TEXT NOT NULL,
    odds REAL NOT NULL,
    stake REAL NOT NULL,
    potential_win REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Admin table for daily reports
  db.run(`CREATE TABLE IF NOT EXISTS daily_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    total_bets INTEGER DEFAULT 0,
    total_stakes REAL DEFAULT 0,
    total_winnings REAL DEFAULT 0,
    house_profit REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const authenticateAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Routes

// Register
app.post('/api/register', [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Username or email already exists' });
          }
          return res.status(500).json({ message: 'Database error' });
        }

        const token = jwt.sign(
          { id: this.lastID, username, role: 'user' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: this.lastID, username, email, credits: 100.00 }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/login', [
  body('username').trim().escape(),
  body('password').exists()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role || 'user' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          credits: user.credits,
          role: user.role || 'user'
        }
      });
    }
  );
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, username, email, credits, role FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(user);
    }
  );
});

// Place a parlay bet
app.post('/api/bet/parlay', authenticateToken, [
  body('selections').isArray({ min: 2 }),
  body('stake').isFloat({ min: 1 })
], (req, res) => {
  // Prevent admins from placing bets
  if (req.user.role === 'admin') {
    return res.status(403).json({ message: 'Admins cannot place bets' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { selections, stake } = req.body;

  // Calculate parlay odds correctly
  let totalDecimalOdds = 1;
  for (const selection of selections) {
    // Convert American odds to decimal odds
    let decimalOdds;
    if (selection.odds > 0) {
      // Positive American odds: (odds / 100) + 1
      decimalOdds = (selection.odds / 100) + 1;
    } else {
      // Negative American odds: (100 / |odds|) + 1
      decimalOdds = (100 / Math.abs(selection.odds)) + 1;
    }
    totalDecimalOdds *= decimalOdds;
  }
  
  // Convert back to American odds for display
  let americanOdds;
  if (totalDecimalOdds >= 2) {
    // Convert to positive American odds
    americanOdds = (totalDecimalOdds - 1) * 100;
  } else {
    // Convert to negative American odds
    americanOdds = -100 / (totalDecimalOdds - 1);
  }
  
  const potentialWin = stake * totalDecimalOdds;

  // Check if user has enough credits
  db.get(
    'SELECT credits FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (user.credits < stake) {
        return res.status(400).json({ message: 'Insufficient credits' });
      }

      // Deduct stake from user credits
      db.run(
        'UPDATE users SET credits = credits - ? WHERE id = ?',
        [stake, req.user.id],
        (err) => {
          if (err) {
            return res.status(500).json({ message: 'Database error' });
          }

          // Create bet record
          db.run(
            'INSERT INTO bets (user_id, bet_type, selections, odds, stake, potential_win) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, 'parlay', JSON.stringify(selections), americanOdds, stake, potentialWin],
            function(err) {
              if (err) {
                return res.status(500).json({ message: 'Database error' });
              }

              res.json({
                message: 'Bet placed successfully',
                betId: this.lastID,
                totalOdds: americanOdds,
                potentialWin
              });
            }
          );
        }
      );
    }
  );
});

// Get user's betting history
app.get('/api/bets/history', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM bets WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, bets) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      const formattedBets = bets.map(bet => ({
        ...bet,
        selections: JSON.parse(bet.selections)
      }));

      res.json(formattedBets);
    }
  );
});

// Admin: Get daily report
app.get('/api/admin/daily-report', authenticateToken, authenticateAdmin, (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  db.all(
    `SELECT 
      COUNT(*) as total_bets,
      SUM(stake) as total_stakes,
      SUM(CASE WHEN status = 'won' THEN potential_win ELSE 0 END) as total_winnings,
      SUM(stake) - SUM(CASE WHEN status = 'won' THEN potential_win ELSE 0 END) as house_profit
    FROM bets 
    WHERE DATE(created_at) = ?`,
    [targetDate],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      const report = result[0] || {
        total_bets: 0,
        total_stakes: 0,
        total_winnings: 0,
        house_profit: 0
      };

      res.json({
        date: targetDate,
        ...report
      });
    }
  );
});

// Admin: Get all users (for admin dashboard)
app.get('/api/admin/users', authenticateToken, authenticateAdmin, (req, res) => {
  db.all(
    'SELECT id, username, email, credits, created_at FROM users ORDER BY created_at DESC',
    (err, users) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(users);
    }
  );
});

// Admin: Get all bets
app.get('/api/admin/bets', authenticateToken, authenticateAdmin, (req, res) => {
  db.all(
    `SELECT b.*, u.username 
     FROM bets b 
     JOIN users u ON b.user_id = u.id 
     ORDER BY b.created_at DESC`,
    (err, bets) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      const formattedBets = bets.map(bet => ({
        ...bet,
        selections: JSON.parse(bet.selections)
      }));

      res.json(formattedBets);
    }
  );
});

// Get all basketball matches (NBA, NCAA, WNBA)
app.get('/api/basketball/matches', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const [nbaResponse, ncaabResponse, wnbaResponse] = await Promise.all([
      axios.get(`${ODDS_API_BASE}/sports/basketball_nba/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: `${targetDate}T00:00:00Z`,
          commenceTimeTo: `${targetDate}T23:59:59Z`
        }
      }).catch(() => ({ data: [] })),
      axios.get(`${ODDS_API_BASE}/sports/basketball_ncaab/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: `${targetDate}T00:00:00Z`,
          commenceTimeTo: `${targetDate}T23:59:59Z`
        }
      }).catch(() => ({ data: [] })),
      axios.get(`${ODDS_API_BASE}/sports/basketball_wnba/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: `${targetDate}T00:00:00Z`,
          commenceTimeTo: `${targetDate}T23:59:59Z`
        }
      }).catch(() => ({ data: [] }))
    ]);

    const nbaMatches = processMatches(nbaResponse.data, 'NBA');
    const ncaabMatches = processMatches(ncaabResponse.data, 'NCAA Basketball');
    const wnbaMatches = processMatches(wnbaResponse.data, 'WNBA');

    const allMatches = [...nbaMatches, ...ncaabMatches, ...wnbaMatches];
    res.json(allMatches);
  } catch (error) {
    console.error('Error fetching basketball matches:', error);
    res.status(500).json({ message: 'Failed to fetch basketball matches' });
  }
});

// Get upcoming basketball matches (NBA, NCAA, WNBA) - next 7 days
app.get('/api/basketball/upcoming', async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Format dates correctly for the API
    const commenceTimeFrom = today.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const commenceTimeTo = nextWeek.toISOString().replace(/\.\d{3}Z$/, 'Z');
    
    const [nbaResponse, ncaabResponse, wnbaResponse] = await Promise.all([
      axios.get(`${ODDS_API_BASE}/sports/basketball_nba/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: commenceTimeFrom,
          commenceTimeTo: commenceTimeTo
        }
      }).catch(() => ({ data: [] })),
      axios.get(`${ODDS_API_BASE}/sports/basketball_ncaab/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: commenceTimeFrom,
          commenceTimeTo: commenceTimeTo
        }
      }).catch(() => ({ data: [] })),
      axios.get(`${ODDS_API_BASE}/sports/basketball_wnba/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: commenceTimeFrom,
          commenceTimeTo: commenceTimeTo
        }
      }).catch(() => ({ data: [] }))
    ]);

    const nbaMatches = processMatches(nbaResponse.data, 'NBA');
    const ncaabMatches = processMatches(ncaabResponse.data, 'NCAA Basketball');
    const wnbaMatches = processMatches(wnbaResponse.data, 'WNBA');

    const allMatches = [...nbaMatches, ...ncaabMatches, ...wnbaMatches].sort((a, b) =>
      new Date(a.commenceTime) - new Date(b.commenceTime)
    );

    res.json(allMatches);
  } catch (error) {
    console.error('Error fetching upcoming basketball matches:', error);
    
    // Return mock basketball data when API is unavailable
    const mockMatches = getMockBasketballMatches();
    res.json(mockMatches);
  }
});

// Get all football matches (NFL, NCAA, CFL)
app.get('/api/football/matches', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const [nflResponse, ncaafResponse, cflResponse] = await Promise.all([
      axios.get(`${ODDS_API_BASE}/sports/americanfootball_nfl/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: `${targetDate}T00:00:00Z`,
          commenceTimeTo: `${targetDate}T23:59:59Z`
        }
      }).catch(() => ({ data: [] })),
      axios.get(`${ODDS_API_BASE}/sports/americanfootball_ncaaf/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: `${targetDate}T00:00:00Z`,
          commenceTimeTo: `${targetDate}T23:59:59Z`
        }
      }).catch(() => ({ data: [] })),
      axios.get(`${ODDS_API_BASE}/sports/americanfootball_cfl/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: `${targetDate}T00:00:00Z`,
          commenceTimeTo: `${targetDate}T23:59:59Z`
        }
      }).catch(() => ({ data: [] }))
    ]);

    const nflMatches = processMatches(nflResponse.data, 'NFL');
    const ncaafMatches = processMatches(ncaafResponse.data, 'NCAA Football');
    const cflMatches = processMatches(cflResponse.data, 'CFL');

    const allMatches = [...nflMatches, ...ncaafMatches, ...cflMatches];
    res.json(allMatches);
  } catch (error) {
    console.error('Error fetching football matches:', error);
    res.status(500).json({ message: 'Failed to fetch football matches' });
  }
});

// Get upcoming football matches (NFL, NCAA, CFL) - next 7 days
app.get('/api/football/upcoming', async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Format dates correctly for the API
    const commenceTimeFrom = today.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const commenceTimeTo = nextWeek.toISOString().replace(/\.\d{3}Z$/, 'Z');
    
    const [nflResponse, ncaafResponse, cflResponse] = await Promise.all([
      axios.get(`${ODDS_API_BASE}/sports/americanfootball_nfl/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: commenceTimeFrom,
          commenceTimeTo: commenceTimeTo
        }
      }).catch(() => ({ data: [] })),
      axios.get(`${ODDS_API_BASE}/sports/americanfootball_ncaaf/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: commenceTimeFrom,
          commenceTimeTo: commenceTimeTo
        }
      }).catch(() => ({ data: [] })),
      axios.get(`${ODDS_API_BASE}/sports/americanfootball_cfl/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: commenceTimeFrom,
          commenceTimeTo: commenceTimeTo
        }
      }).catch(() => ({ data: [] }))
    ]);

    const nflMatches = processMatches(nflResponse.data, 'NFL');
    const ncaafMatches = processMatches(ncaafResponse.data, 'NCAA Football');
    const cflMatches = processMatches(cflResponse.data, 'CFL');

    const allMatches = [...nflMatches, ...ncaafMatches, ...cflMatches].sort((a, b) =>
      new Date(a.commenceTime) - new Date(b.commenceTime)
    );

    res.json(allMatches);
  } catch (error) {
    console.error('Error fetching upcoming football matches:', error);
    
    // Return mock football data when API is unavailable
    const mockMatches = getMockFootballMatches();
    res.json(mockMatches);
  }
});

// Get all sports matches (All Basketball + All Football leagues)
app.get('/api/sports/upcoming', async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Format dates correctly for the API
    const commenceTimeFrom = today.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const commenceTimeTo = nextWeek.toISOString().replace(/\.\d{3}Z$/, 'Z');
    
    const [nbaResponse, ncaabResponse, wnbaResponse, nflResponse, ncaafResponse, cflResponse] = await Promise.all([
      axios.get(`${ODDS_API_BASE}/sports/basketball_nba/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: commenceTimeFrom,
          commenceTimeTo: commenceTimeTo
        }
      }).catch(() => ({ data: [] })),
      axios.get(`${ODDS_API_BASE}/sports/basketball_ncaab/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: commenceTimeFrom,
          commenceTimeTo: commenceTimeTo
        }
      }).catch(() => ({ data: [] })),
      axios.get(`${ODDS_API_BASE}/sports/basketball_wnba/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: commenceTimeFrom,
          commenceTimeTo: commenceTimeTo
        }
      }).catch(() => ({ data: [] })),
      axios.get(`${ODDS_API_BASE}/sports/americanfootball_nfl/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: commenceTimeFrom,
          commenceTimeTo: commenceTimeTo
        }
      }).catch(() => ({ data: [] })),
      axios.get(`${ODDS_API_BASE}/sports/americanfootball_ncaaf/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: commenceTimeFrom,
          commenceTimeTo: commenceTimeTo
        }
      }).catch(() => ({ data: [] })),
      axios.get(`${ODDS_API_BASE}/sports/americanfootball_cfl/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso',
          commenceTimeFrom: commenceTimeFrom,
          commenceTimeTo: commenceTimeTo
        }
      }).catch(() => ({ data: [] }))
    ]);

    const nbaMatches = processMatches(nbaResponse.data, 'NBA');
    const ncaabMatches = processMatches(ncaabResponse.data, 'NCAA Basketball');
    const wnbaMatches = processMatches(wnbaResponse.data, 'WNBA');
    const nflMatches = processMatches(nflResponse.data, 'NFL');
    const ncaafMatches = processMatches(ncaafResponse.data, 'NCAA Football');
    const cflMatches = processMatches(cflResponse.data, 'CFL');
    
    // Combine and sort by date
    const allMatches = [...nbaMatches, ...ncaabMatches, ...wnbaMatches, ...nflMatches, ...ncaafMatches, ...cflMatches].sort((a, b) => 
      new Date(a.commenceTime) - new Date(b.commenceTime)
    );
    
    res.json(allMatches);
  } catch (error) {
    console.error('Error fetching all sports matches:', error);
    
    // Return mock data when API is unavailable
    const mockMatches = getMockAllSportsMatches();
    res.json(mockMatches);
  }
});

// Helper function to process matches
function processMatches(data, sport) {
  return data.map(match => {
    const homeTeam = match.home_team;
    const awayTeam = match.away_team;
    const commenceTime = new Date(match.commence_time);
    
    // Extract odds for different markets
    const h2hOdds = match.bookmakers[0]?.markets.find(m => m.key === 'h2h')?.outcomes || [];
    const spreadOdds = match.bookmakers[0]?.markets.find(m => m.key === 'spreads')?.outcomes || [];
    const totalOdds = match.bookmakers[0]?.markets.find(m => m.key === 'totals')?.outcomes || [];

    return {
      id: match.id,
      sport: sport,
      homeTeam,
      awayTeam,
      commenceTime: commenceTime.toISOString(),
      commenceTimeFormatted: commenceTime.toLocaleString(),
      odds: {
        h2h: h2hOdds.map(outcome => ({
          team: outcome.name,
          price: outcome.price,
          point: outcome.point
        })),
        spreads: spreadOdds.map(outcome => ({
          team: outcome.name,
          price: outcome.price,
          point: outcome.point
        })),
        totals: totalOdds.map(outcome => ({
          team: outcome.name,
          price: outcome.price,
          point: outcome.point
        }))
      }
    };
  });
}

// Mock data function for when API is unavailable
function getMockSportsMatches() {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
  
  return [
    // NBA Matches
    {
      id: 'mock-nba-1',
      sport: 'NBA',
      homeTeam: 'Los Angeles Lakers',
      awayTeam: 'Golden State Warriors',
      commenceTime: tomorrow.toISOString(),
      commenceTimeFormatted: tomorrow.toLocaleString(),
      odds: {
        h2h: [
          { team: 'Los Angeles Lakers', price: -150, point: undefined },
          { team: 'Golden State Warriors', price: +130, point: undefined }
        ],
        spreads: [
          { team: 'Los Angeles Lakers', price: -110, point: -3.5 },
          { team: 'Golden State Warriors', price: -110, point: 3.5 }
        ],
        totals: [
          { team: 'Over', price: -110, point: 225.5 },
          { team: 'Under', price: -110, point: 225.5 }
        ]
      }
    },
    {
      id: 'mock-nba-2',
      sport: 'NBA',
      homeTeam: 'Boston Celtics',
      awayTeam: 'Miami Heat',
      commenceTime: dayAfter.toISOString(),
      commenceTimeFormatted: dayAfter.toLocaleString(),
      odds: {
        h2h: [
          { team: 'Boston Celtics', price: -200, point: undefined },
          { team: 'Miami Heat', price: +170, point: undefined }
        ],
        spreads: [
          { team: 'Boston Celtics', price: -110, point: -6.5 },
          { team: 'Miami Heat', price: -110, point: 6.5 }
        ],
        totals: [
          { team: 'Over', price: -105, point: 218.5 },
          { team: 'Under', price: -115, point: 218.5 }
        ]
      }
    },
    // NFL Matches
    {
      id: 'mock-nfl-1',
      sport: 'NFL',
      homeTeam: 'Kansas City Chiefs',
      awayTeam: 'Buffalo Bills',
      commenceTime: tomorrow.toISOString(),
      commenceTimeFormatted: tomorrow.toLocaleString(),
      odds: {
        h2h: [
          { team: 'Kansas City Chiefs', price: -120, point: undefined },
          { team: 'Buffalo Bills', price: +100, point: undefined }
        ],
        spreads: [
          { team: 'Kansas City Chiefs', price: -110, point: -2.5 },
          { team: 'Buffalo Bills', price: -110, point: 2.5 }
        ],
        totals: [
          { team: 'Over', price: -110, point: 48.5 },
          { team: 'Under', price: -110, point: 48.5 }
        ]
      }
    },
    {
      id: 'mock-nfl-2',
      sport: 'NFL',
      homeTeam: 'Dallas Cowboys',
      awayTeam: 'Philadelphia Eagles',
      commenceTime: dayAfter.toISOString(),
      commenceTimeFormatted: dayAfter.toLocaleString(),
      odds: {
        h2h: [
          { team: 'Dallas Cowboys', price: +110, point: undefined },
          { team: 'Philadelphia Eagles', price: -130, point: undefined }
        ],
        spreads: [
          { team: 'Dallas Cowboys', price: -110, point: 3.5 },
          { team: 'Philadelphia Eagles', price: -110, point: -3.5 }
        ],
        totals: [
          { team: 'Over', price: -105, point: 45.5 },
          { team: 'Under', price: -115, point: 45.5 }
        ]
      }
    }
  ];
}

// Mock data for all basketball leagues
function getMockBasketballMatches() {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
  
  return [
    // NBA Matches
    {
      id: 'mock-nba-1',
      sport: 'NBA',
      homeTeam: 'Los Angeles Lakers',
      awayTeam: 'Golden State Warriors',
      commenceTime: tomorrow.toISOString(),
      commenceTimeFormatted: tomorrow.toLocaleString(),
      odds: {
        h2h: [
          { team: 'Los Angeles Lakers', price: -150, point: undefined },
          { team: 'Golden State Warriors', price: +130, point: undefined }
        ],
        spreads: [
          { team: 'Los Angeles Lakers', price: -110, point: -3.5 },
          { team: 'Golden State Warriors', price: -110, point: 3.5 }
        ],
        totals: [
          { team: 'Over', price: -110, point: 225.5 },
          { team: 'Under', price: -110, point: 225.5 }
        ]
      }
    },
    // NCAA Basketball
    {
      id: 'mock-ncaab-1',
      sport: 'NCAA Basketball',
      homeTeam: 'Duke Blue Devils',
      awayTeam: 'North Carolina Tar Heels',
      commenceTime: tomorrow.toISOString(),
      commenceTimeFormatted: tomorrow.toLocaleString(),
      odds: {
        h2h: [
          { team: 'Duke Blue Devils', price: -120, point: undefined },
          { team: 'North Carolina Tar Heels', price: +100, point: undefined }
        ],
        spreads: [
          { team: 'Duke Blue Devils', price: -110, point: -2.5 },
          { team: 'North Carolina Tar Heels', price: -110, point: 2.5 }
        ],
        totals: [
          { team: 'Over', price: -110, point: 145.5 },
          { team: 'Under', price: -110, point: 145.5 }
        ]
      }
    },
    // WNBA
    {
      id: 'mock-wnba-1',
      sport: 'WNBA',
      homeTeam: 'Las Vegas Aces',
      awayTeam: 'Seattle Storm',
      commenceTime: dayAfter.toISOString(),
      commenceTimeFormatted: dayAfter.toLocaleString(),
      odds: {
        h2h: [
          { team: 'Las Vegas Aces', price: -140, point: undefined },
          { team: 'Seattle Storm', price: +120, point: undefined }
        ],
        spreads: [
          { team: 'Las Vegas Aces', price: -110, point: -4.5 },
          { team: 'Seattle Storm', price: -110, point: 4.5 }
        ],
        totals: [
          { team: 'Over', price: -110, point: 165.5 },
          { team: 'Under', price: -110, point: 165.5 }
        ]
      }
    }
  ];
}

// Mock data for all football leagues
function getMockFootballMatches() {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
  
  return [
    // NFL Matches
    {
      id: 'mock-nfl-1',
      sport: 'NFL',
      homeTeam: 'Kansas City Chiefs',
      awayTeam: 'Buffalo Bills',
      commenceTime: tomorrow.toISOString(),
      commenceTimeFormatted: tomorrow.toLocaleString(),
      odds: {
        h2h: [
          { team: 'Kansas City Chiefs', price: -120, point: undefined },
          { team: 'Buffalo Bills', price: +100, point: undefined }
        ],
        spreads: [
          { team: 'Kansas City Chiefs', price: -110, point: -2.5 },
          { team: 'Buffalo Bills', price: -110, point: 2.5 }
        ],
        totals: [
          { team: 'Over', price: -110, point: 48.5 },
          { team: 'Under', price: -110, point: 48.5 }
        ]
      }
    },
    // NCAA Football
    {
      id: 'mock-ncaaf-1',
      sport: 'NCAA Football',
      homeTeam: 'Alabama Crimson Tide',
      awayTeam: 'Georgia Bulldogs',
      commenceTime: tomorrow.toISOString(),
      commenceTimeFormatted: tomorrow.toLocaleString(),
      odds: {
        h2h: [
          { team: 'Alabama Crimson Tide', price: -110, point: undefined },
          { team: 'Georgia Bulldogs', price: -110, point: undefined }
        ],
        spreads: [
          { team: 'Alabama Crimson Tide', price: -110, point: -1.5 },
          { team: 'Georgia Bulldogs', price: -110, point: 1.5 }
        ],
        totals: [
          { team: 'Over', price: -110, point: 52.5 },
          { team: 'Under', price: -110, point: 52.5 }
        ]
      }
    },
    // CFL
    {
      id: 'mock-cfl-1',
      sport: 'CFL',
      homeTeam: 'Toronto Argonauts',
      awayTeam: 'Winnipeg Blue Bombers',
      commenceTime: dayAfter.toISOString(),
      commenceTimeFormatted: dayAfter.toLocaleString(),
      odds: {
        h2h: [
          { team: 'Toronto Argonauts', price: +105, point: undefined },
          { team: 'Winnipeg Blue Bombers', price: -125, point: undefined }
        ],
        spreads: [
          { team: 'Toronto Argonauts', price: -110, point: 3.5 },
          { team: 'Winnipeg Blue Bombers', price: -110, point: -3.5 }
        ],
        totals: [
          { team: 'Over', price: -110, point: 50.5 },
          { team: 'Under', price: -110, point: 50.5 }
        ]
      }
    }
  ];
}

// Mock data for all sports combined
function getMockAllSportsMatches() {
  return [...getMockBasketballMatches(), ...getMockFootballMatches()];
}

// Create admin user (for testing)
app.post('/api/admin/create-admin', (req, res) => {
  const adminPassword = 'admin123';
  bcrypt.hash(adminPassword, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating admin' });
    }

    db.run(
      'INSERT OR REPLACE INTO users (id, username, email, password, credits, role) VALUES (1, ?, ?, ?, 0, ?)',
      ['admin', 'admin@betting.com', hashedPassword, 'admin'],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error creating admin' });
        }

        const token = jwt.sign(
          { id: 1, username: 'admin', role: 'admin' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          message: 'Admin created successfully',
          token,
          user: { id: 1, username: 'admin', email: 'admin@betting.com', role: 'admin' }
        });
      }
    );
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://192.168.1.106:${PORT}`);
});
