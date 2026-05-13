class RankMatchScene extends Phaser.Scene {
  constructor() { super('RankMatch'); }

  init() {
    this.pd = PlayerData.load();
    this.roundResults = [];
    this.currentRound = 0;
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.add.rectangle(W/2, H/2, W, H, 0x0d0d20);
    this.add.rectangle(W/2, 28, W, 56, 0x3d0060);
    this.add.text(W/2, 28, 'ランクマッチ', {
      fontSize:'18px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold',
    }).setOrigin(0.5);
    const back = this.add.text(12, 28, '←', {
      fontSize:'22px', fontFamily:'sans-serif', color:'#88aacc',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor:true });
    back.on('pointerdown', () => this.scene.start('Home'));

    const rank = getRankFromRP(this.pd.rankRP);
    this.add.text(W/2, 90, `現在ランク: ${rank.name}`, {
      fontSize:'16px', fontFamily:'sans-serif', color: rank.color, fontStyle:'bold',
    }).setOrigin(0.5);
    this.add.text(W/2, 112, `ランクポイント: ${this.pd.rankRP} RP`, {
      fontSize:'14px', fontFamily:'sans-serif', color:'#aaaacc',
    }).setOrigin(0.5);

    this.add.text(W/2, 155, '3ラウンド制\n合計タイムを競う', {
      fontSize:'15px', fontFamily:'sans-serif', color:'#cccccc', align:'center', lineSpacing:6,
    }).setOrigin(0.5);
    this.add.text(W/2, 202, 'ミス1回 = +15秒 ペナルティ　・　サイズ差なし', {
      fontSize:'12px', fontFamily:'sans-serif', color:'#ff8888',
    }).setOrigin(0.5);

    // ラウンドドット
    for (let i = 0; i < RANK_MATCH_ROUNDS; i++) {
      const dot = this.add.circle(W/2 - 30 + i * 30, 235, 10, 0x333344);
      dot.setStrokeStyle(2, 0x7b1fa2);
    }
    this.add.text(W/2, 258, `難問 ${getStageConfig(85).diffCount}箇所 / ラウンド`, {
      fontSize:'13px', fontFamily:'sans-serif', color:'#888899',
    }).setOrigin(0.5);

    // ─── スタートボタン ───────────────────────────────────
    const startBtn = this.add.rectangle(W/2, 326, 280, 58, 0x7b1fa2)
      .setInteractive({ useHandCursor:true });
    startBtn.setStrokeStyle(2, 0xcc88ff);
    this.add.text(W/2, 326, 'ラウンド 1 スタート', {
      fontSize:'20px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold',
    }).setOrigin(0.5);
    startBtn.on('pointerdown', () => this._startRound());
    startBtn.on('pointerover',  () => startBtn.setAlpha(0.8));
    startBtn.on('pointerout',   () => startBtn.setAlpha(1));

    // ─── ランキングボタン ──────────────────────────────────
    const rankingBtn = this.add.rectangle(W/2, 400, 280, 52, 0x1a1a3e)
      .setInteractive({ useHandCursor:true });
    rankingBtn.setStrokeStyle(1, 0x5555aa);
    this.add.text(W/2, 400, '🏆  過去の記録', {
      fontSize:'17px', fontFamily:'sans-serif', color:'#ccccff',
    }).setOrigin(0.5);
    rankingBtn.on('pointerdown', () => this._showRanking());
    rankingBtn.on('pointerover',  () => rankingBtn.setAlpha(0.8));
    rankingBtn.on('pointerout',   () => rankingBtn.setAlpha(1));

    // 直近3件を小さく表示
    if (this.pd.rankMatchHistory.length > 0) {
      this.add.text(W/2, 458, '直近の記録', {
        fontSize:'12px', fontFamily:'sans-serif', color:'#444455',
      }).setOrigin(0.5);
      this.pd.rankMatchHistory.slice(0, 3).forEach((r, i) => {
        this.add.text(W/2, 476 + i * 20, `${r.date}  ${r.totalSec}秒  +${r.rp}RP`, {
          fontSize:'12px', fontFamily:'sans-serif', color:'#555566',
        }).setOrigin(0.5);
      });
    }
  }

  _startRound() {
    const round    = this.currentRound + 1;
    const stageNum = 82 + round * 2;
    this.scene.start('Game', {
      stageNum, mode:'rankMatch', round,
      excludeDiffTypes: ['size'],
    });
  }

  _showRanking() {
    const W = this.scale.width, H = this.scale.height;
    const overlay = this.add.container(W/2, H/2).setDepth(20);
    const bg = this.add.rectangle(0, 0, W - 20, 480, 0x0a0a1e, 0.98);
    bg.setStrokeStyle(2, 0x7b1fa2);
    const title = this.add.text(0, -210, '🏆  過去の記録', {
      fontSize:'18px', fontFamily:'sans-serif', color:'#cc88ff', fontStyle:'bold',
    }).setOrigin(0.5);

    const history = this.pd.rankMatchHistory;
    const items = [];
    if (history.length === 0) {
      items.push(this.add.text(0, -160, '記録がありません', {
        fontSize:'14px', fontFamily:'sans-serif', color:'#666677',
      }).setOrigin(0.5));
    } else {
      history.slice(0, 12).forEach((r, i) => {
        const t = this.add.text(0, -175 + i * 28,
          `${i + 1}.  ${r.date}　${r.totalSec}秒　+${r.rp}RP`, {
          fontSize:'13px', fontFamily:'sans-serif',
          color: i === 0 ? '#ffcc44' : '#aaaacc',
        }).setOrigin(0.5);
        items.push(t);
      });
    }

    const closeBtn = this.add.rectangle(0, 210, 180, 44, 0x333344)
      .setInteractive({ useHandCursor:true });
    closeBtn.setStrokeStyle(1, 0x666677);
    const closeTxt = this.add.text(0, 210, '閉じる', {
      fontSize:'16px', fontFamily:'sans-serif', color:'#ffffff',
    }).setOrigin(0.5);
    closeBtn.on('pointerdown', () => overlay.destroy());
    overlay.add([bg, title, ...items, closeBtn, closeTxt]);
  }
}

