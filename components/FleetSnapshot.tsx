import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FleetSnapshotProps {
  driversActive: number;
  trucksActive: number;
  trailersActive: number;
}

export const FleetSnapshot: React.FC<FleetSnapshotProps> = ({ 
  driversActive, 
  trucksActive, 
  trailersActive 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Fleet Snapshot</Text>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.value}>{driversActive}</Text>
          <Text style={styles.label}>Drivers</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.item}>
          <Text style={styles.value}>{trucksActive}</Text>
          <Text style={styles.label}>Trucks</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.item}>
          <Text style={styles.value}>{trailersActive}</Text>
          <Text style={styles.label}>Trailers</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#eee',
  },
});
