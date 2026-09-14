import Link from 'next/link';

export const WeeklyPreviewPending = () => {
  return (
    <div className="mx-auto max-w-5xl py-10 sm:px-6 sm:py-16 lg:px-8">
      <section className="grid gap-10 border-y border-border py-12 lg:grid-cols-[1fr_18rem]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
            Board forming
          </p>
          <h2 className="mt-3 font-geizer text-4xl uppercase tracking-wider sm:text-5xl">
            Week 1 waits for the final lineup.
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
            The report generator is ready, but it will not invent a starter or projection. Once
            every Legion has six complete matchups and nine projected starters per team, one seeded
            snapshot will publish here.
          </p>
          <Link
            href="/draft/analysis"
            className="mt-7 inline-flex font-semibold text-primary underline-offset-4 hover:underline"
          >
            Read the completed draft report →
          </Link>
        </div>
        <dl className="space-y-5 border-t border-border pt-5 text-sm lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div>
            <dt className="text-muted-foreground">Markets prepared</dt>
            <dd className="mt-1 font-geizer text-3xl">6</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Legions required</dt>
            <dd className="mt-1 font-geizer text-3xl">3 / 3</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Publication mode</dt>
            <dd className="mt-1 font-medium">Frozen one-off</dd>
          </div>
        </dl>
      </section>
    </div>
  );
};
