import React from "react";
import { Search } from "monday-ui-react-core";
import styles from "./Sidebar.module.css";

export default function ({
  allUsers,
  activeChats,
  listedChats,
  setListedChats,
  getPersonById,
  activeUserId,
  setActiveUserId,
}) {
  const handleSearch = (activeChats, searchTerm) => {
    console.log(activeChats);
    if (!searchTerm) {
      return setListedChats(activeChats);
    }

    const possibleChatPartner = allUsers.users
      .filter((user) => user.name.includes(searchTerm))
      .map((user) => ({ userId: user.id }));

    setListedChats(possibleChatPartner);
  };

  return (
    <div className={styles.sidebar}>
      <Search
        iconName="icon-v2-search"
        onChange={(searchTerm) => handleSearch(activeChats, searchTerm)}
        placeholder="Enter Person to talk to"
      />
      <nav className={styles.userlist}>
        {listedChats && listedChats.length === 0 && <div>No Chats yet</div>}
        {listedChats &&
          listedChats.map((userObj) => {
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
                <div className={styles.personTitle}>
                  <span className={styles.usernameContainer}>{user.name}</span>
                </div>
                <div>
                  <div></div>
                  <div className="post_top_right_wrapper">
                    <div className="post_time_wrapper-square">
                      <a
                        href="/boards/879436905/pulses/879437057/posts/848238295"
                        className="router">
                        <time
                          className="humanize"
                          dateTime="1606428696001"
                          title="">
                          <i className="icon icon-dapulse-time"></i> just now
                        </time>
                      </a>
                    </div>
                    <div className="post_snoozer">
                      <div className="automations-one-off-snoozer-menu-component">
                        <div
                          className="snooze-menu-component"
                          id="snooze-menu-component">
                          <div className="ds-menu-button-container">
                            <button
                              type="button"
                              className="ds-menu-square-button snooze-menu-button monday-style-button monday-style-button--size-smd monday-style-button--kind-tertiary monday-style-button--color-primary"
                              name=""
                              id=""
                              aria-label=""
                              aria-busy="false">
                              <span
                                className="icon_component icon_component--no-focus-style fa icon icon-v2-surfce-notifications"
                                aria-label=""
                                tabIndex="-1"></span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="new-post-menu-component">
                      <div className="ds-menu-button-container">
                        <button
                          type="button"
                          className="ds-menu-square-button  monday-style-button monday-style-button--size-smd monday-style-button--kind-tertiary monday-style-button--color-primary"
                          name=""
                          id=""
                          aria-label=""
                          aria-busy="false">
                          <span
                            className="icon_component icon_component--no-focus-style fa fa fa-caret-down"
                            aria-label=""
                            tabIndex="-1"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </nav>
    </div>
  );
}
