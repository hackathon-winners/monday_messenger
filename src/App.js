import React, { useState, useEffect } from "react";
import styles from "./App.module.css";
import mondaySdk from "monday-sdk-js";

import Sidebar from "./components/Sidebar/Sidebar";
import MessageWindow from "./components/MessageWindow/MessageWindow";
import ChatWindow from "./components/ChatWindow/ChatWindow";

import { loadMessages, sendMessage, loadActiveChats } from "./helper/api.js";

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

  // get logged in user
  useEffect(() => {
    monday.api(`query { me { id name } }`).then((res) => {
      setCurrentUser(res.data);
    });
  }, []);

  // get all Users
  useEffect(() => {
    monday
      .api(
        `query {
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
        setAllUsers(res.data);
      });
  }, [currentUser]);

  // get messages for active chatpartner
  useEffect(() => {
    if (currentUser && currentUser.me.id) {
      loadActiveChatsHandler(currentUser.me.id);
    }
  }, [currentUser]);

  // get messages for active chatpartner
  useEffect(() => {
    if (activeUserId && currentUser && currentUser.me.id) {
      loadMessages(monday, currentUser.me.id, activeUserId).then((response) =>
        setActiveMessages(response)
      );
    }
  }, [activeUserId, currentUser]);

  const getPersonById = (users, userId) => {
    return users.find((user) => user.id === userId);
  };

  // Message loader
  const loadActiveChatsHandler = async (userId) => {
    const chatsArray = await loadActiveChats(monday, userId);
    // put messages into state
    setActiveChats(chatsArray);
    setListedChats(chatsArray);
  };

  const sendMessageHandler = (currentUserId, activeUserId, text) => {
    sendMessage(
      monday,
      currentUserId,
      activeUserId,
      text,
      setActiveChats
    ).then((resp) => setActiveMessages(resp));
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
            currentUserId={currentUser.me.id}
            activeUserId={activeUserId}
          />
        )}
      </div>
    </div>
  );
}
