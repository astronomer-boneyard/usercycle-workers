import mongoose from 'mongoose';

let schema = new mongoose.Schema({
  _id: String,
  createdAt: Date,
  emails: [],
  profile: {}
});


schema.statics.findDemoEmailsForIntervals = function(intervals) {
  return this.find( { 'profile.demoEmail': { $in: intervals } } ).exec();
}


export default mongoose.model('User', schema, 'users');
