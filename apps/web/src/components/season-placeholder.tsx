import Link from 'next/link';
import { PageHeaderHero } from '@gauntlet/ui';

interface SeasonPlaceholderProps {
  title: string;
  subtitle: string;
  blurb: string;
  archiveHref: string;
  archiveLabel: string;
}

export const SeasonPlaceholder = ({
  title,
  subtitle,
  blurb,
  archiveHref,
  archiveLabel,
}: SeasonPlaceholderProps) => {
  return (
    <div className="max-w-7xl mx-auto">
      <PageHeaderHero title={title} subtitle={subtitle} crestSrc="/gauntlet_logo.svg" />
      <div className="py-8">
        <div className="rounded-md border border-border bg-card p-6 max-w-xl">
          <p className="text-sm text-muted-foreground">{blurb}</p>
          <Link
            href={archiveHref}
            className="inline-block mt-4 text-sm text-primary hover:underline"
          >
            &larr; {archiveLabel}
          </Link>
        </div>
      </div>
    </div>
  );
};
