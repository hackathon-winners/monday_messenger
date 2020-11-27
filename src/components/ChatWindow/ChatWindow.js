import React, { useEffect, useState } from "react";
import ResizeableTextarea from "../ResizeableTexarea/ResizeableTextarea";
import styles from "./ChatWindow.module.css";
import { Button } from "monday-ui-react-core";
import Update from "monday-ui-react-core/dist/icons/Update";

export default function ({ monday, currentUserId, activeUserId, sendMessage }) {
  const [text, setText] = useState("");

  // user can send on click
  const clickHandler = (e) => {
    e.preventDefault();
    sendMessage(currentUserId, activeUserId, text);
    setText("");
  };

  // she can also send the message when Enter is pressed
  useEffect(() => {
    const keyHandler = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage(currentUserId, activeUserId, text);
        setText("");
      }
    };
    document.addEventListener("keydown", keyHandler, false);
    return () => {
      document.removeEventListener("keydown", keyHandler, false);
    };
  }, [currentUserId, activeUserId, text, sendMessage]);

  // not ready yet
  if (!activeUserId || !currentUserId) {
    return <div></div>;
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chat}>
        <ResizeableTextarea
          text={text}
          setText={setText}
          activeUserId={activeUserId}
        />
        <Button onClick={clickHandler}>
          Send
          <Update style={{ paddingLeft: "4px" }} />
        </Button>
      </div>
    </div>
  );
}
