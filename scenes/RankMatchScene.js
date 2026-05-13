class RankMatchScene extends Phaser.Scene {
  constructor() { super('RankMatch'); }

  init() {
    this.pd = PlayerData.load();
    this.roundResults = []; // [{timeSec, missCount, found, total}]
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
    }).setOrigin(0,0.5).setInteractive({ useHandCursor:true });
    back.on('pointerdown', () => this.scene.start('Home'));

    const rank = getRankFromRP(this.pd.rankRP);
    this.add.text(W/2, 90, `現在ランク: ${rank.name}`, {
      fontSize:'16px', fontFamily:'sans-serif', color: rank.color, fontStyle:'bold',
    }).setOrigin(0.5);
    this.add.text(W/2, 115, `ランクポイント: ${this.pd.rankRP} RP`, {
      fontSize:'14px', fontFamily:'sans-serif', color:'#aaaacc',
    }).setOrigin(0.5);

    this.add.text(W/2, 165, '3ラウンド制\n合計タイムを競う', {
      fontSize:'15px', fontFamily:'sans-serif', color:'#cccccc', align:'center', lineSpacing:6,
    }).setOrigin(0.5);
    this.add.text(W/2, 215, 'ミス1回 = +15秒 のペナルティ', {
      fontSize:'13px', fontFamily:'sans-serif', color:'#ff8888',
    }).setOrigin(0.5);

    // ラウンドインジケーター
    this.roundDots = [];
    for (let i = 0; i < RANK_MATCH_ROUNDS; i++) {
      const dot = this.add.circle(W/2 - 30 + i*30, 256, 10, 0x333344);
      dot.setStrokeStyle(2, 0x7b1fa2);
      this.roundDots.push(dot);
    }
    this.add.text(W/2, 280, `各ラウンド: 難問 ${getStageConfig(85).diffCount}箇所`, {
      fontSize:'13px', fontFamily:'sans-serif', color:'#888899',
    }).setOrigin(0.5);

    // スタートボタン
    const startBtn = this.add.rectangle(W/2, 360, 280, 60, 0x7b1fa2)
      .setInteractive({ useHandCursor:true });
    startBtn.setStrokeStyle(2, 0xcc88ff, 1);
    this.add.text(W/2, 360, 'ラウンド 1 スタート', {
      fontSize:'20px', fontFamily:'sans-serif', color:'#ffffff', fontStyle:'bold',
    }).setOrigin(0.5);
    startBtn.on('pointerdown', () => this._startRound());
    startBtn.on('pointerover',  () => startBtn.setAlpha(0.8));
    startBtn.on('pointerout',   () => startBtn.setAlpha(1));
    this.startBtn = startBtn;

    // 過去記録
    if (this.pd.rankMatchHistory.length > 0) {
      this.add.text(W/2, 440, '過去の記録', {
        fontSize:'13px', fontFamily:'sans-serif', color:'#555566',
      }).setOrigin(0.5);
      this.pd.rankMatchHistory.slice(0, 3).forEach((r, i) => {
        this.add.text(W/2, 460 + i*20, `${r.date}  ${r.totalSec}秒  +${r.rp}RP`, {
          fontSize:'12px', fontFamily:'sans-serif', color:'#666677',
        }).setOrigin(0.5);
      });
    }
  }

  _startRound() {
    const round = this.currentRound + 1;
    // ランクマッチ専用ステージ（85前後の難度）
    const stageNum = 80 + round * 3;
    this.scene.start('Game', {
      stageNum, mode:'rankMatch', round,
      onRoundEnd: (result) => this._onRoundEnd(result),
    });
  }

  _onRoundEnd(result) {
    // GameSceneからコールバックで呼ばれる（今回は scene.start で戻る実装）
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
      this.add.text(W/2, 90 + i*50, `ラウンド${i+1}: ${r.timeSec}秒 (ミス×${r.missCount} +${r.missCount*MISS_PENALTY_SEC}秒)`, {
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
