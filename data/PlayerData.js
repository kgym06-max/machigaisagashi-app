class PlayerData {
  constructor() {
    this.stageProgress  = {};  // { stageNum: { stars, bestTimeSec } }
    this.totalStars     = 0;
    this.maxStageCleared = 0;
    this.rankRP         = 0;
    this.rankMatchHistory= []; // { date, totalSec, rp }
    this.speedBest      = null;
    this.loginStreak    = 0;
    this.lastLoginDate  = null;
    this.totalPlays     = 0;
    this.settings       = { sfx: true, bgm: true };
  }

  static load() {
    const pd = new PlayerData();
    try {
      const raw = localStorage.getItem('machigai_v2');
      if (raw) Object.assign(pd, JSON.parse(raw));
    } catch (_) {}
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
    const improved = stars > prev.stars || timeSec < prev.bestTimeSec;
    const starDelta = Math.max(0, stars - prev.stars);
    this.stageProgress[stageNum] = {
      stars:       Math.max(stars, prev.stars),
      bestTimeSec: Math.min(timeSec, prev.bestTimeSec),
    };
    this.totalStars += starDelta;
    if (stars >= 1) this.maxStageCleared = Math.max(this.maxStageCleared, stageNum);
    this.totalPlays++;
    this.save();
    return { improved, starDelta };
  }

  isStageUnlocked(stageNum) {
    const world = WORLDS[Math.min(Math.floor((stageNum - 1) / 10), 9)];
    return this.totalStars >= world.unlockStars;
  }

  getStageStars(n) {
    return (this.stageProgress[n] || {}).stars || 0;
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
