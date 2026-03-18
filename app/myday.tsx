import React, { useMemo, useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery } from "convex/react";
import { UISettingsContext } from "./_layout";

const api: any = {
  tasks: { getMyDayTasks: "tasks:getMyDayTasks" },
  myDay: {
    getMyDaySelections: "myDay:getMyDaySelections",
    addMyDaySelection: "myDay:addMyDaySelection",
    removeMyDaySelection: "myDay:removeMyDaySelection",
  },
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function MyDay() {
  const { zf } = useContext(UISettingsContext);
  const selections = useQuery(api.myDay.getMyDaySelections) || [];
  const tasksData = useQuery(api.tasks.getMyDayTasks) || [];
  const addSelection = useMutation(api.myDay.addMyDaySelection);
  const removeSelection = useMutation(api.myDay.removeMyDaySelection);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [addingManual, setAddingManual] = useState(false);
  const [manualText, setManualText] = useState("");

  const addedKeySet = useMemo(() => new Set(selections.map((s: any) => `${s.itemType}-${s.itemId}`)), [selections]);

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

  const myDayItems = useMemo(() => {
    return selections
      .slice()
      .sort((a: any, b: any) => b.createdAt - a.createdAt);
  }, [selections]);

  const onAddSuggestion = async (s: { itemId: string; itemType: string; label: string }) => {
    await addSelection({ itemId: s.itemId, itemType: s.itemType, label: s.label });
  };

  const onRemove = async (selectionId: string) => {
    await removeSelection({ selectionId });
  };

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

  const hasItems = myDayItems.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: styles.title.fontSize * zf }]}>My Day</Text>
          <Text style={[styles.subtitle, { fontSize: styles.subtitle.fontSize * zf }]}>{todayStr()}</Text>
        </View>

      {!hasItems && (
        <View style={styles.empty}>
          <Image source={require("../assets/splash_icon.png")} style={styles.bgImage} />
          <Text style={[styles.emptyText, { fontSize: styles.emptyText.fontSize * zf }]}>Start fresh. Add tasks for today.</Text>
        </View>
      )}

      {hasItems && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {myDayItems.map((it: any) => {
            const done = completed[it._id];
            return (
              <View key={it._id} style={[styles.row, { padding: 12 * zf, borderRadius: 12 * zf, marginBottom: 10 * zf }]}>
                <TouchableOpacity onPress={() => onToggleDone(it._id)} style={[styles.checkbox, done && styles.checkboxDone]}>
                  {done ? <Text style={[styles.checkmark, { fontSize: styles.checkmark.fontSize * zf }]}>✓</Text> : null}
                </TouchableOpacity>
                <Text style={[styles.rowText, { fontSize: styles.rowText.fontSize * zf }, done && styles.rowTextDone]} numberOfLines={2}>
                  {it.label}
                </Text>
                <TouchableOpacity onPress={() => onRemove(it._id)} style={styles.removeBtn}>
                  <Text style={[styles.removeText, { fontSize: styles.removeText.fontSize * zf }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={() => setShowSuggestions(true)} style={styles.btn}>
            <Text style={[styles.btnText, { fontSize: styles.btnText.fontSize * zf }]}>Suggestions</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAddingManual(true)} style={styles.addBtn}>
            <Text style={[styles.addBtnText, { fontSize: styles.addBtnText.fontSize * zf, lineHeight: styles.addBtnText.lineHeight * zf }]}>+</Text>
          </TouchableOpacity>
        </View>

      <Modal visible={showSuggestions} transparent animationType="slide" onRequestClose={() => setShowSuggestions(false)}>
        <View style={styles.modalBack}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: styles.modalTitle.fontSize * zf }]}>Suggestions</Text>
              <TouchableOpacity onPress={() => setShowSuggestions(false)}>
                <Text style={[styles.modalClose, { fontSize: styles.modalClose.fontSize * zf }]}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {suggestions.map((s) => (
                <TouchableOpacity key={s.key} style={styles.suggestionRow} onPress={() => onAddSuggestion(s)}>
                  <Text style={[styles.suggestionText, { fontSize: styles.suggestionText.fontSize * zf }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
              {suggestions.length === 0 && <Text style={[styles.noSuggestions, { fontSize: styles.noSuggestions.fontSize * zf }]}>No suggestions available</Text>}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={addingManual} transparent animationType="fade" onRequestClose={() => setAddingManual(false)}>
        <View style={styles.modalBack}>
          <View style={styles.manualBox}>
            <Text style={[styles.modalTitle, { fontSize: styles.modalTitle.fontSize * zf }]}>Add Task</Text>
            <TextInput
              style={[styles.input, { fontSize: styles.input.fontSize * zf }]}
              placeholder="Type task…"
              value={manualText}
              onChangeText={setManualText}
              onSubmitEditing={onAddManual}
              autoFocus
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity onPress={() => setAddingManual(false)}><Text style={[styles.modalClose, { fontSize: styles.modalClose.fontSize * zf }]}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={onAddManual}><Text style={[styles.modalClose, { fontSize: styles.modalClose.fontSize * zf }]}>Add</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 16 },
  title: { fontSize: 28, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 13, fontWeight: "600", color: "#64748b", marginTop: 4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  bgImage: { width: 160, height: 160, opacity: 0.2, marginBottom: 12, resizeMode: "contain" },
  emptyText: { fontSize: 14, color: "#64748b" },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#cbd5e1", marginRight: 12, alignItems: "center", justifyContent: "center" },
  checkboxDone: { backgroundColor: "#cbd5e1", borderColor: "#cbd5e1" },
  checkmark: { color: "#fff", fontSize: 12, fontWeight: "700" },
  rowText: { flex: 1, fontSize: 15, color: "#334155", fontWeight: "500" },
  rowTextDone: { textDecorationLine: "line-through", color: "#cbd5e1" },
  removeBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  removeText: { color: "#64748b", fontWeight: "700", fontSize: 12 },
  bottomBar: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  btn: { backgroundColor: "#0f172a", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  addBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "#fff", fontSize: 24, lineHeight: 24, fontWeight: "800" },
  modalBack: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: "70%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  modalClose: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  suggestionRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  suggestionText: { fontSize: 14, color: "#1e293b" },
  noSuggestions: { paddingVertical: 20, color: "#64748b" },
  manualBox: { backgroundColor: "#fff", margin: 24, padding: 16, borderRadius: 16, gap: 12 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#0f172a", padding: 12, borderRadius: 12, fontSize: 15 },
});
