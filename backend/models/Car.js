import mongoose from 'mongoose';
const carSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  location: String,
  pricePerDay: Number,
  pricePerKm: Number,
  withDriver: Boolean,
  unavailableDates: [String],
  details: String,
});
export default mongoose.model('Car', carSchema);