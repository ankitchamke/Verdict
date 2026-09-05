import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import {
  ArrowRight,
  Check,
  Copy,
  Flame,
  Lightbulb,
  Share2,
  Sparkles,
  Swords,
  Target,
  TriangleAlert,
  UsersRound,
} from 'lucide-react';
import { ScoreRing, VerdictCard, SiteFooter } from '@/components/VerdictUI';

type SharedVerdictData = {
  id: string;
  idea: string;
  score: number;
  scoreReason: string;
  targetUser: string;
  biggestRisk: string;
  competitors: string[];
  tenXSuggestion: string;
  roastMode: boolean;
  createdAt: string;
};

export default function SharedVerdictPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [data, setData] = useState<SharedVerdictData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!shareId) {
      setError('No share ID provided.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/verdict/share/${shareId}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Verdict not found.');
          }
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to load shared verdict.');
        }
        return res.json();
      })
      .then((json: SharedVerdictData) => {
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err.message || 'Unable to load this shared verdict.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [shareId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const formattedDate = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <main className="verdict-page min-h-[100dvh]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1320px] flex-col px-5 sm:px-8 lg:px-12">
        {/* Navigation Bar */}
        <header className="flex items-center justify-between border-b border-[hsl(var(--foreground)/0.14)] py-6 sm:py-7">
          <Link
            to="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
            data-testid="link-home-brand"
          >
            <span className="font-serif text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              Verdict<span className="text-[hsl(var(--accent-foreground))]">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 rounded-full border border-[hsl(var(--foreground)/0.18)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--foreground))] transition-colors hover:border-[hsl(var(--foreground)/0.35)]"
              onClick={handleCopyLink}
              type="button"
              data-testid="button-copy-shared-link"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Link copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy link
                </>
              )}
            </button>
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
              data-testid="link-analyze-own"
            >
              Try Verdict
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <section className="flex flex-1 flex-col items-center justify-center py-24 sm:py-32">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[hsl(var(--foreground)/0.14)] bg-[hsl(var(--card))]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--accent-foreground))] border-t-transparent" />
            </div>
            <p className="mt-5 font-mono text-[0.78rem] text-[hsl(var(--muted-foreground))]">
              Loading public verdict...
            </p>
          </section>
        )}

        {/* Error / Not Found State */}
        {!loading && (error || !data) && (
          <section className="flex flex-1 flex-col items-center justify-center py-24 text-center sm:py-32" data-testid="shared-not-found">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[hsl(var(--foreground)/0.14)] bg-[hsl(var(--card)/0.6)] text-[hsl(var(--muted-foreground))]">
              <Share2 className="h-7 w-7 opacity-60" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[hsl(var(--foreground))] sm:text-4xl">
              Verdict Not Found
            </h1>
            <p className="mt-3 max-w-[420px] text-[0.92rem] leading-6 text-[hsl(var(--muted-foreground))]">
              {error || 'This shared verdict could not be located. It may have expired or the link is incorrect.'}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="verdict-cta flex items-center gap-2 rounded-[0.75rem] bg-[hsl(var(--primary))] px-6 py-3.5 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--primary-foreground))]"
                data-testid="button-home-from-not-found"
              >
                Analyze your idea on Verdict
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        )}

        {/* Loaded Shared Verdict View */}
        {!loading && data && (
          <section className="verdict-results flex-1 pb-16 pt-12 sm:pb-24 sm:pt-16" id="verdict">
            <div className="mx-auto max-w-[1000px]">
              {/* Header Details */}
              <div className="flex flex-col items-start justify-between gap-6 border-b border-[hsl(var(--foreground)/0.14)] pb-10 sm:flex-row sm:items-end">
                <div className="max-w-[660px]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="verdict-eyebrow flex items-center gap-2 text-[0.62rem] font-semibold uppercase text-[hsl(var(--muted-foreground))]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />
                      Shared Founder Verdict
                    </p>
                    {data.roastMode ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[0.62rem] font-bold tracking-wide text-amber-400">
                        <Flame className="h-3 w-3 fill-amber-400/20" />
                        Roast Mode
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--foreground)/0.16)] bg-[hsl(var(--card))] px-2.5 py-0.5 text-[0.62rem] font-medium text-[hsl(var(--muted-foreground))]">
                        Standard Lens
                      </span>
                    )}
                    {formattedDate && (
                      <span className="font-mono text-[0.62rem] text-[hsl(var(--muted-foreground))]">
                        • {formattedDate}
                      </span>
                    )}
                  </div>
                  <h1 className="mt-5 text-[clamp(2.6rem,5.5vw,5.2rem)] font-semibold leading-[0.92] tracking-[-0.075em] text-[hsl(var(--foreground))]">
                    The <span className="verdict-serif">Verdict.</span>
                  </h1>
                  <div className="mt-7 max-w-[580px] border-l-2 border-[hsl(var(--accent-foreground)/0.5)] pl-4">
                    <p className="verdict-eyebrow text-[0.57rem] font-semibold uppercase text-[hsl(var(--muted-foreground))]">Evaluated Idea</p>
                    <p className="mt-2 text-[0.95rem] font-medium leading-6 text-[hsl(var(--foreground)/0.8)]">
                      &ldquo;{data.idea}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-2 rounded-full border border-[hsl(var(--foreground)/0.18)] px-4 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--foreground))] transition-colors hover:border-[hsl(var(--foreground)/0.35)]"
                    onClick={handleCopyLink}
                    type="button"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Link copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Share this
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Exact Five Verdict Cards */}
              <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2">
                <VerdictCard index="1" label="The read" title="Score /10" icon={Sparkles} testId="card-shared-score">
                  <div className="flex flex-col items-center gap-5 py-2 text-center sm:py-4">
                    <ScoreRing score={data.score} />
                    <p className="max-w-[370px] text-[0.95rem] leading-7 text-[hsl(var(--foreground)/0.78)]">
                      {data.scoreReason}
                    </p>
                  </div>
                </VerdictCard>

                <VerdictCard index="2" label="The person" title="Who's it for" icon={UsersRound} testId="card-shared-target-user">
                  <p className="text-[1.05rem] leading-8 text-[hsl(var(--foreground)/0.82)]">
                    {data.targetUser}
                  </p>
                </VerdictCard>

                <VerdictCard index="3" label="The pressure point" title="Biggest risk" icon={TriangleAlert} testId="card-shared-biggest-risk">
                  <p className="text-[1.05rem] leading-8 text-[hsl(var(--foreground)/0.82)]">
                    {data.biggestRisk}
                  </p>
                </VerdictCard>

                <VerdictCard index="4" label="The alternatives" title="Closest competitors" icon={Swords} testId="card-shared-competitors">
                  <ul className="space-y-3">
                    {data.competitors.map((competitor) => (
                      <li className="flex items-center gap-3 text-[1rem] text-[hsl(var(--foreground)/0.82)]" key={competitor}>
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--accent-foreground))]" aria-hidden="true" />
                        {competitor}
                      </li>
                    ))}
                  </ul>
                </VerdictCard>

                <div className="sm:col-span-2">
                  <VerdictCard index="5" label="The unlock" title="What would make it 10x better" icon={Lightbulb} testId="card-shared-ten-x">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
                      <p className="max-w-[690px] text-[1.08rem] leading-8 text-[hsl(var(--foreground)/0.84)]">
                        {data.tenXSuggestion}
                      </p>
                      <Target className="hidden h-8 w-8 shrink-0 text-[hsl(var(--accent-foreground))] sm:block" strokeWidth={1.3} aria-hidden="true" />
                    </div>
                  </VerdictCard>
                </div>
              </div>

              {/* Bottom Call to Action */}
              <div className="mt-14 flex flex-col items-start justify-between gap-5 border-t border-[hsl(var(--foreground)/0.14)] pt-7 sm:flex-row sm:items-center">
                <p className="text-[0.75rem] text-[hsl(var(--muted-foreground))]">
                  Public shared verdict from <span className="font-semibold text-[hsl(var(--foreground))]">Verdict</span>. No accounts or secrets exposed.
                </p>
                <div className="flex items-center gap-3">
                  <Link
                    to="/"
                    className="verdict-cta flex items-center gap-2 rounded-[0.75rem] bg-[hsl(var(--primary))] px-6 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--primary-foreground))]"
                    data-testid="button-shared-cta-analyze"
                  >
                    Analyze your own startup idea
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <SiteFooter />
      </div>
    </main>
  );
}
