import React, { useMemo, useContext } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { WallpaperContext, WALLPAPERS, UISettingsContext } from './_layout';
import { router } from 'expo-router';

const api: any = {
  tasks: { getMyDayTasks: 'tasks:getMyDayTasks' },
  health: { getFleetHealth: 'health:getFleetHealth' },
  drivers: { getDriverDocumentExpiries: 'drivers:getDriverDocumentExpiries' },
  dailyOps: { getDailyOpsSnapshot: 'dailyOps:getDailyOpsSnapshot' },
};

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

export default function AllScreen() {
  const { index } = useContext(WallpaperContext);
  const { zf, compact } = useContext(UISettingsContext);
  const tasksData = useQuery(api.tasks.getMyDayTasks);
  const healthData = useQuery(api.health.getFleetHealth);

  const dailyOps = useQuery(api.dailyOps.getDailyOpsSnapshot) as
    | {
        date: string;
        drivers: Array<{
          driverId: string;
          driverName: string;
          idNumber: string;
          docType: 'License' | 'PDP';
          expiryDate: string;
          daysUntilExpiry: number;
          tier: 'expired' | 'critical' | 'warning' | 'notice' | 'open' | 'current_month';
        }>;
        trucks: Array<{
          truckFleetNo: string;
          registration: string;
          issueType: 'License' | 'Service' | 'Damage';
          expiryDate?: string;
          loggedDate?: string;
          daysUntilExpiry?: number;
          tier: 'expired' | 'critical' | 'warning' | 'notice' | 'open' | 'current_month';
        }>;
        trailers: Array<{
          trailerFleetNoStr: string;
          issueType: 'License' | 'Service' | 'Damage';
          expiryDate?: string;
          loggedDate?: string;
          daysUntilExpiry?: number;
          tier: 'expired' | 'critical' | 'warning' | 'notice' | 'open' | 'current_month';
        }>;
      }
    | null
    | undefined;

  // summary removed per UX request

  return (
    <ImageBackground
      source={WALLPAPERS[index]}
      resizeMode="cover"
      style={styles.imageBackground}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={[styles.overlay, { paddingTop: 40 * (compact ? 0.85 : 1) }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={[styles.body, { fontSize: 18 * zf, color: 'white' }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { fontSize: styles.title.fontSize * zf }]}>ALL</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {dailyOps && (
            <View style={{ marginBottom: 16 * (compact ? 0.85 : 1) }}>
              {Array.isArray(dailyOps.drivers) && dailyOps.drivers.length > 0 && (
                <View style={{ marginTop: 8 * (compact ? 0.85 : 1) }}>
                  <Text style={[styles.title, { fontSize: styles.title.fontSize * zf }]}>DRIVERS</Text>
                  {dailyOps.drivers.map((d, i) => {
                    const n = d.daysUntilExpiry;
                    let relText = '';
                    if (n !== undefined && n !== null) {
                      if (n < 0) {
                        const k = Math.abs(n);
                        relText = k === 1 ? '1 day ago' : `${k} days ago`;
                      } else if (n === 0) {
                        relText = 'today';
                      } else if (n === 1) {
                        relText = 'in 1 day';
                      } else {
                        relText = `in ${n} days`;
                      }
                    }
                    const absPrefix = n !== undefined && n < 0 ? 'Expired' : 'Expires';
                    const initials = (d.driverName || '')
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map(s => s[0]?.toUpperCase() || '')
                      .join('');
                    const badge = d.docType.toUpperCase();
                    const tierColor =
                      d.tier === 'expired' || d.tier === 'open'
                        ? 'rgba(226,75,74,0.9)'
                        : d.tier === 'critical'
                        ? 'rgba(239,159,39,0.9)'
                        : d.tier === 'warning'
                        ? 'rgba(239,159,39,0.7)'
                        : d.tier === 'current_month'
                        ? 'rgba(74, 144, 226, 0.9)'
                        : 'rgba(255,255,255,0.6)';
                    const tierBadgeBg =
                      d.tier === 'expired' || d.tier === 'open'
                        ? 'rgba(226,75,74,0.18)'
                        : d.tier === 'critical'
                        ? 'rgba(239,159,39,0.18)'
                        : d.tier === 'warning'
                        ? 'rgba(239,159,39,0.12)'
                        : d.tier === 'current_month'
                        ? 'rgba(74, 144, 226, 0.18)'
                        : 'rgba(255,255,255,0.12)';
                    return (
                      <View
                        key={`${d.driverId}-${d.docType}-${d.expiryDate}-${i}`}
                        style={{
                          borderRadius: 12 * zf,
                          padding: 12 * (compact ? 0.85 : 1) * zf,
                          marginBottom: 10 * (compact ? 0.85 : 1) * zf,
                          backgroundColor: 'rgba(0,0,0,0.25)',
                          borderWidth: 1,
                          borderColor:
                            d.tier === 'expired' || d.tier === 'open'
                              ? 'rgba(226,75,74,0.5)'
                              : d.tier === 'critical'
                              ? 'rgba(239,159,39,0.5)'
                              : d.tier === 'warning'
                              ? 'rgba(239,159,39,0.4)'
                              : d.tier === 'current_month'
                              ? 'rgba(74, 144, 226, 0.4)'
                              : 'rgba(255,255,255,0.12)',
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 8 * (compact ? 0.85 : 1),
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
                            <View
                              style={{
                                width: 34 * (compact ? 0.9 : 1) * zf,
                                height: 34 * (compact ? 0.9 : 1) * zf,
                                borderRadius: 17 * (compact ? 0.9 : 1) * zf,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10 * (compact ? 0.85 : 1),
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                borderWidth: 1,
                                borderColor: tierColor,
                              }}
                            >
                              <Text style={[styles.body, { fontSize: styles.body.fontSize * zf, fontWeight: '700', color: tierColor }]}>{initials || 'DR'}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.body,
                                  { fontSize: 14 * zf, fontWeight: '600', color: 'white' },
                                ]}
                              >
                                {d.driverName}
                              </Text>
                              <Text
                                style={[
                                  styles.body,
                                  { fontSize: 12 * zf, color: 'rgba(255,255,255,0.7)' },
                                ]}
                              >
                                {d.docType} · {d.idNumber}
                              </Text>
                            </View>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <View
                              style={{
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 999,
                                backgroundColor: tierBadgeBg,
                                borderWidth: 1,
                                borderColor: tierColor,
                              }}
                            >
                              <Text style={[styles.body, { fontSize: 12 * zf, fontWeight: '700', color: 'white' }]}>{badge}</Text>
                            </View>
                            <Text style={[styles.body, { fontSize: 11 * zf, marginTop: 6, color: tierColor }]}>{relText}</Text>
                          </View>
                        </View>
                        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 10 * (compact ? 0.85 : 1) }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={[styles.body, { fontSize: 12 * zf, color: 'rgba(255,255,255,0.8)' }]}>
                            {absPrefix}{' '}
                            <Text style={[styles.body, { fontWeight: '700' }]}>{d.expiryDate}</Text>
                          </Text>
                          <View
                            style={{
                              paddingHorizontal: 12 * (compact ? 0.85 : 1),
                              paddingVertical: 6 * (compact ? 0.85 : 1),
                              borderRadius: 10 * (compact ? 0.85 : 1),
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              borderWidth: 1,
                              borderColor: 'rgba(255,255,255,0.12)',
                            }}
                          >
                            <Text style={[styles.body, { fontSize: 12 * zf, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }]}>View driver</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
              {Array.isArray(dailyOps.trucks) && dailyOps.trucks.length > 0 && (
                <View style={{ marginTop: 8 * (compact ? 0.85 : 1) }}>
                  <Text style={[styles.title, { fontSize: styles.title.fontSize * zf }]}>TRUCKS</Text>
                  {dailyOps.trucks.map((t, i) => {
                    const isDamage = t.issueType === 'Damage';
                    const n = t.daysUntilExpiry ?? 0;
                    let relText = '';
                    if (isDamage) {
                      relText = `since ${formatDate(t.loggedDate)}`;
                    } else {
                      if (n < 0) {
                        const k = Math.abs(n);
                        relText = k === 1 ? '1 day ago' : `${k} days ago`;
                      } else if (n === 0) {
                        relText = 'today';
                      } else if (n === 1) {
                        relText = 'in 1 day';
                      } else {
                        relText = `in ${n} days`;
                      }
                    }
                    const tierColor =
                      t.tier === 'expired' || t.tier === 'open'
                        ? 'rgba(226,75,74,0.9)'
                        : t.tier === 'critical'
                        ? 'rgba(239,159,39,0.9)'
                        : t.tier === 'warning'
                        ? 'rgba(239,159,39,0.7)'
                        : t.tier === 'current_month'
                        ? 'rgba(74, 144, 226, 0.9)'
                        : 'rgba(255,255,255,0.6)';
                    const tierBadgeBg =
                      t.tier === 'expired' || t.tier === 'open'
                        ? 'rgba(226,75,74,0.18)'
                        : t.tier === 'critical'
                        ? 'rgba(239,159,39,0.18)'
                        : t.tier === 'warning'
                        ? 'rgba(239,159,39,0.12)'
                        : t.tier === 'current_month'
                        ? 'rgba(74, 144, 226, 0.18)'
                        : 'rgba(255,255,255,0.12)';
                    const badge = isDamage ? 'OPEN' : t.issueType.toUpperCase();
                    const absPrefix = isDamage ? 'Logged' : (n < 0 ? 'Expired' : 'Expires');
                    const dateStr = isDamage ? formatDate(t.loggedDate) : t.expiryDate;
                    return (
                      <View
                        key={`${t.truckFleetNo}-${t.issueType}-${t.expiryDate ?? t.loggedDate}-${i}`}
                        style={{
                          borderRadius: 12 * zf,
                          padding: 12 * (compact ? 0.85 : 1) * zf,
                          marginBottom: 10 * (compact ? 0.85 : 1) * zf,
                          backgroundColor: 'rgba(0,0,0,0.25)',
                          borderWidth: 1,
                          borderColor:
                            t.tier === 'expired' || t.tier === 'open'
                              ? 'rgba(226,75,74,0.5)'
                              : t.tier === 'critical'
                              ? 'rgba(239,159,39,0.5)'
                              : t.tier === 'warning'
                              ? 'rgba(239,159,39,0.4)'
                              : t.tier === 'current_month'
                              ? 'rgba(74, 144, 226, 0.4)'
                              : 'rgba(255,255,255,0.12)',
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 8 * (compact ? 0.85 : 1),
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
                            <View
                              style={{
                                width: 34 * (compact ? 0.9 : 1) * zf,
                                height: 34 * (compact ? 0.9 : 1) * zf,
                                borderRadius: 8 * (compact ? 0.9 : 1) * zf,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10 * (compact ? 0.85 : 1),
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                borderWidth: 1,
                                borderColor: tierColor,
                              }}
                            >
                              <Text style={[styles.body, { fontSize: 12 * zf, fontWeight: '700', color: tierColor }]}>{t.truckFleetNo || 'TRK'}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.body,
                                  { fontSize: 14 * zf, fontWeight: '600', color: 'white' },
                                ]}
                              >
                                {t.registration || 'Truck'}
                              </Text>
                              <Text
                                style={[
                                  styles.body,
                                  { fontSize: 12 * zf, color: 'rgba(255,255,255,0.7)' },
                                ]}
                              >
                                {t.issueType}
                              </Text>
                            </View>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <View
                              style={{
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 999,
                                backgroundColor: tierBadgeBg,
                                borderWidth: 1,
                                borderColor: tierColor,
                              }}
                            >
                              <Text style={[styles.body, { fontSize: 12 * zf, fontWeight: '700', color: 'white' }]}>{badge}</Text>
                            </View>
                            <Text style={[styles.body, { fontSize: 11 * zf, marginTop: 6, color: tierColor }]}>{relText}</Text>
                          </View>
                        </View>
                        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 10 * (compact ? 0.85 : 1) }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={[styles.body, { fontSize: 12 * zf, color: 'rgba(255,255,255,0.8)' }]}>
                            {absPrefix}{' '}
                            <Text style={[styles.body, { fontWeight: '700' }]}>{dateStr}</Text>
                          </Text>
                          <View
                            style={{
                              paddingHorizontal: 12 * (compact ? 0.85 : 1),
                              paddingVertical: 6 * (compact ? 0.85 : 1),
                              borderRadius: 10 * (compact ? 0.85 : 1),
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              borderWidth: 1,
                              borderColor: 'rgba(255,255,255,0.12)',
                            }}
                          >
                            <Text style={[styles.body, { fontSize: 12 * zf, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }]}>View truck</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
              {Array.isArray(dailyOps.trailers) && dailyOps.trailers.length > 0 && (
                <View style={{ marginTop: 8 * (compact ? 0.85 : 1) }}>
                  <Text style={[styles.title, { fontSize: styles.title.fontSize * zf }]}>TRAILERS</Text>
                  {dailyOps.trailers.map((t, i) => {
                    const isDamage = t.issueType === 'Damage';
                    const n = t.daysUntilExpiry ?? 0;
                    let relText = '';
                    if (isDamage) {
                      relText = `since ${formatDate(t.loggedDate)}`;
                    } else {
                      if (n < 0) {
                        const k = Math.abs(n);
                        relText = k === 1 ? '1 day ago' : `${k} days ago`;
                      } else if (n === 0) {
                        relText = 'today';
                      } else if (n === 1) {
                        relText = 'in 1 day';
                      } else {
                        relText = `in ${n} days`;
                      }
                    }
                    const tierColor =
                      t.tier === 'expired' || t.tier === 'open'
                        ? 'rgba(226,75,74,0.9)'
                        : t.tier === 'critical'
                        ? 'rgba(239,159,39,0.9)'
                        : t.tier === 'warning'
                        ? 'rgba(239,159,39,0.7)'
                        : t.tier === 'current_month'
                        ? 'rgba(74, 144, 226, 0.9)'
                        : 'rgba(255,255,255,0.6)';
                    const tierBadgeBg =
                      t.tier === 'expired' || t.tier === 'open'
                        ? 'rgba(226,75,74,0.18)'
                        : t.tier === 'critical'
                        ? 'rgba(239,159,39,0.18)'
                        : t.tier === 'warning'
                        ? 'rgba(239,159,39,0.12)'
                        : t.tier === 'current_month'
                        ? 'rgba(74, 144, 226, 0.18)'
                        : 'rgba(255,255,255,0.12)';
                    const badge = isDamage ? 'OPEN' : t.issueType.toUpperCase();
                    const absPrefix = isDamage ? 'Logged' : (n < 0 ? 'Expired' : 'Expires');
                    const dateStr = isDamage ? formatDate(t.loggedDate) : t.expiryDate;
                    return (
                      <View
                        key={`${t.trailerFleetNoStr}-${t.issueType}-${t.expiryDate ?? t.loggedDate}-${i}`}
                        style={{
                          borderRadius: 12 * zf,
                          padding: 12 * (compact ? 0.85 : 1) * zf,
                          marginBottom: 10 * (compact ? 0.85 : 1) * zf,
                          backgroundColor: 'rgba(0,0,0,0.25)',
                          borderWidth: 1,
                          borderColor:
                            t.tier === 'expired' || t.tier === 'open'
                              ? 'rgba(226,75,74,0.5)'
                              : t.tier === 'critical'
                              ? 'rgba(239,159,39,0.5)'
                              : t.tier === 'warning'
                              ? 'rgba(239,159,39,0.4)'
                              : t.tier === 'current_month'
                              ? 'rgba(74, 144, 226, 0.4)'
                              : 'rgba(255,255,255,0.12)',
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 8 * (compact ? 0.85 : 1),
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
                            <View
                              style={{
                                width: 34 * (compact ? 0.9 : 1) * zf,
                                height: 34 * (compact ? 0.9 : 1) * zf,
                                borderRadius: 8 * (compact ? 0.9 : 1) * zf,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10 * (compact ? 0.85 : 1),
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                borderWidth: 1,
                                borderColor: tierColor,
                              }}
                            >
                              <Text style={[styles.body, { fontSize: 12 * zf, fontWeight: '700', color: tierColor }]}>{t.trailerFleetNoStr || 'TRL'}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.body,
                                  { fontSize: 14 * zf, fontWeight: '600', color: 'white' },
                                ]}
                              >
                                {t.issueType}
                              </Text>
                              <Text
                                style={[
                                  styles.body,
                                  { fontSize: 12 * zf, color: 'rgba(255,255,255,0.7)' },
                                ]}
                              >
                                {t.issueType}
                              </Text>
                            </View>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <View
                              style={{
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 999,
                                backgroundColor: tierBadgeBg,
                                borderWidth: 1,
                                borderColor: tierColor,
                              }}
                            >
                              <Text style={[styles.body, { fontSize: 12 * zf, fontWeight: '700', color: 'white' }]}>{badge}</Text>
                            </View>
                            <Text style={[styles.body, { fontSize: 11 * zf, marginTop: 6, color: tierColor }]}>{relText}</Text>
                          </View>
                        </View>
                        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 10 * (compact ? 0.85 : 1) }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={[styles.body, { fontSize: 12 * zf, color: 'rgba(255,255,255,0.8)' }]}>
                            {absPrefix}{' '}
                            <Text style={[styles.body, { fontWeight: '700' }]}>{dateStr}</Text>
                          </Text>
                          <View
                            style={{
                              paddingHorizontal: 12 * (compact ? 0.85 : 1),
                              paddingVertical: 6 * (compact ? 0.85 : 1),
                              borderRadius: 10 * (compact ? 0.85 : 1),
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              borderWidth: 1,
                              borderColor: 'rgba(255,255,255,0.12)',
                            }}
                          >
                            <Text style={[styles.body, { fontSize: 12 * zf, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }]}>View trailer</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
              {/* assets-with-issues text removed per UX request */}
            </View>
          )}
          {/* summary section removed per UX request */}

          </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summarySection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
});
