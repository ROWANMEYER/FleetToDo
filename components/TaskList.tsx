import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { Task } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onComplete: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onComplete }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Day Tasks</Text>
      <FlatList
        scrollEnabled={false}
        data={tasks}
        renderItem={({ item }) => (
          <TaskItem task={item} onComplete={onComplete} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  list: {
    paddingBottom: 24,
  },
});
