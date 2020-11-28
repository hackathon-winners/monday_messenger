import React, { useState, useRef, useEffect } from "react";
import styles from "./ResizeableTextarea.module.css";

export default function ({ text, setText, activeUserId }) {
  const [rows, setRows] = useState(1);
  const inputRef = useRef();

  const minRows = 1;
  const maxRows = 10;

  // we focus when chat is changed on the input field
  useEffect(() => {
    inputRef.current.focus();
  }, [activeUserId]);

  const handleChange = (event) => {
    const textareaLineHeight = 24;

    const previousRows = event.target.rows;
    event.target.rows = minRows; // reset number of rows in textarea

    const currentRows = ~~(event.target.scrollHeight / textareaLineHeight);

    if (currentRows === previousRows) {
      event.target.rows = currentRows;
    }

    if (currentRows >= maxRows) {
      event.target.rows = maxRows;
      event.target.scrollTop = event.target.scrollHeight;
    }
    setRows(currentRows < maxRows ? currentRows : maxRows);
    setText(event.target.value);
  };

  return (
    <textarea
      rows={rows}
      value={text}
      placeholder={"Enter your message..."}
      className={styles.textarea}
      onChange={handleChange}
      ref={inputRef}
    />
  );
}
