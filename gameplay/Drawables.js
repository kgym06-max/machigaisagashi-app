// 可愛い手描き風イラスト描画関数集
// 黒い太い輪郭線 + ふくよかな体型 + 大きな目 + ピンクほっぺ
// すべて ctx.save()/restore() で囲み、(0,0) 中心で描く
// p.s = 基準サイズ(px), p.color = メインカラー, p.scaleX = 1 or -1（反転）

const OUTLINE = '#1a1a1a';

function _stroke(ctx, w) {
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth   = w;
  ctx.lineJoin    = 'round';
  ctx.lineCap     = 'round';
  ctx.stroke();
}

function _fillStroke(ctx, fillColor, lw) {
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth   = lw;
  ctx.lineJoin    = 'round';
  ctx.stroke();
}

function _cheeks(ctx, cx, cy, r) {
  ctx.fillStyle = '#ff9eb5';
  ctx.beginPath(); ctx.arc(cx - r*0.55, cy + r*0.15, r*0.14, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r*0.55, cy + r*0.15, r*0.14, 0, Math.PI*2); ctx.fill();
}

function _eyes(ctx, cx, cy, r, expr) {
  ctx.fillStyle = OUTLINE;
  const ey = cy - r*0.05;
  if (expr === 'surprised') {
    ctx.beginPath(); ctx.arc(cx - r*0.30, ey, r*0.16, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r*0.30, ey, r*0.16, 0, Math.PI*2); ctx.fill();
  } else if (expr === 'sad') {
    ctx.lineWidth = r*0.08;
    ctx.strokeStyle = OUTLINE;
    ctx.beginPath(); ctx.arc(cx - r*0.30, ey + r*0.05, r*0.13, Math.PI*1.2, Math.PI*1.8); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + r*0.30, ey + r*0.05, r*0.13, Math.PI*1.2, Math.PI*1.8); ctx.stroke();
  } else {
    // 普通の目（白目+黒目+ハイライト）
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(cx - r*0.30, ey, r*0.13, r*0.16, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + r*0.30, ey, r*0.13, r*0.16, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = r*0.05;
    ctx.beginPath(); ctx.ellipse(cx - r*0.30, ey, r*0.13, r*0.16, 0, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx + r*0.30, ey, r*0.13, r*0.16, 0, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = OUTLINE;
    ctx.beginPath(); ctx.arc(cx - r*0.28, ey + r*0.03, r*0.08, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r*0.32, ey + r*0.03, r*0.08, 0, Math.PI*2); ctx.fill();
    // ハイライト
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - r*0.26, ey - r*0.01, r*0.025, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r*0.34, ey - r*0.01, r*0.025, 0, Math.PI*2); ctx.fill();
  }

  // 口
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth   = r*0.08;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  if      (expr === 'happy')     ctx.arc(cx, cy + r*0.32, r*0.18, 0.2, Math.PI - 0.2);
  else if (expr === 'sad')       ctx.arc(cx, cy + r*0.55, r*0.18, Math.PI + 0.2, -0.2);
  else if (expr === 'surprised') { ctx.fillStyle = OUTLINE; ctx.arc(cx, cy + r*0.40, r*0.10, 0, Math.PI*2); ctx.fill(); }
  else                           { ctx.moveTo(cx - r*0.15, cy + r*0.35); ctx.lineTo(cx + r*0.15, cy + r*0.35); }
  ctx.stroke();
}

