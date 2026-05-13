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
    this.stageNum         = data.stageNum         || 1;
    this.gameMode         = data.mode             || 'stage';
    this.roundNum         = data.round            || 1;
    this.excludeDiffTypes = data.excludeDiffTypes || [];
    this.allRoundResults  = data.allRoundResults  || [];
    this.pd               = PlayerData.load();
    this.cfg              = getStageConfig(this.stageNum);
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
      cfg.world.id, cfg.diffCount, seed,
      cfg.diffTier, cfg.maxSprites, this.excludeDiffTypes, cfg.diffIntensity
    );
    this.diffRects     = rects;
    this._rawDiffCanvas = diffCanvas;
    this.totalDiffs = rects.length;

    const bKey = 'b' + Date.now(), dKey = 'd' + (Date.now()+1);
    this.textures.addCanvas(bKey, baseCanvas);
    this.textures.addCanvas(dKey, diffCanvas);

    // 背景
    this.add.rectangle(W/2, H/2, W, H, 0x0d0d20);

    // HUDバー（ランクマッチは紫系）
    this.add.rectangle(W/2, 28, W, 56, this.gameMode === 'rankMatch' ? 0x3d0060 : 0x0f3460);
    const worldName = cfg.world.name;
    const hdrLabel  = this.gameMode === 'rankMatch'
      ? `RANK  Round ${this.roundNum}/${RANK_MATCH_ROUNDS}`
      : `${this.stageNum}. ${worldName}`;
    this.add.text(10, 28, hdrLabel, {
      fontSize:'14px', fontFamily:'sans-serif',
      color: this.gameMode === 'rankMatch' ? '#ddbbff' : '#aaccff',
      fontStyle:'bold',
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
    zBot.on('pointerdown', p => {
      const lx = p.x - PX, ly = p.y - BOT_Y;
      if (this._loupeActive) {
        // 虫眼鏡モード：押下時はタップせず、最終位置を覚えておく
        this._loupeDragging = true;
        this._loupeLastPos  = { x: lx, y: ly };
        return;
      }
      this._onTap(lx, ly);
    });

    // 虫眼鏡モードでの離した瞬間のタップ判定
    this.input.on('pointerup', (p) => {
      if (this._loupeActive && this._loupeDragging && this._loupeLastPos) {
        const { x, y } = this._loupeLastPos;
        if (x >= 0 && x <= PANEL_SIZE && y >= 0 && y <= PANEL_SIZE) {
          this._onTap(x, y);
        }
        this._loupeDragging = false;
        this._loupeLastPos  = null;
      }
    });

    const zTop = this.add.zone(PX, TOP_Y, PANEL_SIZE, PANEL_SIZE).setOrigin(0,0);
    zTop.setInteractive({ useHandCursor:true });
    zTop.on('pointerdown', () => {
      if (this._loupeActive) return; // 虫眼鏡時は上のパネルもミス扱いしない
      this._miss();
    });

    // 戻るボタン（ランクマッチでは確認）
    const back = this.add.text(8, H - 12, '← 戻る', {
      fontSize:'13px', fontFamily:'sans-serif', color:'#556677',
    }).setOrigin(0,1).setInteractive({ useHandCursor:true });
    back.on('pointerdown', () => {
      if (this.gameMode === 'rankMatch' && !this.gameOver) {
        this._confirmAbort();
      } else {
        this.scene.stop();
        this.scene.start(this.gameMode === 'rankMatch' ? 'RankMatch' : 'StageSelect');
      }
    });

    // 演出テキスト
    this.effectText = this.add.text(W/2, BOT_Y + PANEL_SIZE/2, '', {
      fontSize:'38px', fontFamily:'sans-serif', color:'#ffff00', fontStyle:'bold',
    }).setOrigin(0.5).setAlpha(0);

    // タイマー（経過時間：参考値、色が変わる）
    this.timerEvent = this.time.addEvent({
      delay: 1000, loop: true,
      callback: () => {
        if (this.gameOver) return;
        this.elapsedSec++;
        const m = Math.floor(this.elapsedSec / 60);
        const s = this.elapsedSec % 60;
        this.timerText.setText(`${m}:${s.toString().padStart(2,'0')}`);
        const ratio = this.elapsedSec / cfg.timeSec;
        this.timerText.setColor(
          ratio > 1.2 ? '#ff5555' : ratio > 0.8 ? '#ffaa44' : '#aaaacc'
        );
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
      if (ht) {
        // ハートが割れるアニメ：拡大→透過
        this.tweens.add({
          targets: ht, scaleX: 1.5, scaleY: 1.5,
          duration: 120, ease: 'Quad.Out', yoyo: false,
          onComplete: () => {
            ht.setText('♡').setColor('#660000');
            this.tweens.add({
              targets: ht, scaleX: 1, scaleY: 1, alpha: 0.25,
              duration: 180, ease: 'Quad.In',
            });
          },
        });
      }
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
    if (this._loupeCv) this._loupeCv.style.display = 'none';

    const found  = this.foundCount, total = this.totalDiffs;
    const ratio  = total > 0 ? found / total : 0;

    let stars;
    if (found >= total)       stars = 3;
    else if (ratio >= 0.667)  stars = 2;
    else if (found >= 1)      stars = 1; // 1個でも見つければ1星（次解放）
    else                      stars = 0;

    if (this.gameMode === 'stage') {
      this.pd.saveStageResult(this.stageNum, stars, this.elapsedSec);
      this.time.delayedCall(600, () => this._showResult(stars));
    } else if (this.gameMode === 'rankMatch') {
      // ラウンド結果を記録
      this.allRoundResults.push({
        timeSec:   this.elapsedSec,
        missCount: this.missCount,
        found:     this.foundCount,
        total:     this.totalDiffs,
      });
      if (this.roundNum >= RANK_MATCH_ROUNDS) {
        // 全ラウンド終了 → 集計
        this.time.delayedCall(700, () =>
          this.scene.start('RankResult', { results: this.allRoundResults }));
      } else {
        // 次ラウンドへの中間オーバーレイ
        this.time.delayedCall(700, () => this._showRoundOverlay());
      }
    } else {
      this.time.delayedCall(600, () => this._showResult(stars));
    }
  }

  _confirmAbort() {
    const W = this.scale.width, H = this.scale.height;
    const overlay = this.add.container(W/2, H/2).setDepth(25);
    const dim = this.add.rectangle(-W/2, -H/2, W, H, 0x000000, 0.7)
      .setOrigin(0,0).setInteractive();
    const bg  = this.add.rectangle(0, 0, W - 60, 200, 0x1a0a2e, 0.98);
    bg.setStrokeStyle(2, 0xcc88ff);
    const t = this.add.text(0, -55,
      'ランクマッチを中断しますか？\nこのラウンドの記録は消えます。', {
      fontSize:'14px', fontFamily:'sans-serif', color:'#ffffff',
      align:'center', lineSpacing:6,
    }).setOrigin(0.5);
    const yes = this.add.rectangle(-70, 40, 120, 44, 0x7f0000)
      .setInteractive({ useHandCursor:true });
    const yesT = this.add.text(-70, 40, '中断', {
      fontSize:'15px', fontFamily:'sans-serif', color:'#ff8888',
    }).setOrigin(0.5);
    yes.on('pointerdown', () => { this.scene.stop(); this.scene.start('RankMatch'); });
    const no = this.add.rectangle(70, 40, 120, 44, 0x1a1a3e)
      .setInteractive({ useHandCursor:true });
    const noT = this.add.text(70, 40, '続ける', {
      fontSize:'15px', fontFamily:'sans-serif', color:'#ffffff',
    }).setOrigin(0.5);
    no.on('pointerdown', () => overlay.destroy());
    overlay.add([dim, bg, t, yes, yesT, no, noT]);
  }

  _showRoundOverlay() {
    const W = this.scale.width, H = this.scale.height;
    const overlay = this.add.container(W/2, H/2).setDepth(20);

    const bg = this.add.rectangle(0, 0, W - 40, 300, 0x0f0f2a, 0.97);
    bg.setStrokeStyle(2, 0x7b1fa2);

    const title = this.add.text(0, -110, `ラウンド ${this.roundNum} 完了！`, {
      fontSize:'22px', fontFamily:'sans-serif', color:'#cc88ff', fontStyle:'bold',
    }).setOrigin(0.5);

    const last = this.allRoundResults[this.allRoundResults.length - 1];
    const penalty = last.missCount * MISS_PENALTY_SEC;

    const t2 = this.add.text(0, -60,
      `${this.foundCount}/${this.totalDiffs}個 発見　タイム: ${last.timeSec}秒`, {
      fontSize:'15px', fontFamily:'sans-serif', color:'#ffffff',
    }).setOrigin(0.5);

    const t3 = this.add.text(0, -32,
      `ミス: ${last.missCount}回 (+${penalty}秒)`, {
      fontSize:'13px', fontFamily:'sans-serif', color:'#ff8888',
    }).setOrigin(0.5);

    const totalSoFar = this.allRoundResults.reduce(
      (s, r) => s + r.timeSec + r.missCount * MISS_PENALTY_SEC, 0);
    const t4 = this.add.text(0, -2,
      `累計タイム: ${totalSoFar}秒`, {
      fontSize:'17px', fontFamily:'sans-serif', color:'#ffcc44', fontStyle:'bold',
    }).setOrigin(0.5);

    const nextBtn = this.add.rectangle(0, 75, 260, 52, 0x7b1fa2)
      .setInteractive({ useHandCursor:true });
    nextBtn.setStrokeStyle(2, 0xcc88ff);
    const nextTxt = this.add.text(0, 75, `ラウンド ${this.roundNum + 1} へ →`, {
      fontSize:'17px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold',
    }).setOrigin(0.5);
    nextBtn.on('pointerdown', () => {
      this.scene.start('Game', {
        stageNum: 82 + (this.roundNum + 1) * 2,
        mode: 'rankMatch',
        round: this.roundNum + 1,
        allRoundResults: this.allRoundResults,
        excludeDiffTypes: ['size'],
      });
    });

    overlay.add([bg, title, t2, t3, t4, nextBtn, nextTxt]);
  }

  // ─── リザルトパネル ────────────────────────────────────────
  _buildResult(W, H) {
    this.resultContainer = this.add.container(W/2, H/2 + 10).setDepth(10);
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

    const btnBg = this.add.rectangle(W - 28, H - 38, 50, 50, 0x1a1a3e, 0.92)
      .setInteractive({ useHandCursor:true });
    btnBg.setStrokeStyle(2, 0x4488cc);
    const btnIcon = this.add.text(W - 28, H - 38, '🔍', {
      fontSize:'24px', fontFamily:'sans-serif',
    }).setOrigin(0.5).setAlpha(0.7);
    const btnLabel = this.add.text(W - 28, H - 12, '拡大', {
      fontSize:'10px', fontFamily:'sans-serif', color:'#88aacc',
    }).setOrigin(0.5);
    btnBg.on('pointerdown', () => {
      this._loupeActive = !this._loupeActive;
      btnIcon.setAlpha(this._loupeActive ? 1 : 0.7);
      btnBg.setFillStyle(this._loupeActive ? 0x2244aa : 0x1a1a3e, 0.92);
      btnLabel.setText(this._loupeActive ? '拡大ON' : '拡大');
      if (!this._loupeActive) loupeCv.style.display = 'none';
    });

    this.input.on('pointermove', (ptr) => {
      if (!this._loupeActive || this.gameOver) return;
      const lpx = ptr.x - PX, lpy = ptr.y - BOT_Y;
      if (lpx >= 0 && lpx <= PANEL_SIZE && lpy >= 0 && lpy <= PANEL_SIZE) {
        this._renderLoupe(ptr.x, ptr.y, lpx, lpy, gc);
        // ドラッグ中なら最終位置を更新
        if (this._loupeDragging) this._loupeLastPos = { x: lpx, y: lpy };
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

    // 画面端でクランプ
    const winW = window.innerWidth || document.documentElement.clientWidth;
    const winH = window.innerHeight || document.documentElement.clientHeight;
    const left = Math.max(4, Math.min(winW - lSize - 4, sx - lSize / 2));
    const top  = Math.max(4, Math.min(winH - lSize - 4, sy - lSize - 80));
    this._loupeCv.style.left = left + 'px';
    this._loupeCv.style.top  = top  + 'px';
    this._loupeCv.style.display = 'block';

    const tx   = lpx / PANEL_SCALE;
    const ty   = lpy / PANEL_SCALE;
    const srcR = 38; // 約2.4倍ズーム
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
    // 十字カーソル
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lSize/2 - 10, lSize/2); ctx.lineTo(lSize/2 + 10, lSize/2);
    ctx.moveTo(lSize/2, lSize/2 - 10); ctx.lineTo(lSize/2, lSize/2 + 10);
    ctx.stroke();
  }
}
