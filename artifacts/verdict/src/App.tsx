import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Flame,
  Github,
  History,
  Lightbulb,
  Linkedin,
  Loader2,
  type LucideIcon,
  MoveDown,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  Trash2,
  TriangleAlert,
  UsersRound,
  X,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { mockVerdict, type MockVerdict } from '@/lib/mock-analysis';
import {
  addHistoryEntry,
  clearUserHistory,
  deleteHistoryEntry,
  loadUserHistory,
  type HistoryEntry,
} from '@/lib/history';
import NotFound from '@/pages/not-found';
import SharedVerdictPage from '@/pages/SharedVerdictPage';
import { ScoreRing, VerdictCard, SiteFooter, VerdictLogo } from '@/components/VerdictUI';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
  useClerk,
  useUser,
} from '@clerk/clerk-react';

const queryClient = new QueryClient();

type FlowPhase = 'input' | 'loading' | 'results' | 'history';

const standardLoadingLines = [
  'Interrogating your idea...',
  'Looking for the weak spots...',
  'Checking who actually needs this...',
  'Finding the competition...',
];

const roastLoadingLines = [
  'Measuring founder delusion levels...',
  'Finding out why nobody will pay for this...',
  'Preparing the surgical roast...',
  'Gathering the brutal truths...',
];

function SiteNav({
  onReset,
  onOpenHistory,
  showReset,
  activeView,
}: {
  onReset?: () => void;
  onOpenHistory?: () => void;
  showReset?: boolean;
  activeView?: FlowPhase;
}) {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  const handleHistoryClick = () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    onOpenHistory?.();
  };

  return (
    <nav
      className="verdict-nav flex items-center justify-between border-b border-[hsl(var(--foreground)/0.14)] py-5 sm:py-6"
      aria-label="Main navigation"
    >
      <a
        className="verdict-wordmark flex items-center gap-2.5 text-[1.55rem] font-bold leading-none text-[hsl(var(--foreground))] sm:text-[1.7rem]"
        href="/"
        data-testid="link-home"
      >
        <VerdictLogo className="h-6 w-6 shrink-0 rounded-[6px] sm:h-7 sm:w-7" />
        <span>verdict<span className="text-[hsl(var(--accent))]">.</span></span>
      </a>

      <div className="flex items-center gap-4 sm:gap-8">
        <a
          className="verdict-nav-link hidden text-[0.7rem] font-semibold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] sm:inline-block"
          href={activeView === 'results' ? '#verdict' : '#lens'}
          data-testid="link-how-it-works"
        >
          {activeView === 'results' ? 'Your verdict' : 'Our lens'}
        </a>

        <button
          className={`verdict-nav-link text-[0.7rem] font-semibold uppercase tracking-[0.13em] transition-colors ${
            activeView === 'history'
              ? 'font-bold text-[hsl(var(--foreground))] underline decoration-[hsl(var(--accent))] underline-offset-4'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          }`}
          onClick={handleHistoryClick}
          type="button"
          data-testid="button-nav-history"
        >
          History
        </button>

        {showReset && (
          <button
            className="verdict-nav-link text-[0.7rem] font-semibold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
            onClick={onReset}
            type="button"
            data-testid="button-nav-new-idea"
          >
            New idea
          </button>
        )}
        <SignedOut>
          <SignInButton mode="modal">
            <button
              className="verdict-signin text-[0.7rem] font-semibold uppercase tracking-[0.13em] text-[hsl(var(--foreground))] underline decoration-[hsl(var(--foreground)/0.25)] underline-offset-4 transition-colors hover:decoration-[hsl(var(--accent))]"
              type="button"
              data-testid="button-sign-in"
            >
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8 ring-1 ring-[hsl(var(--foreground)/0.2)]',
                },
              }}
            />
          </div>
        </SignedIn>
      </div>
    </nav>
  );
}

function SignInNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="fixed bottom-5 left-1/2 z-20 flex w-[calc(100%-2rem)] max-w-[430px] -translate-x-1/2 items-center justify-between gap-3 rounded-full border border-[hsl(var(--foreground)/0.16)] bg-[hsl(var(--foreground))] px-4 py-3 text-[0.72rem] text-[hsl(var(--primary-foreground))] shadow-xl"
      role="status"
      data-testid="status-sign-in"
    >
      <span>Sign in arrives with the full Verdict experience.</span>
      <button
        className="shrink-0 font-semibold text-[hsl(var(--accent))] underline underline-offset-2"
        onClick={onDismiss}
        type="button"
        data-testid="button-dismiss-sign-in"
      >
        Dismiss
      </button>
    </div>
  );
}

