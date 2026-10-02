import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { AnswerRecord, Block } from '../engine/session';
import type { M10Item } from '../skills/m10/logic';
import { SessionRunner } from './SessionRunner';

jest.mock('../services/speech', () => ({
  speak: jest.fn(() => Promise.resolve()),
  stopSpeaking: jest.fn(),
}));

const item = (a: number, b: number): M10Item => ({
  key: `M10:add:${a}+${b}:total`, level: 1, kind: 'add', a, b, total: a + b, blank: 'total',
});

function block(overrides: Partial<Block> = {}): Block {
  return {
    skillId: 'M10', items: [item(2, 3), item(4, 4)], reviewKeys: [], timing: null, immediateFeedback: true, ...overrides,
  };
}

async function tapKeys(...labels: string[]) {
  for (const label of labels) await act(async () => fireEvent.press(screen.getByLabelText(label)));
}

describe('SessionRunner', () => {
  it('plays a practice block with feedback after each answer', async () => {
    const onAnswer = jest.fn();
    const onFinish = jest.fn();
    await act(async () => render(<SessionRunner blocks={[block()]} onAnswer={onAnswer} onFinish={onFinish} />));

    await tapKeys('C’est parti !');
    expect(screen.getByText('2 + 3 = …')).toBeTruthy();

    await tapKeys('5', 'Valider');
    expect(onAnswer).toHaveBeenLastCalledWith(expect.objectContaining({ answer: '5', correct: true }));
    expect(screen.getByText(/2 \+ 3 = 5\. Astuce/)).toBeTruthy();

    await tapKeys('Continuer', '9', 'Valider');
    expect(screen.getByText('La bonne réponse :', { exact: false })).toBeTruthy();
    expect(screen.getByText(/4 \+ 4 = 8\. Astuce/)).toBeTruthy();

    await tapKeys('Continuer');
    const records: AnswerRecord[] = onFinish.mock.calls[0][0];
    expect(records.map((r) => r.correct)).toEqual([true, false]);
    expect(records[1].errorTag).toBe('off_by_one');
  });

  it('gives no feedback in school mode and ends when the global time is over', async () => {
    jest.useFakeTimers();
    const onFinish = jest.fn();
    await act(async () =>
      render(
        <SessionRunner
          blocks={[block({ immediateFeedback: false, timing: { kind: 'speed', seconds: 3 } })]}
          onAnswer={jest.fn()}
          onFinish={onFinish}
        />,
      ),
    );
    await tapKeys('C’est parti !', '5', 'Valider');
    expect(screen.queryByText('Continuer')).toBeNull();
    expect(screen.getByText('4 + 4 = …')).toBeTruthy();

    for (let i = 0; i < 4; i++) await act(async () => jest.advanceTimersByTime(1000));
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish.mock.calls[0][0]).toHaveLength(1);
    jest.useRealTimers();
  });
});
