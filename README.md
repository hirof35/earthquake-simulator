# Earthquake & Tsunami 3D Simulator (React + Vite + Cesium)

Cesium.jsを活用し、日本近海における震源の三次元的深度構造、および海域地震における津波の動的な伝播予測範囲を立体的に可視化する3Dシミュレーターです。
<img width="1219" height="1012" alt="スクリーンショット 2026-05-30 225955" src="https://github.com/user-attachments/assets/ee1e5876-380a-45ae-ac5a-790ce2f1a545" />

## 特徴
- **地表透過（シースルー）構造**: 地表および海底を透過させることで、沈み込むプレート境界に応じた震源の「深さ（Depth）」の位置関係を直感的に把握可能。
- **動的タイムライン同期**: Cesiumのクロック（Clock）システムと同期し、発生時刻からの時間経過に応じた津波伝播予測の同心円アニメーションを生成。
- **純粋ローカル配信（CORS / MIMEタイプ対策）**: Web Workerの制約を物理的に回避するため、アセットをドメイン内部から安全に配信するアーキテクチャを採用。

## 開発環境のセットアップ

本リポジトリには、容量削減のため Cesium のビルド済みスタティックアセット（`public/cesium/`）は含まれていません。クローン後は以下の手順に従ってアセットを配置してください。

### 1. 依存関係のインストール
```bash
npm install
2. Cesiumアセットの手動配置（必須）
node_modules/cesium/Build/Cesium フォルダを丸ごとコピーし、public/ 直下に cesium という名前で配置してください。

正しい構造:

Plaintext
earthquake-simulator/
├── public/
│   └── cesium/
│       ├── Assets/
│       ├── Workers/
│       └── ThirdParty/
3. 開発サーバーの起動
Bash
npx vite --force
