import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import PDPStatusBadge from './PDPStatusBadge';
import DrawerMenu from './DrawerMenu';

// --- Types ---
type AssetType = 'driver' | 'truck' | 'trailer';

interface ComplianceItem {
  id: string;
  referenceId?: string;
  type: AssetType;
  name: string;
  field: string;
  expires: string; // YYYY-MM-DD
}

interface ManualTask {
  id: string;
  text: string;
  done: boolean;
}

// --- API Def ---
const api: any = {
    tasks: {
        getMyDayTasks: "tasks:getMyDayTasks",
        completeManualTask: "tasks:completeManualTask",
        addManualTask: "tasks:addManualTask",
        snoozeTask: "tasks:snoozeTask",
        resolveFleetTask: "tasks:resolveFleetTask",
    },
    health: {
        getFleetHealth: "health:getFleetHealth"
    },
    attachments: {
        generateUploadUrl: "attachments:generateUploadUrl",
        saveAttachment: "attachments:saveAttachment"
    },
    pdpApplications: {
        getLatestByDriver: "pdp:getApplicationByDriver"
    },
};

// --- Constants ---
const COLORS = {
  bg: '#f8fafc',
  headerBg: '#0f172a',
  driver: '#8b5cf6',
  truck: '#0ea5e9',
  trailer: '#f59e0b',
  expired: '#ef4444',
  critical: '#ef4444', // Red
  thisWeek: '#f97316', // Orange
  thisMonth: '#eab308', // Yellow
  textDark: '#1e293b',
  textLight: '#64748b',
  white: '#ffffff',
  border: '#e2e8f0',
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_WIDTH = 390;

// --- Helper Functions ---
  const getDaysDiff = (expires: string): number => {
    if (!expires) return 999;
    // Use local calendar day boundaries to avoid UTC off-by-one issues
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(`${expires}T00:00:00`);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

const getUrgency = (days: number) => {
  if (days < 0) return { label: 'EXPIRED', color: COLORS.expired, priority: 0 };
  if (days <= 3) return { label: 'CRITICAL', color: COLORS.critical, priority: 1 };
  if (days <= 7) return { label: 'THIS WEEK', color: COLORS.thisWeek, priority: 2 };
  if (days <= 30) return { label: 'THIS MONTH', color: COLORS.thisMonth, priority: 3 };
  return null; // Not shown if > 30 days
};

const getAssetIcon = (type: AssetType) => {
  switch (type) {
    case 'driver': return '👤';
    case 'truck': return '🚛';
    case 'trailer': return '🛒'; // Trailer approximation
    default: return '📦';
  }
};

const getAssetColor = (type: AssetType) => {
  switch (type) {
    case 'driver': return COLORS.driver;
    case 'truck': return COLORS.truck;
    case 'trailer': return COLORS.trailer;
    default: return COLORS.textLight;
  }
};

// --- Components ---

const Gauge = ({ score }: { score: number }) => {
  // Simple ring implementation using border
  let color = COLORS.expired;
  if (score > 70) color = '#22c55e'; // Green
  else if (score > 40) color = COLORS.thisWeek; // Orange

  return (
    <View style={styles.gaugeContainer}>
      <View style={[styles.gaugeRing, { borderColor: color }]}>
        <Text style={[styles.gaugeText, { color: color }]}>{Math.round(score)}</Text>
        <Text style={styles.gaugeLabel}>health</Text>
      </View>
    </View>
  );
};

const SummaryPill = ({ label, color, active, onPress }: { label: string; color: string; active?: boolean; onPress?: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.pill, { backgroundColor: active ? color : color + '20' }]}>
    <Text style={[styles.pillText, { color: active ? '#ffffff' : color }]}>{label}</Text>
  </TouchableOpacity>
);

const FilterTab = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tab, active && styles.tabActive]}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const DriverPdpBadge = ({ driverId }: { driverId: string }) => {
  const pdpApplication = useQuery(api.pdpApplications.getLatestByDriver, { driverId });

  if (!pdpApplication?.status) return null;

  return (
    <View style={{ marginTop: 6 }}>
      <PDPStatusBadge status={pdpApplication.status} />
    </View>
  );
};

