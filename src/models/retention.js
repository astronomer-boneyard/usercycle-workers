import mongoose from 'mongoose';

let schema = new mongoose.Schema({
  _id: String,
  viewId: String,
  cohortInterval: String,
  cohortDate: Date,
  cohortSize: Number,
  measurementDate: Date,
  measurementValue: Number
});

export default mongoose.model('Retention', schema, 'retention');
