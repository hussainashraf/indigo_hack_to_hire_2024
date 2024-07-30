// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectToDB = require("./config/db");
const Flight = require("./modals/flightschema");
const Subscription = require("./modals/subscription"); // You'll need to create this schema
const insertSampleData = require("./insertSampleData");
const twilio = require('twilio');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectToDB();
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Function to check if the database is empty or has few flights
async function needsRepopulation() {
  const count = await Flight.countDocuments();
  return count < 5; // Repopulate if less than 5 flights
}

// Function to repopulate the database
async function repopulateDatabase() {
  console.log("Repopulating database with sample data...");
  await insertSampleData();
}

// Function to send SMS
async function sendSMS(phoneNumber, message) {
  try {
    const response = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log(`Successfully sent SMS to ${phoneNumber}: ${response.sid}`);
  } catch (error) {
    console.error(`Error sending SMS to ${phoneNumber}: ${error}`);
  }
}

// API Routes
app.get("/api/flights", async (req, res) => {
  try {
    const flights = await Flight.find();
    res.json({ flights });
  } catch (error) {
    console.error("Error fetching flights:", error);
    res.status(500).json({ error: "An error occurred while fetching flights" });
  }
});

// New route to register a device for notifications
app.get("/api/flights/:flightNumber", async (req, res) => {
  try {
    const flight = await Flight.findOne({ flightNumber: req.params.flightNumber });
    if (!flight) {
      return res.status(404).json({ error: "Flight not found" });
    }
    res.json(flight);
  } catch (error) {
    console.error("Error fetching flight:", error);
    res.status(500).json({ error: "An error occurred while fetching the flight" });
  }
});

app.post("/api/subscribe-sms", async (req, res) => {
  const { flightNumber, flightName, scheduledTime, updatedTime, phoneNumber } = req.body;
  try {
    await Subscription.create({ 
      flightNumber, 
      flightName, 
      scheduledTime, 
      updatedTime, 
      phoneNumber 
    });

    // Send initial SMS
    await sendSMS(
      phoneNumber,
      `You've subscribed to SMS updates for flight ${flightNumber} (${flightName}). Scheduled: ${new Date(scheduledTime).toLocaleString()}`
    );

    res.status(200).json({ message: "Subscribed successfully to SMS notifications" });
  } catch (error) {
    console.error("Error subscribing to SMS:", error);
    res.status(500).json({ error: "An error occurred while subscribing" });
  }
});

// Mock data update (simulating airport system integration)
async function updateFlightStatus() {
  setInterval(async () => {
    try {
      // Check if database needs repopulation
      if (await needsRepopulation()) {
        await repopulateDatabase();
      }

      const flights = await Flight.find();

      for (let flight of flights) {
        const oldStatus = flight.status;

        // Simulate random status changes
        const statuses = [
          "On Time",
          "Delayed",
          "Boarding",
          "Gate Closed",
          "Departed",
          "Cancelled",
        ];
        flight.status = statuses[Math.floor(Math.random() * statuses.length)];
        flight.updatedTime = new Date();

        // If the flight is cancelled, remove it from the database
        if (flight.status === "Cancelled") {
          await Flight.deleteOne({ _id: flight._id });
        } else {
          await flight.save();
        }

        // If status has changed, send notifications
        if (oldStatus !== flight.status) {
          const subscriptions = await Subscription.find({
            flightNumber: flight.flightNumber,
          });

          for (const subscription of subscriptions) {
            await sendSMS(
              subscription.phoneNumber,
              `Flight ${subscription.flightNumber} (${subscription.flightName}) Update: 
              Status changed from ${oldStatus} to ${flight.status}. 
              Scheduled: ${new Date(subscription.scheduledTime).toLocaleString()}, 
              Last Updated: ${new Date(flight.updatedTime).toLocaleString()}`
            );
          }
          await Subscription.updateMany(
            { flightNumber: flight.flightNumber },
            { $set: { updatedTime: flight.updatedTime } }
          );
        }
      }

      // Add new flights (example data, should be replaced with actual data source)
      const newFlights = [
        {
          flightNumber: "EK513",
          airline: "Emirates",
          origin: "Canada",
          destination: "Delhi",
          status: "On Time",
          gate: "C4",
          scheduledTime: new Date(Date.now() + 3600000), // 1 hour from now
          updatedTime: new Date(),
        },
        {
          flightNumber: "BA303",
          airline: "British Airways",
          origin: "London",
          destination: "New York",
          status: "Boarding",
          gate: "B3",
          scheduledTime: new Date(Date.now() + 7200000), // 2 hours from now
          updatedTime: new Date(),
        },
      ];

      for (let newFlight of newFlights) {
        const flightExists = await Flight.findOne({
          flightNumber: newFlight.flightNumber,
        });
        if (!flightExists) {
          await Flight.create(newFlight);
        }
      }

      console.log("Flight statuses updated and new flights added");
    } catch (error) {
      console.error("Error updating flight statuses:", error);
    }
  }, 60000); // Update every 1 minute
}


// Initial database population
(async () => {
  if (await needsRepopulation()) {
    console.log("Database needs initial population. Inserting sample data...");
    await repopulateDatabase();
  } else {
    console.log("Database already populated. Skipping sample data insertion.");
  }
})();

updateFlightStatus();

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});