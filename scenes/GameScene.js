const PANEL_SIZE  = 310;
const PANEL_SCALE = PANEL_SIZE / 1024;
const PX          = 45;   // パネル左端 X
const TOP_Y       = 74;   // 上パネル上端 Y
const BOT_Y       = 396;  // 下パネル上端 Y

// 演出閾値（秒）
const SPEED_AMAZING = 2;
const SPEED_GREAT   = 5;

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) {
    this.stageNum       = data.stageNum       || 1;
    this.gameMode       = data.mode           || 'stage';
    this.roundNum       = data.round          || 1;
    this.excludeDiffTypes = data.excludeDiffTypes || [];
    this.pd             = PlayerData.load();
    this.cfg            = getStageConfig(this.stageNum);
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const cfg = this.cfg;

    this.missCount  = 0;
    this.foundCount = 0;
    this.gameOver   = false;
    this._foundSet  = new Set();
    this._lastFoundTime = null;
    this.elapsedSec = 0;
    this.hearts     = cfg.diffCount; // ステージは3ハート固定（ランクはミスで秒ペナルティ）
    this.maxHearts  = this.gameMode === 'stage' ? 3 : Infinity;
    this.missLimit  = this.gameMode === 'stage' ? 3 : Infinity;

    // パズル生成
    const gen  = new SceneGen();
    const seed = this.stageNum * 9999 + (Date.now() % 1000);
    const { baseCanvas, diffCanvas, rects } = gen.generate(
      cfg.world.id, cfg.diffCount, seed, cfg.diffTier, cfg.maxSprites, this.excludeDiffTypes
    );
    this.diffRects     = rects;
    this._rawDiffCanvas = diffCanvas;
    this.totalDiffs = rects.length;

    const bKey = 'b' + Date.now(), dKey = 'd' + (Date.now()+1);
    this.textures.addCanvas(bKey, baseCanvas);
    this.textures.addCanvas(dKey, diffCanvas);

    // 背景
    this.add.rectangle(W/2, H/2, W, H, 0x0d0d20);

    // HUDバー
    this.add.rectangle(W/2, 28, W, 56, 0x0f3460);
    const worldName = cfg.world.name;
    this.add.text(10, 28, `${this.stageNum}. ${worldName}`, {
      fontSize:'14px', fontFamily:'sans-serif', color:'#aaccff', fontStyle:'bold',
    }).setOrigin(0, 0.5);

    this.foundText = this.add.text(W/2, 18, `残り ${this.totalDiffs} 箇所`, {
      fontSize:'16px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold',
    }).setOrigin(0.5);
    this.timerText = this.add.text(W/2, 38, '0:00', {
      fontSize:'13px', fontFamily:'sans-serif', color:'#aaaacc',
    }).setOrigin(0.5);

    // ハートアイコン
    this.heartTexts = [];
    for (let i = 0; i < Math.min(this.missLimit, 5); i++) {
      const ht = this.add.text(W - 12 - i * 22, 28, '♥', {
        fontSize:'18px', fontFamily:'sans-serif', color:'#ff4444',
      }).setOrigin(1, 0.5);
      this.heartTexts.push(ht);
    }

    // ラベル
    this.add.text(W/2, TOP_Y - 8, 'オリジナル', {
      fontSize:'12px', fontFamily:'sans-serif', color:'#7f8c8d',
    }).setOrigin(0.5, 1);
    this.add.text(W/2, BOT_Y - 8, 'まちがいを探せ！', {
      fontSize:'13px', fontFamily:'sans-serif', color:'#f39c12', fontStyle:'bold',
    }).setOrigin(0.5, 1);

    // パネル
    this.add.rectangle(W/2, TOP_Y + PANEL_SIZE/2, PANEL_SIZE+4, PANEL_SIZE+4, 0x333355);
    this.add.rectangle(W/2, BOT_Y + PANEL_SIZE/2, PANEL_SIZE+4, PANEL_SIZE+4, 0x1a5a2a);
    this.add.image(PX, TOP_Y, bKey).setOrigin(0,0).setDisplaySize(PANEL_SIZE, PANEL_SIZE);
    this.add.image(PX, BOT_Y, dKey).setOrigin(0,0).setDisplaySize(PANEL_SIZE, PANEL_SIZE);

    // マーカー
    this.markGfx = this.add.graphics();

    // クリックゾーン（下パネルのみ正当）
    const zBot = this.add.zone(PX, BOT_Y, PANEL_SIZE, PANEL_SIZE).setOrigin(0,0);
    zBot.setInteractive({ useHandCursor:true });
    zBot.on('pointerdown', p => this._onTap(p.x - PX, p.y - BOT_Y));

    const zTop = this.add.zone(PX, TOP_Y, PANEL_SIZE, PANEL_SIZE).setOrigin(0,0);
    zTop.setInteractive({ useHandCursor:true });
    zTop.on('pointerdown', () => this._miss());

    // 戻るボタン
    const back = this.add.text(8, H - 12, '← 戻る', {
      fontSize:'13px', fontFamily:'sans-serif', color:'#556677',
    }).setOrigin(0,1).setInteractive({ useHandCursor:true });
    back.on('pointerdown', () => {
      this.scene.stop();
      this.scene.start(this.gameMode === 'rankMatch' ? 'RankMatch' : 'StageSelect');
    });

    // 演出テキスト
    this.effectText = this.add.text(W/2, BOT_Y + PANEL_SIZE/2, '', {
      fontSize:'38px', fontFamily:'sans-serif', color:'#ffff00', fontStyle:'bold',
    }).setOrigin(0.5).setAlpha(0);

    // タイマー（経過時間）
    this.timerEvent = this.time.addEvent({
      delay: 1000, loop: true,
      callback: () => {
        if (!this.gameOver) {
          this.elapsedSec++;
          const m = Math.floor(this.elapsedSec / 60);
          const s = this.elapsedSec % 60;
          this.timerText.setText(`${m}:${s.toString().padStart(2,'0')}`);
        }
      },
    });

    // リザルト・チュートリアル
    this._buildResult(W, H);
    this.resultContainer.setVisible(false);

    // 虫眼鏡（ステージモードのみ）
    if (this.gameMode === 'stage') this._setupLoupe();

    if (this.stageNum === 1) this._showTutorial();
  }

  _onTap(lx, ly) {
    if (this.gameOver) return;
    const tx = lx / PANEL_SCALE, ty = ly / PANEL_SCALE;
    const now = Date.now();

    const hitIdx = this.diffRects.findIndex((r, i) =>
      !this._foundSet.has(i) &&
      tx >= r.x && tx <= r.x + r.w &&
      ty >= r.y && ty <= r.y + r.h
    );

    if (hitIdx >= 0) {
      this._foundSet.add(hitIdx);
      const dt = this._lastFoundTime ? (now - this._lastFoundTime) / 1000 : 99;
      this._lastFoundTime = now;
      this._drawCircle(hitIdx);
      this.foundCount++;
      const remaining = this.totalDiffs - this.foundCount;
      this.foundText.setText(remaining > 0 ? `残り ${remaining} 箇所` : '全部見つけた！');
      this._showFindEffect(dt);
      if (this.foundCount >= this.totalDiffs) this._endGame();
    } else {
      this._miss();
    }
  }

  _miss() {
    if (this.gameOver) return;
    this.missCount++;
    if (this.gameMode === 'stage') {
      const ht = this.heartTexts[this.missCount - 1];
      if (ht) ht.setAlpha(0.15);
    }
    this._flash(0xff0000, 0.45);
    if (this.gameMode === 'stage' && this.missCount >= this.missLimit) {
      this._endGame();
    }
  }

  _showFindEffect(dt) {
    let word, color;
    if (dt <= SPEED_AMAZING) { word = 'AMAZING!!'; color = '#ff44ff'; }
    else if (dt <= SPEED_GREAT) { word = 'GREAT!'; color = '#ffff00'; }
    else { word = 'NICE!'; color = '#00ffcc'; }

    this.effectText.setText(word).setColor(color).setAlpha(1).setScale(0.5);
    this.tweens.add({
      targets: this.effectText, scaleX:1.3, scaleY:1.3, alpha:0,
      duration: 800, ease:'Cubic.Out',
    });
    this._flash(0x00ff88, 0.2);
  }

  _drawCircle(idx) {
    const r  = this.diffRects[idx];
    const cx = PX + (r.x + r.w/2) * PANEL_SCALE;
    const cBY = BOT_Y + (r.y + r.h/2) * PANEL_SCALE;
    const cTY = TOP_Y + (r.y + r.h/2) * PANEL_SCALE;
    const rad = Math.max(r.w, r.h) * PANEL_SCALE * 0.6;

    this.markGfx.lineStyle(3, 0x00ff88, 1);
    this.markGfx.strokeCircle(cx, cBY, rad);
    this.markGfx.lineStyle(3, 0x00ff88, 0.5);
    this.markGfx.strokeCircle(cx, cTY, rad);

    // アニメ（円を広げて縮める）
    const ring = this.add.graphics();
    ring.lineStyle(3, 0xffffff, 1);
    ring.strokeCircle(cx, cBY, rad * 0.4);
    this.tweens.add({
      targets: ring,
      scaleX: 2.5, scaleY: 2.5, alpha: 0,
      duration: 400, ease:'Quad.Out',
      onComplete: () => ring.destroy(),
    });
  }

  _flash(color, alpha) {
    const f = this.add.rectangle(
      this.scale.width/2, BOT_Y + PANEL_SIZE/2,
      PANEL_SIZE, PANEL_SIZE, color, alpha
    );
    this.tweens.add({ targets:f, alpha:0, duration:250, onComplete:()=>f.destroy() });
  }

  _endGame() {
    this.gameOver = true;
    this.timerEvent.remove();
    const found  = this.foundCount, total = this.totalDiffs;
    const ratio  = total > 0 ? found / total : 0;
    const noMiss = this.missCount === 0;

    let stars;
    if (found >= total)  stars = 3;
    else if (ratio >= 0.667) stars = 2;
    else if (ratio >= 0.334) stars = 1;
    else               stars = 0;

    if (this.gameMode === 'stage') {
      const res = this.pd.saveStageResult(this.stageNum, stars, this.elapsedSec);
    } else if (this.gameMode === 'rankMatch') {
      // ランクマッチはResultScene経由でRP計算
    }

    this.time.delayedCall(600, () => this._showResult(stars));
  }

  // ─── リザルトパネル ────────────────────────────────────────
  _buildResult(W, H) {
    this.resultContainer = this.add.container(W/2, H/2 + 10);
    const bg = this.add.rectangle(0, 0, 360, 420, 0x08081e, 0.97);
    bg.setStrokeStyle(2, 0x4444aa);

    this._rTitle = this.add.text(0, -175, '', {
      fontSize:'28px', fontFamily:'sans-serif', color:'#ffdd44', fontStyle:'bold',
    }).setOrigin(0.5);
    this._rWorld = this.add.text(0, -138, '', {
      fontSize:'14px', fontFamily:'sans-serif', color:'#8888aa',
    }).setOrigin(0.5);
    this._rTime  = this.add.text(0, -108, '', {
      fontSize:'16px', fontFamily:'sans-serif', color:'#cccccc',
    }).setOrigin(0.5);
    this._rScore = this.add.text(0, -80, '', {
      fontSize:'14px', fontFamily:'sans-serif', color:'#aaaaaa',
    }).setOrigin(0.5);

    this._rStars = [];
    for (let i = 0; i < 3; i++) {
      const s = this.add.text(-80 + i*80, -40, '★', {
        fontSize:'52px', fontFamily:'sans-serif', color:'#333333',
      }).setOrigin(0.5);
      this._rStars.push(s);
    }

    // ボタン
    const nextAvail = this.stageNum < 100;
    const nextBtn = this._rBtn(0, 50, nextAvail ? '次のステージ →' : 'クリア！', 0x27ae60,
      () => {
        if (nextAvail) this.scene.start('Game', { stageNum: this.stageNum+1, mode:'stage' });
        else this.scene.start('Home');
      });
    const ansBtn  = this._rBtn(0, 50, '答えを見る', 0xb84800,
      () => this._reviewAnswers());
    const retryBtn = this._rBtn(0, 115, 'もう一度', 0x1565c0,
      () => this.scene.restart({ stageNum: this.stageNum, mode: this.gameMode }));
    const menuBtn  = this._rBtn(0, 175, '← 選択に戻る', 0x333344,
      () => this.scene.start(this.gameMode === 'rankMatch' ? 'RankMatch' : 'StageSelect'));

    this._rNextBtn = nextBtn;
    this._rAnsBtn  = ansBtn;

    this.resultContainer.add([
      bg, this._rTitle, this._rWorld, this._rTime, this._rScore,
      ...this._rStars,
      nextBtn.bg, nextBtn.t, ansBtn.bg, ansBtn.t,
      retryBtn.bg, retryBtn.t, menuBtn.bg, menuBtn.t,
    ]);
  }

  _rBtn(x, y, label, col, cb) {
    const bg = this.add.rectangle(x, y, 280, 50, col).setInteractive({ useHandCursor:true });
    bg.setStrokeStyle(1, 0xffffff, 0.2);
    const t = this.add.text(x, y, label, {
      fontSize:'17px', fontFamily:'sans-serif', color:'#ffffff',
    }).setOrigin(0.5);
    bg.on('pointerdown', cb);
    bg.on('pointerover',  () => bg.setAlpha(0.8));
    bg.on('pointerout',   () => bg.setAlpha(1));
    return { bg, t };
  }

  _showResult(stars) {
    const titles = ['ゲームオーバー','もう少し…','クリア！','パーフェクト！'];
    const colors  = ['#ff6666',     '#ffaa44',  '#66ddff', '#ffdd44'];
    const m = Math.floor(this.elapsedSec / 60), s = this.elapsedSec % 60;

    this._rTitle.setText(titles[stars]).setColor(colors[stars]);
    this._rWorld.setText(`${this.cfg.world.name} - Stage ${this.stageNum}`);
    this._rTime.setText(`クリアタイム: ${m}:${s.toString().padStart(2,'0')}`);
    this._rScore.setText(`発見: ${this.foundCount} / ${this.totalDiffs}　ミス: ${this.missCount}`);

    const isGameOver = stars === 0;
    this._rNextBtn.bg.setVisible(!isGameOver);
    this._rNextBtn.t.setVisible(!isGameOver);
    this._rAnsBtn.bg.setVisible(isGameOver);
    this._rAnsBtn.t.setVisible(isGameOver);

    this._rStars.forEach((st, i) => st.setColor(i < stars ? '#ffdd00':'#333333').setScale(0));
    this.resultContainer.setVisible(true);
    this._rStars.forEach((st, i) => {
      if (i < stars) {
        this.tweens.add({
          targets: st, scaleX:1, scaleY:1,
          delay: 200 + i*180, duration:280, ease:'Back.Out',
        });
      }
    });
  }

  _reviewAnswers() {
    this.resultContainer.setVisible(false);

    const ansGfx = this.add.graphics().setDepth(4);
    for (let i = 0; i < this.diffRects.length; i++) {
      if (this._foundSet.has(i)) continue;
      const r   = this.diffRects[i];
      const cx  = PX + (r.x + r.w/2) * PANEL_SCALE;
      const cyB = BOT_Y + (r.y + r.h/2) * PANEL_SCALE;
      const cyT = TOP_Y + (r.y + r.h/2) * PANEL_SCALE;
      const rad = Math.max(r.w, r.h) * PANEL_SCALE * 0.65;
      ansGfx.lineStyle(3, 0xff4444, 1);
      ansGfx.strokeCircle(cx, cyB, rad);
      ansGfx.lineStyle(3, 0xff4444, 0.5);
      ansGfx.strokeCircle(cx, cyT, rad);
    }

    const W = this.scale.width, H = this.scale.height;
    const label = this.add.text(W/2, BOT_Y - 20, '← 未発見の差分', {
      fontSize:'13px', fontFamily:'sans-serif', color:'#ff8888',
    }).setOrigin(0.5).setDepth(5);

    const backBg = this.add.rectangle(W/2, H - 38, 220, 44, 0x333344)
      .setInteractive({ useHandCursor:true }).setDepth(5);
    backBg.setStrokeStyle(1, 0x888888);
    const backT = this.add.text(W/2, H - 38, '結果に戻る', {
      fontSize:'16px', fontFamily:'sans-serif', color:'#ffffff',
    }).setOrigin(0.5).setDepth(5);

    backBg.on('pointerdown', () => {
      ansGfx.destroy(); backBg.destroy(); backT.destroy(); label.destroy();
      this.resultContainer.setVisible(true);
    });
  }

  // ─── チュートリアル（ステージ1）────────────────────────────
  _showTutorial() {
    const W = this.scale.width, H = this.scale.height;
    const overlay = this.add.container(0, 0).setDepth(15);

    const dim  = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.80);
    const box  = this.add.rectangle(W/2, H/2, W - 20, 260, 0x0f3460, 0.97);
    box.setStrokeStyle(2, 0x4488cc);

    const lines = [
      '下の絵をタップしてみよう！',
      '2枚の絵を見比べて',
      '違う箇所を見つけよう。',
      '',
      '上：オリジナル',
      '下：まちがいを探せ！',
      '',
      '🔍 虫眼鏡ボタンで拡大できるよ',
    ];
    const textObjs = [];
    let ty = H/2 - 108;
    for (const l of lines) {
      const t = this.add.text(W/2, ty, l, {
        fontSize:'16px', fontFamily:'sans-serif', color:'#ffffff', align:'center',
      }).setOrigin(0.5);
      textObjs.push(t);
      ty += 26;
    }

    const okBtn = this.add.rectangle(W/2, H/2 + 108, 200, 44, 0x2980b9)
      .setInteractive({ useHandCursor:true });
    const okTxt = this.add.text(W/2, H/2 + 108, 'はじめる！', {
      fontSize:'18px', fontFamily:'sans-serif', color:'#ffffff',
    }).setOrigin(0.5);

    overlay.add([dim, box, ...textObjs, okBtn, okTxt]);
    okBtn.on('pointerdown', () => overlay.destroy());
  }

  // ─── 虫眼鏡ルーペ ─────────────────────────────────────────
  _setupLoupe() {
    const W = this.scale.width, H = this.scale.height;
    this._loupeActive = false;
    const gc = this.sys.game.canvas;

    const loupeCv = document.createElement('canvas');
    loupeCv.width = 180; loupeCv.height = 180;
    Object.assign(loupeCv.style, {
      position:'fixed', borderRadius:'50%',
      border:'3px solid #ffffff',
      boxShadow:'0 2px 14px rgba(0,0,0,0.7)',
      pointerEvents:'none', display:'none', zIndex:'1000',
    });
    document.body.appendChild(loupeCv);
    this._loupeCv  = loupeCv;
    this._loupeCtx = loupeCv.getContext('2d');
    this.events.once('shutdown', () => loupeCv.remove());
    this.events.once('destroy',  () => loupeCv.remove());

    const btn = this.add.text(W - 12, H - 38, '🔍', {
      fontSize:'28px', fontFamily:'sans-serif',
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor:true }).setAlpha(0.5);
    btn.on('pointerdown', () => {
      this._loupeActive = !this._loupeActive;
      btn.setAlpha(this._loupeActive ? 1 : 0.5);
      if (!this._loupeActive) loupeCv.style.display = 'none';
    });

    this.input.on('pointermove', (ptr) => {
      if (!this._loupeActive || this.gameOver) return;
      const lpx = ptr.x - PX, lpy = ptr.y - BOT_Y;
      if (lpx >= 0 && lpx <= PANEL_SIZE && lpy >= 0 && lpy <= PANEL_SIZE) {
        this._renderLoupe(ptr.x, ptr.y, lpx, lpy, gc);
      } else {
        loupeCv.style.display = 'none';
      }
    });
    this.input.on('pointerup', () => {
      if (this._loupeActive) loupeCv.style.display = 'none';
    });
  }

  _renderLoupe(worldX, worldY, lpx, lpy, gc) {
    const rect   = gc.getBoundingClientRect();
    const scaleX = rect.width  / this.scale.width;
    const scaleY = rect.height / this.scale.height;
    const lSize  = 180;
    const sx = rect.left + worldX * scaleX;
    const sy = rect.top  + worldY * scaleY;

    this._loupeCv.style.left = (sx - lSize / 2) + 'px';
    this._loupeCv.style.top  = (sy - lSize - 100) + 'px';
    this._loupeCv.style.display = 'block';

    const tx   = lpx / PANEL_SCALE;
    const ty   = lpy / PANEL_SCALE;
    const srcR = 55;
    const ctx  = this._loupeCtx;
    ctx.clearRect(0, 0, lSize, lSize);
    ctx.save();
    ctx.beginPath();
    ctx.arc(lSize / 2, lSize / 2, lSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      this._rawDiffCanvas,
      Math.max(0, tx - srcR), Math.max(0, ty - srcR), srcR * 2, srcR * 2,
      0, 0, lSize, lSize
    );
    ctx.restore();
  }
}
