import mongoose from 'mongoose';

let schema = new mongoose.Schema({
  _id: String,
  name: String,
  keen: {},
  isUsercycle: Boolean
});

export default mongoose.model('Project', schema, 'projects');
