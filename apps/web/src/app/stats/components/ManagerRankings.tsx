'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { deltaTextClass } from '@/lib/stat-colors';
import type { GradeTxn, TeamInfo } from '../types';
import { ManagerDetailModal } from './ManagerDetailModal';

export const ManagerRankings = ({
  transactions,
  allTeams,
}: {
  transactions: GradeTxn[];
  allTeams: Map<string, TeamInfo>;
}) => {
  const [selectedManager, setSelectedManager] = useState<string | null>(null);

  const managerStats = useMemo(() => {
    const stats = new Map<
      string,
      {
        teamName: string;
        netVORP: number;
        positiveTransactions: number;
        negativeTransactions: number;
        totalTransactions: number;
        transactions: GradeTxn[];
      }
    >();

    allTeams.forEach(team => {
      stats.set(team.teamName, {
        teamName: team.teamName,
        netVORP: 0,
        positiveTransactions: 0,
        negativeTransactions: 0,
        totalTransactions: 0,
        transactions: [],
      });
    });

    transactions.forEach(txn => {
      if (!txn.teamName) return;

      const existing = stats.get(txn.teamName);
      if (!existing) return;

      existing.netVORP += txn.score;
      existing.totalTransactions += 1;
      existing.transactions.push(txn);

      if (txn.score > 0) {
        existing.positiveTransactions += 1;
      } else if (txn.score < 0) {
        existing.negativeTransactions += 1;
      }
    });

    return Array.from(stats.values()).sort((a, b) => b.netVORP - a.netVORP);
  }, [transactions, allTeams]);

  const selectedManagerData = selectedManager
    ? managerStats.find(m => m.teamName === selectedManager)
    : null;

  if (allTeams.size === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Manager Rankings by Net VORP
          </CardTitle>
          <CardDescription>Loading team data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading manager data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Manager Rankings by Net Cost-Adjusted VORP
          </CardTitle>
          <CardDescription>
            Transaction efficiency ranking based on Cost-Adjusted VORP (FAAB penalties applied) with
            playoff weighting. Click a manager to see their transaction history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Rank</th>
                  <th className="text-left p-2 font-semibold">Manager</th>
                  <th className="text-right p-2 font-semibold">Net Adj. VORP</th>
                  <th className="text-right p-2 font-semibold">Positive</th>
                  <th className="text-right p-2 font-semibold">Negative</th>
                  <th className="text-right p-2 font-semibold">Total</th>
                  <th className="text-right p-2 font-semibold">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {managerStats.map((manager, index) => (
                  <tr
                    key={manager.teamName}
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedManager(manager.teamName)}
                  >
                    <td className="p-2 font-medium">#{index + 1}</td>
                    <td className="p-2 font-medium text-primary hover:underline">
                      {manager.teamName}
                    </td>
                    <td
                      className={`p-2 text-right font-mono font-bold ${deltaTextClass(manager.netVORP)}`}
                    >
                      {manager.netVORP >= 0 ? '+' : ''}
                      {manager.netVORP.toFixed(1)}
                    </td>
                    <td className="p-2 text-right text-success font-medium">
                      {manager.positiveTransactions}
                    </td>
                    <td className="p-2 text-right text-destructive font-medium">
                      {manager.negativeTransactions}
                    </td>
                    <td className="p-2 text-right">{manager.totalTransactions}</td>
                    <td className="p-2 text-right">
                      {manager.totalTransactions > 0
                        ? `${((manager.positiveTransactions / manager.totalTransactions) * 100).toFixed(0)}%`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Manager Detail Modal */}
      {selectedManager && selectedManagerData && (
        <ManagerDetailModal
          manager={selectedManagerData}
          isOpen={!!selectedManager}
          onClose={() => setSelectedManager(null)}
        />
      )}
    </>
  );
};
