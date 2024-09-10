import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import styles from '../styles/Home.module.css';  // Import CSS


export default function Home() {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    fetch("/api/socket");
    const socketIo = io();
    const storedMessages = JSON.parse(localStorage.getItem("chat")) || [];
    setChat(storedMessages);

    socketIo.on("receive-message", (msg) => {
      setChat((prevChat) => {
        const updatedChat = [...prevChat, msg];
        localStorage.setItem("chat", JSON.stringify(updatedChat));
        return updatedChat;
      });
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send-message", message);
      const newChat = [...chat, message];
      setChat(newChat);
      localStorage.setItem("chat", JSON.stringify(newChat));
      setMessage("");
    }
    console.info("send message ",message)
  };

  return (
    <div className={styles.container}>
    <h1 className={styles.header}>Chat</h1>
    <div className={styles.chatWindow}>
      {chat.map((msg, idx) => (
        <div
          key={idx}
          className={`${styles.message} ${msg.isSent ? styles.sent : styles.received}`}
        >
          {msg}
        </div>
      ))}
    </div>
    <div className={styles.inputContainer}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={styles.input}
      />
      <button onClick={sendMessage} className={styles.button}>Send</button>
    </div>
  </div>
  );
}
