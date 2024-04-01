import { Color } from '../colors';

export * from './bmfont';
export * from './chars';
export * from './font';
export * from './layout';

export type WordBreak = 'word' | 'char';

// todo: Justify?
export type TextAlignment = 'start' | 'center' | 'end';

export class LineHeight {
    constructor(
        public height: number,
        public unit?: 'px',
    ) {}

    get(originalLineHeightInPixels: number): number {
        if (this.unit === 'px') {
            return this.height;
        }

        return originalLineHeightInPixels * this.height;
    }
}

export interface TextStyle {
    color: Color;
    size: number;
    lineHeight: LineHeight;
    align: TextAlignment;
    break: WordBreak;
}

export function textStyleOrDefaults(style?: Partial<TextStyle>): TextStyle {
    return {
        color: Color.WHITE,
        size: 16,
        lineHeight: new LineHeight(1),
        align: 'start',
        break: 'word',
        ...style,
    };
}
