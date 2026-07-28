'use client';

import * as React from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  show: boolean;
  logo: React.ReactNode;
  /** Icons orbiting the logo, individually counter-rotated to stay upright. */
  orbitIconSrcs?: string[];
};

/** Aurora glow-pulse behind the logo, combined with orbiting legion crests. */
export function WarRoomLoader({ show, logo, orbitIconSrcs = [] }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'
        >
          <div className='relative w-40 h-40'>
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className='absolute inset-0 rounded-full blur-2xl'
              style={{ background: 'hsl(var(--primary) / 0.35)' }}
            />
            <div className='absolute inset-0 flex items-center justify-center'>{logo}</div>
            {orbitIconSrcs.length > 0 && (
              <motion.div
                className='absolute inset-0'
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              >
                {orbitIconSrcs.map((src, i) => {
                  const angle = (i / orbitIconSrcs.length) * 2 * Math.PI - Math.PI / 2;
                  const r = 76;
                  return (
                    <motion.div
                      key={src}
                      className='absolute'
                      style={{
                        left: `calc(50% + ${Math.cos(angle) * r}px - 11px)`,
                        top: `calc(50% + ${Math.sin(angle) * r}px - 11px)`,
                      }}
                      animate={{ rotate: -360 }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    >
                      <Image src={src} alt='' width={22} height={22} className='opacity-80' />
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
