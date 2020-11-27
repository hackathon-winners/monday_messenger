import React from "react";
import styles from "./MessageWindow.module.css";
import Message from "../Message/Message";

export default function ({ allUsers, messages, getPersonById }) {
  return (
    <div className={styles.messageWindow}>
      {messages &&
        messages.map((msg, index) => (
          <Message
            key={msg.id}
            user={getPersonById(allUsers.users, msg.from)}
            message={msg}
            discussionChange={
              index === 0 || (index && msg.from !== messages[index - 1].from)
            }
          />
        ))}
    </div>
  );
}
