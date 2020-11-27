import React, { useState, useEffect } from "react";
import { Search } from "monday-ui-react-core";
import styles from "./Sidebar.module.css";
import { dateformatter } from "../../helper/date";

export default function ({
  allUsers,
  activeChats,
  listedChats,
  setListedChats,
  getPersonById,
  activeUserId,
  setActiveUserId,
}) {
  const [search, setSearch] = useState();
  // you search for all users
  const handleSearch = (activeChats, searchTerm) => {
    setSearch(searchTerm);
    if (!searchTerm) {
      return setListedChats(activeChats);
    }

    const possibleChatPartner = allUsers.users
      .filter((user) => user.name.includes(searchTerm))
      .map((user) => ({ userId: user.id }));

    setListedChats(possibleChatPartner);
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
            const user = getPersonById(allUsers.users, userObj.userId);

            if (!user) {
              return <></>;
            }
            return (
              <div
                key={user.id}
                className={`${styles.person} ${
                  activeUserId === user.id && styles.active
                }`}
                onClick={(e) => setActiveUserId(user.id)}>
                <img
                  src={user.photo_thumb_small}
                  className={styles.personBullet}
                  alt={`Profile of ${user.name}`}
                />
                <div className={styles.usernameContainer}>
                  <div className={styles.personName}>
                    <span>{user.name}</span>
                    {userObj.last_seen_at && (
                      <small>
                        {dateformatter(userObj.last_seen_at, "date")}
                      </small>
                    )}
                  </div>
                  <div className={styles.lastMessage}>
                    {userObj.last_message}
                  </div>
                </div>
              </div>
            );
          })}
      </nav>
    </div>
  );
}
