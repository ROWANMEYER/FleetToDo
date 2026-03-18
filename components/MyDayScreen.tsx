import React, { useMemo, useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import DrawerMenu from './DrawerMenu';
import { UISettingsContext, WallpaperContext, WALLPAPERS } from '../app/_layout';

const api: any = {
  tasks: { getMyDayTasks: 'tasks:getMyDayTasks' },
  myDay: {
    getMyDaySelections: 'myDay:getMyDaySelections',
    addMyDaySelection: 'myDay:addMyDaySelection',
    removeMyDaySelection: 'myDay:removeMyDaySelection',
  },
};

function getFormattedDate() {
  const today = new Date();
  const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(today);
  const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric' }).format(today);
  const month = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(today);
  return `${weekday} ${day} ${month}`;
}

export default function MyDayScreen() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const formattedDate = getFormattedDate();
  const { index: wallpaperIndex, setIndex: setWallpaperIndex } = useContext(WallpaperContext);
  const { zf } = useContext(UISettingsContext);
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  const [showDailyChecklistHint, setShowDailyChecklistHint] = useState(false);

  const myDayItems = useQuery(api.myDay.getMyDaySelections) || [];
  const tasksData = useQuery(api.tasks.getMyDayTasks) || [];
  const addSelection = useMutation(api.myDay.addMyDaySelection);
  const removeSelection = useMutation(api.myDay.removeMyDaySelection);

  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [addingManual, setAddingManual] = useState(false);
  const [manualText, setManualText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addedKeySet = useMemo(() => new Set(myDayItems.map((s: any) => `${s.itemType}-${s.itemId}`)), [myDayItems]);

  const suggestions = useMemo(() => {
    return (tasksData as any[])
      .filter((t) => t.type === "fleet" && t.priority === "critical")
      .map((t) => {
        const itemId = t.referenceId ?? t.id;
        const itemType = `${t.referenceType}_${(t.assetField || "expiry").toLowerCase()}_expired`;
        const label = `${t.assetName || t.title} · ${(t.assetField || "Expiry")} · EXPIRED`;
        return { itemId, itemType, label, key: `${itemType}-${itemId}` };
      })
      .filter((s) => !addedKeySet.has(s.key));
  }, [tasksData, addedKeySet]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const seen = await AsyncStorage.getItem('fleettodo.dailyChecklistHint.v1');
        if (!mounted) return;
        if (!seen) {
          setShowDailyChecklistHint(true);
        }
      } catch {
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onToggleDone = (selectionId: string) => {
    setCompleted((prev) => ({ ...prev, [selectionId]: !prev[selectionId] }));
  };

  const onAddManual = async () => {
    const text = manualText.trim();
    if (!text) {
      setAddingManual(false);
      return;
    }
    const itemId = `manual-${Date.now()}`;
    await addSelection({ itemId, itemType: "manual", label: text });
    setManualText("");
    setAddingManual(false);
  };

  const onAddSuggestion = async (s: { itemId: string; itemType: string; label: string }) => {
    await addSelection({ itemId: s.itemId, itemType: s.itemType, label: s.label });
  };

  const onRemove = async (selectionId: string) => {
    await removeSelection({ selectionId });
  };

  const hasItems = myDayItems.length > 0;

  return (
    <ImageBackground
      source={WALLPAPERS[wallpaperIndex]}
      resizeMode="cover"
      style={styles.imageBackground}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => setIsDrawerOpen(true)}>
                <Ionicons name="menu-outline" size={28} color="white" />
              </TouchableOpacity>
              <View style={styles.headerTitles}>
                <Text style={styles.headerTitle}>My Day</Text>
                <Text style={styles.headerDate}>{formattedDate}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowWallpaperPicker(true)}>
              <Ionicons name="ellipsis-vertical" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {showDailyChecklistHint && (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>
                Capture today&apos;s trucks, trailers and drivers in the Daily Checklist app. This screen shows your tasks and alerts for the day.
              </Text>
              <TouchableOpacity
                style={styles.hintDismiss}
                onPress={async () => {
                  setShowDailyChecklistHint(false);
                  try {
                    await AsyncStorage.setItem('fleettodo.dailyChecklistHint.v1', '1');
                  } catch {
                  }
                }}
              >
                <Text style={styles.hintDismissText}>Got it</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.contentArea}>
            {hasItems ? (
              <ScrollView contentContainerStyle={styles.listContent}>
                {myDayItems.map((it: any) => {
                  const done = completed[it._id];
                  return (
                    <View key={it._id} style={[styles.row, { padding: 18 * zf, borderRadius: 20 * zf, marginBottom: 10 * zf }]}>
                      <TouchableOpacity onPress={() => onToggleDone(it._id)} style={[styles.checkbox, done && styles.checkboxDone]}>
                        {done ? <Text style={styles.checkmark}>✓</Text> : null}
                      </TouchableOpacity>
                      <Text style={[styles.rowText, done && styles.rowTextDone]} numberOfLines={2}>
                        {it.label}
                      </Text>
                      <TouchableOpacity onPress={() => onRemove(it._id)} style={styles.removeButton}>
                        <Ionicons name="close" size={24} color="#999" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Start fresh. Add tasks for today.</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => setShowSuggestions(true)} style={styles.suggestionsButton}>
              <Ionicons name="bulb-outline" size={20} color="white" style={styles.suggestionsIcon} />
              <Text style={styles.suggestionsButtonText}>Suggestions</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddingManual(true)} style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

      <Modal visible={addingManual} transparent animationType="fade" onRequestClose={() => setAddingManual(false)}>
        <View style={styles.modalBack}>
          <View style={styles.modalSheet}>
            <TextInput
              style={styles.manualInput}
              placeholder="Enter a task..."
              value={manualText}
              onChangeText={setManualText}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setAddingManual(false)} style={styles.modalButton}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onAddManual} style={[styles.modalButton, styles.modalButtonPrimary]}>
                <Text style={styles.modalButtonPrimaryText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showSuggestions} transparent animationType="slide" onRequestClose={() => setShowSuggestions(false)}>
        <View style={styles.modalBack}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Suggestions</Text>
              <TouchableOpacity onPress={() => setShowSuggestions(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {suggestions.map((s) => (
                <TouchableOpacity key={s.key} style={[styles.suggestionRow, { paddingVertical: 14 * zf, paddingHorizontal: 14 * zf, borderRadius: 16 * zf, marginBottom: 10 * zf }]} onPress={() => onAddSuggestion(s)}>
                  <Text style={styles.suggestionText}>{s.label}</Text>
                </TouchableOpacity>
              ))}
              {suggestions.length === 0 && <Text style={styles.noSuggestions}>No suggestions available</Text>}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showWallpaperPicker} transparent animationType="fade" onRequestClose={() => setShowWallpaperPicker(false)}>
        <View style={styles.modalBack}>
          <View style={styles.wallpaperSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Wallpaper</Text>
              <TouchableOpacity onPress={() => setShowWallpaperPicker(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.wallpaperGrid}>
              {WALLPAPERS.map((src, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.wallpaperThumb, wallpaperIndex === i && styles.wallpaperThumbActive]}
                  onPress={() => {
                    setWallpaperIndex(i);
                    setShowWallpaperPicker(false);
                  }}
                >
                  <ImageBackground source={src} style={{ flex: 1 }} imageStyle={{ borderRadius: 12 }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DrawerMenu isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitles: {
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  headerDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  contentArea: {
    flex: 1,
    marginTop: 24,
  },
  hintBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.78)',
  },
  hintText: {
    color: 'rgba(248,250,252,0.92)',
    fontSize: 14,
  },
  hintDismiss: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(248,250,252,0.16)',
  },
  hintDismissText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.58)',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.82)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkboxDone: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
  },
  rowText: {
    flex: 1,
    fontSize: 16,
  },
  rowTextDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  removeButton: {
    marginLeft: 10,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  suggestionsIcon: {
    marginRight: 8,
  },
  suggestionsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
    lineHeight: 32,
  },
  modalBack: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.82)',
    maxHeight: '60%',
  },
  manualInput: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    fontSize: 18,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    padding: 10,
    marginLeft: 10,
  },
  modalButtonPrimary: {
    backgroundColor: '#007aff',
    borderRadius: 5,
  },
  modalButtonPrimaryText: {
    color: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  modalClose: {
    fontSize: 16,
    color: '#007aff',
  },
  suggestionRow: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.82)',
    marginBottom: 10,
  },
  suggestionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noSuggestions: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
  wallpaperSheet: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    width: '92%',
    alignSelf: 'center',
    maxHeight: '70%',
  },
  wallpaperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  wallpaperThumb: {
    width: '31%',
    aspectRatio: 9 / 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  wallpaperThumbActive: {
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
});
