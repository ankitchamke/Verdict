import { useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, Check, MoveDown, ShieldCheck } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const [idea, setIdea] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [signInNotice, setSignInNotice] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!idea.trim()) {
      textareaRef.current?.focus();
      return;
    }
    setSubmitted(true);
  };

  return (
    <main className="verdict-page">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1320px] flex-col px-5 sm:px-8 lg:px-12">
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

          <div className="flex items-center gap-5 sm:gap-8">
            <a
              className="verdict-nav-link hidden text-[0.7rem] font-semibold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] sm:inline-block"
              href="#lens"
              data-testid="link-how-it-works"
            >
              Our lens
            </a>
            <button
              className="verdict-signin text-[0.7rem] font-semibold uppercase tracking-[0.13em] text-[hsl(var(--foreground))] underline decoration-[hsl(var(--foreground)/0.25)] underline-offset-4 transition-colors hover:decoration-[hsl(var(--accent))]"
              onClick={() => setSignInNotice(true)}
              type="button"
              data-testid="button-sign-in"
            >
              Sign in
            </button>
          </div>
        </nav>

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
            <div className="verdict-input-wrap relative overflow-hidden rounded-[1.1rem] border border-[hsl(var(--foreground)/0.26)] bg-[hsl(var(--card))]">
              <div className="flex items-center justify-between border-b border-[hsl(var(--foreground)/0.1)] px-5 py-3.5 sm:px-6">
                <label
                  className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))]"
                  htmlFor="idea-input"
                >
                  Your idea
                </label>
                <span className="font-mono text-[0.62rem] text-[hsl(var(--muted-foreground)/0.72)]">
                  01 / 01
                </span>
              </div>
              <textarea
                ref={textareaRef}
                className="verdict-textarea block min-h-[178px] w-full border-0 bg-transparent px-5 py-5 text-[1.15rem] leading-8 text-[hsl(var(--foreground))] outline-none sm:min-h-[204px] sm:px-6 sm:py-6 sm:text-[1.28rem]"
                id="idea-input"
                maxLength={500}
                onChange={(event) => {
                  setIdea(event.target.value);
                  if (submitted) setSubmitted(false);
                }}
                placeholder="Describe your idea in a sentence or two..."
                value={idea}
                data-testid="input-idea"
              />
              <div className="flex items-center justify-between border-t border-[hsl(var(--foreground)/0.1)] px-5 py-3 sm:px-6">
                <span className="text-[0.68rem] text-[hsl(var(--muted-foreground))]">
                  Clear thinking starts here.
                </span>
                <span className="font-mono text-[0.62rem] text-[hsl(var(--muted-foreground)/0.72)]">
                  {idea.length.toString().padStart(3, '0')} / 500
                </span>
              </div>
            </div>

            <button
              className="verdict-cta mt-4 flex w-full items-center justify-center gap-2 rounded-[0.75rem] bg-[hsl(var(--primary))] px-5 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--primary-foreground))] sm:w-auto sm:min-w-[214px]"
              onClick={handleSubmit}
              type="button"
              data-testid="button-get-verdict"
            >
              {submitted ? 'Idea captured' : 'Get my verdict'}
              {submitted ? (
                <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              ) : (
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
              )}
            </button>

            {submitted && (
              <p
                className="verdict-status mt-4 flex items-center gap-2 text-[0.74rem] text-[hsl(var(--muted-foreground))]"
                data-testid="status-idea-captured"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />
                This is a preview — no verdict is generated or sent yet.
              </p>
            )}
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
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--foreground))]" strokeWidth={1.7} aria-hidden="true" />
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

        {signInNotice && (
          <div
            className="fixed bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[hsl(var(--foreground)/0.16)] bg-[hsl(var(--foreground))] px-4 py-3 text-[0.72rem] text-[hsl(var(--primary-foreground))] shadow-xl"
            role="status"
            data-testid="status-sign-in"
          >
            Sign in arrives with the full Verdict experience.
            <button
              className="font-semibold text-[hsl(var(--accent))] underline underline-offset-2"
              onClick={() => setSignInNotice(false)}
              type="button"
              data-testid="button-dismiss-sign-in"
            >
              Dismiss
            </button>
          </div>
        )}
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