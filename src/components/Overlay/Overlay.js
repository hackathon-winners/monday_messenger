import React from "react";
import styles from "./Overlay.module.css";

import Announcement from "monday-ui-react-core/dist/icons/Announcement";

export default function () {
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.itemContainer}>
          <button className={styles.item}>
            <Announcement />
            <span className={styles.itemBody}>Mute Conversation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
