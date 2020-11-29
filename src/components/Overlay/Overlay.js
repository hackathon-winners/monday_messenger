import React from "react";
import Announcement from "monday-ui-react-core/dist/icons/Announcement";

import styles from "./Overlay.module.css";

export default function ({ mutedUserId, muted, toggleMuteHandle }) {
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.itemContainer}>
          <button
            className={styles.item}
            onClick={() => toggleMuteHandle(mutedUserId)}>
            <Announcement />
            <span className={styles.itemBody}>
              {muted ? "Unmute" : "Mute"} Conversation
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
