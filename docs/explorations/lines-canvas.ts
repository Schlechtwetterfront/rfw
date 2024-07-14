import { vec, Vec2, Vec2Like } from '../../src';

const NORMAL_LENGTH = 100;

export function draw(
    c: CanvasRenderingContext2D,
    points: [Vec2, Vec2, Vec2, Vec2],
    position: Vec2,
    alignment: number,
    thickness: number,
) {
    const beforeStart = points[0];
    const start = points[1];
    const end = points[2];
    const afterEnd = points[3];

    const pointA = beforeStart
        .clone()
        .multiply(1 - position.x)
        .addVec(start.clone().multiply(position.x));

    const pointB = start
        .clone()
        .multiply(1 - position.x)
        .addVec(end.clone().multiply(position.x));

    const pointC = end
        .clone()
        .multiply(1 - position.x)
        .addVec(afterEnd.clone().multiply(position.x));

    const ab = pointB.clone().subtractVec(pointA);
    const abNormalized = ab.clone().normalize();

    const baNormal = vec(-abNormalized.y, abNormalized.x).normalize();

    const miterTangent = pointC
        .clone()
        .subtractVec(pointB)
        .normalize()
        .addVec(abNormalized)
        .normalize();

    const miterNormal = vec(-miterTangent.y, miterTangent.x);

    const alignmentRatio = position.y < 0 ? (1 - alignment) * 2 : alignment * 2;

    const normalsAngle = miterNormal.dotVec(baNormal);

    const miter = miterNormal
        .clone()
        .multiply(thickness)
        .multiply(alignmentRatio)
        .divide(normalsAngle);

    const vertexMiter = miter.clone().multiply(position.y);

    const pos = pointB.clone().addVec(vertexMiter);

    const distanceAlongLine = 1 * position.x;

    const ba = pointA.clone().subtractVec(pointB);

    const projectedPos = vertexMiter.clone().projectOnVec(ba);

    const axisAlignedProjectedPos = projectedPos
        .clone()
        .rotateRadians(-ba.radians);

    const adjustedDistanceAlongLine =
        (ba.length + axisAlignedProjectedPos.x) / ba.length;

    c.clearRect(0, 0, 688, 344);

    c.textBaseline = 'middle';

    // Lines
    c.strokeStyle = 'black';

    line(c, start, end);

    c.setLineDash([5, 5]);

    line(c, beforeStart, start);
    line(c, end, afterEnd);

    c.setLineDash([]);

    // Original points
    c.fillStyle = 'black';

    point(c, beforeStart, 4);
    point(c, start, 4);
    point(c, end, 4);
    point(c, afterEnd, 4);

    // Original point labels
    c.font = '14px sans-serif';
    c.textAlign = 'start';

    label(c, beforeStart, `a_beforeStart (${beforeStart.x},${beforeStart.y})`);
    label(c, start, `a_start (${start.x},${start.y})`);
    label(c, end, `a_end (${end.x},${end.y})`);
    label(c, afterEnd, `a_afterEnd (${afterEnd.x},${afterEnd.y})`);

    // A, B, C
    c.lineWidth = 2;
    c.strokeStyle = 'red';

    circle(c, pointA, 6);
    circle(c, pointB, 6);
    circle(c, pointC, 6);

    // A, B, C labels
    c.fillStyle = 'red';

    label(c, pointA, `pointA (${pointA.x},${pointA.y})`, 12, -8);
    label(c, pointB, `pointB (${pointB.x},${pointB.y})`, 12, -8);
    label(c, pointC, `pointC (${pointC.x},${pointC.y})`, 12, -8);

    // Normals
    c.lineWidth = 1;
    c.strokeStyle = 'green';
    c.setLineDash([2, 2]);
    c.fillStyle = 'green';
    c.textAlign = 'center';

    const baNormalStart = pointA
        .clone()
        .addVec(pointB.clone().subtractVec(pointA).multiply(0.5));

    const baNormalEnd = baNormalStart
        .clone()
        .addVec(baNormal.clone().multiply(NORMAL_LENGTH));

    line(c, baNormalStart, baNormalEnd);
    label(c, baNormalEnd, 'baNormal', 0, -8);

    const miterNormalStart = pointB.clone();

    const miterNormalEnd = miterNormalStart
        .clone()
        .addVec(miterNormal.clone().multiply(NORMAL_LENGTH));

    line(c, miterNormalStart, miterNormalEnd);
    label(c, miterNormalEnd, 'miterNormal', 0, -8);

    // Miter
    c.strokeStyle = 'purple';
    c.setLineDash([]);
    c.textAlign = 'end';
    c.fillStyle = 'purple';

    const miterStart = pointB.clone();
    const miterEnd = miterStart.clone().addVec(miter);

    line(c, miterStart, miterEnd);
    label(c, miterEnd, 'miter', 0, 0);

    // Pos
    c.fillStyle = 'blue';
    c.textAlign = 'start';
    c.textBaseline = 'middle';

    point(c, pos, 4);
    label(c, pos, `pos (${pos.x.toFixed(0)},${pos.y.toFixed(0)})`, 8, -8);

    // Distance along line
    c.strokeStyle = 'orange';
    c.fillStyle = 'orange';
    c.textBaseline = 'bottom';

    line(c, pos, pointB.clone().addVec(projectedPos));

    label(c, vec(0, 330), `distanceAlongLine: ${distanceAlongLine}`, 0, 0);
    label(
        c,
        vec(0, 344),
        `distanceAlongLine (adjusted): ${adjustedDistanceAlongLine.toFixed(2)} (point: ${projectedPos.x.toFixed(1)}, ${projectedPos.y.toFixed(1)})`,
        0,
        0,
    );
}

function line(c: CanvasRenderingContext2D, from: Vec2Like, to: Vec2Like) {
    c.beginPath();

    c.moveTo(from.x, from.y);
    c.lineTo(to.x, to.y);

    c.stroke();
}

function point(c: CanvasRenderingContext2D, pos: Vec2Like, radius: number) {
    c.beginPath();

    c.ellipse(pos.x, pos.y, radius, radius, 0, 0, Math.PI * 2);

    c.fill();
}

function circle(c: CanvasRenderingContext2D, pos: Vec2Like, radius: number) {
    c.beginPath();

    c.ellipse(pos.x, pos.y, radius, radius, 0, 0, Math.PI * 2);

    c.stroke();
}

function label(
    c: CanvasRenderingContext2D,
    pos: Vec2Like,
    text: string,
    ox = 12,
    oy = 8,
) {
    c.fillText(text, pos.x + ox, pos.y - oy);
}
