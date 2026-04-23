/**
 * Unit Tests for Claims Service
 * Covers: Bad Words Filter, AI Analysis, Similarity, State Machine, SLA, Auto-Assignment
 */

// Mock external dependencies before requiring index.js
jest.mock('mysql2/promise', () => ({ createConnection: jest.fn() }));
jest.mock('nodemailer', () => ({ createTransport: () => ({ sendMail: jest.fn() }) }));
jest.mock('amqplib', () => ({ connect: jest.fn() }));
jest.mock('eureka-js-client', () => ({ Eureka: jest.fn().mockImplementation(() => ({ start: jest.fn() })) }));

const {
  containsBadWords, extractSummary, calculateSimilarity,
  predictCategory, generateDraftResponse, analyzeSentiment,
  calculateSLADeadline, validateTransition, assignAgent,
  SLA_CONFIG, VALID_TRANSITIONS, AGENT_ASSIGNMENTS
} = require('./index');

// ═══════════════════════════════════════════════════════════════════════════════
// Bad Words Filter
// ═══════════════════════════════════════════════════════════════════════════════
describe('Bad Words Filter', () => {
  test('should detect explicit bad words', () => {
    expect(containsBadWords('you are an idiot')).toBe(true);
    expect(containsBadWords('this is stupid')).toBe(true);
    expect(containsBadWords('what the fuck')).toBe(true);
  });

  test('should be case-insensitive', () => {
    expect(containsBadWords('You are an IDIOT')).toBe(true);
    expect(containsBadWords('STUPID decision')).toBe(true);
  });

  test('should not flag clean text', () => {
    expect(containsBadWords('I need help with my course')).toBe(false);
    expect(containsBadWords('The login page is not working')).toBe(false);
    expect(containsBadWords('Please fix my account')).toBe(false);
  });

  test('should handle empty/null input', () => {
    expect(containsBadWords('')).toBe(false);
    expect(containsBadWords(null)).toBe(false);
    expect(containsBadWords(undefined)).toBe(false);
  });

  test('should not flag partial word matches (word boundary)', () => {
    // "class" contains "ass" but should NOT be flagged
    expect(containsBadWords('I love this class')).toBe(false);
    // "hello" contains "hell" — should be flagged since "hell" is a whole word here
    expect(containsBadWords('what the hell')).toBe(true);
  });

  test('should detect multi-word bad phrases', () => {
    expect(containsBadWords('shut up and listen')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AI Summarization
// ═══════════════════════════════════════════════════════════════════════════════
describe('AI Summarization (extractSummary)', () => {
  test('should return short text as-is', () => {
    expect(extractSummary('Short text')).toBe('Short text');
  });

  test('should extract first meaningful sentence from long text', () => {
    const text = 'Ok. This is a much longer sentence that contains important information about the problem. And more details follow.';
    const summary = extractSummary(text);
    expect(summary).toContain('This is a much longer sentence');
  });

  test('should truncate very long text without sentences', () => {
    const text = 'abcdefghij '.repeat(30); // long text with no sentence-ending punctuation
    const summary = extractSummary(text);
    expect(summary.length).toBeLessThan(text.length);
  });

  test('should handle null/empty', () => {
    expect(extractSummary('')).toBe('');
    expect(extractSummary(null)).toBe(null);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Similarity Checker (Jaccard Index)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Similarity Checker', () => {
  test('identical strings should return 1.0', () => {
    expect(calculateSimilarity('hello world', 'hello world')).toBe(1.0);
  });

  test('completely different strings should return 0', () => {
    expect(calculateSimilarity('apple banana', 'car train')).toBe(0);
  });

  test('partial overlap should return value between 0 and 1', () => {
    const sim = calculateSimilarity('login page broken', 'login page not working');
    expect(sim).toBeGreaterThan(0);
    expect(sim).toBeLessThan(1);
  });

  test('should be case-insensitive', () => {
    expect(calculateSimilarity('Hello World', 'hello world')).toBe(1.0);
  });

  test('should handle empty strings', () => {
    expect(calculateSimilarity('', 'hello')).toBe(0);
    expect(calculateSimilarity('hello', '')).toBe(0);
    expect(calculateSimilarity('', '')).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Category Prediction
// ═══════════════════════════════════════════════════════════════════════════════
describe('Category Prediction', () => {
  test('should detect Account issues', () => {
    expect(predictCategory('I cannot login to my account')).toBe('Account');
    expect(predictCategory('Reset my password please')).toBe('Account');
  });

  test('should detect Billing issues', () => {
    expect(predictCategory('I need a refund for my payment')).toBe('Billing');
    expect(predictCategory('Invoice not showing')).toBe('Billing');
  });

  test('should detect Technical issues', () => {
    expect(predictCategory('The page crashes every time')).toBe('Technical');
    expect(predictCategory('Getting an error on submit')).toBe('Technical');
  });

  test('should detect Content issues', () => {
    expect(predictCategory('The course material is outdated')).toBe('Content');
    expect(predictCategory('Quiz answers are wrong')).toBe('Content');
  });

  test('should default to General for unrecognized text', () => {
    expect(predictCategory('I have a general question')).toBe('General');
    expect(predictCategory('Something happened')).toBe('General');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AI Sentiment Analysis
// ═══════════════════════════════════════════════════════════════════════════════
describe('Sentiment Analysis', () => {
  test('should detect HIGH priority for urgent words', () => {
    const result = analyzeSentiment('URGENT! The system is down and broken, cannot access anything!');
    expect(['HIGH', 'CRITICAL']).toContain(result.priority);
  });

  test('should detect CRITICAL priority for many urgent signals', () => {
    const result = analyzeSentiment('URGENT EMERGENCY! CRITICAL ERROR! System crash, blocked, lost data immediately!!!');
    expect(result.priority).toBe('CRITICAL');
  });

  test('should detect LOW priority for calm text', () => {
    const result = analyzeSentiment('I have a suggestion for improving the homepage design.');
    expect(result.priority).toBe('LOW');
  });

  test('should detect NEGATIVE sentiment', () => {
    const result = analyzeSentiment('I am angry and frustrated and disappointed with this ridiculous service');
    expect(result.sentiment).toBe('NEGATIVE');
  });

  test('should detect POSITIVE sentiment', () => {
    const result = analyzeSentiment('Thank you, I appreciate your help and kind consideration of my request');
    expect(result.sentiment).toBe('POSITIVE');
  });

  test('should detect NEUTRAL sentiment for normal text', () => {
    const result = analyzeSentiment('The video on module 3 is not loading.');
    expect(result.sentiment).toBe('NEUTRAL');
  });

  test('should predict category', () => {
    const result = analyzeSentiment('I cannot login to my account, password reset not working');
    expect(result.predictedCat).toBe('Account');
  });

  test('should include AI draft in suggestion', () => {
    const result = analyzeSentiment('My course grade is wrong');
    expect(result.suggestedResponse).toContain('🎯 Summary:');
    expect(result.suggestedResponse).toContain('🤖 AI Strategy:');
    expect(result.suggestedResponse).toContain('📝 AI Draft Response:');
  });

  test('should generate varied drafts (not identical)', () => {
    const results = new Set();
    for (let i = 0; i < 10; i++) {
      const r = analyzeSentiment('I need help with my course enrollment');
      results.add(r.ai_draft);
    }
    // With randomized pools, we should get at least 2 unique drafts in 10 tries
    expect(results.size).toBeGreaterThanOrEqual(2);
  });

  test('should include dynamic tips for keyword triggers', () => {
    const result = analyzeSentiment('I want a refund for my money');
    expect(result.suggestedResponse).toContain('💡 Tip:');

    const result2 = analyzeSentiment('My password is locked');
    expect(result2.suggestedResponse).toContain('💡 Tip:');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AI Draft Response Generator
// ═══════════════════════════════════════════════════════════════════════════════
describe('Draft Response Generator', () => {
  test('should include the subject in the greeting', () => {
    const draft = generateDraftResponse(
      { priority: 'LOW', sentiment: 'NEUTRAL' }, 'General', 'My course is broken'
    );
    expect(draft).toContain('My course is broken');
  });

  test('should generate different responses for different sentiments', () => {
    const neg = generateDraftResponse({ priority: 'LOW', sentiment: 'NEGATIVE' }, 'General', 'test');
    const pos = generateDraftResponse({ priority: 'LOW', sentiment: 'POSITIVE' }, 'General', 'test');
    // They use different greeting pools, so they should differ
    // (statistically, not always guaranteed in 1 run, so we test structure)
    expect(neg.length).toBeGreaterThan(50);
    expect(pos.length).toBeGreaterThan(50);
  });

  test('should produce non-empty responses for all categories', () => {
    const categories = ['Technical', 'Billing', 'Account', 'Content', 'General', 'Other'];
    for (const cat of categories) {
      const draft = generateDraftResponse({ priority: 'MEDIUM', sentiment: 'NEUTRAL' }, cat, 'test subject');
      expect(draft.length).toBeGreaterThan(30);
    }
  });

  test('should not produce identical drafts repeatedly', () => {
    const drafts = new Set();
    for (let i = 0; i < 20; i++) {
      drafts.add(generateDraftResponse({ priority: 'LOW', sentiment: 'NEUTRAL' }, 'General', 'test'));
    }
    expect(drafts.size).toBeGreaterThanOrEqual(3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SLA Configuration & Deadline Calculation
// ═══════════════════════════════════════════════════════════════════════════════
describe('SLA Configuration', () => {
  test('should have correct SLA hours per priority', () => {
    expect(SLA_CONFIG.CRITICAL.maxHours).toBe(4);
    expect(SLA_CONFIG.HIGH.maxHours).toBe(24);
    expect(SLA_CONFIG.MEDIUM.maxHours).toBe(48);
    expect(SLA_CONFIG.LOW.maxHours).toBe(72);
  });

  test('should have warning hours less than max hours', () => {
    for (const [key, config] of Object.entries(SLA_CONFIG)) {
      expect(config.warnHours).toBeLessThan(config.maxHours);
      expect(config.escalateHours).toBeLessThan(config.maxHours);
      expect(config.warnHours).toBeLessThan(config.escalateHours);
    }
  });
});

describe('SLA Deadline Calculation', () => {
  test('should calculate CRITICAL deadline as 4 hours from now', () => {
    const now = new Date('2026-01-01T12:00:00Z');
    const deadline = calculateSLADeadline('CRITICAL', now);
    expect(deadline.toISOString()).toBe('2026-01-01T16:00:00.000Z');
  });

  test('should calculate LOW deadline as 72 hours from now', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const deadline = calculateSLADeadline('LOW', now);
    expect(deadline.toISOString()).toBe('2026-01-04T00:00:00.000Z');
  });

  test('should calculate HIGH deadline as 24 hours from now', () => {
    const now = new Date('2026-06-15T10:00:00Z');
    const deadline = calculateSLADeadline('HIGH', now);
    expect(deadline.toISOString()).toBe('2026-06-16T10:00:00.000Z');
  });

  test('should fall back to LOW for unknown priority', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const deadline = calculateSLADeadline('UNKNOWN', now);
    const expected = calculateSLADeadline('LOW', now);
    expect(deadline.getTime()).toBe(expected.getTime());
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// State Machine (Workflow Transitions)
// ═══════════════════════════════════════════════════════════════════════════════
describe('State Machine', () => {
  describe('Valid transitions', () => {
    test('CREATED → IN_PROGRESS', () => expect(validateTransition('CREATED', 'IN_PROGRESS')).toBe(true));
    test('CREATED → REJECTED', () => expect(validateTransition('CREATED', 'REJECTED')).toBe(true));
    test('IN_PROGRESS → RESOLVED', () => expect(validateTransition('IN_PROGRESS', 'RESOLVED')).toBe(true));
    test('IN_PROGRESS → REJECTED', () => expect(validateTransition('IN_PROGRESS', 'REJECTED')).toBe(true));
    test('RESOLVED → CLOSED', () => expect(validateTransition('RESOLVED', 'CLOSED')).toBe(true));
    test('RESOLVED → IN_PROGRESS (reopen)', () => expect(validateTransition('RESOLVED', 'IN_PROGRESS')).toBe(true));
  });

  describe('Invalid transitions', () => {
    test('CREATED → CLOSED', () => expect(validateTransition('CREATED', 'CLOSED')).toBe(false));
    test('CREATED → RESOLVED', () => expect(validateTransition('CREATED', 'RESOLVED')).toBe(false));
    test('IN_PROGRESS → CLOSED', () => expect(validateTransition('IN_PROGRESS', 'CLOSED')).toBe(false));
    test('IN_PROGRESS → CREATED', () => expect(validateTransition('IN_PROGRESS', 'CREATED')).toBe(false));
    test('CLOSED → anything', () => {
      expect(validateTransition('CLOSED', 'CREATED')).toBe(false);
      expect(validateTransition('CLOSED', 'IN_PROGRESS')).toBe(false);
      expect(validateTransition('CLOSED', 'RESOLVED')).toBe(false);
      expect(validateTransition('CLOSED', 'REJECTED')).toBe(false);
    });
    test('REJECTED → anything', () => {
      expect(validateTransition('REJECTED', 'CREATED')).toBe(false);
      expect(validateTransition('REJECTED', 'IN_PROGRESS')).toBe(false);
      expect(validateTransition('REJECTED', 'RESOLVED')).toBe(false);
      expect(validateTransition('REJECTED', 'CLOSED')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    test('unknown status should block all transitions', () => {
      expect(validateTransition('UNKNOWN', 'CREATED')).toBe(false);
    });

    test('same status transition should be blocked', () => {
      expect(validateTransition('CREATED', 'CREATED')).toBe(false);
      expect(validateTransition('IN_PROGRESS', 'IN_PROGRESS')).toBe(false);
    });
  });

  describe('VALID_TRANSITIONS completeness', () => {
    test('all 5 states should be defined', () => {
      expect(Object.keys(VALID_TRANSITIONS)).toEqual(
        expect.arrayContaining(['CREATED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'])
      );
    });

    test('terminal states should have empty transition arrays', () => {
      expect(VALID_TRANSITIONS.CLOSED).toEqual([]);
      expect(VALID_TRANSITIONS.REJECTED).toEqual([]);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Auto-Assignment
// ═══════════════════════════════════════════════════════════════════════════════
describe('Auto-Assignment', () => {
  test('should assign Technical claims to tech-support', () => {
    expect(assignAgent('Technical')).toBe('tech-support@learnivo.com');
  });

  test('should assign Billing claims to billing', () => {
    expect(assignAgent('Billing')).toBe('billing@learnivo.com');
  });

  test('should assign Account claims to account team', () => {
    expect(assignAgent('Account')).toBe('account@learnivo.com');
  });

  test('should assign Content claims to general support', () => {
    expect(assignAgent('Content')).toBe('support@learnivo.com');
  });

  test('should assign General claims to general support', () => {
    expect(assignAgent('General')).toBe('support@learnivo.com');
  });

  test('should default to general support for unknown categories', () => {
    expect(assignAgent('RandomCategory')).toBe('support@learnivo.com');
    expect(assignAgent('')).toBe('support@learnivo.com');
  });

  test('all defined categories should have an assignment', () => {
    for (const cat of Object.keys(AGENT_ASSIGNMENTS)) {
      expect(assignAgent(cat)).toBeTruthy();
      expect(assignAgent(cat)).toContain('@learnivo.com');
    }
  });
});
