export type MockVerdict = {
  score: number;
  scoreReason: string;
  targetUser: string;
  biggestRisk: string;
  competitors: string[];
  tenXSuggestion: string;
};

export const mockVerdict: MockVerdict = {
  score: 7.8,
  scoreReason: 'A sharp wedge into a real habit, with enough urgency to earn a first try.',
  targetUser: 'Indie founders shipping their first product who need honest signal before they spend a quarter building.',
  biggestRisk: 'It could become a clever one-off instead of a repeatable decision ritual people return to every week.',
  competitors: ['Product Hunt', 'Dovetail', 'A trusted founder friend'],
  tenXSuggestion: 'Turn every verdict into a shareable evidence trail: let users log the prediction, ship the test, and return to see what was actually true.',
};

const analysisDelay = 2600;

export function analyzeIdea(_idea: string): Promise<MockVerdict> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(mockVerdict), analysisDelay);
  });
}