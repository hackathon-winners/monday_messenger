import React, { useEffect, useRef } from "react";
import styles from "./MessageWindow.module.css";
import Message from "../Message/Message";
import rocks from "./rocks.png";
import { getPersonById } from "../../helper/api.js";

export default function ({ allUsers, activeUserId, messages }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const messagesSorted =
    messages && messages.sort((a, b) => a.created_at - b.created_at);

  return (
    <div className={styles.messageWindow}>
      {(!messages || messages.length === 0) && (
        <div className={styles.empty}>
          <img src={rocks} />
          <h2>Let's have a Chat!</h2>
          <p>Sit back and enjoy this place for joyful conversations.</p>
        </div>
      )}
      {messagesSorted &&
        messagesSorted.map((msg, index) => (
          <Message
            key={msg.id}
            user={getPersonById(allUsers, msg.from)}
            message={msg}
            discussionChange={
              index === 0 ||
              (index && msg.from !== messagesSorted[index - 1].from)
            }
          />
        ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
