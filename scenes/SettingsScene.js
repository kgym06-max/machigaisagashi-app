class SettingsScene extends Phaser.Scene {
  constructor() { super('Settings'); }

  init(data) { this.caller = data.caller || 'Home'; }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.pd = PlayerData.load();

    this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6).setInteractive();
    const box = this.add.rectangle(W/2, H/2, W - 30, 540, 0x0f1529, 0.98);
    box.setStrokeStyle(2, 0x4444aa);

    const cy = H/2; // 中央Y

    this.add.text(W/2, cy - 250, '設定', {
      fontSize:'22px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold',
    }).setOrigin(0.5);

    // ─── プレイヤー情報 ───────────────────────────────────
    this.add.text(W/2, cy - 215, 'プレイヤー情報', {
      fontSize:'13px', fontFamily:'sans-serif', color:'#7777aa',
    }).setOrigin(0.5);
    this.add.text(W/2, cy - 192, `ID: ${this.pd.playerId}`, {
      fontSize:'12px', fontFamily:'sans-serif', color:'#aaaacc',
    }).setOrigin(0.5);
    this._nameText = this.add.text(W/2, cy - 168, `名前: ${this.pd.playerName}`, {
      fontSize:'14px', fontFamily:'sans-serif', color:'#ffffff',
    }).setOrigin(0.5);
    const editBtn = this.add.rectangle(W/2, cy - 142, 160, 32, 0x333366)
      .setInteractive({ useHandCursor:true });
    editBtn.setStrokeStyle(1, 0x5555aa);
    this.add.text(W/2, cy - 142, '名前を変更', {
      fontSize:'13px', fontFamily:'sans-serif', color:'#aaaaff',
    }).setOrigin(0.5);
    editBtn.on('pointerdown', () => {
      const name = window.prompt('新しい名前を入力してください', this.pd.playerName);
      if (name && name.trim()) {
        this.pd.playerName = name.trim().slice(0, 16);
        this.pd.save();
        this._nameText.setText(`名前: ${this.pd.playerName}`);
      }
    });

    this.add.rectangle(W/2, cy - 114, W - 60, 1, 0x333366);

    // ─── 音響設定 ─────────────────────────────────────────
    this.add.text(W/2, cy - 96, '音響設定', {
      fontSize:'13px', fontFamily:'sans-serif', color:'#7777aa',
    }).setOrigin(0.5);
    this._addToggle(W/2, cy - 66, 'BGM', 'bgm');
    this._addToggle(W/2, cy - 28, 'SFX（効果音）', 'sfx');

    this.add.rectangle(W/2, cy, W - 60, 1, 0x333366);

    // ─── セーブデータ ─────────────────────────────────────
    this.add.text(W/2, cy + 20, 'セーブデータ', {
      fontSize:'13px', fontFamily:'sans-serif', color:'#7777aa',
    }).setOrigin(0.5);
    const resetBtn = this.add.rectangle(W/2, cy + 52, 200, 44, 0x7f0000)
      .setInteractive({ useHandCursor:true });
    this.add.text(W/2, cy + 52, 'データをリセット', {
      fontSize:'15px', fontFamily:'sans-serif', color:'#ffaaaa',
    }).setOrigin(0.5);
    resetBtn.on('pointerdown', () => this._confirmReset());

    // ─── 進捗情報 ─────────────────────────────────────────
    this.add.text(W/2, cy + 106, `ステージ進捗: ${this.pd.maxStageCleared} / 100`, {
      fontSize:'13px', fontFamily:'sans-serif', color:'#cccccc',
    }).setOrigin(0.5);
    this.add.text(W/2, cy + 126, `獲得星: ★ ${this.pd.totalStars}`, {
      fontSize:'13px', fontFamily:'sans-serif', color:'#ffcc44',
    }).setOrigin(0.5);
    this.add.text(W/2, cy + 146, `ランクポイント: ${this.pd.rankRP} RP`, {
      fontSize:'13px', fontFamily:'sans-serif', color:'#cc88ff',
    }).setOrigin(0.5);

    // ─── 閉じるボタン ─────────────────────────────────────
    const closeBtn = this.add.rectangle(W/2, cy + 200, 200, 46, 0x1a1a3e)
      .setInteractive({ useHandCursor:true });
    closeBtn.setStrokeStyle(1, 0x4444aa);
    this.add.text(W/2, cy + 200, '閉じる', {
      fontSize:'16px', fontFamily:'sans-serif', color:'#ffffff',
    }).setOrigin(0.5);
    closeBtn.on('pointerdown', () => {
      // launchされた場合：scene.stop() で十分（callerは継続中）
      // それ以外（startで来た場合）：callerに戻る
      try { this.scene.resume(this.caller); } catch (_) {}
      this.scene.stop();
    });
  }

  _addToggle(cx, cy, label, key) {
    const isOn = !!(this.pd.settings && this.pd.settings[key]);
    const trackW = 54, trackH = 26;
    this.add.text(cx - 70, cy, label, {
      fontSize:'15px', fontFamily:'sans-serif', color:'#cccccc',
    }).setOrigin(0, 0.5);
    const track = this.add.rectangle(cx + 70, cy, trackW, trackH, isOn ? 0x2ecc71 : 0x555566);
    track.setStrokeStyle(1, 0x888888);
    const knobX = isOn ? cx + 70 + trackW/2 - 14 : cx + 70 - trackW/2 + 14;
    const knob  = this.add.circle(knobX, cy, 10, 0xffffff);
    const hit   = this.add.rectangle(cx + 70, cy, trackW + 12, trackH + 12, 0x000000, 0)
      .setInteractive({ useHandCursor:true });
    hit.on('pointerdown', () => {
      if (!this.pd.settings) this.pd.settings = {};
      this.pd.settings[key] = !this.pd.settings[key];
      this.pd.save();
      const on = this.pd.settings[key];
      track.setFillStyle(on ? 0x2ecc71 : 0x555566);
      const nx = on ? cx + 70 + trackW/2 - 14 : cx + 70 - trackW/2 + 14;
      this.tweens.add({ targets: knob, x: nx, duration: 150, ease:'Quad.Out' });
    });
  }

  _confirmReset() {
    const W = this.scale.width, H = this.scale.height;
    const confirmBox = this.add.container(W/2, H/2);
    const bg = this.add.rectangle(0, 0, W - 60, 200, 0x1a0000, 0.98);
    bg.setStrokeStyle(2, 0xff3333);
    const t = this.add.text(0, -70, '本当にリセットしますか？\nこの操作は取り消せません。', {
      fontSize:'15px', fontFamily:'sans-serif', color:'#ffaaaa', align:'center', lineSpacing:6,
    }).setOrigin(0.5);
    const yes = this.add.rectangle(-70, 30, 120, 44, 0x7f0000).setInteractive({ useHandCursor:true });
    this.add.text(-70, 30, 'リセット', { fontSize:'15px', fontFamily:'sans-serif', color:'#ff8888' }).setOrigin(0.5);
    yes.on('pointerdown', () => { localStorage.removeItem('machigai_v2'); this.scene.start('Home'); });
    const no = this.add.rectangle(70, 30, 120, 44, 0x1a1a3e).setInteractive({ useHandCursor:true });
    this.add.text(70, 30, 'キャンセル', { fontSize:'15px', fontFamily:'sans-serif', color:'#ffffff' }).setOrigin(0.5);
    no.on('pointerdown', () => confirmBox.destroy());
    confirmBox.add([bg, t, yes, no]);
    confirmBox.setDepth(20);
  }
}
