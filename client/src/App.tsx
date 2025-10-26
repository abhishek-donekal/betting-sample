import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Betting from './components/Betting';
import History from './components/History';
import AdminDashboard from './components/AdminDashboard';
import BasketballMatches from './components/BasketballMatches';
import SportsMatches from './components/SportsMatches';
import SportsCarousel from './components/SportsCarousel';
import ParticleSystem from './components/ParticleSystem';
import FuturisticCard from './components/FuturisticCard';
import NeonButton from './components/NeonButton';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ParticleSystem />
          <Navbar />
          <main className="container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/betting" element={<ProtectedRoute><Betting /></ProtectedRoute>} />
              <Route path="/basketball" element={<ProtectedRoute><BasketballMatches /></ProtectedRoute>} />
              <Route path="/sports" element={<ProtectedRoute><SportsMatches /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

function HomePage() {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section" style={{
        background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(255, 0, 128, 0.1) 50%, rgba(255, 255, 0, 0.1) 100%)',
        padding: '80px 0',
        marginBottom: '60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container text-center">
          <FuturisticCard className="primary" glowColor="#00ffff" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="gradient-text" style={{ 
              fontSize: '64px', 
              marginBottom: '30px', 
              fontWeight: '900',
              fontFamily: 'Orbitron, monospace'
            }}>
              🏈🏀 ROCK SPORTS BETTING
            </h1>
            <p style={{ 
              fontSize: '24px', 
              color: '#ffffff', 
              marginBottom: '40px',
              fontWeight: '500',
              textShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
            }}>
              Experience the thrill of professional sports betting with real-time odds from NBA, NCAA Basketball, WNBA, NFL, NCAA Football, and CFL
            </p>
            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
              <NeonButton variant="primary" size="large" onClick={() => window.location.href = '/register'}>
                🚀 START BETTING NOW
              </NeonButton>
              <NeonButton variant="secondary" size="large" onClick={() => window.location.href = '/login'}>
                🔑 LOGIN
              </NeonButton>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '30px' }}>
              <div className="text-center">
                <div className="stat-value gradient-text" style={{ fontSize: '28px', fontFamily: 'Orbitron, monospace' }}>$100</div>
                <div className="stat-label" style={{ color: '#b0b0b0' }}>Welcome Bonus</div>
              </div>
              <div className="text-center">
                <div className="stat-value gradient-text" style={{ fontSize: '28px', fontFamily: 'Orbitron, monospace' }}>24/7</div>
                <div className="stat-label" style={{ color: '#b0b0b0' }}>Live Action</div>
              </div>
              <div className="text-center">
                <div className="stat-value gradient-text" style={{ fontSize: '28px', fontFamily: 'Orbitron, monospace' }}>Real</div>
                <div className="stat-label" style={{ color: '#b0b0b0' }}>Sports Odds</div>
              </div>
            </div>
          </FuturisticCard>
        </div>
      </div>

      {/* Sports Carousel */}
      <div className="container">
        <SportsCarousel />
      </div>

      {/* Features Section */}
      <div className="container">
        <div className="text-center mb-30">
          <h2 className="gradient-text" style={{ fontSize: '48px', marginBottom: '20px', fontWeight: '800', fontFamily: 'Orbitron, monospace' }}>
            Why Choose Rock Sports?
          </h2>
          <p style={{ fontSize: '20px', color: '#b0b0b0', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }}>
            The ultimate destination for serious sports bettors
          </p>
        </div>

        <div className="grid grid-3">
          <FuturisticCard className="primary" glowColor="#00ffff" hoverEffect={true} tiltEffect={true}>
            <div className="text-center">
              <div className="sport-icon" style={{ fontSize: '48px', marginBottom: '20px', animation: 'pulse 2s ease-in-out infinite' }}>🏈</div>
              <h3 style={{ color: '#00ffff', marginBottom: '20px', fontSize: '24px', fontWeight: '700', fontFamily: 'Orbitron, monospace' }}>
                LIVE FOOTBALL ACTION
              </h3>
              <p style={{ color: '#ffffff', lineHeight: '1.6', textShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }}>
                Bet on NFL, NCAA Football, and CFL games with real-time odds, live spreads, and totals. Experience the excitement of America's most popular sport.
              </p>
            </div>
          </FuturisticCard>
          
          <FuturisticCard className="secondary" glowColor="#ff0080" hoverEffect={true} tiltEffect={true}>
            <div className="text-center">
              <div className="sport-icon" style={{ fontSize: '48px', marginBottom: '20px', animation: 'pulse 2s ease-in-out infinite' }}>🏀</div>
              <h3 style={{ color: '#ff0080', marginBottom: '20px', fontSize: '24px', fontWeight: '700', fontFamily: 'Orbitron, monospace' }}>
                BASKETBALL LEAGUES
              </h3>
              <p style={{ color: '#ffffff', lineHeight: '1.6', textShadow: '0 0 10px rgba(255, 0, 128, 0.3)' }}>
                From NBA to NCAA Basketball and WNBA, bet on every basketball game with competitive odds and multiple betting markets.
              </p>
            </div>
          </FuturisticCard>
          
          <FuturisticCard className="accent" glowColor="#ffff00" hoverEffect={true} tiltEffect={true}>
            <div className="text-center">
              <div className="sport-icon" style={{ fontSize: '48px', marginBottom: '20px', animation: 'pulse 2s ease-in-out infinite' }}>💰</div>
              <h3 style={{ color: '#ffff00', marginBottom: '20px', fontSize: '24px', fontWeight: '700', fontFamily: 'Orbitron, monospace' }}>
                PARLAY BONUSES
              </h3>
              <p style={{ color: '#ffffff', lineHeight: '1.6', textShadow: '0 0 10px rgba(255, 255, 0, 0.3)' }}>
                Combine multiple bets for massive payouts. The more selections, the bigger the potential win!
              </p>
            </div>
          </FuturisticCard>
        </div>

        {/* How It Works */}
        <div className="card" style={{ marginTop: '60px', background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(0, 212, 170, 0.1))' }}>
          <div className="text-center mb-30">
            <h2 className="gradient-text" style={{ fontSize: '40px', marginBottom: '20px', fontWeight: '800' }}>
              How It Works
            </h2>
            <p style={{ fontSize: '18px', color: '#000000' }}>
              Get started in minutes and start winning big
            </p>
          </div>

          <div className="grid grid-3">
            <div className="text-center">
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px',
                fontSize: '32px',
                fontWeight: '900'
              }}>
                1
              </div>
              <h4 style={{ color: '#ff6b35', marginBottom: '15px', fontSize: '20px', fontWeight: '700' }}>
                CREATE ACCOUNT
              </h4>
              <p style={{ color: '#000000' }}>
                Sign up in seconds and get your $100 welcome bonus instantly
              </p>
            </div>

            <div className="text-center">
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(45deg, #00d4aa, #00a8cc)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px',
                fontSize: '32px',
                fontWeight: '900'
              }}>
                2
              </div>
              <h4 style={{ color: '#00d4aa', marginBottom: '15px', fontSize: '20px', fontWeight: '700' }}>
                CHOOSE YOUR BETS
              </h4>
              <p style={{ color: '#000000' }}>
                Browse live NBA and NFL games, select your picks, and build your parlay
              </p>
            </div>

            <div className="text-center">
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(45deg, #f7931e, #ff6b35)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px',
                fontSize: '32px',
                fontWeight: '900'
              }}>
                3
              </div>
              <h4 style={{ color: '#f7931e', marginBottom: '15px', fontSize: '20px', fontWeight: '700' }}>
                WIN BIG
              </h4>
              <p style={{ color: '#000000' }}>
                Watch your games and collect your winnings. Track your performance over time
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center" style={{ marginTop: '60px', marginBottom: '40px' }}>
          <div className="card glass-effect" style={{ 
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(0, 212, 170, 0.2))',
            border: '2px solid rgba(255, 107, 53, 0.5)'
          }}>
            <h2 className="gradient-text" style={{ fontSize: '36px', marginBottom: '20px', fontWeight: '800' }}>
              Ready to Start Winning?
            </h2>
            <p style={{ fontSize: '20px', color: '#000000', marginBottom: '30px' }}>
              Join thousands of winners who trust Rock Sports for their betting needs
            </p>
            <a href="/register" className="btn btn-primary btn-glow" style={{ 
              fontSize: '20px', 
              padding: '25px 50px',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              🎯 GET STARTED NOW
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="text-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="text-center">Loading...</div>;
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

export default App;
