export interface Char {
    codePoint: number;
    string: string;
}

export function toChars(s: string): Char[] {
    const charStrings = Array.from(s);
    const charCount = charStrings.length;

    const chars = new Array<Char>(charCount);

    for (let i = 0; i < charCount; i++) {
        const charString = charStrings[i]!;

        chars[i] = {
            codePoint: charString.codePointAt(0)!,
            string: charString,
        };
    }

    return chars;
}
