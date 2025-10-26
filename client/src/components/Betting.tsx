import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Match {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  commenceTimeFormatted: string;
  odds: {
    h2h: Array<{
      team: string;
      price: number;
      point?: number;
    }>;
    spreads: Array<{
      team: string;
      price: number;
      point?: number;
    }>;
    totals: Array<{
      team: string;
      price: number;
      point?: number;
    }>;
  };
}

interface Selection {
  id: string;
  matchId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  market: string;
  team: string;
  odds: number;
  point?: number;
  selected: boolean;
}

const Betting: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [stake, setStake] = useState<number>(10);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSport, setSelectedSport] = useState<'all' | 'basketball' | 'football' | 'NBA' | 'NCAA Basketball' | 'WNBA' | 'NFL' | 'NCAA Football' | 'CFL'>('all');
  const [selectedMarket, setSelectedMarket] = useState<'h2h' | 'spreads' | 'totals'>('h2h');

  const fetchMatches = useCallback(async () => {
    try {
      let endpoint = '/api/sports/upcoming';
      
      if (selectedSport === 'basketball' || selectedSport === 'NBA' || selectedSport === 'NCAA Basketball' || selectedSport === 'WNBA') {
        endpoint = '/api/basketball/upcoming';
      } else if (selectedSport === 'football' || selectedSport === 'NFL' || selectedSport === 'NCAA Football' || selectedSport === 'CFL') {
        endpoint = '/api/football/upcoming';
      }
      
      const response = await axios.get(endpoint);
      let allMatches = response.data;
      
      if (selectedSport !== 'all' && selectedSport !== 'basketball' && selectedSport !== 'football') {
        allMatches = allMatches.filter((match: Match) => match.sport === selectedSport);
      }
      
      setMatches(allMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMessage({ type: 'error', text: 'Failed to load sports matches' });
    }
  }, [selectedSport]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'NBA': return '🏀';
      case 'NCAA Basketball': return '🏀';
      case 'WNBA': return '🏀';
      case 'NFL': return '🏈';
      case 'NCAA Football': return '🏈';
      case 'CFL': return '🏈';
      default: return '⚽';
    }
  };

  const getMarketLabel = (market: string) => {
    switch (market) {
      case 'h2h': return 'Moneyline';
      case 'spreads': return 'Spread';
      case 'totals': return 'Total';
      default: return market;
    }
  };

  const getTeamLabel = (team: string, market: string, point?: number) => {
    switch (market) {
      case 'h2h': return team;
      case 'spreads': return `${team} ${point && point > 0 ? '+' : ''}${point || 0}`;
      case 'totals': return `${point && point > 0 ? 'Over' : 'Under'} ${Math.abs(point || 0)}`;
      default: return team;
    }
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const handleSelection = (match: Match, outcome: any, market: string) => {
    const selectionId = `${match.id}-${market}-${outcome.team}`;
    const existingSelection = selections.find(s => s.id === selectionId);
    
    if (existingSelection) {
      setSelections(selections.filter(s => s.id !== selectionId));
    } else {
      const newSelection: Selection = {
        id: selectionId,
        matchId: match.id,
        sport: match.sport,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        market: market,
        team: outcome.team,
        odds: outcome.price,
        point: outcome.point,
        selected: true
      };
      setSelections([...selections, newSelection]);
    }
  };

  const selectedSelections = selections.filter(s => s.selected);
  const totalOdds = selectedSelections.reduce((acc, selection) => acc * (selection.odds / 100 + 1), 1);
  const potentialWin = stake * totalOdds;

  const placeBet = async () => {
    if (selectedSelections.length < 2) {
      setMessage({ type: 'error', text: 'Please select at least 2 options' });
      return;
    }

    if (stake < 1) {
      setMessage({ type: 'error', text: 'Minimum stake is $1' });
      return;
    }

    if (stake > (user?.credits || 0)) {
      setMessage({ type: 'error', text: 'Insufficient credits' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await axios.post('/api/bet/parlay', {
        selections: selectedSelections,
        stake: stake
      });

      setMessage({ type: 'success', text: 'Bet placed successfully!' });
      setSelections([]);
      setStake(10);
      
      // Refresh user credits
      const response = await axios.get('/api/profile');
      updateUser(response.data);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to place bet' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Mobile Floating Bet Button */}
      {selectedSelections.length > 0 && (
        <div className="mobile-bet-button" style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1001,
          display: 'none'
        }}>
          <button 
            className="btn btn-primary btn-glow"
            style={{
              padding: '15px 25px',
              fontSize: '16px',
              fontWeight: '700',
              borderRadius: '25px',
              boxShadow: '0 8px 25px rgba(255, 107, 53, 0.4)',
              animation: 'pulse 2s ease-in-out infinite'
            }}
            onClick={() => {
              const betSlip = document.querySelector('.bet-slip');
              if (betSlip) {
                betSlip.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            🎯 {selectedSelections.length} Selection{selectedSelections.length !== 1 ? 's' : ''} - ${stake.toFixed(2)}
          </button>
        </div>
      )}

      <div className="card glass-effect" style={{ marginBottom: '30px', border: '2px solid rgba(255, 107, 53, 0.3)' }}>
        <h2 className="gradient-text" style={{ 
          fontSize: '32px', 
          marginBottom: '20px', 
          fontWeight: '800'
        }}>
          <span className="desktop-only">🏈🏀 Place a Parlay Bet</span>
          <span className="mobile-only">🏈🏀 Bet</span>
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '20px', fontSize: '18px', fontWeight: '500' }}>
          <span className="desktop-only">Select at least 2 options from real NBA and NFL matches to create a parlay bet. The more selections you add, the higher your potential winnings! 🚀</span>
          <span className="mobile-only">Select 2+ options to create a parlay bet! 🚀</span>
        </p>
        
        {/* Mobile Instructions */}
        <div className="mobile-only" style={{ 
          background: 'rgba(0, 255, 255, 0.1)', 
          padding: '15px', 
          borderRadius: '10px', 
          marginBottom: '20px',
          border: '1px solid rgba(0, 255, 255, 0.3)'
        }}>
          <p style={{ color: '#00ffff', fontSize: '14px', fontWeight: '600', margin: 0, textAlign: 'center' }}>
            📱 Mobile Tip: Tap any odds button to add selections. Use the floating button at the bottom to view your bet slip!
          </p>
        </div>
        
        <div className="betting-controls" style={{ 
          display: 'flex', 
          gap: '20px', 
          marginBottom: '20px', 
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}>
          <div className="control-group">
            <label className="form-label">🏈 Sport:</label>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value as 'all' | 'basketball' | 'football' | 'NBA' | 'NCAA Basketball' | 'WNBA' | 'NFL' | 'NCAA Football' | 'CFL')}
              className="form-select"
              style={{ width: '200px', minWidth: '150px' }}
            >
              <option value="all">🏈🏀 All Sports</option>
              <optgroup label="🏀 Basketball">
                <option value="basketball">All Basketball</option>
                <option value="NBA">NBA</option>
                <option value="NCAA Basketball">NCAA Basketball</option>
                <option value="WNBA">WNBA</option>
              </optgroup>
              <optgroup label="🏈 Football">
                <option value="football">All Football</option>
                <option value="NFL">NFL</option>
                <option value="NCAA Football">NCAA Football</option>
                <option value="CFL">CFL</option>
              </optgroup>
            </select>
          </div>
          <div className="control-group">
            <label className="form-label">🎯 Market Type:</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value as 'h2h' | 'spreads' | 'totals')}
              className="form-select"
              style={{ width: '170px', minWidth: '120px' }}
            >
              <option value="h2h">Moneyline</option>
              <option value="spreads">Spread</option>
              <option value="totals">Total</option>
            </select>
          </div>
          <div className="control-group">
            <button onClick={fetchMatches} className="btn btn-secondary" style={{ padding: '12px 20px', fontSize: '14px' }}>
              🔄 Refresh
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '15px', background: 'rgba(0, 212, 170, 0.1)', borderRadius: '15px' }}>
          <span style={{ fontWeight: 'bold', color: '#00d4aa', fontSize: '16px' }}>💰 Available Credits: ${user?.credits.toFixed(2)}</span>
          <span style={{ fontWeight: 'bold', color: '#ff6b35', fontSize: '16px' }}>
            🎯 {selectedSelections.length} selection{selectedSelections.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type === 'error' ? 'error' : message.type === 'success' ? 'success' : 'info'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <h3 className="gradient-text" style={{ marginBottom: '25px', fontSize: '24px', fontWeight: '700' }}>
            🎯 {getMarketLabel(selectedMarket)} Bets
          </h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {matches.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
                Loading sports matches...
              </div>
            ) : (
              matches.map((match) => (
                <div key={match.id} className="bet-card" style={{ marginBottom: '20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ color: '#000000', margin: 0, fontWeight: '700', fontSize: '16px' }}>
                        {getSportIcon(match.sport)} {match.awayTeam} @ {match.homeTeam}
                      </h4>
                      <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                        {new Date(match.commenceTime).toLocaleDateString()} {new Date(match.commenceTime).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#ff6b35', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {match.sport}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {match.odds[selectedMarket]?.map((outcome, index) => {
                      const selectionId = `${match.id}-${selectedMarket}-${outcome.team}`;
                      const isSelected = selections.some(s => s.id === selectionId);
                      
                      return (
                        <div
                          key={index}
                          className={`bet-selection ${isSelected ? 'selected' : ''}`}
                          style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid #ff6b35' : '1px solid #e9ecef',
                            backgroundColor: isSelected ? 'rgba(255, 107, 53, 0.1)' : '#f8f9fa',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => handleSelection(match, outcome, selectedMarket)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', color: '#000000', fontSize: '14px' }}>
                              {getTeamLabel(outcome.team, selectedMarket, outcome.point)}
                            </span>
                            <span style={{ 
                              fontWeight: 'bold', 
                              color: isSelected ? '#ff6b35' : '#28a745', 
                              fontSize: '16px' 
                            }}>
                              {formatOdds(outcome.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card bet-slip">
          <h3 className="gradient-text" style={{ marginBottom: '25px', fontSize: '24px', fontWeight: '700' }}>🎫 Bet Slip</h3>
          <div className="bet-slip-content">
            {selectedSelections.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '20px', fontSize: '16px', fontWeight: '500' }}>
                Select at least 2 options to place a bet
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '12px', color: '#000000', fontWeight: '700' }}>Selected Selections:</h4>
                  {selectedSelections.map((selection) => (
                    <div key={selection.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#000000' }}>
                          {getSportIcon(selection.sport)} {selection.awayTeam} @ {selection.homeTeam}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          {getMarketLabel(selection.market)} - {getTeamLabel(selection.team, selection.market, selection.point)}
                        </div>
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#28a745', fontSize: '16px' }}>
                        {formatOdds(selection.odds)}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">Stake Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    max={user?.credits || 0}
                    value={stake}
                    onChange={(e) => setStake(Number(e.target.value))}
                    className="stake-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Total Odds:</span>
                    <span style={{ fontWeight: 'bold' }}>{totalOdds.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span>Potential Win:</span>
                    <span className="potential-win">${potentialWin.toFixed(2)}</span>
                  </div>
                  
                  <button
                    onClick={placeBet}
                    disabled={loading || selectedSelections.length < 2 || stake < 1}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    {loading ? 'Placing Bet...' : `Place Bet ($${stake.toFixed(2)})`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card glass-effect" style={{ marginTop: '30px', border: '2px solid rgba(0, 212, 170, 0.3)' }}>
        <h3 className="gradient-text" style={{ marginBottom: '25px', fontSize: '28px', fontWeight: '800' }}>🎓 How Parlay Betting Works</h3>
        <div className="grid grid-2">
          <div style={{ padding: '20px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '15px' }}>
            <h4 style={{ color: '#ff6b35', marginBottom: '15px', fontSize: '18px', fontWeight: '700' }}>🎯 Selection</h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', lineHeight: '1.6' }}>
              Choose 2 or more selections from the available options. Each selection has different odds.
            </p>
          </div>
          <div style={{ padding: '20px', background: 'rgba(0, 212, 170, 0.1)', borderRadius: '15px' }}>
            <h4 style={{ color: '#00d4aa', marginBottom: '15px', fontSize: '18px', fontWeight: '700' }}>💰 Calculation</h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', lineHeight: '1.6' }}>
              Your total odds are calculated by multiplying all individual odds together. Higher odds = bigger potential wins!
            </p>
          </div>
          <div style={{ padding: '20px', background: 'rgba(247, 147, 30, 0.1)', borderRadius: '15px' }}>
            <h4 style={{ color: '#f7931e', marginBottom: '15px', fontSize: '18px', fontWeight: '700' }}>🏆 Winning</h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', lineHeight: '1.6' }}>
              To win, ALL your selections must be correct. If even one selection loses, the entire bet loses.
            </p>
          </div>
          <div style={{ padding: '20px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '15px' }}>
            <h4 style={{ color: '#ff6b35', marginBottom: '15px', fontSize: '18px', fontWeight: '700' }}>💡 Strategy</h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', lineHeight: '1.6' }}>
              More selections = higher potential winnings, but also higher risk. Choose wisely!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Betting;