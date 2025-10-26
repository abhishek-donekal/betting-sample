import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Bet {
  id: number;
  bet_type: string;
  selections: any[];
  odds: number;
  stake: number;
  potential_win: number;
  status: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [recentBets, setRecentBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axios.get('/api/profile');
      updateUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [updateUser]);

  useEffect(() => {
    fetchRecentBets();
    fetchUserProfile();
  }, [fetchUserProfile]);

  const fetchRecentBets = async () => {
    try {
      const response = await axios.get('/api/bets/history');
      setRecentBets(response.data.slice(0, 5)); // Get last 5 bets
    } catch (error) {
      console.error('Error fetching recent bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return '#28a745';
      case 'lost': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'won': return 'Won';
      case 'lost': return 'Lost';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  return (
    <div>
      <div className="card glass-effect" style={{ 
        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(0, 212, 170, 0.2) 100%)', 
        color: 'white', 
        marginBottom: '30px',
        border: '2px solid rgba(255, 107, 53, 0.3)'
      }}>
        <h1 className="gradient-text" style={{ fontSize: '36px', marginBottom: '15px', fontWeight: '800' }}>
          Welcome back, {user?.username}! 👋
        </h1>
        <p style={{ fontSize: '20px', opacity: 0.9, fontWeight: '500' }}>
          {user?.role === 'admin' 
            ? '🏦 Welcome to the admin dashboard. Monitor platform activity and house performance.'
            : `🎯 Ready to place some bets? You have $${user?.credits.toFixed(2)} in credits to win big!`
          }
        </p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="gradient-text" style={{ marginBottom: '25px', fontSize: '24px', fontWeight: '700' }}>🚀 Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {user?.role === 'admin' ? (
              <>
                <Link to="/admin" className="btn btn-primary btn-glow" style={{ textAlign: 'center', fontSize: '16px', padding: '15px 25px' }}>
                  🏦 Admin Dashboard
                </Link>
                      <div style={{ textAlign: 'center', color: '#000000', padding: '20px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '15px' }}>
                        <h4 style={{ color: '#ff6b35', marginBottom: '10px' }}>👑 Admin Access</h4>
                        <p style={{ color: '#000000' }}>You have full administrative privileges to monitor the platform.</p>
                      </div>
              </>
            ) : (
              <>
                <Link to="/sports" className="btn btn-primary btn-glow" style={{ textAlign: 'center', fontSize: '16px', padding: '15px 25px' }}>
                  🏈🏀 Live Sports
                </Link>
                <Link to="/basketball" className="btn btn-secondary" style={{ textAlign: 'center', fontSize: '16px', padding: '15px 25px' }}>
                  🏀 NBA Games
                </Link>
                <Link to="/betting" className="btn btn-success" style={{ textAlign: 'center', fontSize: '16px', padding: '15px 25px' }}>
                  🎯 Place Bet
                </Link>
                <Link to="/history" className="btn btn-secondary" style={{ textAlign: 'center', fontSize: '16px', padding: '15px 25px' }}>
                  📊 View History
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '25px', fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>📊 Account Summary</h3>
          {user?.role === 'admin' ? (
            <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', padding: '10px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '10px' }}>
                      <span style={{ color: '#000000' }}>Account Type:</span>
                      <span style={{ fontWeight: 'bold', color: '#ff6b35' }}>👑 Administrator</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', padding: '10px', background: 'rgba(0, 212, 170, 0.1)', borderRadius: '10px' }}>
                      <span style={{ color: '#000000' }}>Permissions:</span>
                      <span style={{ fontWeight: 'bold', color: '#00d4aa' }}>🔓 Full Access</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(247, 147, 30, 0.1)', borderRadius: '10px' }}>
                      <span style={{ color: '#000000' }}>Member Since:</span>
                      <span style={{ fontWeight: 'bold', color: '#f7931e' }}>
                        {user ? new Date().toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', padding: '10px', background: 'rgba(0, 212, 170, 0.1)', borderRadius: '10px' }}>
                <span style={{ color: '#000000' }}>Available Credits:</span>
                <span style={{ fontWeight: 'bold', color: '#00d4aa', fontSize: '18px' }}>
                  💰 ${user?.credits.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', padding: '10px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '10px' }}>
                <span style={{ color: '#000000' }}>Total Bets:</span>
                <span style={{ fontWeight: 'bold', color: '#ff6b35' }}>🎯 {recentBets.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(247, 147, 30, 0.1)', borderRadius: '10px' }}>
                <span style={{ color: '#000000' }}>Member Since:</span>
                <span style={{ fontWeight: 'bold', color: '#f7931e' }}>
                  📅 {user ? new Date().toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {user?.role !== 'admin' && (
        <div className="card">
          <h3 className="gradient-text" style={{ marginBottom: '25px', fontSize: '24px', fontWeight: '700' }}>🎯 Recent Bets</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading recent bets...
          </div>
        ) : recentBets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
            No bets yet. <Link to="/betting" style={{ color: '#667eea' }}>Place your first bet!</Link>
          </div>
        ) : (
          <div>
            {recentBets.map((bet) => (
              <div key={bet.id} className="bet-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold' }}>
                    {bet.bet_type.charAt(0).toUpperCase() + bet.bet_type.slice(1)} Bet
                  </span>
                  <span 
                    style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      backgroundColor: getStatusColor(bet.status),
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {getStatusText(bet.status)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Stake:</span>
                  <span>${bet.stake.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Potential Win:</span>
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                    ${bet.potential_win.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6c757d' }}>
                  <span>{bet.selections.length} selections</span>
                  <span>{new Date(bet.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link to="/history" className="btn btn-secondary">
                View All Bets
              </Link>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
