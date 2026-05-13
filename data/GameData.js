// ─── 世界観テーマ（10ステージごと）───────────────────────────
const WORLDS = [
  { id: 'school',   name: '学校',     bg: '#d4eaf7', ground: '#8cc77e', accent: '#4a90d9', unlockStars: 0  },
  { id: 'aquarium', name: '水族館',   bg: '#003d66', ground: '#002244', accent: '#00aaff', unlockStars: 10 },
  { id: 'park',     name: '公園',     bg: '#87ceeb', ground: '#5a9e4a', accent: '#ff7f50', unlockStars: 20 },
  { id: 'kitchen',  name: 'キッチン', bg: '#fff8e7', ground: '#d4a855', accent: '#e74c3c', unlockStars: 30 },
  { id: 'beach',    name: '海辺',     bg: '#7ec8e3', ground: '#f5d76e', accent: '#ff6b35', unlockStars: 40 },
  { id: 'forest',   name: '森',       bg: '#2d5a27', ground: '#1a3d1a', accent: '#7cfc00', unlockStars: 50 },
  { id: 'city',     name: '都市',     bg: '#c8d8e8', ground: '#666677', accent: '#ff4444', unlockStars: 60 },
  { id: 'space',    name: '宇宙',     bg: '#000011', ground: '#110022', accent: '#ffffaa', unlockStars: 70 },
  { id: 'festival', name: 'お祭り',   bg: '#1a0a2e', ground: '#2d1a0a', accent: '#ff6600', unlockStars: 80 },
  { id: 'fantasy',  name: '幻想郷',   bg: '#0a0520', ground: '#0d1f0d', accent: '#cc44ff', unlockStars: 90 },
];

function getWorld(stageNum) {
  return WORLDS[Math.min(Math.floor((stageNum - 1) / 10), WORLDS.length - 1)];
}

function getStageConfig(n) {
  const worldIdx = Math.min(Math.floor((n - 1) / 10), 9);
  const posInWorld = (n - 1) % 10; // 0-9
  const world = WORLDS[worldIdx];
  // 難易度スケール：ステージが進むほど差分が増え時間が短くなる
  const diffCount = n === 1 ? 2 : Math.min(2 + worldIdx + Math.floor(posInWorld / 3), 10);
  const timeSec   = Math.max(180 - worldIdx * 12 - posInWorld * 2, 60);
  const isWorldStart = n > 1 && posInWorld === 0;
  return { n, world, diffCount, timeSec, isWorldStart };
}

// ─── ランクシステム ────────────────────────────────────────────
const RANKS = [
  { id: 'unranked',  name: '無',         min: 0,     color: '#888888', badge: '？' },
  { id: 'bronze3',   name: 'ブロンズⅢ', min: 100,   color: '#cd7f32', badge: 'B3' },
  { id: 'bronze2',   name: 'ブロンズⅡ', min: 300,   color: '#cd7f32', badge: 'B2' },
  { id: 'bronze1',   name: 'ブロンズⅠ', min: 600,   color: '#cd7f32', badge: 'B1' },
  { id: 'silver3',   name: 'シルバーⅢ', min: 1000,  color: '#aaaaaa', badge: 'S3' },
  { id: 'silver2',   name: 'シルバーⅡ', min: 1500,  color: '#aaaaaa', badge: 'S2' },
  { id: 'silver1',   name: 'シルバーⅠ', min: 2200,  color: '#aaaaaa', badge: 'S1' },
  { id: 'gold3',     name: 'ゴールドⅢ', min: 3000,  color: '#ffd700', badge: 'G3' },
  { id: 'gold2',     name: 'ゴールドⅡ', min: 4000,  color: '#ffd700', badge: 'G2' },
  { id: 'gold1',     name: 'ゴールドⅠ', min: 5500,  color: '#ffd700', badge: 'G1' },
  { id: 'platinum',  name: 'プラチナ',   min: 7500,  color: '#e5e4e2', badge: 'P'  },
  { id: 'diamond',   name: 'ダイヤ',     min: 10000, color: '#b9f2ff', badge: 'D'  },
  { id: 'master',    name: 'マスター',   min: 15000, color: '#ff44ff', badge: 'M'  },
];

function getRankFromRP(rp) {
  let rank = RANKS[0];
  for (const r of RANKS) { if (rp >= r.min) rank = r; }
  return rank;
}

// ─── ランクマッチ RP 計算 ─────────────────────────────────────
function calcRankRP(totalSec, missCount, found, total) {
  // 速いほど高RP（基準180秒で200RP）
  const timeRP    = Math.max(0, Math.round(200 - totalSec * 0.8));
  const missDeduct = missCount * 10;
  const accBonus  = found >= total ? 50 : Math.round((found / total) * 30);
  return Math.max(0, timeRP - missDeduct + accBonus);
}

const DIFF_TYPES = ['color','size','flip','variant','expression','count'];
const SPEED_INTERVAL_MS = 5000;
const RANK_MATCH_ROUNDS  = 3;
const MISS_PENALTY_SEC   = 15;
