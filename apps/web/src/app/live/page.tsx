import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const LEAGUE_ID = '1049321550490456064'; // Replace with your actual league ID

function getCurrentWeek(): number {
  const seasonStart = new Date('2024-09-05');
  const now = new Date();
  const diffTime = now.getTime() - seasonStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(Math.ceil(diffDays / 7), 1), 18);
}

async function getLiveData() {
  const currentWeek = getCurrentWeek();
  
  try {
    // Read live scores
    const scoresFile = join(DATA_DIR, `live-scores-${LEAGUE_ID}-week-${currentWeek}.json`);
    const winProbFile = join(DATA_DIR, `win-prob-${LEAGUE_ID}-week-${currentWeek}.json`);
    
    let liveScores = null;
    let winProbs = null;
    
    if (existsSync(scoresFile)) {
      liveScores = JSON.parse(readFileSync(scoresFile, 'utf8'));
    }
    
    if (existsSync(winProbFile)) {
      winProbs = JSON.parse(readFileSync(winProbFile, 'utf8'));
    }
    
    return { liveScores, winProbs, currentWeek };
  } catch (error) {
    console.error('Error reading live data:', error);
    return { liveScores: null, winProbs: null, currentWeek: getCurrentWeek() };
  }
}

export default async function LivePage() {
  const { liveScores, winProbs, currentWeek } = await getLiveData();
  
  if (!liveScores?.matchups) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Live Scores - Week {currentWeek}</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No live data available. Games may not be active or data hasn't been updated yet.
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Live Scores - Week {currentWeek}</h1>
      
      <div className="mb-4 text-sm text-gray-600">
        Last updated: {new Date(liveScores.lastUpdated).toLocaleString()}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {liveScores.matchups.map((matchup: any, index: number) => {
          const winProb = winProbs?.winProbabilities?.find(
            (wp: any) => wp.roster_id === matchup.roster_id
          );
          
          return (
            <div key={index} className="border rounded-lg p-6 bg-white shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Matchup {matchup.matchup_id}
                </h3>
                <div className="text-sm text-gray-500">
                  Roster {matchup.roster_id}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Current Score:</span>
                  <span className="font-bold text-2xl">
                    {matchup.totalLivePoints?.toFixed(1) || '0.0'}
                  </span>
                </div>
                
                {winProb && (
                  <>
                    <div className="flex justify-between">
                      <span>Projected Total:</span>
                      <span className="font-semibold">
                        {winProb.projectedTotal}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Win Probability:</span>
                      <span className={`font-bold ${
                        winProb.winProbability > 0.6 ? 'text-green-600' :
                        winProb.winProbability > 0.4 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {(winProb.winProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${winProb.winProbability * 100}%` }}
                      ></div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Player Scores:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(matchup.livePoints || {}).map(([playerId, points]) => (
                    <div key={playerId} className="flex justify-between">
                      <span className="text-gray-600">Player {playerId.slice(-4)}</span>
                      <span>{(points as number).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 text-center">
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
} 