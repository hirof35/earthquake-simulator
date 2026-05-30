import React, { useEffect, useRef } from 'react';

import {
  Viewer,
  Cartesian3,
  Cartographic,
  Color,
  CallbackProperty,
  JulianDate,
  Math as CesiumMath,
  ColorMaterialProperty // 追加：マテリアルの型エラーを完全に防ぐため
} from 'cesium';

// 静的アセットの読み込み先をCDNに強制指定（前段の404エラーを永続的に回避）
//(window as any).CESIUM_BASE_URL = 'https://unpkg.com/cesium@1.118.0/Build/Cesium/';

export interface EarthquakeEvent {
  id: string;
  title: string;
  time: Date;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  isOceanic: boolean;
}

interface SimulatorProps {
  events: EarthquakeEvent[];
}

export const EarthquakeTsunamiSimulator: React.FC<SimulatorProps> = ({ events }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new Viewer(containerRef.current, {
      animation: true,
      timeline: true,
      baseLayerPicker: true,
      fullscreenButton: false,
      geocoder: false,
      infoBox: false,
    });
    viewerRef.current = viewer;

    viewer.scene.globe.translucency.enabled = true;
    viewer.scene.globe.translucency.frontFaceAlpha = 0.5;
    viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(138.0, 35.0, 1500000.0),
      orientation: {
        heading: CesiumMath.toRadians(0.0),
        pitch: CesiumMath.toRadians(-60.0),
        roll: 0.0
      }
    });

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !events) return;

    viewer.entities.removeAll();

    events.forEach((event) => {
      const epicenterCartographic = Cartographic.fromDegrees(event.longitude, event.latitude);
      const positionCartesian = Cartesian3.fromDegrees(
        event.longitude, 
        event.latitude, 
        -event.depth * 1000
      );
      
      const sphereRadius = Math.pow(2, event.magnitude) * 1000; 
      const sphereColor = getDepthColor(event.depth);

      viewer.entities.add({
        id: `eq-${event.id}`,
        name: event.title,
        position: positionCartesian,
        ellipsoid: {
          radii: new Cartesian3(sphereRadius, sphereRadius, sphereRadius),
          material: sphereColor.withAlpha(0.7),
        }
      });

      if (event.isOceanic && event.magnitude >= 6.0) {
        const tsunamiSpeed = 170; 
        const maxDurationSeconds = 7200; 
        const eventJulianDate = JulianDate.fromDate(event.time);

        const dynamicRadius = new CallbackProperty((time) => {
          const elapsedSeconds = JulianDate.secondsDifference(time, eventJulianDate);
          if (elapsedSeconds < 0) return 0;
          if (elapsedSeconds > maxDurationSeconds) return maxDurationSeconds * tsunamiSpeed;
          return elapsedSeconds * tsunamiSpeed;
        }, false);

        // 【今回の重要修正】単なるCallbackPropertyではなく、ColorMaterialPropertyでラップする
        const dynamicMaterial = new ColorMaterialProperty(
          new CallbackProperty((time) => {
            const elapsedSeconds = JulianDate.secondsDifference(time, eventJulianDate);
            if (elapsedSeconds < 0 || elapsedSeconds > maxDurationSeconds) {
              return Color.TRANSPARENT;
            }
            const alphaFactor = Math.max(0, 1 - (elapsedSeconds / maxDurationSeconds));
            return Color.CYAN.withAlpha(alphaFactor * 0.4);
          }, false)
        );

        const seaLevelPosition = Cartesian3.fromRadians(
          epicenterCartographic.longitude,
          epicenterCartographic.latitude,
          10
        );

        viewer.entities.add({
          id: `tsunami-${event.id}`,
          name: `${event.title} - 津波予測範囲`,
          position: seaLevelPosition,
          ellipse: {
            semiMinorAxis: dynamicRadius,
            semiMajorAxis: dynamicRadius,
            material: dynamicMaterial, // これで内部エンジンがgetTypeを呼べるようになります
            outline: true,
            outlineColor: Color.AQUA.withAlpha(0.5),
          }
        });
      }
    });

  }, [events]);

  const getDepthColor = (depth: number): Color => {
    if (depth < 30) return Color.RED;
    if (depth < 100) return Color.ORANGE;
    if (depth < 300) return Color.YELLOW;
    return Color.BLUE;
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white', padding: 12, borderRadius: 8, fontFamily: 'sans-serif', pointerEvents: 'none',
        zIndex: 1000
      }}>
        <h4 style={{ margin: '0 0 8px 0' }}>地震・津波 3D可視化</h4>
        <div style={{ fontSize: '12px' }}>
          <div>🔴 0 - 29km (浅部)</div>
          <div>🟠 30 - 99km</div>
          <div>🟡 100 - 299km</div>
          <div>🔵 300km+ (深部)</div>
          <div style={{ marginTop: 6, color: '#00ffff' }}>🌊 青い同心円: 津波伝播予測</div>
        </div>
      </div>
    </div>
  );
};