import { Rect } from '../../src';
import '../assets/styles.css';
import { usePanAndZoom } from '../interaction';
import { setupWGL } from '../shared';
import { RenderModeApp } from './render-mode';

void main();

async function main() {
    const { driver, canvasEl, diagEl } = await setupWGL();

    const formEl = document.getElementById('form') as HTMLFormElement;
    const inputEl = document.getElementById('count') as HTMLInputElement;
    const switchEl = document.getElementById(
        'switchRenderMode',
    ) as HTMLButtonElement;

    const app = new RenderModeApp(
        new Rect(-600, -400, 1200, 800),
        true,
        canvasEl,
        driver,
    );

    app.addDiagTicker(diagEl);

    switchEl.addEventListener(
        'click',
        () =>
            (app.renderMode =
                app.renderMode === 'always' ? 'onChange' : 'always'),
    );
    formEl.addEventListener('submit', e => {
        e.preventDefault();

        const count = parseInt(inputEl.value);

        if (!isNaN(count) && count) {
            app.addMultiple(count);
        }
    });

    usePanAndZoom(canvasEl, app.camera);

    await app.initializeAndStart();
}
