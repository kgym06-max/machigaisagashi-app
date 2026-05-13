class StageSelectScene extends Phaser.Scene {
  constructor() { super('StageSelect'); }

  create() {
    this.pd = PlayerData.load();
    const W = this.scale.width, H = this.scale.height;

    this.add.rectangle(W/2, H/2, W, H, 0xfafafa);

    // ヘッダー
    this.add.rectangle(W/2, 28, W, 56, 0xc41c00);
    this.add.text(W/2, 28, 'ステージ選択', {
      fontSize:'18px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold',
    }).setOrigin(0.5);
    const back = this.add.text(12, 28, '←', {
      fontSize:'22px', fontFamily:'sans-serif', color:'#ffdddd',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor:true });
    back.on('pointerdown', () => this.scene.start('Home'));
    this.add.text(W - 10, 28, `★ ${this.pd.totalStars}`, {
      fontSize:'14px', fontFamily:'sans-serif', color:'#ffeeaa',
    }).setOrigin(1, 0.5);

    // 章ごとにステージを表示
    let scrollY = 70;
    for (let ch = 0; ch < 10; ch++) {
      const chStart  = ch * 10 + 1;
      const chStars  = this.pd.getChapterStars(chStart);
      const chLocked = ch > 0 && !this.pd.isStageUnlocked(chStart);

      // 章ヘッダー
      const hdrColor = chLocked ? 0xddcccc : 0xc41c00;
      const hdrBg = this.add.rectangle(W/2, scrollY + 18, W - 16, 36, hdrColor);
      this.add.text(16, scrollY + 18, `第${ch + 1}章`, {
        fontSize:'15px', fontFamily:'sans-serif',
        color: chLocked ? '#aaaaaa' : '#ffffff', fontStyle:'bold',
      }).setOrigin(0, 0.5);

      if (chLocked) {
        // 前章の星が足りない → ロック表示
        const prevStart = chStart - 10;
        const prevStars = this.pd.getChapterStars(prevStart);
        this.add.text(W - 16, scrollY + 18, `🔒 ★${prevStars}/30 (20必要)`, {
          fontSize:'12px', fontFamily:'sans-serif', color:'#aaaaaa',
        }).setOrigin(1, 0.5);
        scrollY += 46;
        continue;
      }

      // 星の進捗バー
      this.add.text(W - 16, scrollY + 18, `★${chStars}/30`, {
        fontSize:'12px', fontFamily:'sans-serif', color:'#ffeeaa',
      }).setOrigin(1, 0.5);
      scrollY += 46;

      // 各ステージボタン（2列）
      for (let si = 0; si < 10; si++) {
        const stageNum = chStart + si;
        const col = si % 2, row = Math.floor(si / 2);
        const bx  = col === 0 ? W/2 - 94 : W/2 + 94;
        const by  = scrollY + row * 58 + 22;

        const stars   = this.pd.getStageStars(stageNum);
        const locked  = !this.pd.isStageUnlocked(stageNum);
        const done    = stars > 0;

        const bgCol = locked ? 0xeeeeee : (done ? 0xe8f5e9 : 0xffffff);
        const btn   = this.add.rectangle(bx, by, 172, 48, bgCol)
          .setInteractive({ useHandCursor: !locked });
        btn.setStrokeStyle(1, locked ? 0xcccccc : (done ? 0x388e3c : 0xc41c00), 1);

        if (locked) {
          this.add.text(bx, by, `🔒  ${stageNum}`, {
            fontSize:'14px', fontFamily:'sans-serif', color:'#aaaaaa',
          }).setOrigin(0.5);
        } else {
          this.add.text(bx - 60, by - 6, `${stageNum}`, {
            fontSize:'16px', fontFamily:'sans-serif',
            color: stageNum === 1 ? '#c41c00' : '#333333', fontStyle:'bold',
          }).setOrigin(0, 0.5);
          const starStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);
          this.add.text(bx - 20, by - 8, starStr, {
            fontSize:'13px', fontFamily:'sans-serif', color:'#f9a825',
          }).setOrigin(0, 0.5);
          this.add.text(bx - 20, by + 8,
            stageNum === 1 ? 'チュートリアル' : `${getStageConfig(stageNum).diffCount}箇所`, {
            fontSize:'11px', fontFamily:'sans-serif', color:'#888888',
          }).setOrigin(0, 0.5);

          const sn = stageNum;
          btn.on('pointerdown', () =>
            this.scene.start('Game', { stageNum: sn, mode:'stage' }));
          btn.on('pointerover',  () => btn.setAlpha(0.8));
          btn.on('pointerout',   () => btn.setAlpha(1));
        }
      }
      scrollY += 5 * 58 + 16;
    }

    this.cameras.main.setBounds(0, 0, W, Math.max(H, scrollY + 20));
    this.input.on('pointermove', (ptr) => {
      if (ptr.isDown) this.cameras.main.scrollY -= ptr.velocity.y * 0.016;
    });
  }
}
