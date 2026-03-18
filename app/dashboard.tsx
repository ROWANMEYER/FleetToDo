import React, { useContext } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Dashboard from '../components/Dashboard';
import { WallpaperContext, WALLPAPERS, UISettingsContext } from './_layout';

export default function DashboardScreen() {
  const { index } = useContext(WallpaperContext);
  const { zf, compact } = useContext(UISettingsContext);
  return (
    <ImageBackground
      source={WALLPAPERS[index]}
      resizeMode="cover"
      style={styles.imageBackground}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={[styles.overlay, { paddingTop: 40 * (compact ? 0.85 : 1) }]}>
          <Dashboard />
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
});
