// ─── 世界観ごとの使用スプライト定義 ──────────────────────────
const WORLD_SPRITES = {
  school:   ['person','person','book','book','chair','tree','bird','flower'],
  aquarium: ['fish','fish','fish','jellyfish','coral','jellyfish','fish','fish'],
  park:     ['tree','tree','flower','flower','person','bird','bird','balloon'],
  kitchen:  ['cake','chair','book','person','flower','mushroom','cake','chair'],
  beach:    ['umbrella','fish','bird','person','flower','umbrella','fish','bird'],
  forest:   ['tree','tree','mushroom','mushroom','bird','cat','tree','flower'],
  city:     ['building','building','person','person','car','balloon','tree','bird'],
  space:    ['planet','planet','star','star','rocket','moon','star','planet'],
  festival: ['lantern','lantern','person','person','balloon','balloon','lantern','tree'],
  fantasy:  ['mushroom','tree','star','planet','flower','cat','moon','balloon'],
};

// スプライトのデフォルトサイズ
const SPRITE_BASE_S = {
  person:40, cat:38, bird:28, fish:35, jellyfish:38, tree:45,
  flower:30, mushroom:34, building:55, planet:42, rocket:40,
  lantern:36, cake:38, star:28, moon:36, umbrella:50, coral:36,
  balloon:32, chair:36, book:30,
};

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTE = [
  '#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c',
  '#3498db','#9b59b6','#e91e63','#ff5722','#00bcd4',
  '#8bc34a','#ff9800','#673ab7','#03a9f4','#4caf50',
];

function pickColor(rng) { return PALETTE[Math.floor(rng() * PALETTE.length)]; }
function pickDiffColor(current, rng) {
  let c;
  for (let i = 0; i < 15; i++) {
    c = pickColor(rng);
    if (c !== current) return c;
  }
  return c;
}

const TEX = 1024;

// ─── シーン生成メイン ──────────────────────────────────────────
class SceneGen {
  generate(worldId, diffCount, stageSeed, diffTier = 3, maxSprites = 0) {
    const rng = makeRng(stageSeed);
    const sprites = WORLD_SPRITES[worldId] || WORLD_SPRITES.school;
    const cap = maxSprites > 0 ? maxSprites : 7 + Math.floor(rng() * 3);
    const n = Math.min(sprites.length, cap);

    // 要素をグリッド配置（均一に散らす）
    const elements = [];
    const positions = this._gridPositions(n, rng);
    for (let i = 0; i < n; i++) {
      const type = sprites[i % sprites.length];
      const baseS = SPRITE_BASE_S[type] || 36;
      const sizeVariance = 0.8 + rng() * 0.5;
      elements.push({
        id: i, type,
        x: positions[i].x,
        y: positions[i].y,
        props: {
          s:        Math.round(baseS * sizeVariance),
          scaleX:   rng() > 0.5 ? -1 : 1,
          color:    pickColor(rng),
          color2:   pickColor(rng),
          variant:  Math.floor(rng() * 2),
          expr:     ['happy','sad','surprised','neutral'][Math.floor(rng()*4)],
          count:    2 + Math.floor(rng() * 4),
          rotation: 0,
          visible:  true,
        },
      });
    }

    // 差分適用
    const picked = this._pickUniqueIndices(n, diffCount, rng);
    const diffElements = elements.map(e => ({ ...e, props: { ...e.props } }));
    const rects = [];

    for (const idx of picked) {
      const e    = diffElements[idx];
      const type = this._pickDiffType(rng, diffTier);
      this._applyDiff(e, type, rng);
      rects.push(this._hitRect(e));
    }

    const world    = WORLDS.find(w => w.id === worldId) || WORLDS[0];
    const baseCanvas = this._render(elements,     world);
    const diffCanvas = this._render(diffElements, world);
    return { baseCanvas, diffCanvas, rects };
  }

  _gridPositions(n, rng) {
    // キャンバスを仮想グリッドで分割してランダム配置
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const cellW = TEX / cols, cellH = (TEX * 0.65) / rows;
    const result = [];
    const order = Array.from({ length: cols * rows }, (_, i) => i)
      .sort(() => rng() - 0.5)
      .slice(0, n);
    for (const idx of order) {
      const col = idx % cols, row = Math.floor(idx / cols);
      result.push({
        x: cellW * col + cellW * (0.25 + rng() * 0.5),
        y: TEX * 0.28 + cellH * row + cellH * (0.25 + rng() * 0.5),
      });
    }
    return result;
  }

