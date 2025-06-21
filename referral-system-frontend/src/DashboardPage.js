// DashboardPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [earnings, setEarnings] = useState({ direct: 0, indirect: 0 });
  const [socket, setSocket] = useState(null);
  const [notification, setNotification] = useState(null);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [logs, setLogs] = useState([]); // ← log of earnings updates
  const navigate = useNavigate();

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

      const newSocket = io("http://localhost:5000");
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

      // Update earnings state
      setEarnings((prev) => ({
        direct: data.totalDirectEarnings ?? prev.direct,
        indirect: data.totalIndirectEarnings ?? prev.indirect,
      }));

      // Show popup
      setNotification(data.message || "You have new earnings!");

      // Append log entry
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
      const res = await fetch("http://localhost:5000/api/earning", {
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
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={handleLogout}>Logout</button>

      <h3>User Info</h3>
      <p>Email: {user.email}</p>
      <p>Referral Code: {user.referralCode}</p>

      <h3>Total Earnings</h3>
      <p>Direct Earnings: ₹{earnings.direct}</p>
      <p>Indirect Earnings: ₹{earnings.indirect}</p>

      {/* ===== Buy Section ===== */}
      <div style={{ marginTop: "20px" }}>
        <h3>Make a Purchase</h3>
        <input
          type="number"
          placeholder="Enter amount"
          value={purchaseAmount}
          onChange={(e) => setPurchaseAmount(e.target.value)}
        />
        <button onClick={handleBuy}>Buy</button>
      </div>

      {/* ===== Logs Section ===== */}
      <div style={{ marginTop: "30px" }}>
        <h3>Earnings Log</h3>
        <ul>
          {logs.map((log, idx) => (
            <li key={idx}>{log}</li>
          ))}
        </ul>
      </div>

      {/* ===== Notification Popup ===== */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            backgroundColor: "#4caf50",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
        >
          {notification}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
