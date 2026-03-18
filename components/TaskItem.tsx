import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete }) => {
  const isCritical = task.priority === 'critical';
  const isWarning = task.priority === 'warning';
  
  return (
    <View style={[
      styles.container, 
      isCritical && styles.criticalBorder,
      isWarning && styles.warningBorder
    ]}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <View style={[
          styles.badge,
          isCritical ? styles.bgCritical : isWarning ? styles.bgWarning : styles.bgNormal
        ]}>
          <Text style={styles.badgeText}>{task.priority.toUpperCase()}</Text>
        </View>
      </View>
      
      {task.description && (
        <Text style={styles.description}>{task.description}</Text>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.date}>Due: {new Date(task.dueDate).toLocaleDateString()}</Text>
        
        {task.type === 'manual' ? (
          <TouchableOpacity 
            style={styles.completeBtn}
            onPress={() => onComplete(task.id)}
          >
            <Text style={styles.btnText}>Complete</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.fleetNote}>Update fleet record to resolve</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  criticalBorder: {
    borderLeftColor: '#f44336',
  },
  warningBorder: {
    borderLeftColor: '#ff9800',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bgCritical: { backgroundColor: '#ffebee' },
  bgWarning: { backgroundColor: '#fff3e0' },
  bgNormal: { backgroundColor: '#e8f5e9' },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 12,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  completeBtn: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  btnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  fleetNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#ff9800',
  },
});
