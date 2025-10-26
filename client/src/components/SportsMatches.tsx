import React, { useState, useEffect } from 'react';
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

const SportsMatches: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMarket, setSelectedMarket] = useState<'h2h' | 'spreads' | 'totals'>('h2h');
  const [selectedSport, setSelectedSport] = useState<'all' | 'NBA' | 'NFL'>('all');

  useEffect(() => {
    fetchMatches();
  }, [selectedDate, selectedSport]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      let endpoint = '/api/sports/upcoming';
      
      if (selectedSport === 'NBA') {
        endpoint = '/api/basketball/upcoming';
      } else if (selectedSport === 'NFL') {
        endpoint = '/api/football/upcoming';
      }
      
      const response = await axios.get(endpoint);
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (matchId: string, sport: string, market: string, team: string, odds: number, point?: number) => {
    const selectionId = `${matchId}-${market}-${team}`;
    const match = matches.find(m => m.id === matchId);
    
    if (!match) return;

    setSelections(prev => {
      const existingIndex = prev.findIndex(s => s.id === selectionId);
      
      if (existingIndex >= 0) {
        // Remove selection
        return prev.filter(s => s.id !== selectionId);
      } else {
        // Add selection
        const newSelection: Selection = {
          id: selectionId,
          matchId,
          sport,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          market,
          team,
          odds,
          point,
          selected: true
        };
        return [...prev, newSelection];
      }
    });
  };

  const formatOdds = (price: number) => {
    if (price > 0) return `+${price}`;
    return price.toString();
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

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'NBA': return '🏀';
      case 'NFL': return '🏈';
      default: return '⚽';
    }
  };

  const selectedSelections = selections.filter(s => s.selected);
  const totalOdds = selectedSelections.reduce((acc, selection) => acc * (selection.odds / 100 + 1), 1);

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '40px' }}>
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading sports matches...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>🏈🏀 American Sports Betting</h2>
        <p style={{ color: '#6c757d', marginBottom: '20px' }}>
          Bet on NBA basketball and NFL football matches with real odds from The Odds API.
        </p>
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div>
            <label className="form-label">Sport:</label>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value as 'all' | 'NBA' | 'NFL')}
              className="form-select"
              style={{ width: '120px' }}
            >
              <option value="all">All Sports</option>
              <option value="NBA">🏀 NBA</option>
              <option value="NFL">🏈 NFL</option>
            </select>
          </div>
          <div>
            <label className="form-label">Market Type:</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value as 'h2h' | 'spreads' | 'totals')}
              className="form-select"
              style={{ width: '150px' }}
            >
              <option value="h2h">Moneyline</option>
              <option value="spreads">Spread</option>
              <option value="totals">Total</option>
            </select>
          </div>
          <div>
            <label className="form-label">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-input"
              style={{ width: '150px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button onClick={fetchMatches} className="btn btn-primary" style={{ padding: '8px 16px' }}>
              Refresh
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>Available Credits: ${user?.credits.toFixed(2)}</span>
          <span style={{ fontWeight: 'bold', color: '#667eea' }}>
            {selectedSelections.length} selection{selectedSelections.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="card text-center">
          <h3 style={{ color: '#6c757d', marginBottom: '16px' }}>No matches found</h3>
          <p style={{ color: '#6c757d' }}>
            No {selectedSport === 'all' ? 'sports' : selectedSport} matches available for the selected date. 
            Try a different date or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-2">
          <div>
            <h3 style={{ color: '#667eea', marginBottom: '20px' }}>
              {getMarketLabel(selectedMarket)} Bets
            </h3>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {matches.map((match) => (
                <div key={match.id} className="bet-card">
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ color: '#333', margin: 0 }}>
                        {getSportIcon(match.sport)} {match.awayTeam} @ {match.homeTeam}
                      </h4>
                      <span style={{ fontSize: '14px', color: '#6c757d' }}>
                        {match.commenceTimeFormatted}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#667eea', fontWeight: 'bold' }}>
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
                          onClick={() => toggleSelection(
                            match.id,
                            match.sport,
                            selectedMarket,
                            outcome.team,
                            outcome.price,
                            outcome.point
                          )}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#e3f2fd' : '#f8f9fa',
                            border: isSelected ? '2px solid #667eea' : '2px solid transparent',
                            transition: 'all 0.3s ease',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '500' }}>
                              {getTeamLabel(outcome.team, selectedMarket, outcome.point)}
                            </span>
                            <span className="odds" style={{ color: '#28a745', fontWeight: 'bold' }}>
                              {formatOdds(outcome.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ color: '#667eea', marginBottom: '20px' }}>Bet Slip</h3>
            
            {selectedSelections.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
                Select at least 2 options to place a parlay bet
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '12px' }}>Selected Selections:</h4>
                  {selectedSelections.map((selection) => (
                    <div key={selection.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>
                          {getSportIcon(selection.sport)} {selection.awayTeam} @ {selection.homeTeam}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          {getMarketLabel(selection.market)} - {getTeamLabel(selection.team, selection.market, selection.point)}
                        </div>
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#28a745' }}>
                        {formatOdds(selection.odds)}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Total Odds:</span>
                    <span style={{ fontWeight: 'bold' }}>{totalOdds.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span>Potential Win (per $1):</span>
                    <span className="potential-win">${(totalOdds - 1).toFixed(2)}</span>
                  </div>
                  
                  <div style={{ textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>
                    Place your bet on the Betting page
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SportsMatches;
