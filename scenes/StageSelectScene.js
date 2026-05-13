class StageSelectScene extends Phaser.Scene {
  constructor() { super('StageSelect'); }

  create() {
    this.pd = PlayerData.load();
    const W = this.scale.width, H = this.scale.height;

    this.add.rectangle(W/2, H/2, W, H, 0x0d0d20);

    // ヘッダー
    this.add.rectangle(W/2, 28, W, 56, 0x0f3460);
    this.add.text(W/2, 28, 'ステージ選択', {
      fontSize:'18px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold',
    }).setOrigin(0.5);
    const back = this.add.text(12, 28, '←', {
      fontSize:'22px', fontFamily:'sans-serif', color:'#88aacc',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor:true });
    back.on('pointerdown', () => this.scene.start('Home'));

    // 星合計表示
    this.add.text(W - 10, 28, `★ ${this.pd.totalStars}`, {
      fontSize:'14px', fontFamily:'sans-serif', color:'#ffcc44',
    }).setOrigin(1, 0.5);

    // 世界観ごとにセクション
    let scrollY = 70;
    for (let wi = 0; wi < WORLDS.length; wi++) {
      const world  = WORLDS[wi];
      const locked = this.pd.totalStars < world.unlockStars;

      // 世界観ヘッダー
      const hdrBg = this.add.rectangle(W/2, scrollY + 18, W - 20, 36, locked ? 0x1a1a2e : 0x1a2a4e);
      hdrBg.setStrokeStyle(1, locked ? 0x333344 : 0x4444aa, 1);
      this.add.text(16, scrollY + 18, world.name, {
        fontSize:'15px', fontFamily:'sans-serif',
        color: locked ? '#555566' : '#ffffff', fontStyle:'bold',
      }).setOrigin(0, 0.5);
      if (locked) {
        this.add.text(W - 16, scrollY + 18, `🔒 ★${world.unlockStars}で解放`, {
          fontSize:'12px', fontFamily:'sans-serif', color:'#555566',
        }).setOrigin(1, 0.5);
      }
      scrollY += 42;

      if (!locked) {
        // 10個のステージボタン（2列×5行）
        const stageStart = wi * 10 + 1;
        for (let si = 0; si < 10; si++) {
          const stageNum = stageStart + si;
          const col = si % 2, row = Math.floor(si / 2);
          const bx  = col === 0 ? W/2 - 94 : W/2 + 94;
          const by  = scrollY + row * 58 + 22;

          const stars = this.pd.getStageStars(stageNum);
          const done  = stars > 0;
          const colBg = done ? 0x1a3a2a : (stageNum === 1 ? 0x1a3060 : 0x1a1a2e);
          const btn   = this.add.rectangle(bx, by, 172, 48, colBg)
            .setInteractive({ useHandCursor:true });
          btn.setStrokeStyle(1, done ? 0x2ecc71 : 0x333344, 1);

          this.add.text(bx - 60, by, `${stageNum}`, {
            fontSize:'16px', fontFamily:'sans-serif',
            color: stageNum === 1 ? '#4fc3f7' : '#ffffff', fontStyle:'bold',
          }).setOrigin(0, 0.5);
          this.add.text(bx - 20, by - 8, '★★★'.slice(0, stars) + '☆☆☆'.slice(0, 3 - stars), {
            fontSize:'13px', fontFamily:'sans-serif', color:'#ffcc44',
          }).setOrigin(0, 0.5);
          this.add.text(bx - 20, by + 8, stageNum === 1 ? 'チュートリアル' : `${getStageConfig(stageNum).diffCount}箇所`, {
            fontSize:'11px', fontFamily:'sans-serif', color:'#aaaacc',
          }).setOrigin(0, 0.5);

          const sn = stageNum;
          btn.on('pointerdown', () =>
            this.scene.start('Game', { stageNum: sn, mode:'stage' }));
          btn.on('pointerover',  () => btn.setAlpha(0.8));
          btn.on('pointerout',   () => btn.setAlpha(1));
        }
        scrollY += 5 * 58 + 16;
      } else {
        scrollY += 10;
      }
    }

    // スクロール（長いので簡易カメラスクロール）
    this.cameras.main.setBounds(0, 0, W, Math.max(H, scrollY + 20));
    this.input.on('pointermove', (ptr) => {
      if (ptr.isDown) this.cameras.main.scrollY -= ptr.velocity.y * 0.016;
    });
  }
}
