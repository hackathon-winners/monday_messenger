import React, { useEffect, useState } from "react";
import ResizeableTextarea from "../ResizeableTexarea/ResizeableTextarea";
import styles from "./ChatWindow.module.css";
import { Button, MenuButton } from "monday-ui-react-core";
import Update from "monday-ui-react-core/dist/icons/Update";
import Image from "monday-ui-react-core/dist/icons/Image";
import GiphySearch from "../GiphySearch/GiphySearch";

import Picker from "emoji-picker-react";

export default function ({
  currentUserId,
  activeUserId,
  sendMessage,
  context,
}) {
  const [text, setText] = useState("");
  const [showGiphy, setShowGiphy] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  // user can send on click
  const clickHandler = (e) => {
    e.preventDefault();
    sendMessage(currentUserId, activeUserId, text, context);
    setText("");
  };

  // user can send on click
  const giphyHandler = (gif) => {
    console.log(gif);
    sendMessage(currentUserId, activeUserId, gif.images.downsized.url, context);
    setText("");
  };

  const onEmojiClick = (event, emojiObject) => {
    console.log(emojiObject);
    setText((prev) => prev + emojiObject.emoji);
  };

  // she can also send the message when Enter is pressed
  useEffect(() => {
    const keyHandler = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage(currentUserId, activeUserId, text, context);
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
        {!showGiphy && (
          <div className={styles.textContainer}>
            <ResizeableTextarea
              text={text}
              setText={setText}
              activeUserId={activeUserId}
            />
          </div>
        )}
        <div className={styles.actionContainer}>
          <div>
            {showEmoji && (
              <div className={styles.emojiContainer}>
                <Picker onEmojiClick={onEmojiClick} />
              </div>
            )}
            <Button
              size={Button.sizes.SMALL}
              kind={Button.kinds.SECONDARY}
              onClick={(e) => setShowEmoji((prev) => !prev)}>
              Emojicon
            </Button>
            <Button
              size={Button.sizes.SMALL}
              kind={Button.kinds.SECONDARY}
              onClick={() => setShowGiphy((prev) => !prev)}>
              Giphy
            </Button>
          </div>
          {!showGiphy && (
            <Button
              onClick={clickHandler}
              size={Button.sizes.SMALL}
              kind={Button.kinds.SECONDARY}>
              Send
              <Update style={{ paddingLeft: "4px" }} />
            </Button>
          )}
        </div>
        <div className={styles.extraContainer}>
          {showGiphy && <GiphySearch onSelect={giphyHandler} />}
        </div>
      </div>
    </div>
  );
}
