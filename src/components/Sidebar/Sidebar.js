import React, { useState, useEffect } from "react";
import { Search, Counter, MenuButton } from "monday-ui-react-core";
import DropdownChevronDown from "monday-ui-react-core/dist/icons/DropdownChevronDown";

import styles from "./Sidebar.module.css";
import { dateformatter } from "../../helper/date";
import PersonThumb from "../PersonThumb/PersonThumb";
import Overlay from "../Overlay/Overlay";

export default function ({
  allUsers,
  activeChats,
  listedChats,
  setListedChats,
  getPersonById,
  activeUserId,
  setActiveUserId,
  makeUnread,
}) {
  const [search, setSearch] = useState();
  // you search for all users
  const handleSearch = (activeChats, searchTerm) => {
    setSearch(searchTerm);
    if (!searchTerm) {
      return setListedChats(activeChats);
    }

    const possibleChatPartner = allUsers
      .filter((user) => user.name.includes(searchTerm))
      .map((user) => ({ userId: user.id }));

    setListedChats(possibleChatPartner);
  };

  // when user clicks on user
  const selectChatHandler = (userObj, e) => {
    // check if menu was clicked
    const tag = e.target.tagName;
    const tagArray = ["svg", "path", "button"];
    if (tagArray.includes(tag)) {
      return;
    }

    if (userObj.type === "unread") {
      // we have to remove it from the unread list
      makeUnread(userObj.userId);
    }

    // we set is as active Chat (window changes)
    setActiveUserId(userObj.userId);
  };

  useEffect(() => {
    if (
      !search &&
      JSON.stringify(activeChats) !== JSON.stringify(listedChats)
    ) {
      setListedChats(activeChats);
    }
  }, [activeChats, listedChats, search, setListedChats]);

  // sort the Chats
  const listedChatsSorted = listedChats.sort(
    (a, b) => b.last_seen_at - a.last_seen_at
  );

  if (!allUsers) {
    return <div className={styles.sidebar}></div>;
  }

  return (
    <div className={styles.sidebar}>
      <Search
        iconName="icon-v2-search"
        onChange={(searchTerm) => handleSearch(activeChats, searchTerm)}
        placeholder="Enter Person to talk to"
      />
      <nav className={styles.userlist}>
        {listedChatsSorted && listedChatsSorted.length === 0 && (
          <div>No Chats yet</div>
        )}
        {listedChatsSorted &&
          listedChatsSorted.map((userObj) => {
            // get user
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
                onClick={(e) => selectChatHandler(userObj, e)}>
                <PersonThumb user={user} />
                <div className={styles.usernameContainer}>
                  <div className={styles.personName}>
                    {userObj.type === "unread" && <strong>{user.name}</strong>}
                    {userObj.type !== "unread" && <span>{user.name}</span>}
                    {userObj.last_seen_at && (
                      <>
                        <small>
                          {dateformatter(userObj.last_seen_at, "date")}
                        </small>
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
          })}
      </nav>
    </div>
  );
}
