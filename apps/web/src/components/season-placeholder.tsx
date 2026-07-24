import Link from 'next/link';
import { Container, PageHeader } from '@gauntlet/ui';

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
    <Container className="py-8">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="rounded-md border border-border bg-card p-6 max-w-xl">
        <p className="text-sm text-muted-foreground">{blurb}</p>
        <Link
          href={archiveHref}
          className="inline-block mt-4 text-sm text-gauntlet-crimson hover:underline"
        >
          &larr; {archiveLabel}
        </Link>
      </div>
    </Container>
  );
};
