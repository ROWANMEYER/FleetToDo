import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery } from 'convex/react';
import { WallpaperContext, WALLPAPERS } from './_layout';

const api: any = {
  displaySettings: {
    getByClientId: 'displaySettings:getByClientId',
    upsert: 'displaySettings:upsert',
  },
};

export default function SettingsScreen() {
  const { index } = useContext(WallpaperContext);
  const clientId = 'default';
  const settings = useQuery(api.displaySettings.getByClientId, { clientId });
  const upsert = useMutation(api.displaySettings.upsert);

  const [zoom, setZoom] = useState(40);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    if (settings) {
      setZoom(typeof settings.zoomLevel === 'number' ? settings.zoomLevel : 40);
      setCompactMode(Boolean(settings.compactMode));
    }
  }, [settings]);

  useEffect(() => {
    if (!settings) {
      upsert({ clientId, zoomLevel: 40, compactMode: false }).catch(() => {});
    }
  }, [settings]);

  const zoomPct = Math.max(20, Math.min(200, zoom));
  const onMinus = () => {
    const next = Math.max(20, zoomPct - 10);
    setZoom(next);
    upsert({ clientId, zoomLevel: next, compactMode }).catch(() => {});
  };
  const onPlus = () => {
    const next = Math.min(200, zoomPct + 10);
    setZoom(next);
    upsert({ clientId, zoomLevel: next, compactMode }).catch(() => {});
  };

  const toggleCompact = () => {
    const next = !compactMode;
    setCompactMode(next);
    upsert({ clientId, compactMode: next }).catch(() => {});
  };

  const barWidth = useMemo(() => `${zoomPct}%`, [zoomPct]);

  return (
    <ImageBackground
      source={WALLPAPERS[index]}
      resizeMode="cover"
      style={styles.imageBackground}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={[styles.overlay, { paddingTop: 40 * (compactMode ? 0.85 : 1) }]}>
          <View style={styles.section}>
            <Text style={styles.title}>Settings</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Zoom</Text>
            <View style={styles.zoomRow}>
              <TouchableOpacity onPress={onMinus} style={styles.circleBtn}>
                <Text style={styles.circleBtnText}>−</Text>
              </TouchableOpacity>
              <View style={styles.zoomBar}>
                <View style={[styles.zoomFill, { width: barWidth }]} />
              </View>
              <TouchableOpacity onPress={onPlus} style={styles.circleBtn}>
                <Text style={styles.circleBtnText}>+</Text>
              </TouchableOpacity>
              <Text style={[styles.body, { marginLeft: 10, fontWeight: '700' }]}>{zoomPct}%</Text>
            </View>
            <Text style={[styles.hint, { marginTop: 8 }]}>Affects other screens, not Settings</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Compact Mode</Text>
            <TouchableOpacity
              onPress={toggleCompact}
              style={[
                styles.toggle,
                compactMode ? styles.toggleOn : styles.toggleOff,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  compactMode ? styles.toggleKnobOn : styles.toggleKnobOff,
                ]}
              />
            </TouchableOpacity>
            <Text style={styles.hint}>
              Reduce spacing and padding across lists and cards
            </Text>
          </View>

          <View style={{ height: 24 }} />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  imageBackground: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  circleBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  zoomBar: {
    flex: 1,
    height: 8,
    marginHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  zoomFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    padding: 4,
    alignItems: 'flex-start',
    borderWidth: 1,
    marginTop: 4,
  },
  toggleOn: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderColor: 'rgba(34,197,94,0.35)',
    alignItems: 'flex-end',
  },
  toggleOff: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  toggleKnobOn: {
    backgroundColor: 'white',
  },
  toggleKnobOff: {
    backgroundColor: 'white',
  },
});
