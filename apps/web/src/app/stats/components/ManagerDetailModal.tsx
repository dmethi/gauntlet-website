'use client';

import type { GradeTxn } from '../types';
import { X } from 'lucide-react';
import { deltaTextClass } from '@/lib/stat-colors';

interface ManagerDetailModalProps {
  manager: {
    teamName: string;
    netVORP: number;
    positiveTransactions: number;
    negativeTransactions: number;
    totalTransactions: number;
    transactions: GradeTxn[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export const ManagerDetailModal = ({ manager, isOpen, onClose }: ManagerDetailModalProps) => {
  if (!isOpen) return null;

  const positiveTransactions = manager.transactions
    .filter(t => t.score > 0)
    .sort((a, b) => b.score - a.score);
  const negativeTransactions = manager.transactions
    .filter(t => t.score < 0)
    .sort((a, b) => a.score - b.score);
  const neutralTransactions = manager.transactions
    .filter(t => t.score === 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card text-card-foreground border border-border rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{manager.teamName}</h2>
            <div className="flex items-center gap-4">
              <div className={`text-lg font-mono font-bold ${deltaTextClass(manager.netVORP)}`}>
                Net Adj. VORP: {manager.netVORP >= 0 ? '+' : ''}
                {manager.netVORP.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">
                {manager.positiveTransactions}W - {manager.negativeTransactions}L
                {manager.totalTransactions > 0 && (
                  <span>
                    {' '}
                    ({((manager.positiveTransactions / manager.totalTransactions) * 100).toFixed(0)}
                    %)
                  </span>
                )}
              </div>
            </div>
          </div>
          <button title="Close" onClick={onClose} className="p-2 hover:bg-muted rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {manager.totalTransactions === 0 ? (
            <div className="text-center py-12">
              <div className="text-2xl font-bold text-muted-foreground mb-2">
                No Transactions Yet
              </div>
              <div className="text-muted-foreground">
                This manager hasn&apos;t made any moves this season.
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Net Adj. VORP: 0.0 • Activity Level: Inactive
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Positive Transactions */}
              <div>
                <h3 className="text-lg font-semibold text-success mb-4 flex items-center gap-2">
                  <span className="bg-success/15 text-success px-2 py-1 rounded text-sm font-medium">
                    +{manager.positiveTransactions}
                  </span>
                  Wins (Positive VORP)
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {positiveTransactions.map(txn => (
                    <div
                      key={txn.id}
                      className="border border-success/30 rounded-lg p-3 bg-success/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-success/15 text-success px-2 py-1 rounded text-xs font-medium">
                            {txn.grade}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {txn.type}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-success">
                            +{txn.score.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-success">
                            +
                            {txn.players
                              .filter(p => p.role === 'add')
                              .map(p => p.name)
                              .join(', ')}
                          </span>
                        </div>
                        {txn.players.some(p => p.role === 'drop') && (
                          <>
                            <span className="text-muted-foreground">for</span>
                            <div>
                              <span className="text-destructive">
                                -
                                {txn.players
                                  .filter(p => p.role === 'drop')
                                  .map(p => p.name)
                                  .join(', ')}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {positiveTransactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No positive transactions yet
                    </div>
                  )}
                </div>
              </div>

              {/* Negative Transactions */}
              <div>
                <h3 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
                  <span className="bg-destructive/15 text-destructive px-2 py-1 rounded text-sm font-medium">
                    -{manager.negativeTransactions}
                  </span>
                  Losses (Negative VORP)
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {negativeTransactions.map(txn => (
                    <div
                      key={txn.id}
                      className="border border-destructive/30 rounded-lg p-3 bg-destructive/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-destructive/15 text-destructive px-2 py-1 rounded text-xs font-medium">
                            {txn.grade}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {txn.type}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-destructive">
                            {txn.score.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-success">
                            +
                            {txn.players
                              .filter(p => p.role === 'add')
                              .map(p => p.name)
                              .join(', ')}
                          </span>
                        </div>
                        {txn.players.some(p => p.role === 'drop') && (
                          <>
                            <span className="text-muted-foreground">for</span>
                            <div>
                              <span className="text-destructive">
                                -
                                {txn.players
                                  .filter(p => p.role === 'drop')
                                  .map(p => p.name)
                                  .join(', ')}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {negativeTransactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No negative transactions yet
                    </div>
                  )}
                </div>
              </div>

              {/* Neutral Transactions */}
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                  <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-sm font-medium">
                    ={neutralTransactions.length}
                  </span>
                  Neutral (Zero VORP)
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {neutralTransactions.map(txn => (
                    <div key={txn.id} className="border border-border rounded-lg p-3 bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium">
                            {txn.grade}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {txn.type}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-muted-foreground">0.0</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-success">
                            +
                            {txn.players
                              .filter(p => p.role === 'add')
                              .map(p => p.name)
                              .join(', ')}
                          </span>
                        </div>
                        {txn.players.some(p => p.role === 'drop') && (
                          <>
                            <span className="text-muted-foreground">for</span>
                            <div>
                              <span className="text-destructive">
                                -
                                {txn.players
                                  .filter(p => p.role === 'drop')
                                  .map(p => p.name)
                                  .join(', ')}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {neutralTransactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No neutral transactions yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
