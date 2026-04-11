import mongoose, { Schema } from 'mongoose';

// Patient Schema
export const PatientSchema = new Schema({
  patientId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  mrn: { type: String, required: true },
  admissionReason: { type: String },
  currentProtocol: { type: String },
});

export const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);

// Vitals Schema
export const VitalSchema = new Schema({
  patientId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  heartRate: { type: Number, required: true },
  nibpSystolic: { type: Number, required: true },
  nibpDiastolic: { type: Number, required: true },
  spo2: { type: Number, required: true },
  painScore: { type: Number },
});

export const Vital = mongoose.models.Vital || mongoose.model('Vital', VitalSchema);

// Clinical Note Schema
export const ClinicalNoteSchema = new Schema({
  patientId: { type: String, required: true, index: true },
  authorId: { type: String, required: true },
  authorRole: { type: String }, // e.g., "MD", "RN"
  timestamp: { type: Date, default: Date.now },
  content: { type: String, required: true },
});

export const ClinicalNote = mongoose.models.ClinicalNote || mongoose.model('ClinicalNote', ClinicalNoteSchema);

// Order Schema
export const OrderSchema = new Schema({
  patientId: { type: String, required: true, index: true },
  type: { type: String, required: true }, // "lab", "medication", etc.
  name: { type: String, required: true },
  status: { type: String, enum: ['pending', 'active', 'completed', 'discontinued'], default: 'pending' },
  orderedAt: { type: Date, default: Date.now },
  priority: { type: String, enum: ['routine', 'stat'], default: 'routine' },
});

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// Intelligence Feed Schema (Tasks/Gaps)
export const IntelligenceFeedSchema = new Schema({
  patientId: { type: String, required: true, index: true },
  type: { type: String, enum: ['gap', 'trend', 'task'], required: true },
  severity: { type: String, enum: ['high', 'medium', 'low'], required: true },
  message: { type: String, required: true },
  clinical_insight: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'overdue'], default: 'pending' },
  timestamp: { type: Date, default: Date.now },
});

export const IntelligenceFeed = mongoose.models.IntelligenceFeed || mongoose.model('IntelligenceFeed', IntelligenceFeedSchema);
