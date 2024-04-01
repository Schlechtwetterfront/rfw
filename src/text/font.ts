import { LineHeight, TextStyle, textStyleOrDefaults } from '.';
import { Vec2 } from '../math';
import { Rect } from '../math/shapes';
import { TextureHandle } from '../rendering/textures';
import { TextLayout, TextLayoutOptions, layoutText } from './layout';

export class Glyph {
    constructor(
        public readonly codePoint: number,
        public readonly string: string,
        public readonly rect: Rect,
        public readonly xAdvance: number,
        public readonly page: number = 0,
        public readonly offset: Vec2 = Vec2.ZERO,
    ) {}
}

export class Font {
    private readonly _glyphs: Map<number, Glyph>;

    get pageCount() {
        return this.pages.length;
    }

    constructor(
        public readonly name: string,
        public readonly originalSize: number,
        public readonly originalLineHeight: number,
        public readonly originalBaseLine: number,
        public readonly pageDimensions: Vec2,
        public readonly pages: readonly TextureHandle[],
        public readonly distanceFieldRange: number,
        glyphs: Glyph[],
    ) {
        const map = new Map<number, Glyph>();

        const glyphCount = glyphs.length;

        for (let i = 0; i < glyphCount; i++) {
            const glyph = glyphs[i]!;

            map.set(glyph.codePoint, glyph);
        }

        this._glyphs = map;
    }

    getGlyph(codePoint: number): Glyph | undefined {
        return this._glyphs.get(codePoint);
    }

    getGlyphs(s: string): Glyph[] {
        const charStrings = Array.from(s);
        const charCount = charStrings.length;

        const chars = new Array<Glyph>(charCount);

        for (let i = 0; i < charCount; i++) {
            const charString = charStrings[i]!;

            const glyph = this._glyphs.get(charString.codePointAt(0)!);

            if (!glyph) {
                continue;
            }

            chars[i] = glyph;
        }

        return chars;
    }

    getFontScale(fontSize: number): number {
        return fontSize / this.originalSize;
    }

    getLineHeight(fontSize: number, lineHeight?: LineHeight): number {
        if (lineHeight?.unit === 'px') {
            return lineHeight.height;
        }

        const ratio = this.originalLineHeight / this.originalSize;

        return ratio * fontSize * (lineHeight?.unit ?? 1);
    }

    getScreenPixelRange(fontSize: number, worldScale: number): number {
        return (
            (fontSize / this.originalSize) *
            this.distanceFieldRange *
            worldScale
        );
    }

    layoutText(
        text: string,
        style?: Partial<TextStyle>,
        options?: TextLayoutOptions,
    ): TextLayout {
        return layoutText(text, textStyleOrDefaults(style), this, options);
    }
}
