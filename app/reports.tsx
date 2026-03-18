import React, { useContext } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WallpaperContext, WALLPAPERS, UISettingsContext } from './_layout';

export default function ReportsScreen() {
  const { index } = useContext(WallpaperContext);
  const { zf, compact } = useContext(UISettingsContext);
  return (
    <ImageBackground
      source={WALLPAPERS[index]}
      resizeMode="cover"
      style={styles.imageBackground}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={[styles.overlay, { paddingTop: 40 * (compact ? 0.85 : 1) }]}>
            <View style={styles.content}>
              <Text style={[styles.title, { fontSize: 24 * zf }]}>Reports</Text>
              <Text style={[styles.body, { fontSize: 14 * zf }]}>Reports screen placeholder.</Text>
            </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});
