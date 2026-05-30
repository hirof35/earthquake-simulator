import React from 'react';
import { EarthquakeTsunamiSimulator } from './EarthquakeTsunamiSimulator';
import type { EarthquakeEvent } from './EarthquakeTsunamiSimulator'; // 「type」を明示する
// シミュレーターに表示するテスト用の地震データ
const mockEarthquakes: EarthquakeEvent[] = [
  {
    id: '1',
    title: '三陸沖プレート境界地震',
    time: new Date(),
    latitude: 38.5,
    longitude: 142.5,
    depth: 24,        // 浅いので赤い球体
    magnitude: 7.4,   // M6以上＋海域なので津波が発生
    isOceanic: true,
  },
  {
    id: '2',
    title: '日本海溝深発地震',
    time: new Date(),
    latitude: 38.0,
    longitude: 138.0,
    depth: 350,       // 地下深くなので青い球体
    magnitude: 6.2,
    isOceanic: false,
  }
];

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <EarthquakeTsunamiSimulator events={mockEarthquakes} />
    </div>
  );
}

export default App;