import React from "react";

import { dateformatter } from "helper/date";

import styles from "./Message.module.css";

export default function ({
  user,
  message,
  discussionChange = false,
  children,
}) {
  if (discussionChange) {
    return (
      <>
        {children}
        <div className={styles.messageContainer}>
          <img
            src={user.photo_thumb_small}
            className={styles.person}
            alt={`Profile of ${"user.name"}`}
          />
          <div className={styles.messageBody}>
            <div className={styles.messageTitle}>
              <strong>{user.name}</strong>
              <small>
                {dateformatter(
                  message.created_at,
                  children ? "datetime" : "time"
                )}
              </small>
            </div>
            {!message.text.includes("giphy.com") && (
              <div className={styles.message}>{message.text}</div>
            )}
            {message.text.includes("giphy.com") && (
              <img src={message.text} alt={"Giphy Animated Preview"} />
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {children}
      <div className={styles.messageContainer}>
        <small className={styles.time}>
          {dateformatter(message.created_at, "time")}
        </small>
        <div className={styles.messageBody}>
          {!message.text.includes("giphy.com") && (
            <div className={styles.message}>{message.text}</div>
          )}
          {message.text.includes("giphy.com") && (
            <img src={message.text} alt={"Giphy Animated Preview"} />
          )}
        </div>
      </div>
    </>
  );
}
