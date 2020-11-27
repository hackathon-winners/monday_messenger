import React from "react";
import styles from "./PersonThumb.module.css";
import guestIcon from "./v2_guest_filled.svg";

export default function ({ user }) {
  return (
    <div className={styles.container}>
      <img
        src={user.photo_thumb_small}
        className={styles.personBullet}
        alt={`Profile of ${user.name}`}
      />
      {user.is_guest && (
        <img
          src={guestIcon}
          className={styles.guestIcon}
          alt="Guest Indicator"
        />
      )}
    </div>
  );
}
