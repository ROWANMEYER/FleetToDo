export type TaskPriority = 'critical' | 'warning' | 'normal';

export interface BaseTask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: string; // ISO string
  completed: boolean;
  createdAt: number;
}

export interface ManualTask extends BaseTask {
  type: 'manual';
}

export interface FleetTask extends BaseTask {
  type: 'fleet';
  referenceType: 'driver' | 'truck' | 'trailer';
  referenceId: string;
}

export type Task = ManualTask | FleetTask;

export interface FleetHealth {
  score: number;
  criticalCount: number;
  warningCount: number;
  details?: {
    driversActive: number;
    trucksActive: number;
    trailersActive: number;
  };
}

export interface Attachment {
  id: string;
  taskId: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: number;
  uploadedBy: string;
}
