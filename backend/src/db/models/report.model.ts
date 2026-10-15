import mongoose, { Schema, Document } from 'mongoose';

export interface ReportDocument extends Document {
  fileName: string;
  content: string;
  sizeBytes: number;
  filePath?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<ReportDocument>(
  {
    fileName: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    filePath: { type: String },
  },
  {
    timestamps: true,
  }
);

export const ReportModel = mongoose.models.Report || mongoose.model<ReportDocument>('Report', ReportSchema);
