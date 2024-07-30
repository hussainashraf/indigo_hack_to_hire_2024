"use client"
import { useEffect, useState } from "react";
import {
  FaPlane,
  FaClock,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaDoorClosed,
  FaSync,
  FaBell,
} from "react-icons/fa";

export default function Home() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [notification, setNotification] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const fetchFlights = () => {
      fetch("https://indigo-hack-to-hire-2024.onrender.com/api/flights")
        .then((response) => response.json())
        .then((data) => {
          setFlights(data.flights);
          setLoading(false);
          setLastRefresh(new Date());
        })
        .catch((error) => {
          console.error("Error fetching flights:", error);
          setLoading(false);
        });
    };

    fetchFlights();
    const interval = setInterval(fetchFlights, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const airlineLogos = {
    "Air India":
      "https://logos-world.net/wp-content/uploads/2023/02/Air-India-Logo-500x281.png",
    IndiGo:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4OEGUiBc_oFJGM9cd9yW_NQhLyzaWsaJDHg&s",
    SpiceJet:
      "https://logowik.com/content/uploads/images/spicejet5998.logowik.com.webp",
    Vistara:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-kX-oRUmSA-nnGmUcMnQBVQRcTOqbQP4XWg&s",
    "AirAsia India":
      "https://e7.pngegg.com/pngimages/747/165/png-clipart-air-asia-logo-flight-airasia-logo-airline-ticket-asia-text-passenger.png",
    GoAir:
      "https://banner2.cleanpng.com/20180509/uwq/kisspng-goair-rajiv-gandhi-international-airport-airline-l-5af34ca6736239.9663336815258943104726.jpg",
    "British Airways":
      "https://e7.pngegg.com/pngimages/323/784/png-clipart-british-airways-logo-oneworld-united-kingdom-qantas-british-airways-logo.png",
    Emirates: "https://airhex.com/images/airline-logos/alt/emirates.png",
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "on time":
        return "text-green-600";
      case "delayed":
        return "text-red-600";
      case "cancelled":
        return "text-red-600";
      case "departed":
        return "text-blue-600";
      case "boarding":
        return "text-orange-500 animate-blink";
      case "gate closed":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "on time":
        return <FaCheck className="text-green-600" />;
      case "delayed":
        return <FaClock className="text-red-600" />;
      case "departed":
        return <FaPlane className="text-blue-600" />;
      case "cancelled":
        return <FaTimes className="text-red-600" />;
      case "boarding":
        return <FaPlane className="text-orange-500" />;
      case "gate closed":
        return <FaDoorClosed className="text-purple-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
          <span className="text-xl font-semibold text-gray-700">
            Loading flights...
          </span>
        </div>
      </div>
    );
  }
  const handleSubscribe = async () => {
    try {
      // First, fetch the flight details
      const flightResponse = await fetch(`https://indigo-hack-to-hire-2024.onrender.com/api/flights/${selectedFlight}`);
      if (!flightResponse.ok) {
        throw new Error("Failed to fetch flight details");
      }
      const flightData = await flightResponse.json();
  
      const response = await fetch("https://indigo-hack-to-hire-2024.onrender.com/api/subscribe-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightNumber: selectedFlight,
          flightName: flightData.airline, // Assuming the airline name is used as the flight name
          scheduledTime: flightData.scheduledTime,
          updatedTime: flightData.updatedTime,
          phoneNumber: phoneNumber
        }),
      });
      if (response.ok) {
        alert("Subscribed successfully!");
        setShowModal(false);
        setPhoneNumber("");
      } else {
        throw new Error("Failed to subscribe");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      alert("Failed to subscribe. Please try again.");
    }
  };

 return (
  <div className="min-h-screen  bg-gradient-to-b from-blue-100 to-white py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-9xl mx-auto">
      <h1 className="text-5xl font-extrabold mb-8 text-center text-blue-800 drop-shadow-md">
        Flight Status Board
      </h1>
      {notification && (
        <div className="mb-4 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
          <h4 className="font-bold">{notification.title}</h4>
          <p>{notification.body}</p>
        </div>
      )}
      <div className="bg-white overflow-hidden shadow-xl rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500 italic">
              Data refreshes every 60 seconds
            </span>
            <span className="text-sm text-gray-500 italic flex items-center">
              <FaSync className="mr-2 animate-spin" />
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Flight",
                    "Airline",
                    "Origin",
                    "Destination",
                    "Status",
                    "Gate",
                    "Scheduled Time",
                    "Updated Time",
                    "Subscribe",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 border border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flights.map((flight) => (
                  <tr
                    key={flight.flightNumber}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 border border-gray-300 whitespace-nowrap text-sm font-medium text-gray-900">
                      {flight.flightNumber}
                    </td>
                    <td className="px-6 py-4 border border-gray-300 whitespace-nowrap text-sm text-gray-500 flex items-center">
                      {airlineLogos[flight.airline] && (
                        <img
                          src={airlineLogos[flight.airline]}
                          alt={flight.airline}
                          className="w-16 h-8 mr-2"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 border border-gray-300 whitespace-nowrap text-sm text-gray-500">
                      {flight.origin}
                    </td>
                    <td className="px-6 py-4 border border-gray-300 whitespace-nowrap text-sm text-gray-500">
                      {flight.destination}
                    </td>
                    <td
                      className={`px-6 py-4 border border-gray-300 whitespace-nowrap text-sm font-medium ${getStatusColor(
                        flight.status
                      )} flex items-center`}
                    >
                      {getStatusIcon(flight.status)}
                      <span className="ml-2">{flight.status}</span>
                    </td>
                    <td className="px-6 py-4 border border-gray-300 whitespace-nowrap text-sm text-gray-500">
                      {flight.gate}
                    </td>
                    <td className="px-6 py-4 border border-gray-300 whitespace-nowrap text-sm text-gray-500">
                      {new Date(flight.scheduledTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 border border-gray-300 whitespace-nowrap text-sm text-gray-500">
                      {new Date(flight.updatedTime).toLocaleString()}
                    </td>
                    <td className="px-12 py-4 border border-gray-300 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => {
                          setSelectedFlight(flight.flightNumber);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaBell />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    {showModal && (
      <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Subscribe to SMS notifications</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Enter your phone number to receive updates for flight {selectedFlight}</p>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-2 p-2 w-full border rounded-md"
                  placeholder="Enter phone number with country code +91"
                />
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleSubscribe}
              >
                Subscribe
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    <style jsx global>{`
      @keyframes blink {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
        100% {
          opacity: 1;
        }
      }
      .animate-blink {
        animation: blink 1s linear infinite;
      }
    `}</style>
  </div>
);
}