function InputExperience({
  idea,
  setIdea,
  onSubmit,
  validationMessage,
  textareaRef,
  roastMode,
  setRoastMode,
}: {
  idea: string;
  setIdea: (value: string) => void;
  onSubmit: () => void;
  validationMessage: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  roastMode: boolean;
  setRoastMode: (value: boolean) => void;
}) {
  return (
    <>
      <section className="verdict-hero flex flex-1 flex-col items-center pb-14 pt-20 text-center sm:pb-20 sm:pt-28 lg:pt-32">
        <div className="verdict-kicker mb-7 flex items-center gap-3 text-[0.62rem] font-semibold uppercase text-[hsl(var(--muted-foreground))] sm:mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />
          The founder&apos;s second opinion
        </div>

        <h1
          className="verdict-headline max-w-[900px] text-[clamp(3.25rem,8vw,7.6rem)] font-semibold leading-[0.9] text-[hsl(var(--foreground))]"
          data-testid="text-hero-headline"
        >
          Know if your idea is{' '}
          <span className="verdict-serif relative inline-block">
            worth building
            <span
              className="absolute -bottom-1 left-[4%] h-[0.12em] w-[92%] -rotate-2 rounded-full bg-[hsl(var(--accent))] sm:-bottom-2"
              aria-hidden="true"
            />
          </span>
          .
        </h1>

        <p
          className="mt-7 max-w-[570px] text-[0.97rem] leading-7 text-[hsl(var(--muted-foreground))] sm:mt-9 sm:text-[1.05rem] sm:leading-8"
          data-testid="text-hero-support"
        >
          Paste your idea. Get a brutally honest breakdown before you waste 3 months building it.
        </p>

        <div className="mt-11 w-full max-w-[720px] text-left sm:mt-14">
          <div
            className={`verdict-input-wrap relative overflow-hidden rounded-[1.1rem] border bg-[hsl(var(--card))] transition-all duration-200 ${
              validationMessage
                ? 'border-[hsl(var(--accent-foreground)/0.75)] shadow-[0_0_0_4px_hsl(var(--accent)/0.35)]'
                : roastMode
                ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                : 'border-[hsl(var(--foreground)/0.26)] hover:border-[hsl(var(--foreground)/0.4)]'
            }`}
          >
            <div className="flex items-center justify-between border-b border-[hsl(var(--foreground)/0.1)] px-5 py-3.5 sm:px-6">
              <label
                className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))]"
                htmlFor="idea-input"
              >
                Your idea
              </label>
              <span className="font-mono text-[0.62rem] text-[hsl(var(--muted-foreground)/0.72)]">01 / 01</span>
            </div>
            <textarea
              ref={textareaRef}
              className="verdict-textarea block min-h-[178px] w-full border-0 bg-transparent px-5 py-5 text-[1.15rem] leading-8 text-[hsl(var(--foreground))] outline-none transition-colors sm:min-h-[204px] sm:px-6 sm:py-6 sm:text-[1.28rem]"
              id="idea-input"
              maxLength={500}
              onChange={(event) => setIdea(event.target.value)}
              placeholder="Describe your idea in a sentence or two..."
              value={idea}
              aria-invalid={Boolean(validationMessage)}
              aria-describedby={validationMessage ? 'idea-validation' : undefined}
              data-testid="input-idea"
            />
            <div className="flex items-center justify-between border-t border-[hsl(var(--foreground)/0.1)] px-5 py-3 sm:px-6">
              <span className="text-[0.68rem] text-[hsl(var(--muted-foreground))]">Clear thinking starts here.</span>
              <span className="font-mono text-[0.62rem] text-[hsl(var(--muted-foreground)/0.72)]">
                {idea.length.toString().padStart(3, '0')} / 500
              </span>
            </div>
          </div>

          {/* Roast Mode Toggle Control */}
          <div className="mt-3.5 flex flex-col items-start justify-between gap-2.5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setRoastMode(!roastMode)}
              className={`group flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 text-[0.72rem] font-semibold tracking-wide transition-all active:scale-95 ${
                roastMode
                  ? 'border-amber-500/60 bg-amber-500/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'border-[hsl(var(--foreground)/0.18)] bg-[hsl(var(--card)/0.4)] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--foreground)/0.35)] hover:text-[hsl(var(--foreground))]'
              }`}
              data-testid="toggle-roast-mode"
            >
              <Flame className={`h-3.5 w-3.5 transition-transform group-hover:scale-110 ${roastMode ? 'text-amber-400 fill-amber-400/20' : 'text-[hsl(var(--muted-foreground))]'}`} />
              <span>Roast Mode</span>
              <span className={`rounded-full px-1.5 py-0.2 font-mono text-[0.58rem] uppercase ${roastMode ? 'bg-amber-500/25 text-amber-200' : 'bg-[hsl(var(--foreground)/0.08)] text-[hsl(var(--muted-foreground))]'}`}>
                {roastMode ? 'ON' : 'OFF'}
              </span>
            </button>

            <span className="text-[0.66rem] text-[hsl(var(--muted-foreground))]">
              {roastMode ? '🔥 Surgical wit & savage truth on the idea' : '⚡ Professional & brutally honest evaluation'}
            </span>
          </div>

          {validationMessage && (
            <p
              className="verdict-status mt-3 flex items-center gap-2 text-[0.74rem] font-medium text-[hsl(var(--accent-foreground))]"
              id="idea-validation"
              role="alert"
              data-testid="status-validation"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent-foreground))]" aria-hidden="true" />
              {validationMessage}
            </p>
          )}

          <button
            className={`verdict-cta mt-4 flex w-full items-center justify-center gap-2 rounded-[0.75rem] px-5 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.12em] transition-all active:scale-[0.98] sm:w-auto sm:min-w-[214px] ${
              roastMode
                ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)]'
                : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
            }`}
            onClick={onSubmit}
            type="button"
            data-testid="button-get-verdict"
          >
            {roastMode ? (
              <>
                Roast my idea
                <Flame className="h-4 w-4 fill-black/20" strokeWidth={2.1} aria-hidden="true" />
              </>
            ) : (
              <>
                Get my verdict
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
              </>
            )}
          </button>
        </div>

        <a
          className="mt-16 flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] sm:mt-20"
          href="#lens"
          data-testid="link-scroll-lens"
        >
          What we look for
          <MoveDown className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
        </a>
      </section>

      <section
        className="verdict-support border-t border-[hsl(var(--foreground)/0.14)] pb-7 pt-6 sm:pb-8 sm:pt-7"
        id="lens"
        aria-label="Verdict principles"
      >
        <div className="grid gap-6 sm:grid-cols-[1.1fr_2fr] sm:items-center sm:gap-10">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--foreground))]"
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <p className="max-w-[255px] text-[0.77rem] leading-5 text-[hsl(var(--muted-foreground))]">
              Less cheerleading. More signal. A sharper starting point for what comes next.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 border-t border-[hsl(var(--foreground)/0.12)] pt-5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            {[
              ['01', 'The problem', 'Is it painful enough?'],
              ['02', 'The edge', 'Why you, why now?'],
              ['03', 'The path', 'Can it become a business?'],
            ].map(([number, title, copy]) => (
              <div key={number} data-testid={`text-lens-${number}`}>
                <p className="font-mono text-[0.62rem] text-[hsl(var(--accent-foreground))]">{number}</p>
                <p className="mt-2 text-[0.7rem] font-semibold text-[hsl(var(--foreground))] sm:text-[0.75rem]">{title}</p>
                <p className="mt-1 hidden text-[0.68rem] leading-4 text-[hsl(var(--muted-foreground))] sm:block">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function LoadingExperience({ roastMode }: { roastMode?: boolean }) {
  const lines = roastMode ? roastLoadingLines : standardLoadingLines;
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLineIndex((current) => (current + 1) % lines.length);
    }, 650);
    return () => window.clearInterval(interval);
  }, [lines.length]);

  return (
    <section className="verdict-loading flex flex-1 flex-col items-center justify-center py-24 text-center sm:py-36">
      <div className="relative flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
        <div className="absolute inset-0 rounded-full border border-[hsl(var(--foreground)/0.12)]" />
        <div className={`loading-orbit absolute inset-2 rounded-full border border-dashed ${roastMode ? 'border-amber-500/40' : 'border-[hsl(var(--foreground)/0.3)]'}`} />
        <div className={`loading-orbit absolute inset-6 rounded-full border ${roastMode ? 'border-amber-500/50' : 'border-[hsl(var(--accent-foreground)/0.3)]'}`} style={{ animationDirection: 'reverse', animationDuration: '3.8s' }} />
        <span className={`loading-orbit-dot absolute right-1 top-5 h-2.5 w-2.5 rounded-full ${roastMode ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]' : 'bg-[hsl(var(--accent))]'}`} />
        {roastMode ? (
          <Flame className="h-7 w-7 text-amber-400 fill-amber-400/20" strokeWidth={1.6} aria-hidden="true" />
        ) : (
          <Sparkles className="h-7 w-7 text-[hsl(var(--foreground))]" strokeWidth={1.4} aria-hidden="true" />
        )}
      </div>
      <p className="verdict-eyebrow mt-12 text-[0.62rem] font-semibold uppercase text-[hsl(var(--muted-foreground))]">
        {roastMode ? '🔥 Roast in progress' : 'Verdict in progress'}
      </p>
      <p key={lineIndex} className="loading-copy mt-4 min-h-[2rem] text-[clamp(1.5rem,4vw,2.45rem)] font-medium tracking-[-0.04em] text-[hsl(var(--foreground))]" data-testid="status-analysis">
        {lines[lineIndex]}
      </p>
      <div className="mt-10 h-1 w-full max-w-[290px] overflow-hidden rounded-full bg-[hsl(var(--foreground)/0.1)]" aria-label="Analysis progress">
        <div className={`loading-progress h-full w-2/5 rounded-full ${roastMode ? 'bg-amber-500' : 'bg-[hsl(var(--accent-foreground))]'}`} />
      </div>
      <p className="mt-4 text-[0.7rem] text-[hsl(var(--muted-foreground))]">
        {roastMode ? 'Surgical wit requires a moment of deep scrutiny.' : 'A little scrutiny takes a minute.'}
      </p>
    </section>
  );
}

