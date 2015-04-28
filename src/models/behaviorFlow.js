import mongoose from 'mongoose';

let schema = new mongoose.Schema({
  _id: String,
  viewId: String,
  date: Date,
  tree: {}
});

export default mongoose.model('BehaviorFlow', schema, 'behaviorFlow');
