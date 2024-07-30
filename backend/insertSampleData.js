
const connectToDB = require("./config/db");
const Flight = require("./modals/flightschema")
// const mongoose = require('mongoose')

// Connect to MongoDB

// Indian Airlines
const indianAirlines = [
  { code: '6E', name: 'IndiGo' },
  { code: 'AI', name: 'Air India' },
  { code: 'SG', name: 'SpiceJet' },
  { code: 'UK', name: 'Vistara' },
  { code: 'G8', name: 'GoAir' },
  { code: 'I5', name: 'AirAsia India' },
];

// Indian Cities and Airports
const indianCities = [
  { city: 'Delhi', code: 'DEL' },
  { city: 'Mumbai', code: 'BOM' },
  { city: 'Bangalore', code: 'BLR' },
  { city: 'Hyderabad', code: 'HYD' },
  { city: 'Chennai', code: 'MAA' },
  { city: 'Kolkata', code: 'CCU' },
  { city: 'Ahmedabad', code: 'AMD' },
  { city: 'Pune', code: 'PNQ' },
  { city: 'Jaipur', code: 'JAI' },
  { city: 'Lucknow', code: 'LKO' },
];

// Function to generate a random flight number
function generateFlightNumber() {
  const airline = indianAirlines[Math.floor(Math.random() * indianAirlines.length)];
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${airline.code}${number}`;
}

// Function to generate a random gate
function generateGate() {
  const number = Math.floor(Math.random() * 20) + 1;
  return `${number}`;
}

// Function to generate sample flight data
function generateFlightData(count) {
  const flights = [];
  const statuses = ['On Time', 'Delayed', 'Boarding', 'Departed', 'Cancelled'];

  for (let i = 0; i < count; i++) {
    const originIndex = Math.floor(Math.random() * indianCities.length);
    let destinationIndex = Math.floor(Math.random() * indianCities.length);
    while (destinationIndex === originIndex) {
      destinationIndex = Math.floor(Math.random() * indianCities.length);
    }

    const airline = indianAirlines[Math.floor(Math.random() * indianAirlines.length)];

    const flight = new Flight({
      flightNumber: generateFlightNumber(),
      airline: airline.name,
      origin: `${indianCities[originIndex].city} (${indianCities[originIndex].code})`,
      destination: `${indianCities[destinationIndex].city} (${indianCities[destinationIndex].code})`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      gate: generateGate(),
      scheduledTime: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000), // Random time in the next 24 hours
      updatedTime: new Date()
    });

    flights.push(flight);
  }

  return flights;
}

// Insert sample data into the database
async function insertSampleData() {
  try {
    // Clear existing data

    await connectToDB()
    await Flight.deleteMany({});

    // Generate and insert new data
    const sampleFlights = generateFlightData(50); // Generate 50 sample flights
    await Flight.insertMany(sampleFlights);

    console.log('Sample Indian flight data inserted successfully');
    // mongoose.connection.close();
  } catch (error) {
    console.error('Error inserting sample data:', error);
    // mongoose.connection.close();
  }
}

module.exports = insertSampleData;