function ResultsExperience({
  idea,
  verdict,
  onReset,
  onOpenHistory,
  isRoastMode,
  sharedId,
  setSharedId,
}: {
  idea: string;
  verdict: MockVerdict;
  onReset: () => void;
  onOpenHistory?: () => void;
  isRoastMode?: boolean;
  sharedId?: string | null;
  setSharedId?: (id: string | null) => void;
}) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { getToken } = useAuth();

  const handleShareClick = async () => {
    if (sharedId) {
      setShareModalOpen(true);
      return;
    }

    try {
      setIsSharing(true);
      setShareError(null);
      const token = await getToken();
      const res = await fetch('/api/verdict/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          idea: idea.trim(),
          verdict,
          roastMode: Boolean(isRoastMode),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to create shareable link.');
      }

      const json = await res.json();
      if (setSharedId) {
        setSharedId(json.shareId);
      }
      setShareModalOpen(true);
    } catch (err: any) {
      setShareError(err.message || 'Could not generate share link.');
    } finally {
      setIsSharing(false);
    }
  };

  const shareUrl = sharedId ? `${window.location.origin}/share/${sharedId}` : '';

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <section className="verdict-results flex-1 pb-16 pt-16 sm:pb-24 sm:pt-24" id="verdict">
      <div className="mx-auto max-w-[1000px]">
        <div className="flex flex-col items-start justify-between gap-7 border-b border-[hsl(var(--foreground)/0.14)] pb-10 sm:flex-row sm:items-end sm:gap-10">
          <div className="max-w-[640px]">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="verdict-eyebrow flex items-center gap-2 text-[0.62rem] font-semibold uppercase text-[hsl(var(--muted-foreground))]">
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />
                Your founder&apos;s second opinion
              </p>
              {isRoastMode ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[0.62rem] font-bold tracking-wide text-amber-400">
                  <Flame className="h-3 w-3 fill-amber-400/20" />
                  Roast Mode
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--foreground)/0.16)] bg-[hsl(var(--card))] px-2.5 py-0.5 text-[0.62rem] font-medium text-[hsl(var(--muted-foreground))]">
                  Standard Lens
                </span>
              )}
            </div>
            <h1 className="mt-5 text-[clamp(2.8rem,6vw,5.8rem)] font-semibold leading-[0.92] tracking-[-0.075em] text-[hsl(var(--foreground))]" data-testid="text-results-heading">
              Your <span className="verdict-serif">Verdict.</span>
            </h1>
            <div className="mt-7 max-w-[560px] border-l-2 border-[hsl(var(--accent-foreground)/0.5)] pl-4" data-testid="text-original-idea">
              <p className="verdict-eyebrow text-[0.57rem] font-semibold uppercase text-[hsl(var(--muted-foreground))]">Your idea</p>
              <p className="mt-2 line-clamp-3 text-[0.9rem] leading-6 text-[hsl(var(--foreground)/0.72)]">&ldquo;{idea.trim()}&rdquo;</p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 rounded-full border border-[hsl(var(--foreground)/0.18)] px-4 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--foreground))] transition-all hover:border-[hsl(var(--foreground)/0.35)] hover:bg-[hsl(var(--foreground)/0.04)] disabled:opacity-60"
            onClick={handleShareClick}
            disabled={isSharing}
            type="button"
            data-testid="button-share-verdict"
          >
            {isSharing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[hsl(var(--accent-foreground))]" />
                Generating...
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                Share verdict
              </>
            )}
          </button>
        </div>

        {/* Share Error Notice */}
        {shareError && (
          <div className="mt-4 flex items-center justify-between rounded-[0.75rem] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[0.78rem] text-rose-300">
            <span>{shareError}</span>
            <button
              className="ml-3 text-xs underline underline-offset-2 hover:text-white"
              onClick={() => setShareError(null)}
              type="button"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2">
          <VerdictCard index="1" label="The read" title="Score /10" icon={Sparkles} testId="card-score">
            <div className="flex flex-col items-center gap-5 py-2 text-center sm:py-4">
              <ScoreRing score={verdict.score} />
              <p className="max-w-[370px] text-[0.95rem] leading-7 text-[hsl(var(--foreground)/0.78)]">{verdict.scoreReason}</p>
            </div>
          </VerdictCard>

          <VerdictCard index="2" label="The person" title="Who&apos;s it for" icon={UsersRound} testId="card-target-user">
            <p className="text-[1.05rem] leading-8 text-[hsl(var(--foreground)/0.82)]">{verdict.targetUser}</p>
          </VerdictCard>

          <VerdictCard index="3" label="The pressure point" title="Biggest risk" icon={TriangleAlert} testId="card-biggest-risk">
            <p className="text-[1.05rem] leading-8 text-[hsl(var(--foreground)/0.82)]">{verdict.biggestRisk}</p>
          </VerdictCard>

          <VerdictCard index="4" label="The alternatives" title="Closest competitors" icon={Swords} testId="card-competitors">
            <ul className="space-y-3">
              {verdict.competitors.map((competitor) => (
                <li className="flex items-center gap-3 text-[1rem] text-[hsl(var(--foreground)/0.82)]" key={competitor}>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--accent-foreground))]" aria-hidden="true" />
                  {competitor}
                </li>
              ))}
            </ul>
          </VerdictCard>

          <div className="sm:col-span-2">
            <VerdictCard index="5" label="The unlock" title="What would make it 10x better" icon={Lightbulb} testId="card-ten-x">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
                <p className="max-w-[690px] text-[1.08rem] leading-8 text-[hsl(var(--foreground)/0.84)]">{verdict.tenXSuggestion}</p>
                <Target className="hidden h-8 w-8 shrink-0 text-[hsl(var(--accent-foreground))] sm:block" strokeWidth={1.3} aria-hidden="true" />
              </div>
            </VerdictCard>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-5 border-t border-[hsl(var(--foreground)/0.14)] pt-7 sm:flex-row sm:items-center">
          <p className="flex items-center gap-2 text-[0.72rem] text-[hsl(var(--muted-foreground))]">
            <Check className="h-4 w-4 text-[hsl(var(--accent-foreground))]" strokeWidth={2} aria-hidden="true" />
            Keep the useful part. Question the rest.
          </p>
          <div className="flex items-center gap-3">
            {onOpenHistory && (
              <button
                className="flex items-center gap-2 rounded-[0.75rem] border border-[hsl(var(--foreground)/0.18)] px-4 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--foreground))] transition-colors hover:border-[hsl(var(--foreground)/0.35)]"
                onClick={onOpenHistory}
                type="button"
                data-testid="button-results-history"
              >
                <History className="h-3.5 w-3.5" />
                History
              </button>
            )}
            <button
              className="verdict-cta flex items-center gap-2 rounded-[0.75rem] bg-[hsl(var(--primary))] px-5 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--primary-foreground))]"
              onClick={onReset}
              type="button"
              data-testid="button-analyze-another"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              Analyze another idea
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {shareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in-0 duration-200"
          role="dialog"
          aria-modal="true"
          data-testid="modal-share-verdict"
        >
          <div className="relative w-full max-w-[480px] rounded-[1.25rem] border border-[hsl(var(--foreground)/0.18)] bg-[hsl(var(--card))] p-6 shadow-2xl sm:p-7">
            <button
              className="absolute right-4 top-4 rounded-full p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--foreground)/0.08)] hover:text-[hsl(var(--foreground))]"
              onClick={() => setShareModalOpen(false)}
              type="button"
              aria-label="Close modal"
              data-testid="button-close-share-modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
              <Share2 className="h-3.5 w-3.5 text-[hsl(var(--accent-foreground))]" />
              Public Share Link
            </div>

            <h3 className="mt-2.5 text-xl font-semibold tracking-[-0.03em] text-[hsl(var(--foreground))] sm:text-2xl">
              Share your Verdict
            </h3>
            <p className="mt-1.5 text-[0.82rem] leading-5 text-[hsl(var(--muted-foreground))]">
              Anyone with this link can view your verdict without signing in. No private account details are included.
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-[0.75rem] border border-[hsl(var(--foreground)/0.15)] bg-[hsl(var(--card)/0.8)] p-2">
              <input
                className="flex-1 bg-transparent px-2 font-mono text-[0.75rem] text-[hsl(var(--foreground))] outline-none"
                readOnly
                value={shareUrl}
                data-testid="input-share-url"
              />
              <button
                className="flex shrink-0 items-center gap-1.5 rounded-[0.55rem] bg-[hsl(var(--primary))] px-3.5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
                onClick={handleCopyLink}
                type="button"
                data-testid="button-modal-copy-link"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[hsl(var(--foreground)/0.1)] pt-4 text-[0.72rem]">
              <a
                className="flex items-center gap-1 text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                data-testid="link-modal-open-share"
              >
                Open in new tab
                <ExternalLink className="h-3 w-3" />
              </a>
              <button
                className="font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
                onClick={() => setShareModalOpen(false)}
                type="button"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function HistoryExperience({
  history,
  onSelectEntry,
  onDeleteEntry,
  onClearHistory,
  onNewIdea,
}: {
  history: HistoryEntry[];
  onSelectEntry: (entry: HistoryEntry) => void;
  onDeleteEntry: (id: string, e: React.MouseEvent) => void;
  onClearHistory: () => void;
  onNewIdea: () => void;
}) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <section className="verdict-history flex-1 pb-16 pt-12 sm:pb-24 sm:pt-16" data-testid="section-history">
      <div className="mx-auto max-w-[1050px]">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-[hsl(var(--foreground)/0.14)] pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="verdict-eyebrow flex items-center gap-2.5 text-[0.62rem] font-semibold uppercase text-[hsl(var(--muted-foreground))]">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />
              Your Founder Ledger
            </p>
            <h1 className="mt-4 text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.06em] text-[hsl(var(--foreground))]">
              Idea <span className="verdict-serif">History.</span>
            </h1>
            <p className="mt-3 text-[0.88rem] text-[hsl(var(--muted-foreground))]">
              Review, compare, and trace your previous verdicts.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[0.68rem] text-[hsl(var(--muted-foreground))]">
              {history.length} {history.length === 1 ? 'verdict' : 'verdicts'} saved
            </span>
            {history.length > 0 && (
              <>
                {confirmClear ? (
                  <div className="flex items-center gap-2.5 rounded-full border border-[hsl(var(--accent-foreground)/0.4)] bg-[hsl(var(--card))] px-3.5 py-1.5 text-[0.68rem]">
                    <span className="font-medium text-[hsl(var(--accent-foreground))]">Delete all?</span>
                    <button
                      className="font-bold text-[hsl(var(--accent-foreground))] underline underline-offset-2"
                      onClick={() => {
                        onClearHistory();
                        setConfirmClear(false);
                      }}
                      type="button"
                      data-testid="button-confirm-clear-history"
                    >
                      Yes, clear
                    </button>
                    <button
                      className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      onClick={() => setConfirmClear(false)}
                      type="button"
                      data-testid="button-cancel-clear-history"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--foreground)/0.15)] px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--accent-foreground)/0.5)] hover:text-[hsl(var(--accent-foreground))]"
                    onClick={() => setConfirmClear(true)}
                    type="button"
                    data-testid="button-clear-history"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear history
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center sm:py-28" data-testid="empty-history">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[hsl(var(--foreground)/0.14)] bg-[hsl(var(--card)/0.5)] text-[hsl(var(--muted-foreground))]">
              <History className="h-7 w-7 stroke-[1.5]" aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-[1.45rem] font-semibold tracking-[-0.03em] text-[hsl(var(--foreground))] sm:text-[1.75rem]">
              No verdicts in your ledger yet.
            </h2>
            <p className="mt-3 max-w-[420px] text-[0.88rem] leading-6 text-[hsl(var(--muted-foreground))]">
              Every idea you interrogate will be cataloged here so you can trace your instincts, pivots, and blind spots over time.
            </p>
            <button
              className="verdict-cta mt-8 flex items-center gap-2 rounded-[0.75rem] bg-[hsl(var(--primary))] px-6 py-3.5 text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--primary-foreground))]"
              onClick={onNewIdea}
              type="button"
              data-testid="button-empty-new-idea"
            >
              Analyze your first idea
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="list-history">
            {history.map((item) => {
              const dateObj = new Date(item.createdAt);
              const formattedDate = dateObj.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const formattedTime = dateObj.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              });
              const scoreBadgeClass =
                item.score >= 7.0
                  ? 'border-[hsl(var(--accent)/0.6)] bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent-foreground))]'
                  : item.score >= 4.0
                  ? 'border-[hsl(var(--foreground)/0.25)] bg-[hsl(var(--foreground)/0.06)] text-[hsl(var(--foreground))]'
                  : 'border-[hsl(var(--muted-foreground)/0.3)] bg-[hsl(var(--muted-foreground)/0.08)] text-[hsl(var(--muted-foreground))]';

              return (
                <article
                  key={item.id}
                  onClick={() => onSelectEntry(item)}
                  className="group relative flex cursor-pointer flex-col justify-between rounded-[1.05rem] border border-[hsl(var(--foreground)/0.14)] bg-[hsl(var(--card)/0.6)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--foreground)/0.35)] hover:shadow-lg sm:p-6"
                  data-testid={`card-history-${item.id}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 border-b border-[hsl(var(--foreground)/0.1)] pb-3">
                      <span className="font-mono text-[0.62rem] text-[hsl(var(--muted-foreground))]">
                        {formattedDate} • {formattedTime}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {item.roastMode && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[0.6rem] font-bold text-amber-400" title="Generated in Roast Mode">
                            <Flame className="h-2.5 w-2.5 fill-amber-400/20" />
                            Roast
                          </span>
                        )}
                        <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem] font-semibold ${scoreBadgeClass}`}>
                          {item.score.toFixed(1)} / 10
                        </span>
                        <button
                          className="rounded-full p-1 text-[hsl(var(--muted-foreground)/0.5)] transition-colors hover:text-[hsl(var(--accent-foreground))]"
                          onClick={(e) => onDeleteEntry(item.id, e)}
                          title="Delete verdict"
                          type="button"
                          data-testid={`button-delete-history-${item.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-3 text-[0.98rem] font-medium leading-6 text-[hsl(var(--foreground))]">
                      &ldquo;{item.idea}&rdquo;
                    </p>

                    <p className="mt-3 line-clamp-2 text-[0.78rem] leading-5 text-[hsl(var(--muted-foreground))]">
                      {item.verdict.scoreReason}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[hsl(var(--foreground)/0.08)] pt-3.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))] transition-colors group-hover:text-[hsl(var(--foreground))]">
                    <span>View verdict</span>
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function Home() {
  const [idea, setIdea] = useState('');
  const [phase, setPhase] = useState<FlowPhase>('input');
  const [verdict, setVerdict] = useState<MockVerdict>(mockVerdict);
  const [validationMessage, setValidationMessage] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [roastMode, setRoastMode] = useState(false);
  const [isVerdictRoast, setIsVerdictRoast] = useState(false);
  const [sharedId, setSharedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isSignedIn, getToken } = useAuth();
  const { openSignIn } = useClerk();
  const { user } = useUser();

  // Load user history whenever user changes
  useEffect(() => {
    if (user?.id) {
      setHistory(loadUserHistory(user.id));
    } else {
      setHistory([]);
    }
  }, [user?.id]);

  const handleSubmit = async () => {
    const trimmed = idea.trim();
    if (!trimmed) {
      setValidationMessage('Give us a real idea to interrogate first.');
      textareaRef.current?.focus();
      return;
    }
    if (trimmed.length < 10) {
      setValidationMessage('Give us at least 10 characters so we have enough context to interrogate your idea.');
      textareaRef.current?.focus();
      return;
    }
    if (trimmed.length > 500) {
      setValidationMessage('Ideas must be within 500 characters.');
      textareaRef.current?.focus();
      return;
    }

    if (!isSignedIn) {
      setValidationMessage(
        roastMode
          ? 'Please sign in to roast your idea with surgical precision.'
          : 'Please sign in to get your founder verdict.',
      );
      openSignIn();
      return;
    }

    setValidationMessage('');
    setPhase('loading');

    try {
      const token = await getToken();
      const res = await fetch('/api/verdict/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ idea: trimmed, roastMode }),
      });

      if (!res.ok) {
        let errMsg = 'Failed to analyze your idea. Please try again.';
        try {
          const errData = await res.json();
          if (errData?.error) errMsg = errData.error;
        } catch {}
        setPhase('input');
        setValidationMessage(errMsg);
        return;
      }

      const result: MockVerdict = await res.json();
      setVerdict(result);
      setIsVerdictRoast(roastMode);
      setSharedId(null);

      // Save to localStorage history under current user's ID with roastMode flag
      if (user?.id) {
        const updated = addHistoryEntry(user.id, trimmed, result, roastMode);
        setHistory(updated);
      }

      setPhase('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setPhase('input');
      setValidationMessage('Network connection error. Please check your connection and try again.');
    }
  };

  const handleReset = () => {
    setPhase('input');
    setIdea('');
    setValidationMessage('');
    setSharedId(null);
    window.setTimeout(() => textareaRef.current?.focus(), 60);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenHistory = () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    setPhase('history');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistoryEntry = (entry: HistoryEntry) => {
    setIdea(entry.idea);
    setVerdict(entry.verdict);
    setIsVerdictRoast(Boolean(entry.roastMode));
    setSharedId(null);
    setPhase('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistoryEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    const updated = deleteHistoryEntry(user.id, id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    if (!user?.id) return;
    clearUserHistory(user.id);
    setHistory([]);
  };

  return (
    <main className="verdict-page">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1320px] flex-col px-5 sm:px-8 lg:px-12">
        <SiteNav
          onReset={handleReset}
          onOpenHistory={handleOpenHistory}
          showReset={phase === 'results' || phase === 'history'}
          activeView={phase}
        />
        {phase === 'input' && (
          <InputExperience
            idea={idea}
            setIdea={(value) => {
              setIdea(value);
              if (validationMessage && value.trim()) setValidationMessage('');
            }}
            onSubmit={handleSubmit}
            validationMessage={validationMessage}
            textareaRef={textareaRef}
            roastMode={roastMode}
            setRoastMode={setRoastMode}
          />
        )}
        {phase === 'loading' && <LoadingExperience roastMode={roastMode} />}
        {phase === 'results' && (
          <ResultsExperience
            idea={idea}
            verdict={verdict}
            onReset={handleReset}
            onOpenHistory={handleOpenHistory}
            isRoastMode={isVerdictRoast}
            sharedId={sharedId}
            setSharedId={setSharedId}
          />
        )}
        {phase === 'history' && (
          <HistoryExperience
            history={history}
            onSelectEntry={handleSelectHistoryEntry}
            onDeleteEntry={handleDeleteHistoryEntry}
            onClearHistory={handleClearHistory}
            onNewIdea={handleReset}
          />
        )}
        <SiteFooter />
      </div>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/share/:shareId" component={SharedVerdictPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;