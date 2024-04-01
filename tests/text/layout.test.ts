import { describe, expect, test } from 'vitest';
import { Vec2 } from '../../src/math';
import { Rect } from '../../src/math/shapes';
import { Font, Glyph, layoutText, textStyleOrDefaults } from '../../src/text';

const LINE_HEIGHT = 20;

const FONT = new Font('test', 16, LINE_HEIGHT, 18, Vec2.ONE, [], 4, [
    new Glyph(' '.codePointAt(0)!, ' ', Rect.ONE, 1),
    new Glyph('w'.codePointAt(0)!, 'w', Rect.ONE, 1),
    new Glyph('🫥'.codePointAt(0)!, '🫥', Rect.ONE, 1),
]);

describe('text layout', () => {
    test('keeps whitespace at start of line', () => {
        const layout = layoutText(' 🫥', textStyleOrDefaults(), FONT);

        expect(layout.lines.length).toBe(1);

        expect(layout.lines[0]!.text).toEqual(' 🫥');
    });

    test('keeps whitespace after explicit line break', () => {
        const layout = layoutText(' 🫥\n 🫥', textStyleOrDefaults(), FONT);

        expect(layout.lines.length).toBe(2);

        expect(layout.lines[0]!.text).toEqual(' 🫥');
        expect(layout.lines[1]!.text).toEqual(' 🫥');
    });

    test('breaks on newline', () => {
        const layout = layoutText('🫥\n🫥', textStyleOrDefaults(), FONT);

        expect(layout.lines.length).toBe(2);

        expect(layout.lines[0]!.text).toEqual('🫥');

        expect(layout.lines[1]!.text).toEqual('🫥');
    });

    test('breaks on newlines', () => {
        const layout = layoutText(
            '🫥🫥\n🫥🫥\n🫥🫥',
            textStyleOrDefaults(),
            FONT,
        );

        expect(layout.lines.length).toBe(3);

        expect(layout.lines[0]!.text).toBe('🫥🫥');
        expect(layout.lines[1]!.text).toBe('🫥🫥');
        expect(layout.lines[2]!.text).toEqual('🫥🫥');
    });

    test('breaks on char if word does not fit', () => {
        const layout = layoutText('🫥🫥', textStyleOrDefaults(), FONT, {
            maxLineWidth: 1,
        });

        expect(layout.lines.length).toBe(2);

        expect(layout.lines[0]!.glyphs.length).toBe(1);
        expect(layout.lines[1]!.glyphs.length).toBe(1);
    });

    test('breaks on char if lineBreak == char', () => {
        const layout = layoutText(
            '🫥🫥🫥',
            textStyleOrDefaults({ break: 'char' }),
            FONT,
            {
                maxLineWidth: 2,
            },
        );

        expect(layout.lines.length).toBe(2);

        expect(layout.lines[0]!.text).toBe('🫥🫥');
        expect(layout.lines[1]!.text).toBe('🫥');
    });

    test('breaks full word and discards whitespace', () => {
        const layout = layoutText('🫥 🫥🫥', textStyleOrDefaults(), FONT, {
            maxLineWidth: 3,
        });

        expect(layout.lines.length).toBe(2);

        expect(layout.lines[0]!.text).toBe('🫥');
        expect(layout.lines[1]!.text).toBe('🫥🫥');
    });

    test('breaks on word start and discards trailing whitespace', () => {
        const layout = layoutText('🫥 🫥 🫥', textStyleOrDefaults(), FONT, {
            maxLineWidth: 3,
        });

        expect(layout.lines.length).toBe(2);

        expect(layout.lines[0]!.text).toBe('🫥 🫥');
        expect(layout.lines[1]!.text).toBe('🫥');
    });

    test('calculates dimensions correctly with multiple lines', () => {
        const layout = layoutText('🫥 🫥 🫥', textStyleOrDefaults(), FONT);

        expect(layout.lines.length).toBe(1);

        expect(layout.widestLine).toBeTruthy();
        expect(layout.widestLine.text).toBe('🫥 🫥 🫥');
        expect(layout.widestLine.width).toBe(5);
        expect(layout.height).toBe(1 * LINE_HEIGHT);
    });

    test('calculates dimensions correctly with multiple lines', () => {
        const layout = layoutText('🫥 🫥 🫥', textStyleOrDefaults(), FONT, {
            maxLineWidth: 3,
        });

        expect(layout.lines.length).toBe(2);

        expect(layout.widestLine).toBeTruthy();
        expect(layout.widestLine.text).toBe('🫥 🫥');
        expect(layout.widestLine.width).toBe(3);
        expect(layout.height).toBe(2 * LINE_HEIGHT);
    });

    test('widest line does not exceed max width', () => {
        const layout = layoutText('🫥 🫥 🫥', textStyleOrDefaults(), FONT, {
            maxLineWidth: 3,
        });

        expect(layout.widestLine).toBeTruthy();
        expect(layout.widestLine.width).toBeLessThanOrEqual(3);
    });
});
