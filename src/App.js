import React, { useState, useEffect } from "react";
import styles from "./App.module.css";
import mondaySdk from "monday-sdk-js";

import Sidebar from "./components/Sidebar/Sidebar";
import MessageWindow from "./components/MessageWindow/MessageWindow";
import ChatWindow from "./components/ChatWindow/ChatWindow";

import {
  loadMessages,
  sendMessage,
  loadActiveChats,
  removeFromList,
  getPersonById,
} from "./helper/api.js";

import "monday-ui-react-core/dist/main.css";

const monday = mondaySdk();

export default function () {
  // user specifics
  const [currentUser, setCurrentUser] = useState();
  const [allUsers, setAllUsers] = useState();

  // Chat listing in sidebar
  const [activeChats, setActiveChats] = useState([]);
  const [listedChats, setListedChats] = useState([]);

  // Chat Partner specifics
  const [activeUserId, setActiveUserId] = useState();
  const [activeMessages, setActiveMessages] = useState();

  // get all Users
  useEffect(() => {
    monday
      .api(
        `query {
            me { id name }
            users (kind: all) {
              id
              title
              name
              birthday
              is_guest
              location
              time_zone_identifier
              email
              mobile_phone
              phone
              photo_thumb_small
              photo_small
              url
            }
        }`,
        { variables: {} }
      )
      .then((res) => {
        // we set the loggedin user
        setCurrentUser(res.data.me);
        // and all users
        setAllUsers(res.data.users);
      });
  }, []);

  // get messages for active chatpartner
  useEffect(() => {
    if (currentUser && currentUser.id) {
      loadActiveChatsHandler(currentUser.id);
    }

    const interval = setInterval(() => {
      console.log("Update Chat List");
      loadActiveChatsHandler(currentUser.id);
    }, 8000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // get messages for active chatpartner
  useEffect(() => {
    if (activeUserId && currentUser && currentUser.id) {
      loadMessages(monday, currentUser.id, activeUserId).then((response) =>
        setActiveMessages(response)
      );
    }

    const interval = setInterval(() => {
      console.log("Update Message List");
      loadMessages(monday, currentUser.id, activeUserId).then((response) =>
        setActiveMessages(response)
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [activeUserId, currentUser]);

  // Message loader
  const loadActiveChatsHandler = async (userId) => {
    const chatsArray = await loadActiveChats(monday, userId);
    // put messages into state
    setActiveChats(chatsArray);
    setListedChats(chatsArray);
  };

  const sendMessageHandler = (currentUserId, activeUserId, text) => {
    if (text) {
      sendMessage(
        monday,
        currentUserId,
        activeUserId,
        text,
        setActiveChats
      ).then((resp) => setActiveMessages(resp));
    }
  };

  const makeUnreadHandler = (userId) => {
    removeFromList({
      monday,
      key: `${currentUser.id}_unread`,
      userId: userId,
    }).then((res) => {
      console.log(res);
      loadActiveChatsHandler(userId);
    });
  };

  return (
    <div className={styles.App}>
      <div className={styles.sidebar}>
        <Sidebar
          activeChats={activeChats}
          listedChats={listedChats}
          setListedChats={setListedChats}
          allUsers={allUsers}
          getPersonById={getPersonById}
          activeUserId={activeUserId}
          setActiveUserId={setActiveUserId}
          makeUnread={makeUnreadHandler}
        />
      </div>
      <div className={styles.main}>
        <MessageWindow
          messages={activeMessages}
          allUsers={allUsers}
          getPersonById={getPersonById}
        />
        {currentUser && (
          <ChatWindow
            sendMessage={sendMessageHandler}
            currentUserId={currentUser.id}
            activeUserId={activeUserId}
          />
        )}
      </div>
    </div>
  );
}