const ComplianceCard = ({ item, expanded, onPress }: { item: ComplianceItem; expanded: boolean; onPress: () => void }) => {
  const days = getDaysDiff(item.expires);
  const urgency = getUrgency(days);
  const assetColor = getAssetColor(item.type);

  // Backend Hooks
  const resolveFleetTask = useMutation(api.tasks.resolveFleetTask);
  const snoozeTask = useMutation(api.tasks.snoozeTask);
  const generateUploadUrl = useMutation(api.attachments.generateUploadUrl);
  const saveAttachment = useMutation(api.attachments.saveAttachment);

  const handleMarkResolved = async (itemId: string) => {
    try {
      await resolveFleetTask({
        refId: itemId,
        refType: item.type,
        expiryDate: item.expires
      });
      onPress(); // Close card
    } catch (e) {
      Alert.alert("Error", "Could not mark as resolved: " + e);
    }
  };

  const handleAttachDoc = async (itemId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      
      const file = result.assets[0];

      // 1. Get Upload URL
      const uploadUrl = await generateUploadUrl();

      // 2. Upload File
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.mimeType ?? "application/octet-stream" },
        body: await fetch(file.uri).then(r => r.blob()),
      });

      if (!response.ok) throw new Error("Upload failed");
      
      const { storageId } = await response.json();

      // 3. Save Attachment Record
      await saveAttachment({
        refId: itemId,
        refType: item.type,
        storageId,
        fileName: file.name,
        fileType: file.mimeType ?? "unknown",
      });

      onPress();
      Alert.alert("Success", "Document attached successfully");
    } catch (e) {
      Alert.alert("Error", "Could not attach document: " + e);
    }
  };

  const handleSnooze = async (itemId: string) => {
    try {
      // Snooze for 24 hours
      await snoozeTask({ refId: itemId, durationMs: 24 * 60 * 60 * 1000 });
      onPress();
    } catch (e) {
      Alert.alert("Error", "Could not snooze: " + e);
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, { borderLeftColor: assetColor }]}>
      <View style={styles.cardHeader}>
        {/* Left: Icon + Info */}
        <View style={styles.cardLeft}>
          <View style={[styles.iconBox, { backgroundColor: assetColor + '15' }]}>
            <Text style={{ fontSize: 20 }}>{getAssetIcon(item.type)}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
            <Text style={styles.cardSubtitle} numberOfLines={1} ellipsizeMode="tail">
              {item.field} · {item.expires}
            </Text>
            {item.type === 'driver' && item.referenceId ? <DriverPdpBadge driverId={item.referenceId} /> : null}
          </View>
        </View>

        {/* Right: Days + Urgency */}
        <View style={styles.cardRight}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.daysNum, { color: urgency.color }]}>{Math.abs(days)}</Text>
            <Text style={[styles.daysLabel, { color: urgency.color }]}>
              {days === 0 ? 'days' : days < 0 ? 'days ago' : 'days'}
            </Text>
          </View>
          <View style={[styles.urgencyPill, { borderColor: urgency.color + '40', backgroundColor: urgency.color + '10' }]}>
            <Text style={[styles.urgencyText, { color: urgency.color }]}>{urgency.label}</Text>
          </View>
        </View>
      </View>

      {/* Expanded Actions */}
      {expanded && (
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleMarkResolved(item.id)}>
            <Text style={styles.actionBtnText}>Mark Resolved</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleAttachDoc(item.id)}>
            <Text style={styles.actionBtnText}>Attach Doc</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderRightWidth: 0 }]} onPress={() => handleSnooze(item.id)}>
            <Text style={styles.actionBtnText}>Snooze</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const TaskItem = ({ task, onToggle }: { task: ManualTask; onToggle: () => void }) => (
  <TouchableOpacity onPress={onToggle} style={styles.taskItem}>
    <View style={[styles.checkbox, task.done && styles.checkboxChecked]}>
      {task.done && <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>}
    </View>
    <Text style={[styles.taskText, task.done && styles.taskTextDone]}>{task.text}</Text>
  </TouchableOpacity>
);

