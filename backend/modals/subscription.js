const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    flightNumber: {
      type: String,
      required: true,
    },
    flightName: {
      type: String,
      required: true,
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    updatedTime: {
      type: Date,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  });
  
  const Subscription = mongoose.model('Subscription', subscriptionSchema)

module.exports = mongoose.model('Subscription', subscriptionSchema);