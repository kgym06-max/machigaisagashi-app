// ─── 世界観ごとの使用スプライト定義（多様化）─────────────────
const WORLD_SPRITES = {
  school:   ['person','person','adult','book','book','chair','tree','bird','flower','person','book','chair','flower','bird','hat','cup','plate','sun','balloon','person'],
  aquarium: ['fish','fish','fish','jellyfish','coral','jellyfish','fish','fish','coral','jellyfish','fish','coral','jellyfish','fish','star','fish','coral'],
  park:     ['tree','tree','flower','flower','person','bird','bird','balloon','flower','tree','person','flower','bird','dog','cat','rabbit','sun','hat','person','flower'],
  kitchen:  ['cake','chair','book','person','plate','cup','cake','chair','plate','cup','cake','mushroom','flower','person','adult','cup','plate','cake','book'],
  beach:    ['umbrella','fish','bird','person','flower','umbrella','fish','bird','umbrella','flower','fish','person','umbrella','bird','sun','hat','cup','plate','balloon'],
  forest:   ['tree','tree','mushroom','mushroom','bird','cat','tree','flower','mushroom','tree','bird','flower','cat','mushroom','rabbit','dog','flower','tree'],
  city:     ['building','building','person','person','balloon','tree','bird','flower','building','person','balloon','tree','building','bird','adult','dog','cup','hat'],
  space:    ['planet','planet','star','star','rocket','moon','star','planet','star','rocket','moon','planet','star','rocket','star','planet','moon'],
  festival: ['lantern','lantern','person','person','balloon','balloon','lantern','tree','person','lantern','balloon','flower','lantern','person','hat','cup','plate','adult','cake'],
  fantasy:  ['mushroom','tree','star','planet','flower','cat','moon','balloon','mushroom','star','flower','cat','tree','moon','rabbit','sun','star'],
};