  _pickUniqueIndices(n, count, rng) {
    const all = Array.from({ length: n }, (_, i) => i);
    const result = [];
    while (result.length < Math.min(count, n)) {
      const i = Math.floor(rng() * all.length);
      result.push(all.splice(i, 1)[0]);
    }
    return result;
  }

  _pickDiffType(rng, diffTier = 3) {
    const tiers = [
      ['color', 'size'],
      ['color', 'size', 'color2', 'flip'],
      ['color', 'size', 'flip', 'variant', 'color2', 'expr', 'count'],
    ];
    const types = tiers[Math.min(diffTier - 1, 2)];
    return types[Math.floor(rng() * types.length)];
  }

  _applyDiff(e, type, rng) {
    const p = e.props;
    switch (type) {
      case 'color':   p.color   = pickDiffColor(p.color, rng);  break;
      case 'color2':  p.color2  = pickDiffColor(p.color2, rng); break;
      case 'size':    p.s       = Math.round(p.s * (rng() > 0.5 ? 0.55 : 1.65)); break;
      case 'flip':    p.scaleX  = p.scaleX === 1 ? -1 : 1;      break;
      case 'variant': p.variant = p.variant === 0 ? 1 : 0;      break;
      case 'remove':  p.visible = false;                         break;
      case 'expr':    {
        const exprs = ['happy','sad','surprised','neutral'];
        p.expr = exprs[(exprs.indexOf(p.expr) + 1 + Math.floor(rng()*3)) % 4];
        break;
      }
      case 'count':   p.count   = Math.max(1, p.count + (rng() > 0.5 ? 2 : -1)); break;
    }
  }

  _hitRect(e) {
    const r = (e.props.s || 36) * 0.65;
    return { x: e.x - r, y: e.y - r, w: r * 2, h: r * 2 };
  }

  _render(elements, world) {
    const cv  = document.createElement('canvas');
    cv.width  = TEX;
    cv.height = TEX;
    const ctx = cv.getContext('2d');

    // 背景
    this._drawBg(ctx, world);

    // 要素描画
    for (const e of elements) {
      if (!e.props.visible) continue;
      drawSprite(ctx, e.type, e.x, e.y, e.props);
    }

    // 地面ライン
    ctx.strokeStyle = world.ground + 'aa';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(0, TEX * 0.92); ctx.lineTo(TEX, TEX * 0.92);
    ctx.stroke();

    return cv;
  }

  _drawBg(ctx, world) {
    // 空
    const skyGrad = ctx.createLinearGradient(0, 0, 0, TEX * 0.6);
    skyGrad.addColorStop(0, world.bg);
    skyGrad.addColorStop(1, world.bg + 'aa');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, TEX, TEX * 0.92);

    // 地面
    ctx.fillStyle = world.ground;
    ctx.fillRect(0, TEX * 0.82, TEX, TEX * 0.18);

    // 装飾（雲や星など）
    if (['school','park','beach','city'].includes(world.id)) {
      this._drawClouds(ctx, world.bg);
    }
    if (['space','fantasy'].includes(world.id)) {
      this._drawStars(ctx);
    }
    if (world.id === 'aquarium') {
      // 水泡
      ctx.fillStyle = '#ffffff22';
      [[80,100],[200,180],[340,120],[460,200]].forEach(([x,y]) => {
        for (let i = 0; i < 5; i++) {
          ctx.beginPath(); ctx.arc(x+i*8, y+i*12, 4+i*2, 0, Math.PI*2); ctx.fill();
        }
      });
    }
  }

  _drawClouds(ctx, baseColor) {
    ctx.fillStyle = '#ffffff88';
    [[80,60,35],[220,40,28],[350,75,40],[460,50,22]].forEach(([x,y,r]) => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x+r*0.6, y+r*0.2, r*0.75, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x-r*0.6, y+r*0.2, r*0.6, 0, Math.PI*2); ctx.fill();
    });
  }

  _drawStars(ctx) {
    ctx.fillStyle = '#ffffffcc';
    for (let i = 0; i < 40; i++) {
      const x = (i * 137.5) % TEX;
      const y = (i * 89.3) % (TEX * 0.7);
      const r = 1 + (i % 3);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    }
  }
}
