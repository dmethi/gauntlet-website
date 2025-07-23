export async function runTestSimulation() {
  // Simulate a simple fantasy matchup
  const team1 = {
    name: 'Thunder Bolts',
    players: [
      { name: 'QB1', position: 'QB', projectedPoints: 22.5 },
      { name: 'RB1', position: 'RB', projectedPoints: 18.2 },
      { name: 'RB2', position: 'RB', projectedPoints: 12.8 },
      { name: 'WR1', position: 'WR', projectedPoints: 16.4 },
      { name: 'WR2', position: 'WR', projectedPoints: 14.1 },
      { name: 'TE1', position: 'TE', projectedPoints: 8.9 },
      { name: 'FLEX', position: 'WR', projectedPoints: 11.3 },
      { name: 'K1', position: 'K', projectedPoints: 7.2 },
      { name: 'DEF1', position: 'DEF', projectedPoints: 9.8 }
    ]
  };

  const team2 = {
    name: 'Lightning Strikes',
    players: [
      { name: 'QB2', position: 'QB', projectedPoints: 20.1 },
      { name: 'RB3', position: 'RB', projectedPoints: 19.7 },
      { name: 'RB4', position: 'RB', projectedPoints: 10.5 },
      { name: 'WR3', position: 'WR', projectedPoints: 17.8 },
      { name: 'WR4', position: 'WR', projectedPoints: 13.2 },
      { name: 'TE2', position: 'TE', projectedPoints: 9.4 },
      { name: 'FLEX2', position: 'RB', projectedPoints: 12.6 },
      { name: 'K2', position: 'K', projectedPoints: 6.8 },
      { name: 'DEF2', position: 'DEF', projectedPoints: 8.3 }
    ]
  };

  // Add variance to simulate actual performance
  const simulateActualPerformance = (projected: number) => {
    const variance = 0.3; // 30% variance
    const random = (Math.random() - 0.5) * 2; // -1 to 1
    return Math.max(0, projected + (projected * variance * random));
  };

  const team1Score = team1.players.reduce((total, player) => 
    total + simulateActualPerformance(player.projectedPoints), 0
  );

  const team2Score = team2.players.reduce((total, player) => 
    total + simulateActualPerformance(player.projectedPoints), 0
  );

  return {
    matchup: `${team1.name} vs ${team2.name}`,
    scores: {
      [team1.name]: Math.round(team1Score * 100) / 100,
      [team2.name]: Math.round(team2Score * 100) / 100
    },
    winner: team1Score > team2Score ? team1.name : team2.name,
    margin: Math.abs(team1Score - team2Score).toFixed(2)
  };
} 