export default function FleetToday() {
  const [activeTab, setActiveTab] = useState<'All' | 'Drivers' | 'Trucks' | 'Trailers'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [manualTasksCount, setManualTasksCount] = useState(0);

  const [filterType, setFilterType] = useState<'all' | 'critical' | 'thisWeek' | 'tasks'>('all');

  const insets = useSafeAreaInsets(); // Get safe area insets

  const tasksData = useQuery(api.tasks.getMyDayTasks);
  const healthData = useQuery(api.health.getFleetHealth);
  
  const addManualTask = useMutation(api.tasks.addManualTask);
  const completeManualTask = useMutation(api.tasks.completeManualTask);
  const generateUploadUrl = useMutation(api.attachments.generateUploadUrl);
  const saveAttachment = useMutation(api.attachments.saveAttachment);

  // Update manual tasks count for the pill
  React.useEffect(() => {
    if (tasksData) {
      setManualTasksCount(tasksData.filter((t: any) => t.type === 'manual' && !t.completed).length);
    }
  }, [tasksData]);
  const [time, setTime] = useState(new Date());
  const headerDateStr = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(time);

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // --- Derived Data ---
  const complianceItems: ComplianceItem[] = useMemo(() => {
    if (!tasksData) return [];
    return tasksData
        .filter((t: any) => t.type === 'fleet')
        .map((t: any) => ({
            id: t.id,
            referenceId: t.referenceId,
            type: t.referenceType,
            name: t.assetName || t.title, // Fallback if assetName not deployed yet
            field: t.assetField || "Expiry",
            expires: t.dueDate.split('T')[0]
        }));
  }, [tasksData]);

  const handleFilterPress = (type: 'critical' | 'thisWeek' | 'tasks') => {
    setFilterType(current => current === type ? 'all' : type);
  };

  const manualTasks = useMemo(() => {
    if (!tasksData) return [];
    
    // Filter manual tasks based on filterType
    if (filterType === 'critical' || filterType === 'thisWeek') return [];

    return tasksData
        .filter((t: any) => t.type === 'manual')
        .map((t: any) => ({
            id: t._id,
            text: t.title,
            done: t.completed
        }));
  }, [tasksData, filterType]);

  const filteredCompliance = useMemo(() => {
    // If "tasks" filter is active, show nothing in compliance list (only manual tasks shown below)
    if (filterType === 'tasks') return [];

    return complianceItems.filter(item => {
      // Tab Filter
      if (activeTab === 'Drivers' && item.type !== 'driver') return false;
      if (activeTab === 'Trucks' && item.type !== 'truck') return false;
      if (activeTab === 'Trailers' && item.type !== 'trailer') return false;
      
      const days = getDaysDiff(item.expires);
      
      // Filter Type Logic
      if (filterType === 'critical' && days > 3) return false;
      if (filterType === 'thisWeek' && (days <= 3 || days > 7)) return false;

      // 30 Days Filter (Default)
      if (filterType === 'all' && days > 30) return false;

      return true;
    }).sort((a, b) => {
        // Sort: Expired/Critical first (priority), then days ascending
        const daysA = getDaysDiff(a.expires);
        const daysB = getDaysDiff(b.expires);
        const urgencyA = getUrgency(daysA)?.priority ?? 99;
        const urgencyB = getUrgency(daysB)?.priority ?? 99;
        
        if (urgencyA !== urgencyB) return urgencyA - urgencyB;
        return daysA - daysB;
    });
  }, [activeTab, filterType, complianceItems]);

  const stats = useMemo(() => {
    if (healthData) {
        return {
            critical: healthData.details?.criticalCount || 0,
            thisWeek: healthData.details?.warningCount || 0,
            health: healthData.score || 100
        };
    }
    // Fallback to local calculation if health endpoint not ready
    let critical = 0;
    let thisWeek = 0;
    
    complianceItems.forEach(item => {
      const days = getDaysDiff(item.expires);
      if (days <= 3) critical++;
      else if (days <= 7) thisWeek++;
    });

    const health = Math.max(0, 100 - (critical * 15) - (thisWeek * 5));
    
    return { critical, thisWeek, health };
  }, [complianceItems, healthData]);

  const toggleTask = async (id: string) => {
    try {
        // Optimistic update logic could go here, but Convex is fast.
        await completeManualTask({ taskId: id });
    } catch (e) {
        console.error("Failed to complete task", e);
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) {
      setIsAddingTask(false);
      return;
    }
    
    try {
        await addManualTask({
            title: newTaskText,
            priority: "normal",
            dueDate: new Date().toISOString()
        });
        setNewTaskText('');
        setIsAddingTask(false);
    } catch (e) {
        console.error("Failed to add task", e);
        alert("Could not add task.");
    }
  };
  
  if (!tasksData) {
      return (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={COLORS.thisWeek} />
          </View>
      );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />
      
      {/* Drawer Menu */}
      <DrawerMenu isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => setIsDrawerOpen(true)} style={styles.menuButton}>
              <Ionicons name="menu" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerLabel}>FLEET COMMAND</Text>
              <Text style={styles.headerTitle}>Today</Text>
              <Text style={styles.headerDate}>
                {headerDateStr} · {time.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false })}
              </Text>
            </View>
          </View>
          <Gauge score={stats.health} />
        </View>
            
            <View style={styles.statsRow}>
                <SummaryPill 
                    label={`${stats.critical} Critical`} 
                    color={COLORS.critical} 
                    active={filterType === 'critical'}
                    onPress={() => handleFilterPress('critical')}
                />
                <SummaryPill 
                    label={`${stats.thisWeek} This Week`} 
                    color={COLORS.thisWeek} 
                    active={filterType === 'thisWeek'}
                    onPress={() => handleFilterPress('thisWeek')}
                />
                <SummaryPill 
                    label={`${manualTasksCount} Tasks`} 
                    color="#64748b" 
                    active={filterType === 'tasks'}
                    onPress={() => handleFilterPress('tasks')}
                />
            </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Filter Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={{ paddingHorizontal: 16 }}>
                {(['All', 'Drivers', 'Trucks', 'Trailers'] as const).map(tab => (
                    <FilterTab 
                        key={tab} 
                        label={tab} 
                        active={activeTab === tab} 
                        onPress={() => setActiveTab(tab)} 
                    />
                ))}
            </ScrollView>

            {/* Compliance List */}
            <View style={styles.listContainer}>
                {filteredCompliance.map(item => (
                    <ComplianceCard 
                        key={item.id} 
                        item={item} 
                        expanded={expandedId === item.id}
                        onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    />
                ))}
                {filteredCompliance.length === 0 && (
                  <Text style={styles.emptyText}>No alerts for this category.</Text>
                )}
            </View>

            {/* My Tasks */}
            <View style={styles.tasksContainer}>
                <View style={styles.tasksHeader}>
                    <Text style={styles.sectionTitle}>MY TASKS</Text>
                </View>
                
                {isAddingTask && (
                    <View style={styles.inputContainer}>
                        <TextInput 
                            style={styles.input}
                            placeholder="Type task..."
                            value={newTaskText}
                            onChangeText={setNewTaskText}
                            onSubmitEditing={addTask}
                            autoFocus
                            onBlur={addTask}
                        />
                    </View>
                )}

                {manualTasks.map(task => (
                    <TaskItem key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
                ))}
            </View>
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity 
          onPress={() => setIsAddingTask(true)} 
          style={[
            styles.fab,
            { bottom: insets.bottom + 20 } // Dynamic bottom position based on safe area
          ]}
        >
            <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg, // Use background color instead of header color
    alignSelf: 'center',
    width: '100%',
    maxWidth: MAX_WIDTH, // Constrain width for tablet/web
  },
  content: {
    backgroundColor: COLORS.bg,
    flex: 1,
  },
  // Header
  header: {
    backgroundColor: COLORS.headerBg,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  menuButton: {
    marginRight: 16,
    padding: 8,
    marginLeft: -8,
    marginTop: -4,
  },
  headerLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerDate: {
    color: '#94a3b8',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  // Gauge
  gaugeContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeText: {
    fontSize: 18,
    fontWeight: '800',
  },
  gaugeLabel: {
    fontSize: 8,
    color: '#64748b',
  },
  // Tabs
  tabsContainer: {
    marginTop: 16,
    marginBottom: 8,
    maxHeight: 40,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: COLORS.headerBg,
  },
  tabText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 13,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  // List
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textLight,
    marginTop: 20,
    fontSize: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 0, // Inner padding handled by children
    borderLeftWidth: 5,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden', // for radius
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    overflow: 'hidden',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 2,
    flexShrink: 1,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    flexShrink: 1,
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
    width: 64,
    flexShrink: 0,
  },
  daysNum: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 20,
  },
  daysLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  urgencyPill: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  urgencyText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // Expanded Actions
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  // Tasks
  tasksContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    padding: 16,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textLight,
    letterSpacing: 0.8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.textLight,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.thisWeek,
    borderColor: COLORS.thisWeek,
  },
  taskText: {
    color: COLORS.textDark,
    fontSize: 15,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.bg,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 80, // Account for bottom safe area
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.headerBg,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    color: 'white',
    fontSize: 24,
    lineHeight: 24,
  },
});
