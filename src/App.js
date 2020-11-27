import React, { useState, useEffect } from "react";
import styles from "./App.module.css";
import mondaySdk from "monday-sdk-js";

import Sidebar from "./components/Sidebar/Sidebar";
import MessageWindow from "./components/MessageWindow/MessageWindow";
import ChatWindow from "./components/ChatWindow/ChatWindow";

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
        console.log(res);
        setAllUsers(res.data);
      });
  }, [currentUser]);

  // get messages for active chatpartner
  useEffect(() => {
    if (currentUser && currentUser.me.id) {
      loadActiveChats(currentUser.me.id);
    }
  }, [currentUser]);

  // get messages for active chatpartner
  useEffect(() => {
    if (activeUserId && currentUser && currentUser.me.id) {
      loadMessages(currentUser.me.id, activeUserId);
    }
  }, [activeUserId, currentUser]);

  const getPersonById = (users, userId) => {
    return users.find((user) => user.id === userId);
  };

  // Message loader
  const loadActiveChats = async (userId) => {
    const chats = await monday.storage.instance.getItem(userId);

    const chatsArray = JSON.parse(chats.data.value);

    if (!chatsArray) {
      return;
    }

    // put messages into state
    setActiveChats(chatsArray);
    setListedChats(chatsArray);
  };

  // Message loader
  const loadMessages = async (from, to) => {
    // we load parallel for faster loading
    const promises = [];

    promises.push(monday.storage.instance.getItem(`${from}_${to}`));
    if (from !== to) {
      promises.push(monday.storage.instance.getItem(`${to}_${from}`));
    }

    // we wait for both promises to get a full message list
    const responses = await Promise.all(promises);

    // we reduce array to single array
    const finalArray = responses.reduce((accumulator, currentValue) => {
      const parsedValue = JSON.parse(currentValue.data.value);
      if (!parsedValue) {
        return accumulator;
      }
      return accumulator.concat(parsedValue);
    }, []);

    // put messages into state
    setActiveMessages(finalArray);
  };

  const sendMessageHandler = async (
    currentUserId,
    activeUserId,
    messageText
  ) => {
    const storageKey = `${currentUserId}_${activeUserId}`;

    let messageContainer = [];

    // we get all the messages first (maybe she sent something from a different window)
    const getExistingMessages = await monday.storage.instance.getItem(
      storageKey
    );

    // check if she has already messages
    if (getExistingMessages.data.value) {
      messageContainer = JSON.parse(getExistingMessages.data.value);
    }

    // add our message to the list
    messageContainer.push({
      from: currentUserId,
      text: messageText,
      created_at: Date.now(),
    });

    // we encode it again
    const messageString = JSON.stringify(messageContainer);

    // and set it to storage
    await monday.storage.instance.setItem(storageKey, messageString);

    // load all messages
    loadMessages(currentUserId, activeUserId);
  };

  return (
    <div className={styles.App}>
      <div className={styles.sidebar}>
        <Sidebar
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
