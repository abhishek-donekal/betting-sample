const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/betting.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Function to calculate correct parlay odds
function calculateCorrectParlayOdds(selections) {
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
  
  return { americanOdds, totalDecimalOdds };
}

// Get all parlay bets
db.all('SELECT * FROM bets WHERE bet_type = ?', ['parlay'], (err, bets) => {
  if (err) {
    console.error('Error fetching bets:', err.message);
    return;
  }
  
  console.log(`Found ${bets.length} parlay bets to fix...`);
  
  let fixedCount = 0;
  let errorCount = 0;
  
  bets.forEach((bet, index) => {
    try {
      const selections = JSON.parse(bet.selections);
      
      // Calculate correct odds
      const { americanOdds, totalDecimalOdds } = calculateCorrectParlayOdds(selections);
      const correctPotentialWin = bet.stake * totalDecimalOdds;
      
      console.log(`\nBet #${bet.id}:`);
      console.log(`  Old odds: ${bet.odds}`);
      console.log(`  New odds: ${americanOdds.toFixed(2)}`);
      console.log(`  Old potential win: $${bet.potential_win.toFixed(2)}`);
      console.log(`  New potential win: $${correctPotentialWin.toFixed(2)}`);
      
      // Update the bet in database
      db.run(
        'UPDATE bets SET odds = ?, potential_win = ? WHERE id = ?',
        [americanOdds, correctPotentialWin, bet.id],
        function(err) {
          if (err) {
            console.error(`Error updating bet #${bet.id}:`, err.message);
            errorCount++;
          } else {
            console.log(`  ✅ Updated successfully`);
            fixedCount++;
          }
          
          // Check if this is the last bet
          if (index === bets.length - 1) {
            console.log(`\n📊 Summary:`);
            console.log(`  Total bets processed: ${bets.length}`);
            console.log(`  Successfully fixed: ${fixedCount}`);
            console.log(`  Errors: ${errorCount}`);
            
            if (errorCount === 0) {
              console.log('\n🎉 All parlay bets have been fixed with correct odds!');
            }
            
            db.close();
          }
        }
      );
      
    } catch (error) {
      console.error(`Error processing bet #${bet.id}:`, error.message);
      errorCount++;
      
      if (index === bets.length - 1) {
        console.log(`\n📊 Summary:`);
        console.log(`  Total bets processed: ${bets.length}`);
        console.log(`  Successfully fixed: ${fixedCount}`);
        console.log(`  Errors: ${errorCount}`);
        db.close();
      }
    }
  });
  
  if (bets.length === 0) {
    console.log('No parlay bets found in database.');
    db.close();
  }
});

