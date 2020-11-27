import React, { useEffect, useRef } from "react";
import styles from "./MessageWindow.module.css";
import Message from "../Message/Message";

export default function ({ allUsers, messages, getPersonById }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const messagesSorted =
    messages && messages.sort((a, b) => a.created_at - b.created_at);

  return (
    <div className={styles.messageWindow}>
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
