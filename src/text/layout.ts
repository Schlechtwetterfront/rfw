import { TextStyle } from '.';
import { Char, toChars } from './chars';
import { Font, Glyph } from './font';

/** @category Text */
export class TextLine {
    get text() {
        return this.glyphs.map(c => c.string).join('');
    }

    constructor(
        public readonly glyphs: readonly Glyph[],
        public readonly width: number,
    ) {}
}

/** @category Text */
export class TextLayout {
    readonly widestLine: TextLine;
    readonly glyphCount: number;
    readonly width: number;

    constructor(
        public readonly lines: readonly TextLine[],
        public readonly height: number,
        public readonly maxLineWidth: number,
    ) {
        if (!this.lines.length) {
            throw new Error('Layout must have at least one line');
        }

        this.widestLine = this.lines.reduce(
            (widest, line) =>
                widest && widest.width > line.width ? widest : line,
            undefined as TextLine | undefined,
        )!;

        this.glyphCount = this.lines.reduce(
            (sum, line) => sum + line.glyphs.length,
            0,
        );

        this.width =
            maxLineWidth === Number.POSITIVE_INFINITY
                ? this.widestLine.width
                : maxLineWidth;
    }
}

/** @category Text */
export interface TextLayoutOptions {
    maxLineWidth?: number;
}

/** @category Text */
export function layoutText(
    text: string,
    style: TextStyle,
    font: Font,
    options?: TextLayoutOptions,
): TextLayout {
    const chars = toChars(text);

    return layoutChars(chars, style, font, options);
}

/** @category Text */
export function layoutChars(
    chars: Char[],
    style: TextStyle,
    font: Font,
    options?: TextLayoutOptions,
) {
    const maxLineWidth = options?.maxLineWidth ?? Number.POSITIVE_INFINITY;

    const lines: TextLine[] = [];

    const charCount = chars.length;

    const fontSize = style.size;
    const fontScale = font.getFontScale(fontSize);
    const lineHeight =
        style.lineHeight.get(font.originalLineHeight) * fontScale;

    const wordGlyphs: Glyph[] = [];
    let wordWidth = 0;

    const whitespaceGlyphs: Glyph[] = [];
    let whitespaceWidth = 0;

    let lineGlyphs: Glyph[] = [];
    let lineWidth = 0;

    let totalHeight = 0;

    for (let i = 0; i < charCount; i++) {
        const char = chars[i]!;

        const isWhitespaceChar = isWhitespace(char.string);

        if (isWhitespaceChar && wordGlyphs.length) {
            completeWhitespace();
            completeWord();
        }

        const glyph = font.getGlyph(char.codePoint);

        const glyphWidth = (glyph?.xAdvance ?? 0) * fontScale;

        if (!glyph) {
            // Break explicitly, word already is completed because newline is a word-break char
            if (char.string === '\n') {
                nextLine();
            }
        } else {
            // Break line if line + pending chars + current char (word or not) would overflow
            if (
                lineWidth + whitespaceWidth + wordWidth + glyphWidth >
                maxLineWidth
            ) {
                // Overflowed while word was not completed
                const overflowedWithWord =
                    !isWhitespaceChar && wordGlyphs.length;

                // Overflowed in a word but word would never fit in a line,
                // break on char
                if (
                    overflowedWithWord &&
                    style.break === 'word' &&
                    wordWidth + glyphWidth > maxLineWidth
                ) {
                    completeWhitespace();
                    completeWord();
                    nextLine();
                    extendWord(glyph, glyphWidth);
                }
                // Overflowed in a word, break before word and discard now trailing
                // whitespace
                else if (overflowedWithWord && style.break === 'word') {
                    discardWhitespace();
                    extendWord(glyph, glyphWidth);
                    nextLine();
                }
                // Overflowed in a word, break on char
                else if (overflowedWithWord && style.break === 'char') {
                    completeWhitespace();
                    completeWord();
                    nextLine();
                    extendWord(glyph, glyphWidth);
                }
                // Overflow on word start, discard whitespace, start word in new line
                else if (!isWhitespaceChar) {
                    discardWhitespace();
                    nextLine();
                    extendWord(glyph, glyphWidth);
                }
            } else {
                if (isWhitespaceChar) {
                    extendWhitespace(glyph, glyphWidth);
                } else if (glyph) {
                    extendWord(glyph, glyphWidth);
                }
            }
        }
    }

    completeWhitespace();
    completeWord();

    if (lineGlyphs.length || !lines.length) {
        nextLine();
    }

    return new TextLayout(lines, totalHeight, maxLineWidth);

    function extendWord(g: Glyph, w: number) {
        wordGlyphs.push(g);
        wordWidth += w;
    }

    function extendWhitespace(g: Glyph, w: number) {
        whitespaceGlyphs.push(g);
        whitespaceWidth += w;
    }

    function nextLine() {
        lines.push(new TextLine(lineGlyphs, lineWidth));

        lineGlyphs = [];
        lineWidth = 0;

        totalHeight += lineHeight;
    }

    function completeWord() {
        for (let w = 0; w < wordGlyphs.length; w++) {
            const glyph = wordGlyphs[w]!;

            lineGlyphs.push(glyph);
            lineWidth += glyph.xAdvance * fontScale;
        }

        wordGlyphs.length = 0;
        wordWidth = 0;
    }

    function completeWhitespace() {
        for (let w = 0; w < whitespaceGlyphs.length; w++) {
            const glyph = whitespaceGlyphs[w]!;

            lineGlyphs.push(glyph);
            lineWidth += glyph.xAdvance * fontScale;
        }

        discardWhitespace();
    }

    function discardWhitespace() {
        whitespaceGlyphs.length = 0;
        whitespaceWidth = 0;
    }
}

// todo: Improve
const WHITESPACE = ' \t\v\r\n';

/** @category Text */
export function isWhitespace(s: string): boolean {
    return WHITESPACE.indexOf(s) > -1;
}
