import React, { useState } from "react";
import styles from "./ResizeableTextarea.module.css";

export default function ({ text, setText }) {
  const [rows, setRows] = useState(1);

  const minRows = 1;
  const maxRows = 10;

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
      placeholder={"Enter your text here..."}
      className={styles.textarea}
      onChange={handleChange}
    />
  );
}
