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
} from "./helper/api";
import { useLocalStorage } from "./helper/hooks";

import "monday-ui-react-core/dist/main.css";

const monday = mondaySdk();

export default function () {
  const [context, setContext] = useState();
  // user specifics
  const [currentUser, setCurrentUser] = useState();
  const [allUsers, setAllUsers] = useState();

  // Chat listing in sidebar
  const [activeChats, setActiveChats] = useState([]);
  const [listedChats, setListedChats] = useState([]);

  // Chat Partner specifics
  const [activeUserId, setActiveUserId] = useLocalStorage("activeUserId", null);
  const [activeMessages, setActiveMessages] = useState();

  useEffect(() => {
    // get context
    monday.listen("context", (res) => {
      setContext(res.data);
    });
    // get userdata
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
              join_date
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
    // we don't need to hurry for this list
    const interval = setInterval(() => {
      console.log("Update Chat List");
      loadActiveChatsHandler(currentUser.id);
    }, 28000);

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

  const sendMessageHandler = (currentUserId, activeUserId, text, context) => {
    if (text) {
      sendMessage({
        monday,
        context,
        currentUserId,
        activeUserId,
        messageText: text,
        setActiveChats,
      }).then((resp) => setActiveMessages(resp));
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
          activeUserId={activeUserId}
          setActiveUserId={setActiveUserId}
          makeUnread={makeUnreadHandler}
        />
      </div>
      <div className={styles.main}>
        <MessageWindow
          activeUserId={activeUserId}
          messages={activeMessages}
          allUsers={allUsers}
        />
        {currentUser && (
          <ChatWindow
            context={context}
            sendMessage={sendMessageHandler}
            currentUserId={currentUser.id}
            activeUserId={activeUserId}
          />
        )}
      </div>
    </div>
  );
}
