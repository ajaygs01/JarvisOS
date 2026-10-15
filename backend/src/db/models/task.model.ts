import mongoose, { Schema, Document } from 'mongoose';
import type { AgentTask } from '../../types/agent.js';

export interface TaskDocument extends Omit<AgentTask, 'id'>, Document {
  id: string;
}

const LogSchema = new Schema(
  {
    id: { type: String, required: true },
    timestamp: { type: String, required: true },
    level: { type: String, enum: ['info', 'warn', 'error', 'success'], required: true },
    message: { type: String, required: true },
    stepId: { type: String },
    details: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const VerificationSchema = new Schema(
  {
    verified: { type: Boolean, required: true },
    timestamp: { type: String, required: true },
    checkType: { type: String, required: true },
    details: { type: String, required: true },
    expectedCriteria: { type: String, required: true },
    actualOutcome: { type: String, required: true },
  },
  { _id: false }
);

const StepSchema = new Schema(
  {
    id: { type: String, required: true },
    stepNumber: { type: Number, required: true },
    description: { type: String, required: true },
    tool: { type: String, required: true },
    params: { type: Schema.Types.Mixed, default: {} },
    dependencies: [{ type: String }],
    expectedOutput: { type: String },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'needs_approval'],
      required: true,
    },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 2 },
    error: { type: String },
    output: { type: Schema.Types.Mixed },
    verification: { type: VerificationSchema },
    startedAt: { type: String },
    completedAt: { type: String },
  },
  { _id: false }
);

const ApprovalSchema = new Schema(
  {
    stepId: { type: String, required: true },
    actionDescription: { type: String, required: true },
    tool: { type: String, required: true },
    params: { type: Schema.Types.Mixed, default: {} },
    consequences: { type: String, required: true },
  },
  { _id: false }
);

const TaskSchema = new Schema<TaskDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    instruction: { type: String, required: true },
    createdAt: { type: String, required: true },
    startedAt: { type: String },
    completedAt: { type: String },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'needs_approval'],
      required: true,
      index: true,
    },
    steps: [StepSchema],
    logs: [LogSchema],
    overallVerification: { type: VerificationSchema },
    finalReportPath: { type: String },
    downloadUrl: { type: String },
    requiresApproval: { type: ApprovalSchema },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

export const TaskModel = mongoose.models.Task || mongoose.model<TaskDocument>('Task', TaskSchema);
