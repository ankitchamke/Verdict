import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Github, Linkedin, type LucideIcon } from 'lucide-react';

export function SiteFooter() {
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

export function ScoreRing({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();
    const duration = 1100;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(score * eased);
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
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

export function VerdictCard({
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
