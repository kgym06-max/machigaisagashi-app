class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenu'); }

  create() {
    this.pd   = PlayerData.load();
    this.diff = DIFFICULTY.Normal;
    this.mode = GAME_MODE.Normal;

    const W = this.scale.width;   // 400
    const H = this.scale.height;  // 780

    // 背景グラデーション風
    this.add.rectangle(W / 2, H / 2, W, H, 0x1a1a2e);
    this.add.rectangle(W / 2, 90,    W, 180, 0x0f3460);

    // タイトル
    this.add.text(W / 2, 36, '某ファミリーレストランの', {
      fontSize: '16px', fontFamily: 'sans-serif', color: '#aaaacc',
    }).setOrigin(0.5);
    this.add.text(W / 2, 60, '間違い探しを練習するアプリ', {
      fontSize: '18px', fontFamily: 'sans-serif', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // プロフィール
    this.profileText = this.add.text(W / 2, 130, '', {
      fontSize: '13px', fontFamily: 'sans-serif', color: '#aaaacc', align: 'center',
    }).setOrigin(0.5);
    this._refreshProfile();

    // --- 難易度 ---
    this.add.text(W / 2, 178, '難易度を選ぶ', {
      fontSize: '14px', fontFamily: 'sans-serif', color: '#888899',
    }).setOrigin(0.5);

    const diffEntries = [
      { d: DIFFICULTY.Easy,   label: '簡単',       sub: '3箇所',  col: 0x27ae60 },
      { d: DIFFICULTY.Normal, label: '普通',       sub: '5箇所',  col: 0x2980b9 },
      { d: DIFFICULTY.Hard,   label: 'むずかしい', sub: '7箇所',  col: 0xe67e22 },
      { d: DIFFICULTY.Exceed, label: 'えきしーど', sub: '10箇所', col: 0x8e44ad },
    ];
    this.diffBtns = {};
    // 2列 × 2行
    diffEntries.forEach(({ d, label, sub, col }, i) => {
      const col2 = i % 2, row = Math.floor(i / 2);
      const x = 104 + col2 * 192;
      const y = 222 + row * 70;
      const btn = this._makeBtn(x, y, 172, 54, label + '\n' + sub, col,
        () => this._selectDiff(d), 15);
      this.diffBtns[d] = { btn, col };
    });

    // --- モード ---
    this.add.text(W / 2, 368, 'モード', {
      fontSize: '14px', fontFamily: 'sans-serif', color: '#888899',
    }).setOrigin(0.5);

    const modeEntries = [
      { m: GAME_MODE.Normal, label: '通常モード', col: 0x1abc9c },
      { m: GAME_MODE.Ranked, label: 'ランクマッチ', col: 0xe74c3c },
    ];
    this.modeBtns = {};
    modeEntries.forEach(({ m, label, col }, i) => {
      const x = 104 + i * 192;
      this._makeBtn(x, 406, 172, 50, label, col, () => this._selectMode(m), 15);
      this.modeBtns[m] = { btn: null, col }; // ダミー、後で差し替え
    });
    // 再生成（参照保存のため）
    this.modeBtns = {};
    modeEntries.forEach(({ m, label, col }, i) => {
      const x = 104 + i * 192;
      const btn = this._makeBtn(x, 406, 172, 50, label, col, () => this._selectMode(m), 15);
      this.modeBtns[m] = { btn, col };
    });

    // --- スタートボタン ---
    this._makeBtn(W / 2, 476, 300, 60, 'ゲームスタート ▶', 0xf39c12,
      () => this._startGame(), 18);

    // --- 記録 ---
    this.add.rectangle(W / 2, 610, W - 20, 180, 0x16213e).setOrigin(0.5);
    this.add.text(W / 2, 532, '記録', {
      fontSize: '14px', fontFamily: 'sans-serif', color: '#888899',
    }).setOrigin(0.5);
    this.statsText = this.add.text(W / 2, 610, '', {
      fontSize: '14px', fontFamily: 'sans-serif', color: '#ffffff',
      align: 'center', lineSpacing: 10,
    }).setOrigin(0.5);
    this._refreshStats();

    // 初期選択
    this._selectDiff(DIFFICULTY.Normal);
    this._selectMode(GAME_MODE.Normal);
  }

  _refreshProfile() {
    const pd = this.pd;
    this.profileText.setText(
      `総プレイ: ${pd.totalPlays}回  /  連続ログイン: ${pd.loginStreak}日\nハイスコア: ${pd.highScore}`
    );
  }

  _refreshStats() {
    const pd = this.pd;
    this.statsText.setText(
      `通常ハイスコア: ${pd.highScore}\n` +
      `ランクスコア: ${pd.rankedHighScore}\n` +
      `クリア: ${pd.totalClears}回  /  最大コンボ: ${pd.bestCombo}\n` +
      `ノーミスクリア: ${pd.noMissClears}回`
    );
  }

  _selectDiff(d) {
    this.diff = d;
    for (const [key, { btn, col }] of Object.entries(this.diffBtns)) {
      const active = Number(key) === d;
      btn.bg.setFillStyle(active ? col : 0x2a2a4a);
      btn.label.setColor(active ? '#ffffff' : '#666688');
    }
  }

  _selectMode(m) {
    this.mode = m;
    for (const [key, { btn, col }] of Object.entries(this.modeBtns)) {
      const active = Number(key) === m;
      btn.bg.setFillStyle(active ? col : 0x2a2a4a);
      btn.label.setColor(active ? '#ffffff' : '#666688');
    }
  }

  _startGame() {
    this.scene.start('Game', { diff: this.diff, mode: this.mode });
  }

  _makeBtn(x, y, w, h, label, col, cb, fontSize = 16) {
    const bg = this.add.rectangle(x, y, w, h, col).setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(1, 0xffffff, 0.2);
    const text = this.add.text(x, y, label, {
      fontSize: `${fontSize}px`, fontFamily: 'sans-serif', color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);
    bg.on('pointerdown', cb);
    bg.on('pointerover',  () => bg.setAlpha(0.8));
    bg.on('pointerout',   () => bg.setAlpha(1));
    return { bg, label: text };
  }
}
