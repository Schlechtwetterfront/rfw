import { Color } from '../colors';

export * from './bmfont';
export * from './chars';
export * from './font';
export * from './layout';

/** @category Text */
export type WordBreak = 'word' | 'char';

// todo: Justify?
/** @category Text */
export type TextAlignment = 'start' | 'center' | 'end';

/** @category Text */
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

/** @category Text */
export interface TextStyle {
    color: Color;
    size: number;
    lineHeight: LineHeight;
    align: TextAlignment;
    break: WordBreak;
}

/** @category Text */
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
