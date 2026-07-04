import { describe, it, expect } from 'vitest';
import { scoreSentencePosition, POSITION_WEIGHTS } from '../score';

describe('scoreSentencePosition', () => {
  it('returns "opening" when the brand appears in sentence 1', () => {
    const answer = 'Linear is the best project management tool. Notion is a runner-up. ClickUp is third. Asana closes out the list.';
    expect(scoreSentencePosition(answer, 'Linear')).toBe('opening');
  });

  it('returns "top_3" when the brand appears in sentence 2', () => {
    const answer = 'Project management tools include several options. Linear is one of the best. Notion is another.';
    expect(scoreSentencePosition(answer, 'Linear')).toBe('top_3');
  });

  it('returns "top_3" when the brand appears in sentence 3', () => {
    const answer = 'There are several project management tools. Notion is a strong option. Linear is one of the best for engineering teams.';
    expect(scoreSentencePosition(answer, 'Linear')).toBe('top_3');
  });

  it('returns "closing" when the brand appears in the last sentence', () => {
    const answer = 'Notion is solid for documents. ClickUp is flexible. Asana is reliable. Linear is best for engineering teams.';
    expect(scoreSentencePosition(answer, 'Linear')).toBe('closing');
  });

  it('returns "middle" when the brand is buried mid-paragraph', () => {
    const answer = 'Notion is a strong choice. ClickUp is flexible. Asana is reliable. Trello is simple. Linear is best for engineering teams. Jira is enterprise. Height is fast. Pitch is design-first.';
    expect(scoreSentencePosition(answer, 'Linear')).toBe('middle');
  });

  it('returns "absent" when the brand is not mentioned', () => {
    const answer = 'Notion is a strong choice. ClickUp is flexible. Asana is reliable.';
    expect(scoreSentencePosition(answer, 'Linear')).toBe('absent');
  });

  it('returns "opening" when the brand appears twice (first wins)', () => {
    const answer = 'Linear is great for engineering teams. Notion is solid. ClickUp is flexible. Linear is also a strong option for solo founders.';
    expect(scoreSentencePosition(answer, 'Linear')).toBe('opening');
  });

  it('weights reflect the right priorities', () => {
    expect(POSITION_WEIGHTS.opening).toBe(1.0);
    expect(POSITION_WEIGHTS.top_3).toBe(1.0);
    expect(POSITION_WEIGHTS.closing).toBe(1.0);
    expect(POSITION_WEIGHTS.middle).toBe(0.5);
    expect(POSITION_WEIGHTS.absent).toBe(0);
  });

  it('is case-insensitive', () => {
    const answer = 'LINEAR is the best. Notion is second.';
    expect(scoreSentencePosition(answer, 'linear')).toBe('opening');
  });

  it('handles empty answer', () => {
    expect(scoreSentencePosition('', 'Linear')).toBe('absent');
  });

  it('handles empty brand', () => {
    expect(scoreSentencePosition('Some text here.', '')).toBe('absent');
  });
});