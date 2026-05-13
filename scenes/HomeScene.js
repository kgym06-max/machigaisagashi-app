class HomeScene extends Phaser.Scene {
  constructor() { super('Home'); }

  create() {
    this.pd = PlayerData.load();
    const W = this.scale.width, H = this.scale.height;
    const rank = getRankFromRP(this.pd.rankRP);

    // 背景：白
    this.add.rectangle(W/2, H/2, W, H, 0xfafafa);

    // ─── ヘッダー（赤）──────────────────────────────────────
    this.add.rectangle(W/2, 60, W, 120, 0xc41c00);

    this.add.text(W/2, 22, '某ファミリーレストランの', {
      fontSize:'13px', fontFamily:'sans-serif', color:'#ffcccc',
    }).setOrigin(0.5);
    this.add.text(W/2, 44, '間違い探しを練習するアプリ', {
      fontSize:'16px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold',
    }).setOrigin(0.5);

    // ランクバッジ
    this.add.rectangle(60, 88, 108, 36, 0x8b1300);
    this.add.text(22, 88, rank.badge, {
      fontSize:'18px', fontFamily:'sans-serif', color: rank.color, fontStyle:'bold',
    }).setOrigin(0, 0.5);
    this.add.text(52, 88, rank.name, {
      fontSize:'13px', fontFamily:'sans-serif', color:'#ffdddd',
    }).setOrigin(0, 0.5);

    this.add.text(W - 12, 80, `Stage ${this.pd.maxStageCleared || 0}`, {
      fontSize:'14px', fontFamily:'sans-serif', color:'#ffeeaa',
    }).setOrigin(1, 0.5);
    this.add.text(W - 12, 98, `★ ${this.pd.totalStars}`, {
      fontSize:'13px', fontFamily:'sans-serif', color:'#ffe0a0',
    }).setOrigin(1, 0.5);

    const gear = this.add.text(W - 10, 16, '⚙', {
      fontSize:'22px', fontFamily:'sans-serif', color:'#ffcccc',
    }).setOrigin(1, 0).setInteractive({ useHandCursor:true });
    gear.on('pointerdown', () => this.scene.launch('Settings', { caller:'Home' }));

    // ─── メインボタン（ステージ：赤、ランクマッチ：緑）────
    this._bigBtn(W/2, 210, 340, 110, 'ステージ', '100ステージ', 0xc41c00,
      () => this.scene.start('StageSelect'));

    this._bigBtn(W/2, 340, 340, 110, 'ランクマッチ', '個人タイムを競え！', 0x2e7d32,
      () => this.scene.start('RankMatch'));

    // ─── サブボタン（フレンドマッチ：緑系、スピード：紫）──
    this._smallBtn(W/2 - 90, 456, 160, 70, 'フレンド\nマッチ', '準備中', 0x1b5e20,
      () => {});
    this._smallBtn(W/2 + 90, 456, 160, 70, 'スピード\nモード', '1問5秒！', 0x7d3c98,
      () => this.scene.start('Speed'));

    // ─── 記録帯（薄い赤みがかったクリーム）──────────────
    this.add.rectangle(W/2, 570, W, 72, 0xfce8e5);
    this.add.text(W/2, 548, `総プレイ: ${this.pd.totalPlays}回　連続ログイン: ${this.pd.loginStreak}日`, {
      fontSize:'13px', fontFamily:'sans-serif', color:'#8b3a2a',
    }).setOrigin(0.5);
    this.add.text(W/2, 572, `ランクポイント: ${this.pd.rankRP} RP`, {
      fontSize:'15px', fontFamily:'sans-serif', color: rank.color, fontStyle:'bold',
    }).setOrigin(0.5);
    if (this.pd.speedBest !== null) {
      this.add.text(W/2, 594, `スピードベスト: ${this.pd.speedBest}問`, {
        fontSize:'13px', fontFamily:'sans-serif', color:'#9b59b6',
      }).setOrigin(0.5);
    }

    // ─── フッター ─────────────────────────────────────────
    this.add.text(W/2, H - 14, '某ファミリーレストランの間違い探し練習アプリ', {
      fontSize:'10px', fontFamily:'sans-serif', color:'#ccbbbb',
    }).setOrigin(0.5, 1);
  }

  _bigBtn(x, y, w, h, title, sub, col, cb) {
    const bg = this.add.rectangle(x, y, w, h, col).setInteractive({ useHandCursor:true });
    bg.setStrokeStyle(2, 0xffffff, 0.2);
    this.add.text(x, y - 14, title, {
      fontSize:'24px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold',
    }).setOrigin(0.5);
    this.add.text(x, y + 20, sub, {
      fontSize:'13px', fontFamily:'sans-serif', color:'#ffffffbb',
    }).setOrigin(0.5);
    bg.on('pointerdown', cb);
    bg.on('pointerover',  () => bg.setAlpha(0.85));
    bg.on('pointerout',   () => bg.setAlpha(1));
    return bg;
  }

  _smallBtn(x, y, w, h, title, sub, col, cb) {
    const bg = this.add.rectangle(x, y, w, h, col).setInteractive({ useHandCursor:true });
    bg.setStrokeStyle(1, 0xffffff, 0.15);
    this.add.text(x, y - 10, title, {
      fontSize:'15px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold', align:'center',
    }).setOrigin(0.5);
    this.add.text(x, y + 18, sub, {
      fontSize:'11px', fontFamily:'sans-serif', color:'#ffffffaa',
    }).setOrigin(0.5);
    bg.on('pointerdown', cb);
    bg.on('pointerover',  () => bg.setAlpha(0.85));
    bg.on('pointerout',   () => bg.setAlpha(1));
    return bg;
  }
}
