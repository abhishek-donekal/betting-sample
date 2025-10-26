import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Bet {
  id: number;
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

const History: React.FC = () => {
  const { user } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');

  useEffect(() => {
    fetchBets();
  }, []);

  const fetchBets = async () => {
    try {
      const response = await axios.get('/api/bets/history');
      setBets(response.data);
    } catch (error) {
      console.error('Error fetching bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBets = bets.filter(bet => {
    if (filter === 'all') return true;
    return bet.status === filter;
  });

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

  const getTotalStats = () => {
    const totalBets = bets.length;
    const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0);
    const totalWon = bets.filter(bet => bet.status === 'won').reduce((sum, bet) => sum + bet.potential_win, 0);
    const totalLost = bets.filter(bet => bet.status === 'lost').reduce((sum, bet) => sum + bet.stake, 0);
    const netResult = totalWon - totalLost;

    return { totalBets, totalStaked, totalWon, totalLost, netResult };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '40px' }}>
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading betting history...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Betting History</h2>
        <p style={{ color: '#6c757d' }}>
          Track all your betting activity and performance over time.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="admin-stats" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-value">{stats.totalBets}</div>
          <div className="stat-label">Total Bets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${stats.totalStaked.toFixed(2)}</div>
          <div className="stat-label">Total Staked</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#28a745' }}>${stats.totalWon.toFixed(2)}</div>
          <div className="stat-label">Total Won</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#dc3545' }}>${stats.totalLost.toFixed(2)}</div>
          <div className="stat-label">Total Lost</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: stats.netResult >= 0 ? '#28a745' : '#dc3545' }}>
            ${stats.netResult.toFixed(2)}
          </div>
          <div className="stat-label">Net Result</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px' }}
          >
            All ({bets.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px' }}
          >
            Pending ({bets.filter(b => b.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('won')}
            className={`btn ${filter === 'won' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px' }}
          >
            Won ({bets.filter(b => b.status === 'won').length})
          </button>
          <button
            onClick={() => setFilter('lost')}
            className={`btn ${filter === 'lost' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px' }}
          >
            Lost ({bets.filter(b => b.status === 'lost').length})
          </button>
        </div>
      </div>

      {/* Bets List */}
      <div className="card">
        {filteredBets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            {filter === 'all' ? 'No bets found. Start betting to see your history here!' : `No ${filter} bets found.`}
          </div>
        ) : (
          <div>
            {filteredBets.map((bet) => (
              <div key={bet.id} className="bet-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ color: '#ffffff', marginBottom: '4px' }}>
                      {bet.bet_type.charAt(0).toUpperCase() + bet.bet_type.slice(1)} Bet #{bet.id}
                    </h4>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                      {new Date(bet.created_at).toLocaleString()}
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

                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{ color: '#333', marginBottom: '12px' }}>Parlay Breakdown:</h5>
                  {bet.bet_type === 'parlay' ? (
                    <div>
                      {(() => {
                        const parlayBreakdown = calculateParlayBreakdown(bet.selections);
                        return (
                          <div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                              {parlayBreakdown.breakdown.map((selection, index) => (
                                <div key={index} style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  padding: '10px 12px', 
                                  backgroundColor: '#f8f9fa', 
                                  borderRadius: '8px',
                                  border: '1px solid #e9ecef'
                                }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                                      {selection.team}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                      {selection.sport} • {selection.homeTeam} vs {selection.awayTeam}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>
                                      {selection.market === 'h2h' ? 'Moneyline' : 
                                       selection.market === 'spreads' ? 'Point Spread' : 
                                       selection.market === 'totals' ? 'Over/Under' : selection.market}
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: selection.odds > 0 ? '#28a745' : '#dc3545' }}>
                                      {selection.odds > 0 ? '+' : ''}{selection.odds}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#6c757d' }}>
                                      ({selection.decimalOdds.toFixed(3)})
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div style={{ 
                              padding: '12px', 
                              backgroundColor: '#e3f2fd', 
                              borderRadius: '8px',
                              border: '1px solid #bbdefb'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1976d2' }}>Parlay Calculation:</span>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1976d2' }}>
                                  {parlayBreakdown.breakdown.map(s => s.decimalOdds.toFixed(3)).join(' × ')} = {parlayBreakdown.totalDecimalOdds.toFixed(3)}
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#1976d2' }}>Total American Odds:</span>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1976d2' }}>
                                  {parlayBreakdown.americanOdds > 0 ? '+' : ''}{parlayBreakdown.americanOdds.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div style={{ padding: '10px 12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        Single bet - No parlay calculation needed
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', borderTop: '1px solid #e9ecef', paddingTop: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Stake</div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>${bet.stake.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Total Odds</div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{bet.odds.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Potential Win</div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#28a745' }}>${bet.potential_win.toFixed(2)}</div>
                  </div>
                  {bet.status === 'won' && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Winnings</div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#28a745' }}>${bet.potential_win.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