// スプライトのデフォルトサイズ
const SPRITE_BASE_S = {
  person:48, adult:56, cat:42, dog:46, rabbit:42, bird:32,
  fish:38, jellyfish:42, tree:54, flower:34, mushroom:38,
  building:64, planet:46, rocket:44, lantern:40, cake:42,
  star:30, moon:40, umbrella:54, coral:40, balloon:36,
  chair:40, book:34, plate:42, cup:32, sun:46, hat:34,
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

// intensity 1.0=パレット差し替え（明らか）, 0.1=RGB微小シフト（微妙）
function pickDiffColor(current, rng, intensity = 1.0) {
  if (intensity >= 0.7) {
    let c;
    for (let i = 0; i < 15; i++) {
      c = pickColor(rng);
      if (c !== current) return c;
    }
    return c;
  }
  return shiftColor(current, intensity, rng);
}

function shiftColor(hex, intensity, rng) {
  if (!hex || hex.length < 7) return hex;
  let r = parseInt(hex.slice(1, 3), 16) || 0;
  let g = parseInt(hex.slice(3, 5), 16) || 0;
  let b = parseInt(hex.slice(5, 7), 16) || 0;
  // intensity 0.7: ±90, 0.4: ±55, 0.15: ±28
  const range = Math.round(20 + intensity * 100);
  // 主に1チャンネルだけシフト（変化を目立たせる方向に）
  const ch   = Math.floor(rng() * 3);
  const sign = rng() > 0.5 ? 1 : -1;
  const delta = sign * (range * 0.6 + rng() * range * 0.4);
  if      (ch === 0) r = Math.max(0, Math.min(255, Math.round(r + delta)));
  else if (ch === 1) g = Math.max(0, Math.min(255, Math.round(g + delta)));
  else               b = Math.max(0, Math.min(255, Math.round(b + delta)));
  // 他チャンネルも少し
  const minor = Math.round(range * 0.2);
  r = Math.max(0, Math.min(255, r + Math.round((rng() - 0.5) * 2 * minor)));
  g = Math.max(0, Math.min(255, g + Math.round((rng() - 0.5) * 2 * minor)));
  b = Math.max(0, Math.min(255, b + Math.round((rng() - 0.5) * 2 * minor)));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

const TEX = 1024;

// ─── シーン生成メイン ──────────────────────────────────────────
class SceneGen {
  generate(worldId, diffCount, stageSeed, diffTier = 3, maxSprites = 0, excludeTypes = [], diffIntensity = 1.0) {
    const rng = makeRng(stageSeed);
    const sprites = WORLD_SPRITES[worldId] || WORLD_SPRITES.school;
    const cap = maxSprites > 0 ? maxSprites : 14 + Math.floor(rng() * 6);
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
      const type = this._pickDiffType(rng, diffTier, excludeTypes, diffIntensity);
      this._applyDiff(e, type, rng, diffIntensity);
      rects.push(this._hitRect(e));
    }

    const world    = WORLDS.find(w => w.id === worldId) || WORLDS[0];
    // 背景は両パネル同一にする（同じシードで描画）
    const bgSeed = stageSeed;
    const baseCanvas = this._render(elements,     world, bgSeed);
    const diffCanvas = this._render(diffElements, world, bgSeed);
    return { baseCanvas, diffCanvas, rects };
  }

  _gridPositions(n, rng) {
    // 適応的なグリッド：スプライト数に応じて列数を調整
    const cols = n <= 4 ? 2 : n <= 9 ? 3 : n <= 16 ? 4 : 5;
    const rows = Math.ceil(n / cols);
    const cellW = TEX / cols;
    // 上部に余白（背景）、下部いっぱいまで使う
    const topMargin = TEX * 0.22;
    const useH     = TEX * 0.66;
    const cellH    = useH / rows;
    const result = [];
    const order = Array.from({ length: cols * rows }, (_, i) => i)
      .sort(() => rng() - 0.5)
      .slice(0, n);
    for (const idx of order) {
      const col = idx % cols, row = Math.floor(idx / cols);
      result.push({
        x: cellW * col + cellW * (0.20 + rng() * 0.60),
        y: topMargin + cellH * row + cellH * (0.30 + rng() * 0.40),
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

  _pickDiffType(rng, diffTier = 3, excludeTypes = [], intensity = 1.0) {
    const tiers = [
      ['color', 'size'],
      ['color', 'size', 'color2', 'flip'],
      ['color', 'size', 'flip', 'variant', 'color2', 'expr', 'count'],
    ];
    let base = tiers[Math.min(diffTier - 1, 2)];
    // 低 intensity の時は二択型（flip/variant/expr）を除外
    // ※常に「明らかな差」になってしまうため
    if (intensity < 0.5) {
      base = base.filter(t => !['flip', 'variant', 'expr'].includes(t));
    }
    const types = base.filter(t => !excludeTypes.includes(t));
    return (types.length ? types : base)[Math.floor(rng() * (types.length || base.length))];
  }

  _hitRect(e) {
    const r = (e.props.s || 36) * 1.1;
    return { x: e.x - r, y: e.y - r, w: r * 2, h: r * 2 };
  }

  _applyDiff(e, type, rng, intensity = 1.0) {
    const p = e.props;
    switch (type) {
      case 'color':   p.color   = pickDiffColor(p.color,  rng, intensity); break;
      case 'color2':  p.color2  = pickDiffColor(p.color2, rng, intensity); break;
      case 'size': {
        // intensity 1.0: 0.45x or 1.7x（大）
        // intensity 0.5: 0.78x or 1.32x（中）
        // intensity 0.15: 0.93x or 1.10x（小）
        const range = 0.55 * intensity;
        const factor = rng() > 0.5 ? (1 - range * 0.95) : (1 + range * 1.25);
        p.s = Math.max(10, Math.round(p.s * factor));
        break;
      }
      case 'flip':    p.scaleX  = p.scaleX === 1 ? -1 : 1; break;
      case 'variant': p.variant = p.variant === 0 ? 1 : 0; break;
      case 'remove':  p.visible = false; break;
      case 'expr':    {
        const exprs = ['happy','sad','surprised','neutral'];
        p.expr = exprs[(exprs.indexOf(p.expr) + 1 + Math.floor(rng()*3)) % 4];
        break;
      }
      case 'count': {
        // intensity 1.0: ±2〜3, intensity 0.15: ±1
        const delta = Math.max(1, Math.round(2.5 * intensity));
        p.count = Math.max(1, p.count + (rng() > 0.5 ? delta : -delta));
        break;
      }
    }
  }


  _render(elements, world, bgSeed = 0) {
    const cv  = document.createElement('canvas');
    cv.width  = TEX;
    cv.height = TEX;
    const ctx = cv.getContext('2d');

    // 背景（シード固定で両パネル一致）
    this._drawBg(ctx, world, makeRng(bgSeed));

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

  _drawBg(ctx, world, bgRng) {
    const rng = bgRng || (() => Math.random());

    // 空（シードで色をわずかに変化）
    const skyGrad = ctx.createLinearGradient(0, 0, 0, TEX * 0.6);
    skyGrad.addColorStop(0, world.bg);
    skyGrad.addColorStop(1, world.bg + 'aa');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, TEX, TEX * 0.92);

    // 地面（バリエーションあり）
    ctx.fillStyle = world.ground;
    ctx.fillRect(0, TEX * 0.82, TEX, TEX * 0.18);

    // 地面に芝の点描
    ctx.fillStyle = world.ground;
    for (let i = 0; i < 30; i++) {
      const x = rng() * TEX;
      const y = TEX * 0.82 + rng() * (TEX * 0.18);
      ctx.fillRect(x, y, 6 + rng() * 8, 2);
    }

    // 装飾（世界別）
    if (['school','park','beach','city','kitchen'].includes(world.id)) {
      this._drawClouds(ctx, rng);
    }
    if (['space','fantasy'].includes(world.id)) {
      this._drawStars(ctx, rng);
    }
    if (world.id === 'aquarium') {
      this._drawBubbles(ctx, rng);
    }
    if (['forest','festival'].includes(world.id)) {
      this._drawSparkles(ctx, rng);
    }
    if (world.id === 'kitchen') {
      // タイル風
      ctx.strokeStyle = '#0000001a';
      ctx.lineWidth = 1;
      for (let y = TEX * 0.85; y < TEX; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TEX, y); ctx.stroke();
      }
    }
  }

  _drawClouds(ctx, rng) {
    ctx.fillStyle = '#ffffffaa';
    const count = 3 + Math.floor(rng() * 4);
    for (let i = 0; i < count; i++) {
      const x = rng() * TEX;
      const y = 40 + rng() * 200;
      const r = 30 + rng() * 30;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + r*0.7, y + r*0.2, r*0.75, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x - r*0.6, y + r*0.2, r*0.6, 0, Math.PI*2); ctx.fill();
    }
  }

  _drawStars(ctx, rng) {
    const count = 50 + Math.floor(rng() * 30);
    for (let i = 0; i < count; i++) {
      const x = rng() * TEX;
      const y = rng() * (TEX * 0.75);
      const r = 1 + Math.floor(rng() * 3);
      ctx.fillStyle = rng() > 0.7 ? '#ffeeaa' : '#ffffffcc';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    }
  }

  _drawBubbles(ctx, rng) {
    ctx.fillStyle = '#ffffff33';
    const count = 6 + Math.floor(rng() * 6);
    for (let i = 0; i < count; i++) {
      const x = rng() * TEX;
      const y = rng() * (TEX * 0.8);
      const r = 4 + rng() * 14;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    }
  }

  _drawSparkles(ctx, rng) {
    const count = 20 + Math.floor(rng() * 15);
    for (let i = 0; i < count; i++) {
      const x = rng() * TEX;
      const y = rng() * (TEX * 0.8);
      const s = 3 + rng() * 4;
      ctx.fillStyle = '#fff7c044';
      ctx.beginPath();
      ctx.moveTo(x, y - s); ctx.lineTo(x + s*0.4, y - s*0.4);
      ctx.lineTo(x + s, y); ctx.lineTo(x + s*0.4, y + s*0.4);
      ctx.lineTo(x, y + s); ctx.lineTo(x - s*0.4, y + s*0.4);
      ctx.lineTo(x - s, y); ctx.lineTo(x - s*0.4, y - s*0.4);
      ctx.closePath(); ctx.fill();
    }
  }
}
