import { CountedSampler, TimeSampler } from '../util/measuring';

export class RenderDiagnostics {
    readonly actualFrameTime = new TimeSampler('frameTime');
    readonly frameTime = new TimeSampler('fps');
    readonly drawCalls = new CountedSampler('drawCalls');
    readonly triangles = new CountedSampler('tris');
}
