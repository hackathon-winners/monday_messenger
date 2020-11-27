import React, { useState } from "react";

import styles from "./Message.module.css";
import { dateformatter } from "../../helper/date";

export default function ({ user, message, discussionChange = false }) {
  if (discussionChange) {
    return (
      <div className={styles.messageContainer}>
        <img
          src={user.photo_thumb_small}
          className={styles.person}
          alt={`Profile of ${"user.name"}`}
        />
        <div className={styles.messageBody}>
          <div className={styles.messageTitle}>
            <strong>{user.name}</strong>
            <small>{dateformatter(message.created_at)}</small>
          </div>
          <div className={styles.message}>{message.text}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.messageContainer}>
      <small className={styles.time}>{dateformatter(message.created_at)}</small>
      <div className={styles.messageBody}>
        <div className={styles.message}>{message.text}</div>
      </div>
    </div>
  );
}
