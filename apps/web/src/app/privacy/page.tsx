import { Container, PageHeader } from '@gauntlet/ui';
import { Card, CardContent } from '@/components/ui/card';
import { CONTACT_EMAIL } from '@/lib/site';

/**
 * Privacy notice.
 *
 * A plain-language disclosure of what this site collects, not a GDPR/CCPA/etc.
 * compliance instrument — see the "Scope of this notice" section. Values here
 * (controller identity, retention, contact, jurisdiction) were resolved by the
 * repo owner on 2026-07-28; see
 * `.humanlayer/tasks/gauntlet-website-specification-audit/04-structure-outline-public-web-audit.md`
 * § Open Questions — RESOLVED for the rationale and how to reverse each.
 *
 * Content is cross-checked against `prisma/schema.prisma` and the three form
 * handlers under `app/api/year-in-review/` — every persisted field is
 * disclosed below. Indexable: this page is durable content, listed in
 * `CANONICAL_STATIC_PATHS` (`@/lib/site`), so it is in the sitemap and carries
 * the default (non-`noindex`) root `robots` directive.
 */
export const metadata = {
  title: 'Privacy Notice — The Gauntlet',
  description:
    'What The Gauntlet collects through its Year in Review forms and site analytics, why, who processes it, how long it is kept, and how to request a copy or deletion.',
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

const Section = ({ title, children }: SectionProps) => (
  <Card>
    <CardContent className="pt-6 space-y-3">
      <h2 className="text-xl font-semibold text-card-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </CardContent>
  </Card>
);

const PrivacyPage = () => {
  return (
    <Container className="py-8 max-w-3xl">
      <PageHeader
        title="Privacy Notice"
        subtitle="What we collect on this site, why, and how to reach us about it."
      />

      <div className="space-y-6">
        <Section title="Who operates this site">
          <p>
            The Gauntlet is a private fantasy football league. This site is operated by Dhruv Methi
            as an individual — there is no company behind it.
          </p>
        </Section>

        <Section title="What we collect">
          <p>
            The Year in Review page (<code className="text-foreground">/year-in-review</code>) has
            three forms. If you submit one, we store the fields you enter:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="text-foreground font-medium">Returning-team confirmation</span> —
              your name, your email address, and, optionally, the team name you play under.
            </li>
            <li>
              <span className="text-foreground font-medium">League 3 registration</span> — your
              name, your email address, and, optionally, who referred you and any notes you add.
            </li>
            <li>
              <span className="text-foreground font-medium">Proposal submissions</span> — your name,
              your email address, a title, a description, and, optionally, a category.
            </li>
          </ul>
          <p>
            If a proposal is approved, its title, description, category, your name, and its
            submission date are shown publicly on the Year in Review page. Your email address is
            never shown.
          </p>
          <p>
            The Year in Review league-structure view combines returning-team and registration names
            with historical league data to show who has confirmed a spot and who is registered. Only
            names are shown there — never email addresses.
          </p>
          <p>
            Every page on this site sends automatic, anonymous usage and performance data to Vercel
            Analytics and Vercel Speed Insights — page views, general location derived from IP
            address, device and browser type, and load-time metrics. This happens whether or not you
            submit a form.
          </p>
          <p>
            Your light/dark theme preference is stored in your browser (
            <code className="text-foreground">localStorage</code>) and is never sent to us.
          </p>
        </Section>

        <Section title="Why we collect it">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Returning-team and registration details let us plan League 3 and follow up about your
              spot.
            </li>
            <li>
              Proposal details let us review community ideas and, if approved, credit and publish
              them.
            </li>
            <li>
              Analytics and performance data help us understand which pages are used and where the
              site is slow.
            </li>
          </ul>
        </Section>

        <Section title="Who we share it with">
          <ul className="list-disc pl-5 space-y-1">
            <li>Vercel hosts this site and operates Vercel Analytics and Vercel Speed Insights.</li>
            <li>
              Form submissions are stored in a PostgreSQL database run by our database host,
              configured through this application&apos;s{' '}
              <code className="text-foreground">DATABASE_URL</code>.
            </li>
          </ul>
          <p>
            We do not sell your data, and we do not share it with anyone beyond these two
            processors.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            Returning-team confirmations, League 3 registrations, and proposals are kept for as long
            as the league operates. If you ask us to delete your record, we will do so within 30
            days. There is no automatic expiration today — this describes our actual practice, not
            an aspirational policy.
          </p>
        </Section>

        <Section title="Your choices">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              We do not currently offer an in-site way to opt out of Analytics or Speed Insights.
            </li>
            <li>
              None of the three Year in Review forms are required to use the rest of the site — you
              can decline to submit any of them.
            </li>
          </ul>
        </Section>

        <Section title="Requesting a copy or deletion of your data">
          <p>
            Email the address below with the address you used to submit a form, and we will send you
            the data we hold on you or delete it, within 30 days.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-foreground underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>{' '}
            — the same address published at{' '}
            <code className="text-foreground">/.well-known/security.txt</code>.
          </p>
        </Section>

        <Section title="Scope of this notice">
          <p>
            This is a plain-language description of what a small, privately run fantasy football
            site collects and why — not a GDPR, CCPA, or other jurisdiction-specific compliance
            instrument. It is written for the United States, without naming a particular state,
            because The Gauntlet has not adopted a formal legal compliance program.
          </p>
        </Section>
      </div>
    </Container>
  );
};

export default PrivacyPage;
