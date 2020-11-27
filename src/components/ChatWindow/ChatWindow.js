import React, { useEffect, useState } from "react";
import ResizeableTextarea from "../ResizeableTexarea/ResizeableTextarea";
import styles from "./ChatWindow.module.css";
import { Button } from "monday-ui-react-core";
import Update from "monday-ui-react-core/dist/icons/Update";

export default function ({ currentUserId, activeUserId, sendMessage }) {
  const [text, setText] = useState("");

  useEffect(() => {
    document.addEventListener("keydown", keyHandler, false);
    return () => {
      document.removeEventListener("keydown", keyHandler, false);
    };
  }, []);

  const keyHandler = (event) => {
    if (event.key === "Enter") {
      clickHandler(event);
    }
  };
  const clickHandler = (e) => {
    e.preventDefault();
    sendMessage(currentUserId, activeUserId, text);
    setText("");
  };

  if (!activeUserId || !currentUserId) {
    return <div></div>;
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chat}>
        <ResizeableTextarea text={text} setText={setText} />
        <Button onClick={clickHandler}>
          Send
          <Update style={{ paddingLeft: "4px" }} />
        </Button>
      </div>
    </div>
  );
}
