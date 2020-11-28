import React from "react";

import { Counter, MenuButton } from "monday-ui-react-core";
import DropdownChevronDown from "monday-ui-react-core/dist/icons/DropdownChevronDown";

import { dateformatter } from "../../helper/date";
import PersonThumb from "../PersonThumb/PersonThumb";
import Overlay from "../Overlay/Overlay";
import { getPersonById } from "../../helper/api.js";

import styles from "./Person.module.css";

export default function ({
  allUsers,
  userObj,
  activeUserId,
  selectChatHandler,
}) {
  const user = getPersonById(allUsers, userObj.userId);

  if (!user) {
    return <></>;
  }
  return (
    <div
      key={user.id}
      className={`${styles.person} ${
        activeUserId === user.id && styles.active
      }`}
      onClick={(e) => selectChatHandler(userObj, e)}
      tabIndex={1}>
      <PersonThumb user={user} />
      <div className={styles.usernameContainer}>
        <div className={styles.personName}>
          {userObj.type === "unread" && <strong>{user.name}</strong>}
          {userObj.type !== "unread" && <span>{user.name}</span>}
          {userObj.last_seen_at && (
            <>
              <small>{dateformatter(userObj.last_seen_at, "date")}</small>
            </>
          )}
        </div>
        <div className={styles.lastMessage}>
          {userObj.type === "unread" && (
            <>
              <strong>{userObj.last_message}</strong>
              <div>
                <Counter
                  color={Counter.colors.NEGATIVE}
                  count={1}
                  size={Counter.sizes.SMALL}
                  maxDigits={1}
                />
                <MenuButton
                  component={DropdownChevronDown}
                  ariaLabel={"chevron menu icon menu button"}>
                  <Overlay />
                </MenuButton>
              </div>
            </>
          )}
          {userObj.type !== "unread" && (
            <>
              <span>{userObj.last_message}</span>
              <MenuButton
                componentClassName={styles.menuButton}
                component={DropdownChevronDown}
                ariaLabel={"chevron menu icon menu button"}>
                <Overlay />
              </MenuButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
