class SpeedScene extends Phaser.Scene {
  constructor() { super('Speed'); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.pd       = PlayerData.load();
    this.score    = 0;
    this.alive    = true;
    this.interval = SPEED_INTERVAL_MS;
    this._foundThis = false;

    this.add.rectangle(W/2, H/2, W, H, 0x0d0d20);
    this.add.rectangle(W/2, 28, W, 56, 0x4a0080);
    this.add.text(W/2, 18, 'スピードモード', {
      fontSize:'18px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold',
    }).setOrigin(0.5);
    this.add.text(W/2, 38, '5秒以内に1つ見つけろ！', {
      fontSize:'12px', fontFamily:'sans-serif', color:'#cc88ff',
    }).setOrigin(0.5);

    this.scoreText = this.add.text(W - 10, 28, 'スコア: 0', {
      fontSize:'16px', fontFamily:'sans-serif', color:'#ffcc44', fontStyle:'bold',
    }).setOrigin(1, 0.5);

    const back = this.add.text(10, 28, '←', {
      fontSize:'22px', fontFamily:'sans-serif', color:'#8888aa',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor:true });
    back.on('pointerdown', () => this.scene.start('Home'));

    // タイムバー
    this.timeBarBg = this.add.rectangle(W/2, 64, W - 20, 14, 0x333344);
    this.timeBarBg.setStrokeStyle(1, 0x555566);
    this.timeBar   = this.add.rectangle(10, 64, W - 20, 14, 0x00cc44).setOrigin(0, 0.5);

    // パズルパネル（1枚：下にのみ表示、上はオリジナル）
    this.markGfx = this.add.graphics();
    this._panelImgs = [];

    // シャッター演出
    this.shutter = this.add.rectangle(W/2, 300, W, 700, 0x000000, 0).setDepth(5);

    // 効果テキスト
    this.effectTxt = this.add.text(W/2, BOT_Y + PANEL_SIZE/2, '', {
      fontSize:'40px', fontFamily:'sans-serif', color:'#ffff44', fontStyle:'bold',
    }).setOrigin(0.5).setAlpha(0).setDepth(6);

    this._nextPuzzle();
  }

  _nextPuzzle() {
    if (!this.alive) return;
    this._foundThis  = false;
    this._rects      = null;
    this._timeLeft   = this.interval;

    // 古いパネルを削除
    this._panelImgs.forEach(i => i.destroy());
    this._panelImgs = [];
    this.markGfx.clear();

    const gen  = new SceneGen();
    const diff = Math.floor(this.score / 5) % 5; // 難度を徐々に上げる
    const worldId = WORLDS[Math.min(diff, WORLDS.length-1)].id;
    const { baseCanvas, diffCanvas, rects } = gen.generate(worldId, 3 + diff, Date.now(), Math.min(diff + 1, 3));
    this.diffRects = rects;

    const bKey = 'sb' + Date.now(), dKey = 'sd' + (Date.now()+1);
    this.textures.addCanvas(bKey, baseCanvas);
    this.textures.addCanvas(dKey, diffCanvas);

    const W = this.scale.width;
    const imgT = this.add.image(PX, TOP_Y, bKey).setOrigin(0,0).setDisplaySize(PANEL_SIZE, PANEL_SIZE);
    const imgB = this.add.image(PX, BOT_Y, dKey).setOrigin(0,0).setDisplaySize(PANEL_SIZE, PANEL_SIZE);
    this._panelImgs = [imgT, imgB];

    // クリックゾーン
    if (this._tapZone) this._tapZone.destroy();
    this._tapZone = this.add.zone(PX, BOT_Y, PANEL_SIZE, PANEL_SIZE).setOrigin(0,0);
    this._tapZone.setInteractive({ useHandCursor:true });
    this._tapZone.on('pointerdown', p => this._onTap(p.x - PX, p.y - BOT_Y));

    // カウントダウンタイマー
    if (this._countTimer) this._countTimer.remove();
    this._countTimer = this.time.addEvent({
      delay: 50, loop:true,
      callback: () => {
        if (!this.alive) return;
        this._timeLeft -= 50;
        const ratio = Math.max(0, this._timeLeft / this.interval);
        this.timeBar.setDisplaySize((this.scale.width - 20) * ratio, 14);
        this.timeBar.setFillStyle(ratio > 0.4 ? 0x00cc44 : ratio > 0.2 ? 0xffaa00 : 0xff3300);
        if (this._timeLeft <= 0) this._gameOver();
      },
    });
  }

