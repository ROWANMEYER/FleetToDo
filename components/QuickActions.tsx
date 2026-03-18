import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface QuickActionsProps {
  onAddTask: () => void;
  onLogIssue: () => void;
  onUploadDoc: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  onAddTask, 
  onLogIssue, 
  onUploadDoc 
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btn} onPress={onAddTask}>
        <Text style={styles.btnText}>+ Add Task</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onLogIssue}>
        <Text style={styles.btnText}>! Log Issue</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onUploadDoc}>
        <Text style={styles.btnText}>^ Upload Doc</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 8,
  },
  btn: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  btnText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
});
