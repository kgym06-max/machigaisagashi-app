// フラットデザイン イラスト描画関数集
// すべて ctx.save()/restore() で囲み、(0,0) 中心で描く
// p.s = 基準サイズ（px）, p.color = メインカラー, p.scaleX = 1 or -1（反転）

const D = {

  // ─── 人物 ─────────────────────────────────────────────────
  person(ctx, p) {
    const s = p.s || 40;
    const body = p.color  || '#4a90d9';
    const skin = p.skin   || '#ffd09b';
    const hair = p.hair   || '#4a3728';
    const expr = p.expr   || 'happy';

    // 体
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.roundRect(-s*0.18, -s*0.35, s*0.36, s*0.45, s*0.05);
    ctx.fill();
    // 脚
    ctx.fillStyle = p.pants || '#2c3e50';
    ctx.fillRect(-s*0.16, s*0.08, s*0.13, s*0.3);
    ctx.fillRect( s*0.03,  s*0.08, s*0.13, s*0.3);
    // 腕
    ctx.fillStyle = body;
    ctx.fillRect(-s*0.32, -s*0.3, s*0.14, s*0.1);
    ctx.fillRect( s*0.18,  -s*0.3, s*0.14, s*0.1);
    // 頭
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(0, -s*0.52, s*0.2, 0, Math.PI*2); ctx.fill();
    // 髪
    ctx.fillStyle = hair;
    ctx.beginPath(); ctx.arc(0, -s*0.62, s*0.2, Math.PI, 0); ctx.fill();
    ctx.fillRect(-s*0.18, -s*0.62, s*0.06, s*0.12);
    ctx.fillRect( s*0.12, -s*0.62, s*0.06, s*0.12);
    // 表情
    D._face(ctx, 0, -s*0.52, s*0.2, expr);
  },

  _face(ctx, cx, cy, r, expr) {
    // 目
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(cx - r*0.35, cy - r*0.1, r*0.1, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r*0.35, cy - r*0.1, r*0.1, 0, Math.PI*2); ctx.fill();
    // 口
    ctx.strokeStyle = '#333'; ctx.lineWidth = r*0.1;
    ctx.beginPath();
    if      (expr === 'happy')     { ctx.arc(cx, cy + r*0.1, r*0.25, 0.2, Math.PI-0.2); }
    else if (expr === 'sad')       { ctx.arc(cx, cy + r*0.4,  r*0.25, Math.PI+0.2, -0.2); }
    else if (expr === 'surprised') { ctx.arc(cx, cy + r*0.2,  r*0.15, 0, Math.PI*2); }
    else                           { ctx.moveTo(cx - r*0.2, cy + r*0.2); ctx.lineTo(cx + r*0.2, cy + r*0.2); }
    ctx.stroke();
  },

  // ─── 木 ───────────────────────────────────────────────────
  tree(ctx, p) {
    const s = p.s || 45;
    const crown = p.color  || '#2e8b57';
    const trunk = p.trunk  || '#8b4513';
    const v = p.variant || 0;

    ctx.fillStyle = trunk;
    ctx.fillRect(-s*0.1, 0, s*0.2, s*0.5);
    ctx.fillStyle = crown;
    if (v === 0) { // 丸い木
      ctx.beginPath(); ctx.arc(0, -s*0.15, s*0.38, 0, Math.PI*2); ctx.fill();
    } else { // 三角の木
      ctx.beginPath();
      ctx.moveTo(0, -s*0.7); ctx.lineTo(s*0.38, 0); ctx.lineTo(-s*0.38, 0);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -s*0.95); ctx.lineTo(s*0.28, -s*0.4); ctx.lineTo(-s*0.28, -s*0.4);
      ctx.closePath(); ctx.fill();
    }
  },

  // ─── 魚 ───────────────────────────────────────────────────
  fish(ctx, p) {
    const s = p.s || 35;
    const c = p.color || '#ff6b35';
    const c2 = p.color2 || '#ffaa55';
    // 胴体
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(0, 0, s*0.5, s*0.28, 0, 0, Math.PI*2); ctx.fill();
    // 尾びれ
    ctx.beginPath();
    ctx.moveTo(-s*0.5, 0); ctx.lineTo(-s*0.85, -s*0.3); ctx.lineTo(-s*0.85, s*0.3);
    ctx.closePath(); ctx.fill();
    // 背びれ
    ctx.fillStyle = c2;
    ctx.beginPath();
    ctx.moveTo(-s*0.1, -s*0.28); ctx.lineTo(s*0.15, -s*0.5); ctx.lineTo(s*0.3, -s*0.28);
    ctx.closePath(); ctx.fill();
    // 目
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s*0.32, -s*0.05, s*0.1, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(s*0.35, -s*0.05, s*0.05, 0, Math.PI*2); ctx.fill();
    // 模様（variant）
    if (p.variant === 1) {
      ctx.strokeStyle = c2; ctx.lineWidth = s*0.04;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.arc(i*s*0.15, 0, s*0.12, -Math.PI*0.6, Math.PI*0.6); ctx.stroke();
      }
    }
  },

  // ─── クラゲ ───────────────────────────────────────────────
  jellyfish(ctx, p) {
    const s = p.s || 38;
    const c = p.color || '#cc88ff';
    ctx.fillStyle = c + 'aa';
    ctx.beginPath(); ctx.ellipse(0, 0, s*0.45, s*0.35, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(0, 0, s*0.45, s*0.35, 0, Math.PI, 0); ctx.stroke();
    // 触手
    ctx.strokeStyle = c; ctx.lineWidth = s*0.04;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * s*0.12, s*0.05);
      ctx.bezierCurveTo(i*s*0.2, s*0.3, i*s*0.05, s*0.5, i*s*0.18, s*0.7);
      ctx.stroke();
    }
  },

  // ─── 花 ───────────────────────────────────────────────────
  flower(ctx, p) {
    const s  = p.s     || 30;
    const c  = p.color || '#ff69b4';
    const cc = p.color2|| '#ffff44';
    const petals = p.count || 5;
    ctx.fillStyle = '#5a9e3a';
    ctx.fillRect(-s*0.05, 0, s*0.1, s*0.6);
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.ellipse(0, -s*0.35, s*0.15, s*0.25, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = cc;
    ctx.beginPath(); ctx.arc(0, 0, s*0.18, 0, Math.PI*2); ctx.fill();
  },

  // ─── 猫 ───────────────────────────────────────────────────
  cat(ctx, p) {
    const s = p.s || 38;
    const c = p.color || '#f5cba7';
    const expr = p.expr || 'happy';
    // 体
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(0, s*0.1, s*0.28, s*0.35, 0, 0, Math.PI*2); ctx.fill();
    // 頭
    ctx.beginPath(); ctx.arc(0, -s*0.3, s*0.28, 0, Math.PI*2); ctx.fill();
    // 耳
    ctx.beginPath();
    ctx.moveTo(-s*0.25, -s*0.5); ctx.lineTo(-s*0.08, -s*0.72); ctx.lineTo(-s*0.02, -s*0.5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s*0.25, -s*0.5); ctx.lineTo(s*0.08, -s*0.72); ctx.lineTo(s*0.02, -s*0.5);
    ctx.fill();
    // 耳内側
    ctx.fillStyle = '#ffb6b6';
    ctx.beginPath();
    ctx.moveTo(-s*0.2, -s*0.52); ctx.lineTo(-s*0.1, -s*0.66); ctx.lineTo(-s*0.06, -s*0.52);
    ctx.fill();
    // 尻尾
    ctx.strokeStyle = c; ctx.lineWidth = s*0.09;
    ctx.beginPath();
    ctx.moveTo(s*0.28, s*0.35);
    ctx.bezierCurveTo(s*0.6, s*0.5, s*0.7, s*0.2, s*0.55, 0);
    ctx.stroke();
    // 顔
    D._face(ctx, 0, -s*0.3, s*0.28, expr);
    // ひげ
    ctx.strokeStyle = '#888'; ctx.lineWidth = 1;
    [-1,1].forEach(side => {
      [-1,0,1].forEach(row => {
        ctx.beginPath();
        ctx.moveTo(0, -s*0.28 + row*s*0.07);
        ctx.lineTo(side*s*0.38, -s*0.28 + row*s*0.05);
        ctx.stroke();
      });
    });
  },

  // ─── 鳥 ───────────────────────────────────────────────────
  bird(ctx, p) {
    const s = p.s || 28;
    const c = p.color || '#e74c3c';
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(0, 0, s*0.38, s*0.24, -0.2, 0, Math.PI*2); ctx.fill();
    // 頭
    ctx.beginPath(); ctx.arc(s*0.28, -s*0.15, s*0.18, 0, Math.PI*2); ctx.fill();
    // くちばし
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.moveTo(s*0.44, -s*0.15);
    ctx.lineTo(s*0.68, -s*0.1);
    ctx.lineTo(s*0.44, -s*0.05);
    ctx.closePath(); ctx.fill();
    // 翼
    if (p.variant === 1) { // 飛んでいる
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(-s*0.1, 0);
      ctx.bezierCurveTo(-s*0.5, -s*0.5, -s*0.8, -s*0.2, -s*0.9, 0);
      ctx.bezierCurveTo(-s*0.7, 0.1, -s*0.3, -s*0.1, -s*0.1, 0);
      ctx.fill();
    }
    // 目
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s*0.35, -s*0.2, s*0.07, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(s*0.37, -s*0.2, s*0.04, 0, Math.PI*2); ctx.fill();
  },

  // ─── キノコ ───────────────────────────────────────────────
  mushroom(ctx, p) {
    const s = p.s || 34;
    const c = p.color || '#c0392b';
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.ellipse(0, s*0.15, s*0.22, s*0.28, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(0, 0, s*0.42, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, s*0.42, Math.PI, 0); ctx.closePath(); ctx.fill();
    // 水玉
    ctx.fillStyle = '#ffffff88';
    [[-s*0.18,-s*0.22],[s*0.18,-s*0.22],[0,-s*0.05],[-s*0.08,-s*0.35],[s*0.1,-s*0.32]].forEach(([x,y]) => {
      ctx.beginPath(); ctx.arc(x, y, s*0.07, 0, Math.PI*2); ctx.fill();
    });
  },

  // ─── 建物 ─────────────────────────────────────────────────
  building(ctx, p) {
    const s = p.s || 55;
    const wall = p.color  || '#ecf0f1';
    const roof = p.color2 || '#e74c3c';
    const win  = p.accent || '#85c1e9';
    // 壁
    ctx.fillStyle = wall;
    ctx.fillRect(-s*0.38, -s*0.45, s*0.76, s*0.75);
    // 屋根
    ctx.fillStyle = roof;
    ctx.beginPath();
    ctx.moveTo(-s*0.45, -s*0.45); ctx.lineTo(0, -s*0.82); ctx.lineTo(s*0.45, -s*0.45);
    ctx.closePath(); ctx.fill();
    // 窓 2×2
    ctx.fillStyle = win;
    [[-s*0.2,-s*0.25],[s*0.1,-s*0.25],[-s*0.2,s*0.02],[s*0.1,s*0.02]].forEach(([x,y]) => {
      ctx.fillRect(x, y, s*0.18, s*0.16);
    });
    // ドア
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(-s*0.1, s*0.1, s*0.2, s*0.2);
  },

  // ─── 惑星 ─────────────────────────────────────────────────
  planet(ctx, p) {
    const s = p.s || 42;
    const c = p.color || '#3498db';
    const c2 = p.color2 || '#2980b9';
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(0, 0, s*0.45, 0, Math.PI*2); ctx.fill();
    // 帯（横縞）
    ctx.fillStyle = c2;
    ctx.save();
    ctx.clip();
    ctx.beginPath(); ctx.ellipse(0, -s*0.1, s*0.45, s*0.12, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, s*0.2, s*0.45, s*0.1, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    // リング（variant 1）
    if (p.variant === 1) {
      ctx.strokeStyle = '#f39c12'; ctx.lineWidth = s*0.06;
      ctx.beginPath(); ctx.ellipse(0, 0, s*0.7, s*0.18, 0, 0, Math.PI*2); ctx.stroke();
    }
  },

  // ─── ロケット ─────────────────────────────────────────────
  rocket(ctx, p) {
    const s = p.s || 40;
    const c = p.color || '#e74c3c';
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(0, -s*0.7); ctx.bezierCurveTo(s*0.25,-s*0.2, s*0.25,s*0.2, s*0.2,s*0.3);
    ctx.lineTo(-s*0.2, s*0.3); ctx.bezierCurveTo(-s*0.25,s*0.2, -s*0.25,-s*0.2, 0,-s*0.7);
    ctx.fill();
    // 窓
    ctx.fillStyle = '#85c1e9';
    ctx.beginPath(); ctx.arc(0, -s*0.2, s*0.15, 0, Math.PI*2); ctx.fill();
    // フィン
    ctx.fillStyle = p.color2 || '#c0392b';
    ctx.beginPath();
    ctx.moveTo(s*0.2, s*0.3); ctx.lineTo(s*0.45, s*0.6); ctx.lineTo(s*0.2, s*0.45);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s*0.2, s*0.3); ctx.lineTo(-s*0.45, s*0.6); ctx.lineTo(-s*0.2, s*0.45);
    ctx.fill();
    // 炎
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.moveTo(-s*0.15, s*0.3); ctx.lineTo(0, s*0.65); ctx.lineTo(s*0.15, s*0.3);
    ctx.fill();
  },

  // ─── 提灯 ─────────────────────────────────────────────────
  lantern(ctx, p) {
    const s = p.s || 36;
    const c = p.color || '#e74c3c';
    // 紐
    ctx.strokeStyle = '#8b4513'; ctx.lineWidth = s*0.04;
    ctx.beginPath(); ctx.moveTo(0, -s*0.65); ctx.lineTo(0, -s*0.48); ctx.stroke();
    // 提灯本体
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(0, 0, s*0.3, s*0.48, 0, 0, Math.PI*2); ctx.fill();
    // 横縞
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = s*0.025;
    for (let y = -s*0.3; y <= s*0.3; y += s*0.15) {
      const hw = Math.sqrt(Math.max(0, (s*0.3)**2 - y**2)) * (s*0.48/s*0.3);
      ctx.beginPath();
      ctx.moveTo(-hw, y); ctx.lineTo(hw, y); ctx.stroke();
    }
    // 文字（〇）
    ctx.strokeStyle = '#ffff88'; ctx.lineWidth = s*0.04;
    ctx.beginPath(); ctx.arc(0, 0, s*0.15, 0, Math.PI*2); ctx.stroke();
    // 下飾り
    ctx.fillStyle = '#f39c12';
    ctx.beginPath(); ctx.ellipse(0, s*0.55, s*0.1, s*0.08, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(-s*0.02, s*0.5, s*0.04, s*0.25);
  },

  // ─── ケーキ ───────────────────────────────────────────────
  cake(ctx, p) {
    const s = p.s || 38;
    const c = p.color || '#f5cba7';
    const c2 = p.color2 || '#e74c3c';
    // 本体
    ctx.fillStyle = c;
    ctx.fillRect(-s*0.38, -s*0.05, s*0.76, s*0.45);
    // クリーム上部
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    for (let x = -s*0.38; x < s*0.38; x += s*0.15) {
      ctx.arc(x + s*0.075, -s*0.05, s*0.075, Math.PI, 0);
    }
    ctx.fill();
    // 苺
    const berries = p.count || 3;
    ctx.fillStyle = '#c0392b';
    for (let i = 0; i < berries; i++) {
      const bx = -s*0.28 + i * (s*0.56 / (berries-1 || 1));
      ctx.beginPath(); ctx.arc(bx, -s*0.14, s*0.09, 0, Math.PI*2); ctx.fill();
    }
    // ろうそく
    ctx.fillStyle = '#fff5cc';
    ctx.fillRect(-s*0.04, -s*0.3, s*0.08, s*0.25);
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath(); ctx.arc(0, -s*0.32, s*0.05, 0, Math.PI*2); ctx.fill();
  },

  // ─── 星（宇宙用）─────────────────────────────────────────
  star(ctx, p) {
    const s = p.s || 28;
    const c = p.color || '#ffd700';
    ctx.fillStyle = c;
    const pts = p.points || 5;
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? s*0.45 : s*0.2;
      i === 0 ? ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r) : ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
    }
    ctx.closePath(); ctx.fill();
  },

  // ─── 月 ───────────────────────────────────────────────────
  moon(ctx, p) {
    const s = p.s || 36;
    const c = p.color || '#ffffaa';
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(0, 0, s*0.45, 0, Math.PI*2); ctx.fill();
    // 三日月のくり抜き（variant 0 = 満月、1 = 三日月）
    if (p.variant !== 0) {
      ctx.fillStyle = '#000011';
      ctx.beginPath(); ctx.arc(s*0.18, -s*0.08, s*0.38, 0, Math.PI*2); ctx.fill();
    }
  },

  // ─── 傘（ビーチ）─────────────────────────────────────────
  umbrella(ctx, p) {
    const s = p.s || 50;
    const c = p.color || '#e74c3c';
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(-s*0.03, -s*0.6, s*0.06, s*0.95);
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(0, -s*0.6, s*0.5, Math.PI, 0); ctx.fill();
    // 区切り
    const segs = p.count || 4;
    ctx.strokeStyle = '#fff5'; ctx.lineWidth = s*0.03;
    for (let i = 1; i < segs; i++) {
      const a = Math.PI + (i / segs) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(0, -s*0.6);
      ctx.lineTo(Math.cos(a)*s*0.5, -s*0.6 + Math.sin(a)*s*0.5);
      ctx.stroke();
    }
  },

  // ─── サンゴ ───────────────────────────────────────────────
  coral(ctx, p) {
    const s = p.s || 36;
    const c = p.color || '#ff7f7f';
    ctx.strokeStyle = c; ctx.lineWidth = s*0.12; ctx.lineCap = 'round';
    // 幹
    ctx.beginPath(); ctx.moveTo(0, s*0.4); ctx.lineTo(0, 0); ctx.stroke();
    // 枝
    [[-s*0.3, -s*0.3],[ s*0.3,-s*0.3],[-s*0.15,-s*0.55],[s*0.15,-s*0.55]].forEach(([ex,ey])=>{
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.beginPath(); ctx.arc(ex, ey, s*0.08, 0, Math.PI*2); ctx.fillStyle=c; ctx.fill();
    });
  },

  // ─── 風船 ─────────────────────────────────────────────────
  balloon(ctx, p) {
    const s = p.s || 32;
    const c = p.color || '#e74c3c';
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(0, 0, s*0.3, s*0.38, 0, 0, Math.PI*2); ctx.fill();
    // 光沢
    ctx.fillStyle = '#ffffff44';
    ctx.beginPath(); ctx.ellipse(-s*0.08, -s*0.12, s*0.1, s*0.14, -0.5, 0, Math.PI*2); ctx.fill();
    // 紐
    ctx.strokeStyle = '#888'; ctx.lineWidth = s*0.03;
    ctx.beginPath();
    ctx.moveTo(0, s*0.38);
    ctx.bezierCurveTo(s*0.1, s*0.55, -s*0.1, s*0.65, 0, s*0.8);
    ctx.stroke();
  },

  // ─── 椅子 ─────────────────────────────────────────────────
  chair(ctx, p) {
    const s = p.s || 36;
    const c = p.color || '#8b4513';
    ctx.fillStyle = c;
    ctx.fillRect(-s*0.35, -s*0.05, s*0.7, s*0.1); // 座面
    ctx.fillRect(-s*0.28,  s*0.05, s*0.12, s*0.45); // 左脚
    ctx.fillRect( s*0.16,  s*0.05, s*0.12, s*0.45); // 右脚
    ctx.fillRect(-s*0.35, -s*0.5,  s*0.1, s*0.45); // 背もたれ左
    ctx.fillRect( s*0.25, -s*0.5,  s*0.1, s*0.45);
    ctx.fillRect(-s*0.35, -s*0.55, s*0.7, s*0.1);  // 背もたれ横
  },

  // ─── 本 ───────────────────────────────────────────────────
  book(ctx, p) {
    const s = p.s || 30;
    const c = p.color || '#3498db';
    ctx.fillStyle = c;
    ctx.fillRect(-s*0.3, -s*0.42, s*0.6, s*0.84);
    ctx.fillStyle = '#ffffffcc';
    ctx.fillRect(-s*0.22, -s*0.38, s*0.44, s*0.76);
    // 文字風線
    ctx.fillStyle = '#aaa';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(-s*0.18, -s*0.28 + i*s*0.16, s*0.36, s*0.04);
    }
    // 背表紙線
    ctx.fillStyle = '#0002';
    ctx.fillRect(-s*0.3, -s*0.42, s*0.06, s*0.84);
  },

};

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
