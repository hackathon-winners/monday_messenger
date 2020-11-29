import React, { useEffect, useState } from "react";

import { Button } from "monday-ui-react-core";
import Update from "monday-ui-react-core/dist/icons/Update";
import Picker from "emoji-picker-react";

import ResizeableTextarea from "components/ResizeableTexarea/ResizeableTextarea";
import GiphySearch from "components/GiphySearch/GiphySearch";
import { useLocalStorage } from "helper/hooks";

import styles from "./ChatWindow.module.css";

export default function ({ currentUserId, activeUserId, sendMessage, itemId }) {
  const [text, setText] = useLocalStorage(activeUserId, "");
  const [showGiphy, setShowGiphy] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  // user can send on click
  const clickHandler = (e) => {
    e.preventDefault();
    sendMessage(currentUserId, activeUserId, text, itemId);
    setText("");
    setShowEmoji(false);
  };

  // user can send on click
  const giphyHandler = (gif) => {
    sendMessage(currentUserId, activeUserId, gif.images.downsized.url, itemId);
    setShowGiphy(false);
  };

  const onEmojiClick = (event, emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
    setShowEmoji(false);
  };

  // Store User messages drafts in localstorage
  useEffect(() => {
    const item = window.localStorage.getItem(activeUserId);
    if (item) {
      const parsed = JSON.parse(item);
      setText(parsed);
    }
  }, [activeUserId, setText]);

  // she can also send the message when Enter is pressed
  useEffect(() => {
    const keyHandler = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage(currentUserId, activeUserId, text, itemId);
        setText("");
        setShowEmoji(false);
      }
    };
    document.addEventListener("keydown", keyHandler, false);
    return () => {
      document.removeEventListener("keydown", keyHandler, false);
    };
  }, [currentUserId, activeUserId, text, sendMessage, setText, itemId]);

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
            {!showGiphy && (
              <Button
                size={Button.sizes.SMALL}
                kind={Button.kinds.SECONDARY}
                onClick={(e) => setShowEmoji((prev) => !prev)}>
                Emoji
              </Button>
            )}
            <Button
              size={Button.sizes.SMALL}
              kind={Button.kinds.SECONDARY}
              onClick={() => setShowGiphy((prev) => !prev)}>
              {showGiphy ? "back" : "Giphy"}
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
