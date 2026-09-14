'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

type Props = {
  title: string;
  /** Watermark image shown large and low-opacity in the top-right corner. */
  crestSrc: string;
  /** Only pass this when it's information the user needs, not filler — see below. */
  subtitle?: string;
  actions?: React.ReactNode;
  /** Optional identity image (e.g. a team/manager avatar) shown beside the title. */
  avatar?: React.ReactNode;
};

/**
 * Page header pattern: crimson accent bar + large low-opacity crest watermark
 * + bottom divider for visual weight. Content defaults to the title only —
 * no eyebrow line, subheading, or status strip unless it directly serves the
 * page (see feedback_ui_content_discipline: don't fill a slot just because
 * it exists). `subtitle` is an explicit opt-in for the rare case where a
 * short status line is itself useful information (e.g. "2026 season —
 * coming soon"), not decorative.
 */
export function PageHeaderHero({ title, crestSrc, subtitle, actions, avatar }: Props) {
  return (
    <header className='relative overflow-hidden border-b border-border'>
      <Image
        src={crestSrc}
        alt=''
        width={280}
        height={280}
        className='pointer-events-none select-none absolute -right-10 -top-16 opacity-[0.04] dark:opacity-[0.06] grayscale'
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.215, 0.61, 0.355, 1] }}
        className='relative mx-auto flex max-w-7xl flex-col items-stretch gap-4 px-0 pb-5 pt-4 md:flex-row md:items-end md:justify-between md:px-6 md:pb-6 md:pt-8'
      >
        <div className='flex min-w-0 items-center gap-4'>
          {avatar}
          <div className='min-w-0'>
            <span className='block w-10 h-1 bg-primary rounded-full mb-3' />
            <h1 className='break-words font-geizer text-4xl uppercase leading-none tracking-widest sm:text-6xl'>
              {title}
            </h1>
            {subtitle && <p className='mt-2 text-sm text-muted-foreground'>{subtitle}</p>}
          </div>
        </div>
        {actions && (
          <div className='flex w-full flex-wrap items-center gap-2 md:w-auto md:shrink-0'>
            {actions}
          </div>
        )}
      </motion.div>
    </header>
  );
}
