import { v4 as uuidv4 } from "uuid";

export const getPersonById = (users, userId) => {
  return users.find((user) => user.id === userId);
};
// load chats
export const loadActiveChats = async (monday, userId) => {
  const storageKeyActive = `${userId}_active`;
  const storageKeyUnread = `${userId}_unread`;

  // we load parallel for faster loading
  const promises = [];

  promises.push(monday.storage.instance.getItem(storageKeyUnread));
  promises.push(monday.storage.instance.getItem(storageKeyActive));

  // we wait for both promises to get a full message list
  const chatsRaw = await Promise.all(promises);

  const chatsArray = mergeStorageResults(chatsRaw);

  // we remove duplicates (entry can be in unread and active)
  // because we are handling object arrays, this is quite tedious
  // @todo: make sure unread always comes first
  const output = chatsArray.filter(
    (chat, index, self) =>
      index === self.findIndex((t) => t.userId === chat.userId)
  );

  return output;
};

// Message loader
export const loadMessages = async (monday, from, to) => {
  // we load parallel for faster loading
  const promises = [];

  promises.push(monday.storage.instance.getItem(`${from}_${to}`));
  if (from !== to) {
    promises.push(monday.storage.instance.getItem(`${to}_${from}`));
  }

  // we wait for both promises to get a full message list
  const messagesRaw = await Promise.all(promises);

  // we reduce array to single array
  const messagesArray = mergeStorageResults(messagesRaw);

  // put messages into state
  return messagesArray;
};

// send Message to monday
export const sendMessage = async (
  monday,
  currentUserId,
  activeUserId,
  messageText,
  setActiveChats
) => {
  const storageKey = `${currentUserId}_${activeUserId}`;

  let messageContainer = [];

  // we get all the messages first (maybe she sent something from a different window)
  const getExistingMessages = await monday.storage.instance.getItem(storageKey);

  // check if she has already messages
  if (getExistingMessages.data.value) {
    messageContainer = JSON.parse(getExistingMessages.data.value);
  }

  // add our message to the list
  messageContainer.push({
    id: uuidv4(),
    from: currentUserId,
    text: messageText,
    created_at: Date.now(),
  });

  // we encode it again
  const messageString = JSON.stringify(messageContainer);

  // and set it to storage
  await monday.storage.instance.setItem(storageKey, messageString);

  console.log("current user send", currentUserId);
  console.log("active user send", activeUserId);
  console.log("text", messageText);
  console.log(setActiveChats);

  // we make sure that the activeChat List of the user contains the Object
  updateList({
    monday,
    key: `${currentUserId}_active`,
    userId: activeUserId,
    message: messageText,
    type: "active",
    setActiveChats,
  });

  // we add the Object to the unread List of the recieving user
  // as promise for speed
  if (activeUserId !== currentUserId) {
    updateList({
      monday,
      key: `${activeUserId}_unread`,
      userId: currentUserId,
      message: messageText,
      type: "unread",
    });
  }

  // Notification Logic
  // if
  // - the channel isn't muted
  // And
  // -- the last message was not sent by us
  // - OR
  // -- the last message was sent by us more than 1hs ago

  // load all messages
  return loadMessages(monday, currentUserId, activeUserId);
};

export const mergeStorageResults = (responses) => {
  return responses.reduce((accumulator, currentValue) => {
    const parsedValue = JSON.parse(currentValue.data.value);
    if (!parsedValue) {
      return accumulator;
    }
    return accumulator.concat(parsedValue);
  }, []);
};

export const updateList = async ({
  monday,
  key,
  userId,
  message,
  type,
  setActiveChats = (r) => {},
}) => {
  const chatsRaw = await monday.storage.instance.getItem(key);

  let chats = JSON.parse(chatsRaw.data.value);

  if (!chats) {
    chats = [];
  }

  let chatAlreadyExisted = false;
  for (let i = 0; i < chats.length; i++) {
    if (chats[i].userId === userId) {
      chats[i].last_seen_at = Date.now();
      chats[i].last_message = message;

      // we set the flag
      chatAlreadyExisted = true;
    }
  }
  if (!chatAlreadyExisted) {
    chats.push({
      userId: userId,
      last_seen_at: Date.now(),
      last_message: message,
      type: type,
    });
  }

  setActiveChats(chats);

  return monday.storage.instance
    .setItem(key, JSON.stringify(chats))
    .then((resp) => {});
};

export const removeFromList = async ({ monday, key, userId }) => {
  const chatsRaw = await monday.storage.instance.getItem(key);

  let chats = JSON.parse(chatsRaw.data.value);

  console.log(chats);

  if (!chats) {
    return;
  }

  const chatlistWithoutChat = [];
  for (let i = 0; i < chats.length; i++) {
    if (chats[i].userId !== userId) {
      chatlistWithoutChat.push(chats[i]);
    }
  }

  console.log(chatlistWithoutChat);

  return monday.storage.instance.setItem(
    key,
    JSON.stringify(chatlistWithoutChat)
  );
};
