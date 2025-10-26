import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface DailyReport {
  date: string;
  total_bets: number;
  total_stakes: number;
  total_winnings: number;
  house_profit: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  credits: number;
  created_at: string;
}

interface Bet {
  id: number;
  user_id: number;
  username: string;
  bet_type: string;
  selections: Array<{
    id: string;
    matchId: string;
    sport: string;
    homeTeam: string;
    awayTeam: string;
    market: string;
    team: string;
    odds: number;
    selected: boolean;
  }>;
  odds: number;
  stake: number;
  potential_win: number;
  status: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bets'>('overview');

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const [reportResponse, usersResponse, betsResponse] = await Promise.all([
        axios.get(`/api/admin/daily-report?date=${selectedDate}`),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/bets')
      ]);

      setDailyReport(reportResponse.data);
      setUsers(usersResponse.data);
      setBets(betsResponse.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
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

  const calculateParlayBreakdown = (selections: any[]) => {
    const breakdown = selections.map(selection => {
      const decimalOdds = selection.odds > 0 
        ? (selection.odds / 100) + 1 
        : (100 / Math.abs(selection.odds)) + 1;
      
      return {
        ...selection,
        decimalOdds: decimalOdds,
        americanOdds: selection.odds
      };
    });

    const totalDecimalOdds = breakdown.reduce((total, selection) => total * selection.decimalOdds, 1);
    const americanOdds = totalDecimalOdds >= 2 
      ? (totalDecimalOdds - 1) * 100 
      : -100 / (totalDecimalOdds - 1);

    return {
      breakdown,
      totalDecimalOdds,
      americanOdds
    };
  };

  const totalUsers = users?.length || 0;
  const totalCredits = users?.reduce((sum, user) => sum + (user.credits || 0), 0) || 0;
  const totalBets = bets?.length || 0;
  const totalStakes = bets?.reduce((sum, bet) => sum + (bet.stake || 0), 0) || 0;
  const totalWinnings = bets?.filter(bet => bet.status === 'won').reduce((sum, bet) => sum + (bet.potential_win || 0), 0) || 0;
  const houseProfit = totalStakes - totalWinnings;

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '40px' }}>
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Admin Dashboard</h2>
        <p style={{ color: '#6c757d' }}>
          Monitor platform activity, user accounts, and financial performance.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px' }}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px' }}
          >
            👥 Users ({totalUsers})
          </button>
          <button
            onClick={() => setActiveTab('bets')}
            className={`btn ${activeTab === 'bets' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px' }}
          >
            🎯 All Bets ({totalBets})
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Date Selector */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <label className="form-label" style={{ margin: 0 }}>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-input"
                style={{ width: '200px' }}
              />
              <button onClick={fetchData} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                Refresh
              </button>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="admin-stats" style={{ marginBottom: '30px' }}>
            <div className="stat-card">
              <div className="stat-value">{totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">${totalCredits.toFixed(2)}</div>
              <div className="stat-label">Total Credits in System</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalBets}</div>
              <div className="stat-label">Total Bets</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">${totalStakes.toFixed(2)}</div>
              <div className="stat-label">Total Stakes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#28a745' }}>${totalWinnings.toFixed(2)}</div>
              <div className="stat-label">Total Winnings Paid</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: houseProfit >= 0 ? '#28a745' : '#dc3545' }}>
                ${houseProfit.toFixed(2)}
              </div>
              <div className="stat-label">House Profit</div>
            </div>
          </div>

          {/* Daily Report */}
          {dailyReport && (
            <div className="card">
              <h3 style={{ color: '#667eea', marginBottom: '20px' }}>
                Daily Report - {new Date(selectedDate).toLocaleDateString()}
              </h3>
              <div className="admin-stats">
                <div className="stat-card">
                  <div className="stat-value">{dailyReport.total_bets || 0}</div>
                  <div className="stat-label">Bets Today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">${(dailyReport.total_stakes || 0).toFixed(2)}</div>
                  <div className="stat-label">Stakes Today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value" style={{ color: '#28a745' }}>${(dailyReport.total_winnings || 0).toFixed(2)}</div>
                  <div className="stat-label">Winnings Today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value" style={{ color: (dailyReport.house_profit || 0) >= 0 ? '#28a745' : '#dc3545' }}>
                    ${(dailyReport.house_profit || 0).toFixed(2)}
                  </div>
                  <div className="stat-label">House Profit Today</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <h3 style={{ color: '#667eea', marginBottom: '20px' }}>All Users</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Username</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Credits</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                    <td style={{ padding: '12px' }}>{user.id}</td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{user.username}</td>
                    <td style={{ padding: '12px' }}>{user.email}</td>
                    <td style={{ padding: '12px', color: '#28a745', fontWeight: 'bold' }}>
                      ${(user.credits || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', color: '#6c757d' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bets Tab */}
      {activeTab === 'bets' && (
        <div className="card">
          <h3 style={{ color: '#667eea', marginBottom: '20px' }}>All Bets</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {bets?.map((bet) => (
              <div key={bet.id} className="bet-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ color: '#333', marginBottom: '4px' }}>
                      {bet.bet_type.charAt(0).toUpperCase() + bet.bet_type.slice(1)} Bet #{bet.id}
                    </h4>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                      User: {bet.username} | {new Date(bet.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      backgroundColor: getStatusColor(bet.status),
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {getStatusText(bet.status)}
                  </div>
                </div>

                {/* Detailed Parlay Breakdown */}
                <div style={{ marginBottom: '12px' }}>
                  <h5 style={{ color: '#333', marginBottom: '8px', fontSize: '14px' }}>Parlay Details:</h5>
                  {bet.bet_type === 'parlay' ? (
                    <div>
                      {(() => {
                        const parlayBreakdown = calculateParlayBreakdown(bet.selections);
                        return (
                          <div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                              {parlayBreakdown.breakdown.map((selection, index) => (
                                <div key={index} style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  padding: '8px 10px', 
                                  backgroundColor: '#f8f9fa', 
                                  borderRadius: '6px',
                                  border: '1px solid #e9ecef'
                                }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>
                                      {selection.team}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#6c757d' }}>
                                      {selection.sport} • {selection.homeTeam} vs {selection.awayTeam}
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: selection.odds > 0 ? '#28a745' : '#dc3545' }}>
                                      {selection.odds > 0 ? '+' : ''}{selection.odds}
                                    </div>
                                    <div style={{ fontSize: '9px', color: '#6c757d' }}>
                                      ({selection.decimalOdds.toFixed(3)})
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div style={{ 
                              padding: '8px', 
                              backgroundColor: '#e3f2fd', 
                              borderRadius: '6px',
                              border: '1px solid #bbdefb'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '500', color: '#1976d2' }}>Calculation:</span>
                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1976d2' }}>
                                  {parlayBreakdown.breakdown.map(s => s.decimalOdds.toFixed(3)).join(' × ')} = {parlayBreakdown.totalDecimalOdds.toFixed(3)}
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', color: '#1976d2' }}>Total Odds:</span>
                                <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#1976d2' }}>
                                  {parlayBreakdown.americanOdds > 0 ? '+' : ''}{parlayBreakdown.americanOdds.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div style={{ padding: '8px 10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        Single bet - No parlay calculation
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', borderTop: '1px solid #e9ecef', paddingTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Stake</div>
                    <div style={{ fontWeight: 'bold' }}>${(bet.stake || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Odds</div>
                    <div style={{ fontWeight: 'bold' }}>{(bet.odds || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Potential Win</div>
                    <div style={{ fontWeight: 'bold', color: '#28a745' }}>${(bet.potential_win || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Selections</div>
                    <div style={{ fontWeight: 'bold' }}>{bet.selections?.length || 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
