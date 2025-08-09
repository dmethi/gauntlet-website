import express, { Request, Response } from 'express';
import leagueRoutes from './routes/league.js';
import rollupRoutes from './routes/rollups.js';

const app = express();
const port = 3001;

app.use('/api/league', leagueRoutes);
app.use('/api/rollups', rollupRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the Gauntlet server!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