  _onTap(lx, ly) {
    if (this._foundThis || !this.alive) return;
    const tx = lx / PANEL_SCALE, ty = ly / PANEL_SCALE;
    const hit = this.diffRects.find(r =>
      tx >= r.x && tx <= r.x + r.w && ty >= r.y && ty <= r.y + r.h
    );
    if (hit) {
      this._foundThis = true;
      this._countTimer.remove();
      this.score++;
      this.scoreText.setText(`スコア: ${this.score}`);

      // 円演出
      const cx = PX + (hit.x + hit.w/2) * PANEL_SCALE;
      const cy = BOT_Y + (hit.y + hit.h/2) * PANEL_SCALE;
      const rad = Math.max(hit.w, hit.h) * PANEL_SCALE * 0.6;
      this.markGfx.lineStyle(4, 0x00ff88, 1);
      this.markGfx.strokeCircle(cx, cy, rad);

      this.effectTxt.setText('NICE!').setAlpha(1).setScale(0.5);
      this.tweens.add({ targets:this.effectTxt, scaleX:1.4, scaleY:1.4, alpha:0, duration:600 });

      // シャッター切り替え
      this.time.delayedCall(600, () => this._shutter());
    }
  }

  _shutter() {
    this.shutter.setAlpha(1);
    this.tweens.add({
      targets: this.shutter, alpha:0, duration:300,
      onComplete: () => this._nextPuzzle(),
    });
  }

  _gameOver() {
    if (!this.alive) return;
    this.alive = false;
    this._countTimer?.remove();
    const isNew = this.pd.updateSpeedBest(this.score);

    const W = this.scale.width, H = this.scale.height;
    const dim = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.8).setDepth(10);
    const box = this.add.rectangle(W/2, H/2, 340, 280, 0x0f0f2a, 0.97).setDepth(10);
    box.setStrokeStyle(2, 0x9b59b6);

    this.add.text(W/2, H/2 - 100, 'タイムアップ！', {
      fontSize:'26px', fontFamily:'sans-serif', color:'#ff6666', fontStyle:'bold',
    }).setOrigin(0.5).setDepth(11);
    this.add.text(W/2, H/2 - 55, `スコア: ${this.score}`, {
      fontSize:'32px', fontFamily:'sans-serif', color:'#ffcc44', fontStyle:'bold',
    }).setOrigin(0.5).setDepth(11);
    if (isNew) {
      this.add.text(W/2, H/2 - 15, '🎉 ベスト更新！', {
        fontSize:'18px', fontFamily:'sans-serif', color:'#00ffcc',
      }).setOrigin(0.5).setDepth(11);
    } else {
      this.add.text(W/2, H/2 - 15, `ベスト: ${this.pd.speedBest}`, {
        fontSize:'16px', fontFamily:'sans-serif', color:'#aaaaaa',
      }).setOrigin(0.5).setDepth(11);
    }

    const retry = this.add.rectangle(W/2, H/2 + 60, 220, 50, 0x9b59b6).setInteractive({ useHandCursor:true }).setDepth(11);
    this.add.text(W/2, H/2 + 60, 'もう一度', { fontSize:'18px', fontFamily:'sans-serif', color:'#fff' }).setOrigin(0.5).setDepth(12);
    retry.on('pointerdown', () => this.scene.restart());
    const home = this.add.rectangle(W/2, H/2 + 120, 220, 50, 0x333344).setInteractive({ useHandCursor:true }).setDepth(11);
    this.add.text(W/2, H/2 + 120, 'ホームへ', { fontSize:'18px', fontFamily:'sans-serif', color:'#fff' }).setOrigin(0.5).setDepth(12);
    home.on('pointerdown', () => this.scene.start('Home'));
  }
}