const D = {
  // ─── 人物（子ども）─────────────────────────────────────────
  person(ctx, p) {
    const s    = p.s     || 50;
    const body = p.color || '#ff5757';
    const pant = p.color2 || '#3a6fb5';
    const skin = '#ffd9b5';
    const hair = p.variant === 0 ? '#3d2817' : '#5a3820';
    const expr = p.expr   || 'happy';

    // 脚
    ctx.fillStyle = pant;
    ctx.beginPath(); ctx.roundRect(-s*0.20, s*0.05, s*0.16, s*0.34, s*0.05);
    _fillStroke(ctx, pant, s*0.06);
    ctx.beginPath(); ctx.roundRect( s*0.04, s*0.05, s*0.16, s*0.34, s*0.05);
    _fillStroke(ctx, pant, s*0.06);
    // 靴
    ctx.fillStyle = '#3a2817';
    ctx.beginPath(); ctx.ellipse(-s*0.12, s*0.42, s*0.11, s*0.06, 0, 0, Math.PI*2);
    _fillStroke(ctx, '#3a2817', s*0.05);
    ctx.beginPath(); ctx.ellipse( s*0.12, s*0.42, s*0.11, s*0.06, 0, 0, Math.PI*2);
    _fillStroke(ctx, '#3a2817', s*0.05);

    // 体（シャツ）
    ctx.beginPath();
    ctx.moveTo(-s*0.30, -s*0.05);
    ctx.bezierCurveTo(-s*0.30, s*0.10, -s*0.25, s*0.20, -s*0.22, s*0.18);
    ctx.lineTo(s*0.22, s*0.18);
    ctx.bezierCurveTo(s*0.25, s*0.20, s*0.30, s*0.10, s*0.30, -s*0.05);
    ctx.bezierCurveTo(s*0.25, -s*0.15, s*0.15, -s*0.18, 0, -s*0.18);
    ctx.bezierCurveTo(-s*0.15, -s*0.18, -s*0.25, -s*0.15, -s*0.30, -s*0.05);
    ctx.closePath();
    _fillStroke(ctx, body, s*0.06);

    // 腕
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.ellipse(-s*0.30, s*0.05, s*0.07, s*0.16, -0.2, 0, Math.PI*2);
    _fillStroke(ctx, skin, s*0.05);
    ctx.beginPath(); ctx.ellipse( s*0.30, s*0.05, s*0.07, s*0.16,  0.2, 0, Math.PI*2);
    _fillStroke(ctx, skin, s*0.05);

    // 頭
    ctx.beginPath();
    ctx.arc(0, -s*0.42, s*0.26, 0, Math.PI*2);
    _fillStroke(ctx, skin, s*0.06);

    // 髪
    ctx.beginPath();
    ctx.arc(0, -s*0.45, s*0.27, Math.PI + 0.3, -0.3);
    ctx.lineTo(s*0.22, -s*0.38);
    ctx.lineTo(s*0.10, -s*0.46);
    ctx.lineTo(s*0.00, -s*0.40);
    ctx.lineTo(-s*0.10, -s*0.46);
    ctx.lineTo(-s*0.22, -s*0.38);
    ctx.closePath();
    _fillStroke(ctx, hair, s*0.05);

    // ほっぺと顔
    _cheeks(ctx, 0, -s*0.42, s*0.26);
    _eyes(ctx, 0, -s*0.42, s*0.26, expr);
  },

  // ─── 大人（背が高い）───────────────────────────────────────
  adult(ctx, p) {
    const s    = p.s     || 60;
    const body = p.color || '#5b95d6';
    const pant = p.color2 || '#3a3a4a';
    const skin = '#ffd9b5';
    const hair = p.variant === 0 ? '#2d1b10' : '#704830';
    const expr = p.expr || 'happy';

    // 脚
    ctx.beginPath(); ctx.roundRect(-s*0.18, s*0.05, s*0.14, s*0.40, s*0.05);
    _fillStroke(ctx, pant, s*0.05);
    ctx.beginPath(); ctx.roundRect( s*0.04, s*0.05, s*0.14, s*0.40, s*0.05);
    _fillStroke(ctx, pant, s*0.05);
    // 靴
    ctx.beginPath(); ctx.ellipse(-s*0.11, s*0.48, s*0.10, s*0.05, 0, 0, Math.PI*2);
    _fillStroke(ctx, '#1a1a1a', s*0.04);
    ctx.beginPath(); ctx.ellipse( s*0.11, s*0.48, s*0.10, s*0.05, 0, 0, Math.PI*2);
    _fillStroke(ctx, '#1a1a1a', s*0.04);
    // 体
    ctx.beginPath();
    ctx.moveTo(-s*0.28, -s*0.10);
    ctx.bezierCurveTo(-s*0.30, s*0.10, -s*0.25, s*0.20, -s*0.22, s*0.18);
    ctx.lineTo(s*0.22, s*0.18);
    ctx.bezierCurveTo(s*0.25, s*0.20, s*0.30, s*0.10, s*0.28, -s*0.10);
    ctx.bezierCurveTo(s*0.20, -s*0.20, -s*0.20, -s*0.20, -s*0.28, -s*0.10);
    ctx.closePath();
    _fillStroke(ctx, body, s*0.05);
    // 腕
    ctx.beginPath(); ctx.ellipse(-s*0.30, s*0.05, s*0.07, s*0.18, -0.15, 0, Math.PI*2);
    _fillStroke(ctx, skin, s*0.04);
    ctx.beginPath(); ctx.ellipse( s*0.30, s*0.05, s*0.07, s*0.18,  0.15, 0, Math.PI*2);
    _fillStroke(ctx, skin, s*0.04);
    // 頭
    ctx.beginPath(); ctx.arc(0, -s*0.32, s*0.20, 0, Math.PI*2);
    _fillStroke(ctx, skin, s*0.05);
    // 髪
    ctx.beginPath();
    ctx.arc(0, -s*0.35, s*0.21, Math.PI + 0.2, -0.2);
    ctx.closePath();
    _fillStroke(ctx, hair, s*0.04);
    _cheeks(ctx, 0, -s*0.32, s*0.20);
    _eyes(ctx, 0, -s*0.32, s*0.20, expr);
  },

  // ─── 犬 ───────────────────────────────────────────────────
  dog(ctx, p) {
    const s = p.s || 42;
    const c = p.color || '#d9a368';
    const expr = p.expr || 'happy';
    // 体
    ctx.beginPath();
    ctx.ellipse(0, s*0.18, s*0.35, s*0.25, 0, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.06);
    // 脚
    [-s*0.22, s*0.22].forEach(x => {
      ctx.beginPath(); ctx.roundRect(x - s*0.06, s*0.30, s*0.12, s*0.18, s*0.04);
      _fillStroke(ctx, c, s*0.05);
    });
    // 尻尾
    ctx.beginPath();
    ctx.moveTo(s*0.30, s*0.10);
    ctx.quadraticCurveTo(s*0.50, -s*0.05, s*0.55, -s*0.20);
    ctx.lineWidth = s*0.10; _stroke(ctx, s*0.10);
    // 頭
    ctx.beginPath(); ctx.arc(-s*0.25, -s*0.15, s*0.25, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.06);
    // 耳（垂れ）
    ctx.beginPath();
    ctx.ellipse(-s*0.42, -s*0.10, s*0.10, s*0.18, -0.4, 0, Math.PI*2);
    _fillStroke(ctx, '#a07040', s*0.05);
    ctx.beginPath();
    ctx.ellipse(-s*0.10, -s*0.10, s*0.10, s*0.18, 0.4, 0, Math.PI*2);
    _fillStroke(ctx, '#a07040', s*0.05);
    // 鼻
    ctx.beginPath(); ctx.ellipse(-s*0.32, -s*0.05, s*0.05, s*0.04, 0, 0, Math.PI*2);
    _fillStroke(ctx, OUTLINE, s*0.03);
    // 目
    ctx.fillStyle = OUTLINE;
    ctx.beginPath(); ctx.arc(-s*0.32, -s*0.20, s*0.035, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(-s*0.18, -s*0.20, s*0.035, 0, Math.PI*2); ctx.fill();
    // 口
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = s*0.04;
    ctx.beginPath();
    if (expr === 'happy') {
      ctx.moveTo(-s*0.32, -s*0.02);
      ctx.quadraticCurveTo(-s*0.25, s*0.06, -s*0.18, -s*0.02);
    } else {
      ctx.moveTo(-s*0.32, 0); ctx.lineTo(-s*0.18, 0);
    }
    ctx.stroke();
  },

  // ─── 猫 ───────────────────────────────────────────────────
  cat(ctx, p) {
    const s    = p.s || 40;
    const c    = p.color || '#f5cba7';
    const expr = p.expr || 'happy';
    // 体
    ctx.beginPath(); ctx.ellipse(0, s*0.15, s*0.30, s*0.30, 0, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.06);
    // 頭
    ctx.beginPath(); ctx.arc(0, -s*0.28, s*0.30, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.06);
    // 耳
    ctx.beginPath();
    ctx.moveTo(-s*0.27, -s*0.48); ctx.lineTo(-s*0.10, -s*0.72); ctx.lineTo(-s*0.05, -s*0.48);
    ctx.closePath(); _fillStroke(ctx, c, s*0.05);
    ctx.beginPath();
    ctx.moveTo(s*0.27, -s*0.48); ctx.lineTo(s*0.10, -s*0.72); ctx.lineTo(s*0.05, -s*0.48);
    ctx.closePath(); _fillStroke(ctx, c, s*0.05);
    // 耳内側
    ctx.fillStyle = '#ff9eb5';
    ctx.beginPath();
    ctx.moveTo(-s*0.20, -s*0.52); ctx.lineTo(-s*0.12, -s*0.65); ctx.lineTo(-s*0.08, -s*0.52);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s*0.20, -s*0.52); ctx.lineTo(s*0.12, -s*0.65); ctx.lineTo(s*0.08, -s*0.52);
    ctx.closePath(); ctx.fill();
    // 尻尾
    ctx.beginPath();
    ctx.moveTo(s*0.28, s*0.30);
    ctx.bezierCurveTo(s*0.65, s*0.40, s*0.75, s*0.10, s*0.55, -s*0.10);
    ctx.lineWidth = s*0.10; _stroke(ctx, s*0.10);
    _cheeks(ctx, 0, -s*0.28, s*0.30);
    _eyes(ctx, 0, -s*0.28, s*0.30, expr);
    // ひげ
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = s*0.02;
    [-1,1].forEach(side => {
      [-1,0,1].forEach(row => {
        ctx.beginPath();
        ctx.moveTo(side*s*0.10, -s*0.20 + row*s*0.05);
        ctx.lineTo(side*s*0.40, -s*0.22 + row*s*0.04);
        ctx.stroke();
      });
    });
  },

  // ─── うさぎ ───────────────────────────────────────────────
  rabbit(ctx, p) {
    const s = p.s || 40;
    const c = p.color || '#f5e8e0';
    const expr = p.expr || 'happy';
    // 体
    ctx.beginPath(); ctx.ellipse(0, s*0.18, s*0.26, s*0.30, 0, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.06);
    // 頭
    ctx.beginPath(); ctx.ellipse(0, -s*0.20, s*0.25, s*0.27, 0, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.06);
    // 長い耳
    ctx.beginPath(); ctx.ellipse(-s*0.13, -s*0.55, s*0.07, s*0.25, -0.15, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.05);
    ctx.beginPath(); ctx.ellipse( s*0.13, -s*0.55, s*0.07, s*0.25,  0.15, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.05);
    // 耳内側
    ctx.fillStyle = '#ffb6c1';
    ctx.beginPath(); ctx.ellipse(-s*0.13, -s*0.55, s*0.035, s*0.18, -0.15, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( s*0.13, -s*0.55, s*0.035, s*0.18,  0.15, 0, Math.PI*2); ctx.fill();
    _cheeks(ctx, 0, -s*0.20, s*0.25);
    _eyes(ctx, 0, -s*0.20, s*0.25, expr);
  },

  // ─── 鳥 ───────────────────────────────────────────────────
  bird(ctx, p) {
    const s = p.s || 32;
    const c = p.color || '#fbd244';
    // 体
    ctx.beginPath(); ctx.ellipse(0, 0, s*0.40, s*0.32, 0, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.06);
    // 翼
    if (p.variant === 1) {
      ctx.beginPath();
      ctx.moveTo(-s*0.10, -s*0.05);
      ctx.bezierCurveTo(-s*0.40, -s*0.40, -s*0.55, -s*0.20, -s*0.45, s*0.05);
      ctx.bezierCurveTo(-s*0.30, s*0.05, -s*0.15, -s*0.05, -s*0.10, -s*0.05);
      ctx.closePath();
      _fillStroke(ctx, c, s*0.05);
    }
    // くちばし
    ctx.beginPath();
    ctx.moveTo(s*0.38, -s*0.05);
    ctx.lineTo(s*0.60, s*0.00);
    ctx.lineTo(s*0.38, s*0.06);
    ctx.closePath();
    _fillStroke(ctx, '#ff8c00', s*0.04);
    // 目
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s*0.15, -s*0.12, s*0.12, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = s*0.04;
    ctx.beginPath(); ctx.arc(s*0.15, -s*0.12, s*0.12, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = OUTLINE;
    ctx.beginPath(); ctx.arc(s*0.18, -s*0.10, s*0.07, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s*0.19, -s*0.12, s*0.025, 0, Math.PI*2); ctx.fill();
    // 足
    ctx.strokeStyle = '#ff8c00'; ctx.lineWidth = s*0.05;
    ctx.beginPath(); ctx.moveTo(-s*0.10, s*0.32); ctx.lineTo(-s*0.10, s*0.45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( s*0.10, s*0.32); ctx.lineTo( s*0.10, s*0.45); ctx.stroke();
  },

  // ─── 木 ───────────────────────────────────────────────────
  tree(ctx, p) {
    const s = p.s || 50;
    const crown = p.color || '#5cb85c';
    const v = p.variant || 0;
    // 幹
    ctx.beginPath();
    ctx.roundRect(-s*0.10, -s*0.05, s*0.20, s*0.55, s*0.04);
    _fillStroke(ctx, '#8b4513', s*0.05);
    if (v === 0) {
      // 丸い葉っぱ（3つ重ね）
      ctx.beginPath(); ctx.arc(-s*0.18, -s*0.18, s*0.22, 0, Math.PI*2);
      _fillStroke(ctx, crown, s*0.06);
      ctx.beginPath(); ctx.arc( s*0.18, -s*0.18, s*0.22, 0, Math.PI*2);
      _fillStroke(ctx, crown, s*0.06);
      ctx.beginPath(); ctx.arc(0, -s*0.40, s*0.25, 0, Math.PI*2);
      _fillStroke(ctx, crown, s*0.06);
    } else {
      // 三角の木
      ctx.beginPath();
      ctx.moveTo(0, -s*0.70); ctx.lineTo(s*0.40, -s*0.05); ctx.lineTo(-s*0.40, -s*0.05);
      ctx.closePath(); _fillStroke(ctx, crown, s*0.06);
      ctx.beginPath();
      ctx.moveTo(0, -s*0.95); ctx.lineTo(s*0.30, -s*0.40); ctx.lineTo(-s*0.30, -s*0.40);
      ctx.closePath(); _fillStroke(ctx, crown, s*0.06);
    }
  },

  // ─── 花 ───────────────────────────────────────────────────
  flower(ctx, p) {
    const s = p.s || 32;
    const c = p.color  || '#ff7eb9';
    const cc = p.color2 || '#fff066';
    const petals = p.count || 5;
    // 茎
    ctx.beginPath();
    ctx.moveTo(0, s*0.05); ctx.lineTo(0, s*0.55);
    ctx.strokeStyle = '#3a8b3a'; ctx.lineWidth = s*0.08; ctx.stroke();
    // 葉っぱ
    ctx.beginPath(); ctx.ellipse(s*0.12, s*0.30, s*0.10, s*0.05, 0.4, 0, Math.PI*2);
    _fillStroke(ctx, '#5cb85c', s*0.04);
    // 花びら
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2 - Math.PI/2;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(0, -s*0.28, s*0.14, s*0.20, 0, 0, Math.PI*2);
      _fillStroke(ctx, c, s*0.05);
      ctx.restore();
    }
    // 中心
    ctx.beginPath(); ctx.arc(0, 0, s*0.13, 0, Math.PI*2);
    _fillStroke(ctx, cc, s*0.04);
  },

  // ─── 魚 ───────────────────────────────────────────────────
  fish(ctx, p) {
    const s = p.s || 38;
    const c = p.color || '#ff7849';
    const c2 = p.color2 || '#ffc04c';
    // 体
    ctx.beginPath(); ctx.ellipse(0, 0, s*0.45, s*0.28, 0, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.06);
    // 尾びれ
    ctx.beginPath();
    ctx.moveTo(-s*0.40, 0); ctx.lineTo(-s*0.75, -s*0.30); ctx.lineTo(-s*0.75, s*0.30);
    ctx.closePath(); _fillStroke(ctx, c, s*0.06);
    // 背びれ
    ctx.beginPath();
    ctx.moveTo(-s*0.10, -s*0.26); ctx.lineTo(s*0.10, -s*0.45); ctx.lineTo(s*0.25, -s*0.26);
    ctx.closePath(); _fillStroke(ctx, c2, s*0.05);
    // 模様（variant=1だけ）
    if (p.variant === 1) {
      ctx.strokeStyle = c2; ctx.lineWidth = s*0.05;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.arc(i*s*0.13, 0, s*0.10, -Math.PI*0.6, Math.PI*0.6); ctx.stroke();
      }
    }
    // 目
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s*0.25, -s*0.05, s*0.10, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = s*0.03;
    ctx.beginPath(); ctx.arc(s*0.25, -s*0.05, s*0.10, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = OUTLINE;
    ctx.beginPath(); ctx.arc(s*0.27, -s*0.04, s*0.06, 0, Math.PI*2); ctx.fill();
  },

  // ─── クラゲ ───────────────────────────────────────────────
  jellyfish(ctx, p) {
    const s = p.s || 40;
    const c = p.color || '#dd9bff';
    ctx.beginPath(); ctx.ellipse(0, 0, s*0.40, s*0.32, 0, Math.PI, 0);
    _fillStroke(ctx, c, s*0.05);
    // 触手
    ctx.strokeStyle = c; ctx.lineWidth = s*0.06; ctx.lineCap = 'round';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * s*0.12, 0);
      ctx.bezierCurveTo(i*s*0.18, s*0.30, i*s*0.06, s*0.50, i*s*0.20, s*0.70);
      ctx.stroke();
    }
    // 顔
    ctx.fillStyle = OUTLINE;
    ctx.beginPath(); ctx.arc(-s*0.10, -s*0.10, s*0.04, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc( s*0.10, -s*0.10, s*0.04, 0, Math.PI*2); ctx.fill();
    _cheeks(ctx, 0, -s*0.05, s*0.30);
  },

  // ─── キノコ ───────────────────────────────────────────────
  mushroom(ctx, p) {
    const s = p.s || 36;
    const c = p.color || '#e74c3c';
    // 軸
    ctx.beginPath(); ctx.roundRect(-s*0.18, 0, s*0.36, s*0.42, s*0.06);
    _fillStroke(ctx, '#fff5e0', s*0.05);
    // 傘
    ctx.beginPath(); ctx.arc(0, 0, s*0.48, Math.PI, 0);
    _fillStroke(ctx, c, s*0.06);
    // 水玉
    ctx.fillStyle = '#fff';
    [[-s*0.22,-s*0.20,0.10],[s*0.22,-s*0.20,0.09],[0,-s*0.05,0.08],[-s*0.08,-s*0.36,0.07],[s*0.10,-s*0.34,0.08]].forEach(([x,y,r]) => {
      ctx.beginPath(); ctx.arc(x, y, s*r, 0, Math.PI*2); ctx.fill();
    });
    // 顔
    if (p.variant === 1) {
      ctx.fillStyle = OUTLINE;
      ctx.beginPath(); ctx.arc(-s*0.06, s*0.18, s*0.025, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc( s*0.06, s*0.18, s*0.025, 0, Math.PI*2); ctx.fill();
    }
  },

  // ─── 建物（イタリア風カラフルな家）─────────────────────────
  building(ctx, p) {
    const s = p.s || 60;
    const wall = p.color  || '#fff0b3';
    const roof = p.color2 || '#c0392b';
    const win  = p.accent || '#5dade2';
    // 壁
    ctx.beginPath();
    ctx.rect(-s*0.35, -s*0.40, s*0.70, s*0.80);
    _fillStroke(ctx, wall, s*0.05);
    // 屋根
    ctx.beginPath();
    ctx.moveTo(-s*0.45, -s*0.40); ctx.lineTo(0, -s*0.75); ctx.lineTo(s*0.45, -s*0.40);
    ctx.closePath();
    _fillStroke(ctx, roof, s*0.05);
    // 窓 2×2
    [[-s*0.18,-s*0.22],[s*0.04,-s*0.22],[-s*0.18,s*0.00],[s*0.04,s*0.00]].forEach(([x,y]) => {
      ctx.beginPath(); ctx.rect(x, y, s*0.14, s*0.14);
      _fillStroke(ctx, win, s*0.04);
      // 十字
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = s*0.02;
      ctx.beginPath();
      ctx.moveTo(x + s*0.07, y); ctx.lineTo(x + s*0.07, y + s*0.14);
      ctx.moveTo(x, y + s*0.07); ctx.lineTo(x + s*0.14, y + s*0.07);
      ctx.stroke();
    });
    // ドア
    ctx.beginPath(); ctx.roundRect(-s*0.10, s*0.18, s*0.20, s*0.22, s*0.02);
    _fillStroke(ctx, '#8b4513', s*0.04);
    // ドアノブ
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath(); ctx.arc(s*0.05, s*0.30, s*0.02, 0, Math.PI*2); ctx.fill();
  },

  // ─── 惑星 ─────────────────────────────────────────────────
  planet(ctx, p) {
    const s = p.s || 44;
    const c = p.color || '#4a90d9';
    const c2 = p.color2 || '#2c5e8e';
    ctx.beginPath(); ctx.arc(0, 0, s*0.45, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.05);
    // 模様
    ctx.save();
    ctx.beginPath(); ctx.arc(0, 0, s*0.45, 0, Math.PI*2); ctx.clip();
    ctx.fillStyle = c2;
    ctx.beginPath(); ctx.ellipse(-s*0.10, -s*0.10, s*0.20, s*0.08, 0.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s*0.10, s*0.15, s*0.25, s*0.10, -0.1, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    // リング
    if (p.variant === 1) {
      ctx.beginPath(); ctx.ellipse(0, 0, s*0.70, s*0.16, 0, 0, Math.PI*2);
      _fillStroke(ctx, '#f0c060', s*0.04);
      // 上半分だけ前に
      ctx.beginPath(); ctx.arc(0, 0, s*0.45, Math.PI, 0);
      ctx.fillStyle = c; ctx.fill();
    }
  },

  // ─── ロケット ─────────────────────────────────────────────
  rocket(ctx, p) {
    const s = p.s || 42;
    const c = p.color || '#ff5757';
    // 本体
    ctx.beginPath();
    ctx.moveTo(0, -s*0.65);
    ctx.bezierCurveTo(s*0.25, -s*0.20, s*0.22, s*0.15, s*0.18, s*0.30);
    ctx.lineTo(-s*0.18, s*0.30);
    ctx.bezierCurveTo(-s*0.22, s*0.15, -s*0.25, -s*0.20, 0, -s*0.65);
    ctx.closePath();
    _fillStroke(ctx, c, s*0.06);
    // 窓
    ctx.beginPath(); ctx.arc(0, -s*0.20, s*0.12, 0, Math.PI*2);
    _fillStroke(ctx, '#85c1e9', s*0.05);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-s*0.04, -s*0.24, s*0.04, 0, Math.PI*2); ctx.fill();
    // フィン
    ctx.beginPath();
    ctx.moveTo(s*0.18, s*0.30); ctx.lineTo(s*0.42, s*0.55); ctx.lineTo(s*0.18, s*0.45);
    ctx.closePath();
    _fillStroke(ctx, '#c0392b', s*0.05);
    ctx.beginPath();
    ctx.moveTo(-s*0.18, s*0.30); ctx.lineTo(-s*0.42, s*0.55); ctx.lineTo(-s*0.18, s*0.45);
    ctx.closePath();
    _fillStroke(ctx, '#c0392b', s*0.05);
    // 炎
    ctx.beginPath();
    ctx.moveTo(-s*0.12, s*0.30); ctx.lineTo(0, s*0.60); ctx.lineTo(s*0.12, s*0.30);
    ctx.closePath();
    _fillStroke(ctx, '#ffaa00', s*0.05);
  },

  // ─── 提灯 ─────────────────────────────────────────────────
  lantern(ctx, p) {
    const s = p.s || 38;
    const c = p.color || '#e74c3c';
    // 紐
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = s*0.03;
    ctx.beginPath(); ctx.moveTo(0, -s*0.65); ctx.lineTo(0, -s*0.48); ctx.stroke();
    // 提灯本体
    ctx.beginPath(); ctx.ellipse(0, 0, s*0.30, s*0.45, 0, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.06);
    // 横縞
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = s*0.02;
    for (let y = -s*0.30; y <= s*0.30; y += s*0.15) {
      const hw = Math.sqrt(Math.max(0, 1 - (y/(s*0.45))**2)) * s*0.30;
      ctx.beginPath(); ctx.moveTo(-hw, y); ctx.lineTo(hw, y); ctx.stroke();
    }
    // 下飾り
    ctx.beginPath(); ctx.roundRect(-s*0.04, s*0.45, s*0.08, s*0.18, s*0.02);
    _fillStroke(ctx, '#fff066', s*0.03);
  },

  // ─── ケーキ ───────────────────────────────────────────────
  cake(ctx, p) {
    const s = p.s || 40;
    const c = p.color || '#ffe0b3';
    // 本体
    ctx.beginPath(); ctx.rect(-s*0.38, 0, s*0.76, s*0.40);
    _fillStroke(ctx, c, s*0.05);
    // クリーム
    ctx.beginPath();
    ctx.moveTo(-s*0.38, 0);
    for (let x = -s*0.38; x <= s*0.38 - 0.001; x += s*0.12) {
      ctx.arc(x + s*0.06, 0, s*0.06, Math.PI, 0);
    }
    ctx.lineTo(s*0.38, 0);
    ctx.closePath();
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = s*0.04; ctx.stroke();
    // 苺
    const berries = p.count || 3;
    for (let i = 0; i < berries; i++) {
      const bx = -s*0.30 + i * (s*0.60 / Math.max(1, berries-1));
      ctx.beginPath(); ctx.arc(bx, -s*0.10, s*0.08, 0, Math.PI*2);
      _fillStroke(ctx, '#e74c3c', s*0.03);
    }
    // ろうそく
    ctx.beginPath(); ctx.roundRect(-s*0.03, -s*0.32, s*0.06, s*0.22, s*0.01);
    _fillStroke(ctx, '#fff5cc', s*0.03);
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath(); ctx.ellipse(0, -s*0.35, s*0.04, s*0.06, 0, 0, Math.PI*2); ctx.fill();
  },

  // ─── 星 ───────────────────────────────────────────────────
  star(ctx, p) {
    const s = p.s || 30;
    const c = p.color || '#ffd700';
    const pts = 5;
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? s*0.45 : s*0.20;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    _fillStroke(ctx, c, s*0.05);
  },

  // ─── 月 ───────────────────────────────────────────────────
  moon(ctx, p) {
    const s = p.s || 38;
    const c = p.color || '#fff4a3';
    if (p.variant === 0) {
      ctx.beginPath(); ctx.arc(0, 0, s*0.45, 0, Math.PI*2);
      _fillStroke(ctx, c, s*0.05);
      // クレーター
      ctx.fillStyle = '#e6d98a';
      ctx.beginPath(); ctx.arc(-s*0.12, -s*0.05, s*0.07, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(s*0.10, s*0.10, s*0.06, 0, Math.PI*2); ctx.fill();
    } else {
      // 三日月
      ctx.beginPath();
      ctx.arc(0, 0, s*0.45, Math.PI*0.7, Math.PI*1.7, true);
      ctx.arc(s*0.12, 0, s*0.40, Math.PI*1.7, Math.PI*0.7, false);
      ctx.closePath();
      _fillStroke(ctx, c, s*0.05);
    }
  },

  // ─── 傘 ───────────────────────────────────────────────────
  umbrella(ctx, p) {
    const s = p.s || 52;
    const c = p.color || '#e74c3c';
    // 柄
    ctx.beginPath();
    ctx.moveTo(0, -s*0.55); ctx.lineTo(0, s*0.35);
    ctx.quadraticCurveTo(0, s*0.45, -s*0.07, s*0.43);
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = s*0.05; ctx.stroke();
    // 傘部
    ctx.beginPath(); ctx.arc(0, -s*0.55, s*0.50, Math.PI, 0);
    _fillStroke(ctx, c, s*0.06);
    // 縞
    const segs = p.count || 4;
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = s*0.03;
    for (let i = 1; i < segs; i++) {
      const a = Math.PI + (i / segs) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(0, -s*0.55);
      ctx.lineTo(Math.cos(a) * s*0.50, -s*0.55 + Math.sin(a) * s*0.50);
      ctx.stroke();
    }
  },

  // ─── サンゴ ───────────────────────────────────────────────
  coral(ctx, p) {
    const s = p.s || 38;
    const c = p.color || '#ff8a9a';
    ctx.strokeStyle = c; ctx.lineWidth = s*0.16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, s*0.40); ctx.lineTo(0, 0); ctx.stroke();
    [[-s*0.30, -s*0.30],[s*0.30, -s*0.30],[-s*0.15, -s*0.55],[s*0.15, -s*0.55]].forEach(([ex,ey]) => {
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(ex, ey, s*0.10, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = s*0.04;
      ctx.stroke();
      ctx.strokeStyle = c; ctx.lineWidth = s*0.16;
    });
    // 輪郭
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = s*0.04;
    ctx.beginPath(); ctx.moveTo(0, s*0.40); ctx.lineTo(0, 0);
    [[-s*0.30, -s*0.30],[s*0.30, -s*0.30],[-s*0.15, -s*0.55],[s*0.15, -s*0.55]].forEach(([ex,ey]) => {
      ctx.moveTo(0, 0); ctx.lineTo(ex, ey);
    });
    ctx.stroke();
  },

  // ─── 風船 ─────────────────────────────────────────────────
  balloon(ctx, p) {
    const s = p.s || 34;
    const c = p.color || '#ff5757';
    ctx.beginPath(); ctx.ellipse(0, 0, s*0.30, s*0.38, 0, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.05);
    // 結び目
    ctx.beginPath();
    ctx.moveTo(-s*0.04, s*0.35); ctx.lineTo(0, s*0.40); ctx.lineTo(s*0.04, s*0.35);
    ctx.closePath();
    _fillStroke(ctx, c, s*0.03);
    // ハイライト
    ctx.fillStyle = '#ffffff88';
    ctx.beginPath(); ctx.ellipse(-s*0.10, -s*0.14, s*0.06, s*0.10, -0.4, 0, Math.PI*2); ctx.fill();
    // 紐
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = s*0.02;
    ctx.beginPath();
    ctx.moveTo(0, s*0.40);
    ctx.quadraticCurveTo(s*0.12, s*0.58, 0, s*0.78);
    ctx.stroke();
  },

  // ─── 椅子 ─────────────────────────────────────────────────
  chair(ctx, p) {
    const s = p.s || 38;
    const c = p.color || '#a0522d';
    // 座面
    ctx.beginPath(); ctx.rect(-s*0.32, -s*0.05, s*0.64, s*0.10);
    _fillStroke(ctx, c, s*0.05);
    // 脚
    ctx.beginPath(); ctx.rect(-s*0.26, s*0.05, s*0.10, s*0.40);
    _fillStroke(ctx, c, s*0.04);
    ctx.beginPath(); ctx.rect( s*0.16, s*0.05, s*0.10, s*0.40);
    _fillStroke(ctx, c, s*0.04);
    // 背もたれ
    ctx.beginPath(); ctx.rect(-s*0.30, -s*0.50, s*0.06, s*0.45);
    _fillStroke(ctx, c, s*0.04);
    ctx.beginPath(); ctx.rect( s*0.24, -s*0.50, s*0.06, s*0.45);
    _fillStroke(ctx, c, s*0.04);
    ctx.beginPath(); ctx.rect(-s*0.30, -s*0.55, s*0.60, s*0.10);
    _fillStroke(ctx, c, s*0.04);
  },

  // ─── 本 ───────────────────────────────────────────────────
  book(ctx, p) {
    const s = p.s || 32;
    const c = p.color || '#3498db';
    // 表紙
    ctx.beginPath(); ctx.roundRect(-s*0.32, -s*0.40, s*0.64, s*0.80, s*0.03);
    _fillStroke(ctx, c, s*0.05);
    // ページ
    ctx.fillStyle = '#fff';
    ctx.fillRect(-s*0.24, -s*0.34, s*0.48, s*0.68);
    // 文字風線
    ctx.fillStyle = '#aaaaaa';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(-s*0.18, -s*0.24 + i*s*0.13, s*0.36, s*0.03);
    }
    // 背
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(-s*0.32, -s*0.40, s*0.05, s*0.80);
  },

  // ─── お皿（料理）─────────────────────────────────────────
  plate(ctx, p) {
    const s = p.s || 36;
    const c = p.color || '#fff';
    // 皿
    ctx.beginPath(); ctx.ellipse(0, s*0.05, s*0.50, s*0.15, 0, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.04);
    // 中央の料理
    ctx.beginPath(); ctx.ellipse(0, s*0.05, s*0.30, s*0.08, 0, 0, Math.PI*2);
    _fillStroke(ctx, p.color2 || '#ffaa44', s*0.03);
    // 具
    const items = p.count || 3;
    for (let i = 0; i < items; i++) {
      const ix = -s*0.18 + i * (s*0.36 / Math.max(1, items-1));
      ctx.beginPath(); ctx.arc(ix, s*0.03, s*0.05, 0, Math.PI*2);
      _fillStroke(ctx, '#5cb85c', s*0.02);
    }
  },

  // ─── コップ ───────────────────────────────────────────────
  cup(ctx, p) {
    const s = p.s || 30;
    const c = p.color || '#5dade2';
    // ガラス
    ctx.beginPath();
    ctx.moveTo(-s*0.20, -s*0.30);
    ctx.lineTo(-s*0.14, s*0.35);
    ctx.lineTo( s*0.14, s*0.35);
    ctx.lineTo( s*0.20, -s*0.30);
    ctx.closePath();
    _fillStroke(ctx, c, s*0.05);
    // 飲み物
    ctx.fillStyle = '#ffffff55';
    ctx.beginPath();
    ctx.moveTo(-s*0.15, -s*0.20);
    ctx.lineTo(-s*0.13, s*0.30);
    ctx.lineTo( s*0.13, s*0.30);
    ctx.lineTo( s*0.15, -s*0.20);
    ctx.closePath(); ctx.fill();
    // ストロー
    if (p.variant === 1) {
      ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = s*0.06; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s*0.10, -s*0.50); ctx.lineTo(s*0.05, s*0.20);
      ctx.stroke();
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = s*0.02;
      ctx.beginPath();
      ctx.moveTo(s*0.10, -s*0.50); ctx.lineTo(s*0.05, s*0.20);
      ctx.stroke();
    }
  },

  // ─── 太陽 ─────────────────────────────────────────────────
  sun(ctx, p) {
    const s = p.s || 40;
    const c = p.color || '#ffd700';
    // 光線
    ctx.strokeStyle = c; ctx.lineWidth = s*0.08; ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*s*0.40, Math.sin(a)*s*0.40);
      ctx.lineTo(Math.cos(a)*s*0.60, Math.sin(a)*s*0.60);
      ctx.stroke();
    }
    // 本体
    ctx.beginPath(); ctx.arc(0, 0, s*0.35, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.05);
    _cheeks(ctx, 0, 0, s*0.35);
    _eyes(ctx, 0, 0, s*0.35, p.expr || 'happy');
  },

  // ─── 帽子 ─────────────────────────────────────────────────
  hat(ctx, p) {
    const s = p.s || 30;
    const c = p.color || '#5b95d6';
    // つば
    ctx.beginPath(); ctx.ellipse(0, s*0.15, s*0.45, s*0.10, 0, 0, Math.PI*2);
    _fillStroke(ctx, c, s*0.05);
    // 頭頂部
    ctx.beginPath();
    ctx.moveTo(-s*0.24, s*0.10);
    ctx.bezierCurveTo(-s*0.24, -s*0.30, s*0.24, -s*0.30, s*0.24, s*0.10);
    ctx.closePath();
    _fillStroke(ctx, c, s*0.05);
    // 帯
    ctx.fillStyle = p.color2 || '#fff066';
    ctx.fillRect(-s*0.24, s*0.05, s*0.48, s*0.07);
  },

};

// 旧名互換
D.expression = D._face;

// ─── 描画ディスパッチャ ────────────────────────────────────────
function drawSprite(ctx, type, x, y, props) {
  if (!D[type]) return;
  ctx.save();
  ctx.translate(x, y);
  if (props.scaleX && props.scaleX !== 1) ctx.scale(props.scaleX, 1);
  if (props.rotation) ctx.rotate(props.rotation);
  D[type](ctx, props);
  ctx.restore();
}
