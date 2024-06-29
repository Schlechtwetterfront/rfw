/* eslint-disable no-constant-condition */
import { Rect } from '../../src';
import '../assets/styles.css';
import { usePanAndZoom } from '../interaction';
import { setupWGL } from '../shared';
import { QuadTreeApp } from './quadtree';

void main();

async function main() {
    const { driver, canvasEl, diagEl } = await setupWGL();

    const formEl = document.getElementById('form') as HTMLFormElement;
    const inputEl = document.getElementById('count') as HTMLInputElement;

    const app = new QuadTreeApp(
        new Rect(-600, -400, 1200, 800),
        true,
        canvasEl,
        driver,
    );

    app.addDiagTicker(diagEl);

    formEl.addEventListener('submit', e => {
        e.preventDefault();

        const count = parseInt(inputEl.value);

        if (!isNaN(count) && count) {
            app.addRects(count);
        }
    });

    usePanAndZoom(canvasEl, app.camera);

    await app.initializeAndStart();
}
