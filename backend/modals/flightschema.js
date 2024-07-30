const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  flightNumber: String,
  airline: String,
  origin: String,
  destination: String,
  status: String,
  gate: String,
  scheduledTime: Date,
  updatedTime: Date,
});

const Flight = mongoose.model("Flight", flightSchema);

module.exports = Flight;