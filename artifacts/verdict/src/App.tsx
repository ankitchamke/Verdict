import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import {
  ArrowUpRight,
  Check,
  Github,
  Lightbulb,
  Linkedin,
  type LucideIcon,
  MoveDown,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  TriangleAlert,
  UsersRound,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { analyzeIdea, mockVerdict, type MockVerdict } from '@/lib/mock-analysis';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type FlowPhase = 'input' | 'loading' | 'results';

const loadingLines = [
  'Interrogating your idea...',
  'Looking for the weak spots...',
  'Checking who actually needs this...',
  'Finding the competition...',
];

function SiteNav({
  onSignIn,
  onReset,
  showReset,
}: {
  onSignIn: () => void;
  onReset?: () => void;
  showReset?: boolean;
}) {
  return (
    <nav
      className="verdict-nav flex items-center justify-between border-b border-[hsl(var(--foreground)/0.14)] py-5 sm:py-6"
      aria-label="Main navigation"
    >
      <a
        className="verdict-wordmark text-[1.55rem] font-bold leading-none text-[hsl(var(--foreground))] sm:text-[1.7rem]"
        href="/"
        data-testid="link-home"
      >
        verdict<span className="text-[hsl(var(--accent))]">.</span>
      </a>

      <div className="flex items-center gap-4 sm:gap-8">
        <a
          className="verdict-nav-link hidden text-[0.7rem] font-semibold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] sm:inline-block"
          href={showReset ? '#verdict' : '#lens'}
          data-testid="link-how-it-works"
        >
          {showReset ? 'Your verdict' : 'Our lens'}
        </a>
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
        <button
          className="verdict-signin text-[0.7rem] font-semibold uppercase tracking-[0.13em] text-[hsl(var(--foreground))] underline decoration-[hsl(var(--foreground)/0.25)] underline-offset-4 transition-colors hover:decoration-[hsl(var(--accent))]"
          onClick={onSignIn}
          type="button"
          data-testid="button-sign-in"
        >
          Sign in
        </button>
      </div>
    </nav>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[hsl(var(--foreground)/0.14)] py-6 sm:py-7">
      <div className="flex flex-col gap-5 text-[0.68rem] text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between">
        <p data-testid="text-footer-credit">
          Built by <span className="font-semibold text-[hsl(var(--foreground))]">Ankit Chamke</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="mr-2 hidden uppercase tracking-[0.13em] sm:inline">Keep in touch</span>
          <a
            className="verdict-footer-link flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(var(--foreground)/0.15)] text-[hsl(var(--foreground))]"
            href="https://github.com/ankitchamke"
            target="_blank"
            rel="noreferrer"
            aria-label="Ankit Chamke on GitHub"
            data-testid="link-github"
          >
            <Github className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          </a>
          <a
            className="verdict-footer-link flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(var(--foreground)/0.15)] text-[hsl(var(--foreground))]"
            href="https://www.linkedin.com/in/ankitchamke/"
            target="_blank"
            rel="noreferrer"
            aria-label="Ankit Chamke on LinkedIn"
            data-testid="link-linkedin"
          >
            <Linkedin className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
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
}: {
  idea: string;
  setIdea: (value: string) => void;
  onSubmit: () => void;
  validationMessage: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
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
            className={`verdict-input-wrap relative overflow-hidden rounded-[1.1rem] border bg-[hsl(var(--card))] ${
              validationMessage
                ? 'border-[hsl(var(--accent-foreground)/0.75)] shadow-[0_0_0_4px_hsl(var(--accent)/0.35)]'
                : 'border-[hsl(var(--foreground)/0.26)]'
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
              className="verdict-textarea block min-h-[178px] w-full border-0 bg-transparent px-5 py-5 text-[1.15rem] leading-8 text-[hsl(var(--foreground))] outline-none sm:min-h-[204px] sm:px-6 sm:py-6 sm:text-[1.28rem]"
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
            className="verdict-cta mt-4 flex w-full items-center justify-center gap-2 rounded-[0.75rem] bg-[hsl(var(--primary))] px-5 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--primary-foreground))] sm:w-auto sm:min-w-[214px]"
            onClick={onSubmit}
            type="button"
            data-testid="button-get-verdict"
          >
            Get my verdict
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
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

function LoadingExperience() {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLineIndex((current) => (current + 1) % loadingLines.length);
    }, 650);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="verdict-loading flex flex-1 flex-col items-center justify-center py-24 text-center sm:py-36">
      <div className="relative flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
        <div className="absolute inset-0 rounded-full border border-[hsl(var(--foreground)/0.12)]" />
        <div className="loading-orbit absolute inset-2 rounded-full border border-dashed border-[hsl(var(--foreground)/0.3)]" />
        <div className="loading-orbit absolute inset-6 rounded-full border border-[hsl(var(--accent-foreground)/0.3)]" style={{ animationDirection: 'reverse', animationDuration: '3.8s' }} />
        <span className="loading-orbit-dot absolute right-1 top-5 h-2.5 w-2.5 rounded-full bg-[hsl(var(--accent))]" />
        <Sparkles className="h-7 w-7 text-[hsl(var(--foreground))]" strokeWidth={1.4} aria-hidden="true" />
      </div>
      <p className="verdict-eyebrow mt-12 text-[0.62rem] font-semibold uppercase text-[hsl(var(--muted-foreground))]">
        Verdict in progress
      </p>
      <p key={lineIndex} className="loading-copy mt-4 min-h-[2rem] text-[clamp(1.5rem,4vw,2.45rem)] font-medium tracking-[-0.04em] text-[hsl(var(--foreground))]" data-testid="status-analysis">
        {loadingLines[lineIndex]}
      </p>
      <div className="mt-10 h-1 w-full max-w-[290px] overflow-hidden rounded-full bg-[hsl(var(--foreground)/0.1)]" aria-label="Analysis progress">
        <div className="loading-progress h-full w-2/5 rounded-full bg-[hsl(var(--accent-foreground))]" />
      </div>
      <p className="mt-4 text-[0.7rem] text-[hsl(var(--muted-foreground))]">A little scrutiny takes a minute.</p>
    </section>
  );
}

function ScoreRing({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();
    const duration = 1100;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Number((score * eased).toFixed(1)));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="relative h-56 w-56 sm:h-64 sm:w-64" data-testid="score-visual">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
        <circle className="score-ring-track" cx="60" cy="60" r="52" fill="none" strokeWidth="5" />
        <circle
          className="score-ring-fill"
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="hsl(var(--accent-foreground))"
          strokeLinecap="round"
          strokeWidth="5"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="score-number text-[4.3rem] font-semibold leading-none tracking-[-0.09em] text-[hsl(var(--foreground))] sm:text-[5.2rem]" data-testid="text-score">
          {displayScore.toFixed(1)}
        </span>
        <span className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">/ 10</span>
      </div>
    </div>
  );
}

function VerdictCard({
  index,
  label,
  title,
  icon: Icon,
  children,
  testId,
}: {
  index: string;
  label: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  testId: string;
}) {
  return (
    <article
      className="result-card rounded-[1.05rem] border border-[hsl(var(--foreground)/0.16)] bg-[hsl(var(--card)/0.62)] p-6 sm:p-8"
      style={{ '--reveal-delay': `${Number(index) * 100}ms` } as CSSProperties}
      data-testid={testId}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.7)] text-[hsl(var(--accent-foreground))]">
            <Icon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
          </span>
          <div>
            <p className="verdict-eyebrow text-[0.58rem] font-semibold uppercase text-[hsl(var(--muted-foreground))]">{label}</p>
            <h2 className="mt-1 text-[1.15rem] font-semibold tracking-[-0.035em] text-[hsl(var(--foreground))] sm:text-[1.3rem]">{title}</h2>
          </div>
        </div>
        <span className="font-mono text-[0.62rem] text-[hsl(var(--muted-foreground))]">{index.padStart(2, '0')}</span>
      </div>
      <div className="mt-7 text-[0.96rem] leading-7 text-[hsl(var(--muted-foreground))]">{children}</div>
    </article>
  );
}

function ResultsExperience({
  idea,
  verdict,
  onReset,
}: {
  idea: string;
  verdict: MockVerdict;
  onReset: () => void;
}) {
  const [shareNotice, setShareNotice] = useState(false);

  return (
    <section className="verdict-results flex-1 pb-16 pt-16 sm:pb-24 sm:pt-24" id="verdict">
      <div className="mx-auto max-w-[1000px]">
        <div className="flex flex-col items-start justify-between gap-7 border-b border-[hsl(var(--foreground)/0.14)] pb-10 sm:flex-row sm:items-end sm:gap-10">
          <div className="max-w-[640px]">
            <p className="verdict-eyebrow flex items-center gap-3 text-[0.62rem] font-semibold uppercase text-[hsl(var(--muted-foreground))]">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />
              Your founder&apos;s second opinion
            </p>
            <h1 className="mt-5 text-[clamp(2.8rem,6vw,5.8rem)] font-semibold leading-[0.92] tracking-[-0.075em] text-[hsl(var(--foreground))]" data-testid="text-results-heading">
              Your <span className="verdict-serif">Verdict.</span>
            </h1>
            <div className="mt-7 max-w-[560px] border-l-2 border-[hsl(var(--accent-foreground)/0.5)] pl-4" data-testid="text-original-idea">
              <p className="verdict-eyebrow text-[0.57rem] font-semibold uppercase text-[hsl(var(--muted-foreground))]">Your idea</p>
              <p className="mt-2 line-clamp-3 text-[0.9rem] leading-6 text-[hsl(var(--foreground)/0.72)]">&ldquo;{idea.trim()}&rdquo;</p>
            </div>
          </div>
          <button
            className="share-placeholder flex items-center gap-2 rounded-full border border-[hsl(var(--foreground)/0.18)] px-4 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))]"
            onClick={() => setShareNotice(true)}
            type="button"
            data-testid="button-share-placeholder"
          >
            <Share2 className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
            Share verdict
          </button>
        </div>

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

      {shareNotice && (
        <div className="verdict-status fixed bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[hsl(var(--foreground)/0.16)] bg-[hsl(var(--foreground))] px-4 py-3 text-[0.72rem] text-[hsl(var(--primary-foreground))]" role="status" data-testid="status-share-placeholder">
          Sharing is coming soon.
          <button className="font-semibold text-[hsl(var(--accent))] underline underline-offset-2" onClick={() => setShareNotice(false)} type="button" data-testid="button-dismiss-share">
            Dismiss
          </button>
        </div>
      )}
    </section>
  );
}

function Home() {
  const [idea, setIdea] = useState('');
  const [phase, setPhase] = useState<FlowPhase>('input');
  const [verdict, setVerdict] = useState<MockVerdict>(mockVerdict);
  const [validationMessage, setValidationMessage] = useState('');
  const [signInNotice, setSignInNotice] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!idea.trim()) {
      setValidationMessage('Give us a real idea to interrogate first.');
      textareaRef.current?.focus();
      return;
    }
    setValidationMessage('');
    setPhase('loading');
    analyzeIdea(idea.trim()).then((result) => {
      setVerdict(result);
      setPhase('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleReset = () => {
    setPhase('input');
    setIdea('');
    setValidationMessage('');
    window.setTimeout(() => textareaRef.current?.focus(), 60);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="verdict-page">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1320px] flex-col px-5 sm:px-8 lg:px-12">
        <SiteNav onSignIn={() => setSignInNotice(true)} onReset={handleReset} showReset={phase === 'results'} />
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
          />
        )}
        {phase === 'loading' && <LoadingExperience />}
        {phase === 'results' && <ResultsExperience idea={idea} verdict={verdict} onReset={handleReset} />}
        {phase !== 'results' && <SiteFooter />}
        {phase === 'results' && <SiteFooter />}
        {signInNotice && <SignInNotice onDismiss={() => setSignInNotice(false)} />}
      </div>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
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
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;