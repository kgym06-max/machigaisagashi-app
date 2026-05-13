// Seeded RNG (mulberry32)
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TEX  = 512;
const SHAPES = 12;

class PuzzleGenerator {
  generate(difficulty) {
    const cfg = DIFF_SETTINGS[difficulty];
    const rng = makeRng(Math.floor(Math.random() * 2147483647));

    const base     = this._makeShapes(cfg.shapeScale, rng);
    const { cloned: diff, rects } = this._applyDiffs(base, cfg.diffCount, rng);

    return {
      baseCanvas: this._render(base),
      diffCanvas: this._render(diff),
      rects,
    };
  }

  _makeShapes(scale, rng) {
    const shapes = [];
    const usedColors = [];
    for (let i = 0; i < SHAPES; i++) {
      const minS = TEX * scale * 0.08, maxS = TEX * scale * 0.22;
      const w = rng() * (maxS - minS) + minS;
      const h = rng() * (maxS - minS) + minS;
      const col = this._distinctColor(usedColors, rng);
      usedColors.push(col);
      shapes.push({
        type: Math.floor(rng() * 3),
        x: rng() * (TEX - w) + w / 2,
        y: rng() * (TEX - h) + h / 2,
        w, h, col, visible: true,
      });
    }
    return shapes;
  }

  _applyDiffs(shapes, count, rng) {
    const cloned = shapes.map(s => ({ ...s }));
    const rects  = [];
    const used   = new Set();

    while (used.size < count) {
      const idx = Math.floor(rng() * cloned.length);
      if (used.has(idx)) continue;
      used.add(idx);

      const s      = cloned[idx];
      const change = Math.floor(rng() * 3);
      if      (change === 0) s.col     = this._distinctColor([s.col], rng);
      else if (change === 1) s.visible = false;
      else { const f = rng() * 1.3 + 0.5; s.w *= f; s.h *= f; }

      rects.push({ x: s.x - s.w / 2 - 15, y: s.y - s.h / 2 - 15, w: s.w + 30, h: s.h + 30 });
    }
    return { cloned, rects };
  }

  _render(shapes) {
    const cv  = document.createElement('canvas');
    cv.width  = TEX;
    cv.height = TEX;
    const ctx = cv.getContext('2d');

    ctx.fillStyle = '#f0ece0';
    ctx.fillRect(0, 0, TEX, TEX);

    for (const s of shapes) {
      if (!s.visible) continue;
      ctx.fillStyle = s.col;
      ctx.beginPath();
      if (s.type === 0) {
        ctx.ellipse(s.x, s.y, s.w / 2, s.h / 2, 0, 0, Math.PI * 2);
      } else if (s.type === 1) {
        ctx.rect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h);
      } else {
        ctx.moveTo(s.x,           s.y - s.h / 2);
        ctx.lineTo(s.x + s.w / 2, s.y + s.h / 2);
        ctx.lineTo(s.x - s.w / 2, s.y + s.h / 2);
        ctx.closePath();
      }
      ctx.fill();
    }
    return cv;
  }

  _distinctColor(existing, rng) {
    const parse = c => {
      const m = c.match(/\d+/g);
      return m ? m.map(Number) : [128, 128, 128];
    };
    for (let i = 0; i < 20; i++) {
      const r = Math.round((rng() * 0.8 + 0.1) * 255);
      const g = Math.round((rng() * 0.8 + 0.1) * 255);
      const b = Math.round((rng() * 0.8 + 0.1) * 255);
      const dist = existing.every(e => {
        const [er, eg, eb] = parse(e);
        return Math.abs(r - er) + Math.abs(g - eg) + Math.abs(b - eb) > 100;
      });
      if (dist) return `rgb(${r},${g},${b})`;
    }
    return `rgb(${Math.round(rng()*255)},${Math.round(rng()*255)},${Math.round(rng()*255)})`;
  }
}
