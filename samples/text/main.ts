/* eslint-disable no-constant-condition */
import '../assets/styles.css';

import FONT_DATA from '../assets/NotoSans-Regular.json';
import FONT_TEX_URL from '../assets/NotoSans-Regular.png';

import FONT_DATA_2 from '../assets/UnifrakturMaguntia-Regular.json';
import FONT_TEX_URL_2 from '../assets/UnifrakturMaguntia-Regular.png';

import { Color } from '../../src/colors';
import { Vec2 } from '../../src/math';
import { TextBatcher } from '../../src/renderers/text';
import { Group } from '../../src/scene';
import { TextObject } from '../../src/scene/text';
import { LineHeight } from '../../src/text';
import { BMFont, createFontFromBMFont } from '../../src/text/bmfont';
import { spawnInGrid } from '../generation';
import { usePanAndZoom } from '../interaction';
import { SampleApp, setupWGL } from '../shared';

export class TextApp extends SampleApp {
    private readonly batches = new TextBatcher({
        maxTextureCount: this.driver.textures.maxTextureCount,
        changeTracker: this.changeTracker,
    });

    override async initialize(): Promise<void> {
        await super.initialize();

        const texts: TextObject[] = [];

        // Text
        if (true) {
            const fontTex = await this.textures.addFromURL(FONT_TEX_URL);

            const font = createFontFromBMFont(FONT_DATA as BMFont, [fontTex]);

            const fontTex2 = await this.textures.addFromURL(FONT_TEX_URL_2);
            const font2 = createFontFromBMFont(FONT_DATA_2 as BMFont, [
                fontTex2,
            ]);

            // Text perf
            if (true) {
                const {
                    widestLine: { width },
                    height,
                } = font.layoutText('0000', { size: 8 });

                let group = new Group();

                spawnInGrid(width, height, 1200, 800, (i, x, y, tt) => {
                    const t = new TextObject({
                        text: `${i}`,
                        font: i % 2 === 0 ? font : font,
                        style: {
                            size: 8,
                            color: new Color(1, 1, 1, i / tt),
                        },
                        x,
                        y,
                    });

                    group.add(t);

                    texts.push(t);

                    if (group.children.length > 800) {
                        group = new Group();
                    }
                });

                this.tickers.add(() => {
                    const index = Math.floor(Math.random() * texts.length);

                    const t = texts[index]!;

                    if (t.style.color?.equalsColorWithAlpha(Color.WHITE)) {
                        const hue =
                            (Math.sqrt(
                                t.transform.position.x ** 2 +
                                    t.transform.position.y ** 2,
                            ) /
                                Math.sqrt(1200 ** 2 + 800 ** 2)) *
                            360;

                        t.style.color?.setHSV(hue, 1, 1);
                        t.transform.scale.x = -1;
                    } else {
                        t.style.color?.set(1, 1, 1);
                        t.transform.scale.x = 1;
                    }

                    this.transforms.change(t);

                    this.batches.change(t);
                });
            }

            {
                const foxText =
                    '0 - The quick brown fox jumps over the lazy dog';

                const t1 = new TextObject({
                    text: '1' + foxText.substring(1),
                    font,
                    x: 8,
                    y: 8,
                });

                const t2 = new TextObject({
                    text: '2' + foxText.substring(1),
                    font: font2,
                    style: {
                        size: 32,
                    },
                    x: 24,
                    y: t1.transform.position.y + t1.layout.height + 8,
                });

                const t3 = new TextObject({
                    text: '3' + foxText.substring(1),
                    font,
                    style: {
                        size: 64,
                    },
                    x: 40,
                    y: t2.transform.position.y + t2.layout.height + 16,
                });

                const t4 = new TextObject({
                    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do\neiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim\nad minim veniam, quis nostrud exercitation ullamco laboris nisi ut\naliquip ex ea commodo consequat. Duis aute irure dolor in\nreprehenderit in voluptate velit esse cillum dolore eu fugiat nulla\npariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa\nqui officia deserunt mollit anim id est laborum.',
                    font: font2,
                    style: { size: 24, lineHeight: new LineHeight(1.6) },
                    x: 40,
                    y: t3.transform.position.y + t3.layout.height + 24,
                });

                texts.push(
                    t1,
                    t2,
                    t3,
                    t4,
                    new TextObject({
                        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                        font,
                        style: { size: 24, align: 'center' },
                        x: 320,
                        y: t4.transform.position.y + t4.layout.height + 160,
                        width: 800,
                        anchor: new Vec2(0.5, 0.5),
                    }),
                );
            }

            texts.forEach(t => {
                this.batches.add(t);
                this.transforms.change(t);
            });
        }
    }

    override render(): void {
        super.render();

        this.renderers.text.render(this.batches.finalize(), this.camera);
    }
}

void main();

async function main() {
    const { driver, canvasEl, diagEl } = await setupWGL();

    const app = new TextApp(canvasEl, driver);

    app.addDiagTicker(diagEl);

    usePanAndZoom(canvasEl, app.camera);

    await app.initializeAndStart();
}
