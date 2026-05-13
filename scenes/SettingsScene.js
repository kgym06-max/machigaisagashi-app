class SettingsScene extends Phaser.Scene {
  constructor() { super('Settings'); }

  init(data) {
    this.caller = data.caller || 'Home';
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.pd = PlayerData.load();

    // 半透明オーバーレイ
    const dim = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6)
      .setInteractive(); // クリック吸収

    const box = this.add.rectangle(W/2, H/2, W - 30, 340, 0x0f1529, 0.98);
    box.setStrokeStyle(2, 0x4444aa);

    this.add.text(W/2, H/2 - 140, '設定', {
      fontSize:'22px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold',
    }).setOrigin(0.5);

    // データリセット
    this.add.text(W/2, H/2 - 60, 'セーブデータ', {
      fontSize:'15px', fontFamily:'sans-serif', color:'#aaaacc',
    }).setOrigin(0.5);
    const resetBtn = this.add.rectangle(W/2, H/2 - 20, 200, 44, 0x7f0000)
      .setInteractive({ useHandCursor:true });
    this.add.text(W/2, H/2 - 20, 'データをリセット', {
      fontSize:'15px', fontFamily:'sans-serif', color:'#ffaaaa',
    }).setOrigin(0.5);
    resetBtn.on('pointerdown', () => this._confirmReset());

    // 進捗情報
    this.add.text(W/2, H/2 + 40, `ステージ進捗: ${this.pd.maxStageCleared} / 100`, {
      fontSize:'14px', fontFamily:'sans-serif', color:'#cccccc',
    }).setOrigin(0.5);
    this.add.text(W/2, H/2 + 65, `獲得星: ★ ${this.pd.totalStars}`, {
      fontSize:'14px', fontFamily:'sans-serif', color:'#ffcc44',
    }).setOrigin(0.5);
    this.add.text(W/2, H/2 + 90, `ランクポイント: ${this.pd.rankRP} RP`, {
      fontSize:'14px', fontFamily:'sans-serif', color:'#cc88ff',
    }).setOrigin(0.5);

    // 閉じるボタン
    const closeBtn = this.add.rectangle(W/2, H/2 + 140, 200, 46, 0x1a1a3e)
      .setInteractive({ useHandCursor:true });
    closeBtn.setStrokeStyle(1, 0x4444aa);
    this.add.text(W/2, H/2 + 140, '閉じる', {
      fontSize:'16px', fontFamily:'sans-serif', color:'#ffffff',
    }).setOrigin(0.5);
    closeBtn.on('pointerdown', () => {
      this.scene.stop();
      this.scene.resume(this.caller);
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
    yes.on('pointerdown', () => {
      localStorage.removeItem('machigai_v2');
      this.scene.start('Home');
    });
    const no = this.add.rectangle(70, 30, 120, 44, 0x1a1a3e).setInteractive({ useHandCursor:true });
    this.add.text(70, 30, 'キャンセル', { fontSize:'15px', fontFamily:'sans-serif', color:'#ffffff' }).setOrigin(0.5);
    no.on('pointerdown', () => confirmBox.destroy());
    confirmBox.add([bg, t, yes, no]);
    confirmBox.setDepth(20);
  }
}
