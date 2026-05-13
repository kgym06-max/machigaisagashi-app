class HomeScene extends Phaser.Scene {
  constructor() { super('Home'); }

  create() {
    this.pd = PlayerData.load();
    const W = this.scale.width, H = this.scale.height;
    const rank = getRankFromRP(this.pd.rankRP);

    // 背景
    this.add.rectangle(W/2, H/2, W, H, 0x0d0d20);

    // ─── ヘッダー ─────────────────────────────────────────
    this.add.rectangle(W/2, 60, W, 120, 0x0f3460);

    this.add.text(W/2, 22, '某ファミリーレストランの', {
      fontSize:'13px', fontFamily:'sans-serif', color:'#8888aa',
    }).setOrigin(0.5);
    this.add.text(W/2, 44, '間違い探しを練習するアプリ', {
      fontSize:'16px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold',
    }).setOrigin(0.5);

    // ランクバッジ
    const rankBg = this.add.rectangle(60, 88, 100, 36, 0x1a1a3e);
    this.add.text(28, 88, rank.badge, {
      fontSize:'18px', fontFamily:'sans-serif', color: rank.color, fontStyle:'bold',
    }).setOrigin(0, 0.5);
    this.add.text(58, 88, rank.name, {
      fontSize:'13px', fontFamily:'sans-serif', color: rank.color,
    }).setOrigin(0, 0.5);

    // ステージ進捗
    this.add.text(W - 12, 80, `Stage ${this.pd.maxStageCleared || 0}`, {
      fontSize:'14px', fontFamily:'sans-serif', color:'#ffcc44',
    }).setOrigin(1, 0.5);
    this.add.text(W - 12, 98, `★ ${this.pd.totalStars}`, {
      fontSize:'13px', fontFamily:'sans-serif', color:'#ffdd88',
    }).setOrigin(1, 0.5);

    // 設定ボタン
    const gear = this.add.text(W - 10, 16, '⚙', {
      fontSize:'22px', fontFamily:'sans-serif', color:'#888899',
    }).setOrigin(1, 0).setInteractive({ useHandCursor:true });
    gear.on('pointerdown', () => this.scene.launch('Settings', { caller:'Home' }));

    // ─── メインボタン（大：ステージ・ランクマッチ）────────
    const stage = this._bigBtn(W/2, 210, 340, 110, 'ステージ', '100ステージ 10の世界観', 0x1565c0,
      () => this.scene.start('StageSelect'));

    const rankLocked = this.pd.maxStageCleared < 10;
    const rankBtn = this._bigBtn(W/2, 340, 340, 110,
      'ランクマッチ',
      rankLocked ? '🔒 ステージ10クリアで解放' : '個人タイムを競え！',
      rankLocked ? 0x333344 : 0x7b1fa2,
      () => { if (!rankLocked) this.scene.start('RankMatch'); }
    );

    // ─── サブボタン（小：フレンドマッチ・スピード）────────
    this._smallBtn(W/2 - 90, 456, 160, 70, 'フレンド\nマッチ', '準備中', 0x1b4332,
      () => {});

    this._smallBtn(W/2 + 90, 456, 160, 70, 'スピード\nモード', '1問5秒！', 0x7d3c98,
      () => this.scene.start('Speed'));

    // ─── 記録帯 ───────────────────────────────────────────
    this.add.rectangle(W/2, 570, W, 72, 0x16213e);
    this.add.text(W/2, 548, `総プレイ: ${this.pd.totalPlays}回　連続ログイン: ${this.pd.loginStreak}日`, {
      fontSize:'13px', fontFamily:'sans-serif', color:'#8888aa',
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
      fontSize:'10px', fontFamily:'sans-serif', color:'#444455',
    }).setOrigin(0.5, 1);
  }

  _bigBtn(x, y, w, h, title, sub, col, cb) {
    const bg = this.add.rectangle(x, y, w, h, col).setInteractive({ useHandCursor:true });
    bg.setStrokeStyle(2, 0xffffff, 0.15);
    this.add.text(x, y - 14, title, {
      fontSize:'24px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold',
    }).setOrigin(0.5);
    this.add.text(x, y + 20, sub, {
      fontSize:'13px', fontFamily:'sans-serif', color:'#ffffffaa',
    }).setOrigin(0.5);
    bg.on('pointerdown', cb);
    bg.on('pointerover',  () => bg.setAlpha(0.8));
    bg.on('pointerout',   () => bg.setAlpha(1));
    return bg;
  }

  _smallBtn(x, y, w, h, title, sub, col, cb) {
    const bg = this.add.rectangle(x, y, w, h, col).setInteractive({ useHandCursor:true });
    bg.setStrokeStyle(1, 0xffffff, 0.1);
    this.add.text(x, y - 10, title, {
      fontSize:'15px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold', align:'center',
    }).setOrigin(0.5);
    this.add.text(x, y + 18, sub, {
      fontSize:'11px', fontFamily:'sans-serif', color:'#ffffffaa',
    }).setOrigin(0.5);
    bg.on('pointerdown', cb);
    bg.on('pointerover',  () => bg.setAlpha(0.8));
    bg.on('pointerout',   () => bg.setAlpha(1));
    return bg;
  }
}
