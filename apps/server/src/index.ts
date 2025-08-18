import express, { Request, Response } from 'express';
import leagueRoutes from './routes/league.js';
import rollupRoutes from './routes/rollups.js';
import calculateWinProbRoutes from './routes/calculate-win-prob.js';
import matchupRoutes from './routes/matchups.js';
import playersRoutes from './routes/players.js';

const app = express();
app.use(express.json());
const port = 3001;

app.use('/api/league', leagueRoutes);
app.use('/api/rollups', rollupRoutes);
app.use('/api/calculate-win-prob', calculateWinProbRoutes);
app.use('/api/matchups', matchupRoutes);
app.use('/api/players', playersRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the Gauntlet server!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
