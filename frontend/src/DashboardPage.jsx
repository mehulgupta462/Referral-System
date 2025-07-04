import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [earnings, setEarnings] = useState({ direct: 0, indirect: 0 });
  const [socket, setSocket] = useState(null);
  const [notification, setNotification] = useState(null);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      navigate("/login");
    } else {
      setUser(userData);
      setEarnings({
        direct: userData.DirectEarnings,
        indirect: userData.IndirectEarnings,
      });

      const newSocket = io(`${apiUrl}`);
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [navigate]);

  useEffect(() => {
    if (!socket || !user) return;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("joinRoom", user._id);
    });

    socket.on("earningsUpdate", (data) => {
      console.log("Earnings update received:", data);
      setEarnings((prev) => ({
        direct: data.totalDirectEarnings ?? prev.direct,
        indirect: data.totalIndirectEarnings ?? prev.indirect,
      }));

      setNotification(data.message || "You have new earnings!");
      const logMessage = `${new Date().toLocaleTimeString()} - ${data.message}`;
      setLogs((prevLogs) => [logMessage, ...prevLogs]);
    });

    return () => {
      socket.off("connect");
      socket.off("earningsUpdate");
    };
  }, [socket, user]);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [notification]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (socket) socket.disconnect();
    navigate("/login");
  };

  const handleBuy = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/earning`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          amount: Number(purchaseAmount),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setPurchaseAmount("");
      } else {
        alert(data.message || "Purchase failed");
      }
    } catch (error) {
      alert("Error making purchase");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-blue-200 p-8">
      {/* Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8 space-y-8 border border-gray-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-semibold text-indigo-800">
            Welcome, {user.name}
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-5 py-3 rounded-full shadow-md hover:bg-red-700 transition-all ease-in-out duration-300 transform hover:scale-105"
          >
            Logout
          </button>
        </div>

        {/* User Info */}
        <div className="text-gray-700">
          <h3 className="text-2xl font-medium mb-4">User Info</h3>
          <p className="text-lg">
            Email: <span className="text-blue-600">{user.email}</span>
          </p>
          <p className="text-lg">
            Referral Code:{" "}
            <span className="text-blue-600">{user.referralCode}</span>
          </p>
        </div>

        {/* Earnings Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
          <h3 className="text-2xl font-medium text-gray-800 mb-4">
            Total Earnings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all ease-in-out duration-300 transform hover:scale-105">
              <p className="text-lg text-gray-600">Direct Earnings</p>
              <p className="text-3xl font-semibold text-green-600">
                ₹{earnings.direct}
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all ease-in-out duration-300 transform hover:scale-105">
              <p className="text-lg text-gray-600">Indirect Earnings</p>
              <p className="text-3xl font-semibold text-blue-600">
                ₹{earnings.indirect}
              </p>
            </div>
          </div>
        </div>

        {/* Purchase Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-medium text-gray-800 mb-4">
            Make a Purchase
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="number"
              placeholder="Enter amount"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
              className="w-full sm:w-2/3 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ease-in-out duration-300"
            />
            <button
              onClick={handleBuy}
              className="w-full sm:w-1/3 bg-blue-600 text-white py-4 rounded-md shadow-md hover:bg-blue-700 transition-all ease-in-out duration-300 transform hover:scale-105"
            >
              Buy
            </button>
          </div>
        </div>

        {/* Earnings Log */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-medium text-gray-800 mb-4">
            Earnings Log
          </h3>
          <ul className="space-y-4 text-sm text-gray-700">
            {logs.map((log, idx) => (
              <li
                key={idx}
                className="bg-white p-4 rounded-md shadow-sm hover:shadow-lg transition-all ease-in-out duration-300 transform hover:scale-105"
              >
                {log}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Notification Popup */}
      {notification && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl z-50">
          {notification}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
