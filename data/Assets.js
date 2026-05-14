// グローバル画像キャッシュ
// 起動時に worlds.png を読み込んで、SceneGen で各世界の領域を切り出して使う

const ASSETS = {
  bgComposite: null,    // 10世界の合成画像（5列×2行）
  ready: false,
};

// 世界IDから合成画像のグリッド位置を引くマップ
// 上段: school, aquarium, park, kitchen, beach
// 下段: forest, city, space, festival, fantasy
const BG_GRID = {
  school:   { col: 0, row: 0 },
  aquarium: { col: 1, row: 0 },
  park:     { col: 2, row: 0 },
  kitchen:  { col: 3, row: 0 },
  beach:    { col: 4, row: 0 },
  forest:   { col: 0, row: 1 },
  city:     { col: 1, row: 1 },
  space:    { col: 2, row: 1 },
  festival: { col: 3, row: 1 },
  fantasy:  { col: 4, row: 1 },
};

function loadAssets() {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ASSETS.bgComposite = img;
      ASSETS.ready = true;
      console.log('✓ worlds.png 読み込み成功', img.width, '×', img.height);
      resolve(true);
    };
    img.onerror = () => {
      console.warn('⚠ worlds.png が見つかりません。procedural背景にフォールバック');
      ASSETS.ready = true; // 失敗してもゲームは起動
      resolve(false);
    };
    // 相対パスでロード
    img.src = 'assets/bg/worlds.png';
  });
}

// 指定世界の切り出し領域（ソース画像座標）を返す
// 縦長タイルからセンタークロップ気味の正方形を取得
function getBgSlice(worldId) {
  const img = ASSETS.bgComposite;
  if (!img || !BG_GRID[worldId]) return null;
  const cols = 5, rows = 2;
  const cw   = img.width / cols;
  const ch   = img.height / rows;
  const { col, row } = BG_GRID[worldId];
  const sx = col * cw;
  const sy = row * ch;
  // 正方形クロップ（中央やや下：主要な被写体が中下にあることが多いため）
  const size  = Math.min(cw, ch);
  const cropX = sx + (cw - size) / 2;
  const cropY = sy + (ch - size) * 0.55;
  return { sx: cropX, sy: cropY, sw: size, sh: size, img };
}
