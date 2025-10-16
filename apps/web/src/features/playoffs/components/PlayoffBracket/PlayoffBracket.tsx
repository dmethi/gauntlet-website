'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PlayoffBracketProps } from '@/features/playoffs/types';
import { buildBracketTeams, parseBracketStructure } from './utils';
import { OfficialBracketFlow } from './OfficialBracketFlow';
import { FallbackBracket } from './FallbackBracket';
import { BracketLegend } from './BracketLegend';

const hasOfficialData = (playoffBracket?: PlayoffBracketProps['playoffBracket']) =>
  Boolean(playoffBracket?.winners_bracket?.length || playoffBracket?.losers_bracket?.length);

export const PlayoffBracket = memo<PlayoffBracketProps>(({ teams, league, playoffBracket }) => {
  const bracketTeams = buildBracketTeams(teams);
  const official = hasOfficialData(playoffBracket);
  const structure = parseBracketStructure(playoffBracket);

  return (
    <div className="space-y-8">
      <Card
        className={
          official ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
        }
      >
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-sm">
            <Badge
              variant={official ? 'secondary' : 'outline'}
              className={
                official ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''
              }
            >
              {official ? 'Official Bracket Data' : 'Reconstructed Bracket View'}
            </Badge>
            <span
              className={
                official
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-yellow-700 dark:text-yellow-300'
              }
            >
              {official
                ? 'Loaded from Sleeper API – displaying official playoff flow with live scores.'
                : 'No official bracket detected. Rendering estimated structure from seeding and weekly matchups.'}
            </span>
          </div>
        </CardContent>
      </Card>

      <BracketLegend />

      {official ? (
        <OfficialBracketFlow structure={structure} bracketTeams={bracketTeams} league={league} />
      ) : (
        <FallbackBracket bracketTeams={bracketTeams} league={league} />
      )}
    </div>
  );
});

PlayoffBracket.displayName = 'PlayoffBracket';
