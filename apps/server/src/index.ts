import express, { Request, Response } from 'express';
import leagueRoutes from './routes/league.js';
import rollupRoutes from './routes/rollups.js';
import calculateWinProbRoutes from './routes/calculate-win-prob.js';

const app = express();
app.use(express.json());
const port = 3001;

app.use('/api/league', leagueRoutes);
app.use('/api/rollups', rollupRoutes);
app.use('/api/calculate-win-prob', calculateWinProbRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the Gauntlet server!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
