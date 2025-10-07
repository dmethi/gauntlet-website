import { describe, expect, it } from 'vitest';
import { TeamFactory } from './team';

describe('TeamFactory', () => {
  describe('generateTeam', () => {
    it('should generate a valid team with defaults', () => {
      const team = TeamFactory.generateTeam();

      expect(team.roster_id).toBe(1);
      expect(team.owner_id).toBe('user_123');
      expect(team.players).toHaveLength(3);
      expect(team.metadata?.team_name).toBe('Test Team');
    });

    it('should allow overriding default values', () => {
      const team = TeamFactory.generateTeam({
        roster_id: 5,
        metadata: { team_name: 'Custom Team' },
      });

      expect(team.roster_id).toBe(5);
      expect(team.metadata?.team_name).toBe('Custom Team');
    });
  });

  describe('generateMultiple', () => {
    it('should generate multiple teams with sequential IDs', () => {
      const teams = TeamFactory.generateMultiple(3);

      expect(teams).toHaveLength(3);
      expect(teams[0].roster_id).toBe(1);
      expect(teams[1].roster_id).toBe(2);
      expect(teams[2].roster_id).toBe(3);
    });
  });
});
