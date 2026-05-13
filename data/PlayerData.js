class PlayerData {
  constructor() {
    this.playerId        = null;
    this.playerName      = 'プレイヤー';
    this.stageProgress   = {};
    this.totalStars      = 0;
    this.maxStageCleared = 0;
    this.rankRP          = 0;
    this.rankMatchHistory= [];
    this.speedBest       = null;
    this.loginStreak     = 0;
    this.lastLoginDate   = null;
    this.totalPlays      = 0;
    this.settings        = { sfx: true, bgm: true };
  }

  static load() {
    const pd = new PlayerData();
    try {
      const raw = localStorage.getItem('machigai_v2');
      if (raw) Object.assign(pd, JSON.parse(raw));
    } catch (_) {}
    if (!pd.playerId) {
      pd.playerId = 'ID-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      pd.save();
    }
    if (!pd.settings) pd.settings = { sfx: true, bgm: true };
    pd.updateLoginStreak();
    return pd;
  }

  save() {
    try { localStorage.setItem('machigai_v2', JSON.stringify(this)); } catch (_) {}
  }

  updateLoginStreak() {
    const today = new Date().toDateString();
    if (this.lastLoginDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    this.loginStreak = (this.lastLoginDate === yesterday) ? this.loginStreak + 1 : 1;
    this.lastLoginDate = today;
    this.save();
  }

  saveStageResult(stageNum, stars, timeSec) {
    const prev = this.stageProgress[stageNum] || { stars: 0, bestTimeSec: Infinity };
    const starDelta = Math.max(0, stars - prev.stars);
    this.stageProgress[stageNum] = {
      stars:       Math.max(stars, prev.stars),
      bestTimeSec: Math.min(timeSec, prev.bestTimeSec),
    };
    this.totalStars += starDelta;
    if (stars >= 1) this.maxStageCleared = Math.max(this.maxStageCleared, stageNum);
    this.totalPlays++;
    this.save();
    return { improved: starDelta > 0, starDelta };
  }

  // 順番通りロック + 章境界での星条件
  isStageUnlocked(stageNum) {
    if (stageNum === 1) return true;
    if (!this.getStageStars(stageNum - 1)) return false;
    // 章の最初のステージ（11, 21, 31...）では前章の星が20以上必要
    if ((stageNum - 1) % 10 === 0) {
      const prevChStart = stageNum - 10;
      if (this.getChapterStars(prevChStart) < 20) return false;
    }
    return true;
  }

  getStageStars(n) {
    return (this.stageProgress[n] || {}).stars || 0;
  }

  getChapterStars(chapterStart) {
    let total = 0;
    for (let i = chapterStart; i < chapterStart + 10; i++) {
      total += this.getStageStars(i);
    }
    return total;
  }

  addRankRP(rp, totalSec) {
    this.rankRP += rp;
    this.rankMatchHistory.unshift({ date: new Date().toLocaleDateString(), totalSec, rp });
    if (this.rankMatchHistory.length > 20) this.rankMatchHistory.pop();
    this.totalPlays++;
    this.save();
  }

  updateSpeedBest(score) {
    if (this.speedBest === null || score > this.speedBest) {
      this.speedBest = score;
      this.save();
      return true;
    }
    return false;
  }
}