// ─── ランクマッチ結果集計シーン ────────────────────────────────
class RankResultScene extends Phaser.Scene {
  constructor() { super('RankResult'); }

  init(data) {
    this.results = data.results || [];
    this.pd      = PlayerData.load();
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.add.rectangle(W/2, H/2, W, H, 0x0d0d20);
    this.add.rectangle(W/2, 28, W, 56, 0x3d0060);
    this.add.text(W/2, 28, 'ランクマッチ 結果', {
      fontSize:'18px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold',
    }).setOrigin(0.5);

    let totalTime = 0, totalMiss = 0, totalFound = 0, totalDiffs = 0;
    this.results.forEach((r, i) => {
      totalTime  += r.timeSec + r.missCount * MISS_PENALTY_SEC;
      totalMiss  += r.missCount;
      totalFound += r.found;
      totalDiffs += r.total;
      this.add.text(W/2, 90 + i * 50,
        `ラウンド${i + 1}: ${r.timeSec}秒 (ミス×${r.missCount} +${r.missCount * MISS_PENALTY_SEC}秒)`, {
        fontSize:'14px', fontFamily:'sans-serif', color:'#cccccc',
      }).setOrigin(0.5);
    });

    const rp = calcRankRP(totalTime, totalMiss, totalFound, totalDiffs);
    this.pd.addRankRP(rp, totalTime);
    const newRank = getRankFromRP(this.pd.rankRP);

    this.add.text(W/2, 260, `合計タイム: ${totalTime}秒`, {
      fontSize:'22px', fontFamily:'sans-serif', color:'#ffcc44', fontStyle:'bold',
    }).setOrigin(0.5);
    this.add.text(W/2, 298, `獲得RP: +${rp}`, {
      fontSize:'18px', fontFamily:'sans-serif', color:'#cc88ff',
    }).setOrigin(0.5);
    this.add.text(W/2, 330, `現在ランク: ${newRank.name}  (${this.pd.rankRP} RP)`, {
      fontSize:'15px', fontFamily:'sans-serif', color: newRank.color,
    }).setOrigin(0.5);

    const home = this.add.rectangle(W/2, 420, 260, 52, 0x1565c0).setInteractive({ useHandCursor:true });
    this.add.text(W/2, 420, 'ホームへ', { fontSize:'18px', fontFamily:'sans-serif', color:'#fff' }).setOrigin(0.5);
    home.on('pointerdown', () => this.scene.start('Home'));
    const retry = this.add.rectangle(W/2, 490, 260, 52, 0x7b1fa2).setInteractive({ useHandCursor:true });
    this.add.text(W/2, 490, 'もう一度', { fontSize:'18px', fontFamily:'sans-serif', color:'#fff' }).setOrigin(0.5);
    retry.on('pointerdown', () => this.scene.start('RankMatch'));
  }
}
