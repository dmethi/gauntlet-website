import Link from 'next/link';

/**
 * Minimal footer for shelled routes (everything under `ClientLayout` except
 * `/year-in-review` and `/playground`, which render their own chrome). The
 * privacy link is the only thing it needs to carry — Year in Review is the
 * one route family that actually collects personal data, and it links to the
 * same notice from its own campaign footer instead of relying on this one.
 */
export const SiteFooter = () => {
  return (
    <footer className="border-t border-border mt-12">
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 text-center text-sm text-muted-foreground">
        <Link
          href="/privacy"
          className="underline-offset-4 hover:text-foreground hover:underline transition-colors"
        >
          Privacy Notice
        </Link>
      </div>
    </footer>
  );
};
