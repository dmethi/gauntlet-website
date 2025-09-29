'use cliient';

import type { GradeTxn } from '../types';
import { X } from 'lucide-react';

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

export function ManagerDetailModal({ manager, isOpen, onClose }: ManagerDetailModalProps) {
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
      className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
      onClick={onClose}
    >
      <div
        className='bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden'
        onClick={e => e.stopPropagation()}
      >
        <div className='sticky top-0 bg-white dark:bg-gray-800 border-b p-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h2 className='text-2xl font-bold'>{manager.teamName}</h2>
            <div className='flex items-center gap-4'>
              <div
                className={`text-lg font-mono font-bold ${manager.netVORP >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                Net Adj. VORP: {manager.netVORP >= 0 ? '+' : ''}
                {manager.netVORP.toFixed(1)}
              </div>
              <div className='text-sm text-gray-500'>
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
          <button
            title='Close'
            onClick={onClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
          {manager.totalTransactions === 0 ? (
            <div className='text-center py-12'>
              <div className='text-2xl font-bold text-gray-400 mb-2'>No Transactions Yet</div>
              <div className='text-gray-500'>
                This manager hasn&apos;t made any moves this season.
              </div>
              <div className='text-sm text-gray-400 mt-2'>
                Net Adj. VORP: 0.0 • Activity Level: Inactive
              </div>
            </div>
          ) : (
            <div className='grid md:grid-cols-3 gap-6'>
              {/* Positive Transactions */}
              <div>
                <h3 className='text-lg font-semibold text-green-700 mb-4 flex items-center gap-2'>
                  <span className='bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium'>
                    +{manager.positiveTransactions}
                  </span>
                  Wins (Positive VORP)
                </h3>
                <div className='space-y-3 max-h-96 overflow-y-auto'>
                  {positiveTransactions.map(txn => (
                    <div
                      key={txn.id}
                      className='border border-green-200 rounded-lg p-3 bg-green-50/50'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <span className='bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium'>
                            {txn.grade}
                          </span>
                          <span className='text-xs text-gray-500 capitalize'>{txn.type}</span>
                        </div>
                        <div className='text-right'>
                          <div className='font-mono font-bold text-green-600'>
                            +{txn.score.toFixed(1)}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-4 text-sm'>
                        <div>
                          <span className='text-green-700'>
                            +
                            {txn.players
                              .filter(p => p.role === 'add')
                              .map(p => p.name)
                              .join(', ')}
                          </span>
                        </div>
                        {txn.players.some(p => p.role === 'drop') && (
                          <>
                            <span className='text-gray-500'>for</span>
                            <div>
                              <span className='text-red-600'>
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
                    <div className='text-center py-8 text-gray-500'>
                      No positive transactions yet
                    </div>
                  )}
                </div>
              </div>

              {/* Negative Transactions */}
              <div>
                <h3 className='text-lg font-semibold text-red-700 mb-4 flex items-center gap-2'>
                  <span className='bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium'>
                    -{manager.negativeTransactions}
                  </span>
                  Losses (Negative VORP)
                </h3>
                <div className='space-y-3 max-h-96 overflow-y-auto'>
                  {negativeTransactions.map(txn => (
                    <div key={txn.id} className='border border-red-200 rounded-lg p-3 bg-red-50/50'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <span className='bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium'>
                            {txn.grade}
                          </span>
                          <span className='text-xs text-gray-500 capitalize'>{txn.type}</span>
                        </div>
                        <div className='text-right'>
                          <div className='font-mono font-bold text-red-600'>
                            {txn.score.toFixed(1)}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-4 text-sm'>
                        <div>
                          <span className='text-green-700'>
                            +
                            {txn.players
                              .filter(p => p.role === 'add')
                              .map(p => p.name)
                              .join(', ')}
                          </span>
                        </div>
                        {txn.players.some(p => p.role === 'drop') && (
                          <>
                            <span className='text-gray-500'>for</span>
                            <div>
                              <span className='text-red-600'>
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
                    <div className='text-center py-8 text-gray-500'>
                      No negative transactions yet
                    </div>
                  )}
                </div>
              </div>

              {/* Neutral Transactions */}
              <div>
                <h3 className='text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2'>
                  <span className='bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium'>
                    ={neutralTransactions.length}
                  </span>
                  Neutral (Zero VORP)
                </h3>
                <div className='space-y-3 max-h-96 overflow-y-auto'>
                  {neutralTransactions.map(txn => (
                    <div
                      key={txn.id}
                      className='border border-gray-200 rounded-lg p-3 bg-gray-50/50'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <span className='bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium'>
                            {txn.grade}
                          </span>
                          <span className='text-xs text-gray-500 capitalize'>{txn.type}</span>
                        </div>
                        <div className='text-right'>
                          <div className='font-mono font-bold text-gray-600'>0.0</div>
                          <div className='text-xs text-gray-500'>
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-4 text-sm'>
                        <div>
                          <span className='text-green-700'>
                            +
                            {txn.players
                              .filter(p => p.role === 'add')
                              .map(p => p.name)
                              .join(', ')}
                          </span>
                        </div>
                        {txn.players.some(p => p.role === 'drop') && (
                          <>
                            <span className='text-gray-500'>for</span>
                            <div>
                              <span className='text-red-600'>
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
                    <div className='text-center py-8 text-gray-500'>
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
}
