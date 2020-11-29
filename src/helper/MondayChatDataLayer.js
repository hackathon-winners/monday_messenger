import mondaySdk from "monday-sdk-js";
import { v4 as uuidv4 } from "uuid";

/**
 * MondayChatLayer is a DataLayer above the monday SDK
 * that allows using the storage API for Chat/Messaging
 * purposes.
 */
class MondayChatDataLayer {
  /**
   * We initialize the mondaySDK
   *
   * @return  {[type]}  [return description]
   */
  constructor() {
    this.monday = mondaySdk();
  }

  /**
   * Request the current user and all users in a single call
   *
   * @return  {Promise}  promise of monday api call
   */
  getUserAndAllUsers() {
    return this.monday.api(
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
        }`
    );
  }

  /**
   * get monday context
   *
   * @param   {func}  callback  callback then context changes
   *
   * @return  {void}
   */
  getContext(callback) {
    // get context
    this.monday.listen("context", (res) => {
      callback(res.data);
    });
  }
  /**
   * Return the user from the array based on its ID
   *
   * @param   {Array}  users   Array containing all Users
   * @param   {Int}    userId
   *
   * @return  {Object|null}         User Object
   */
  static getPersonById(users, userId) {
    return users.find((user) => user.id === userId);
  }

  /**
   * Get all the active Chats of user
   *
   * @param   {Int}  userId
   *
   * @return  {Array}          List of all active Chats (active/unread)
   */
  async loadActiveChats(userId) {
    const storageKeyActive = `${userId}_active`;
    const storageKeyUnread = `${userId}_unread`;

    // we load parallel for faster loading
    const promises = [];

    promises.push(this.monday.storage.instance.getItem(storageKeyUnread));
    promises.push(this.monday.storage.instance.getItem(storageKeyActive));

    // we wait for both promises to get a full message list
    const chatsRaw = await Promise.all(promises);

    const chatsArray = this.mergeStorageResults(chatsRaw);

    // we remove duplicates (entry can be in unread and active)
    // because we are handling object arrays, this is quite tedious
    // @todo: make sure unread always comes first
    const output = chatsArray.filter(
      (chat, index, self) =>
        index === self.findIndex((t) => t.userId === chat.userId)
    );

    return output;
  }

  /**
   * Get all Messages between two people
   *
   * @param   {Int}  from  Loggedin User ID
   * @param   {Int}  to    Person chatting with
   *
   * @return  {Array}        Array of all Messages
   */
  async loadMessages(from, to) {
    // we load parallel for faster loading
    const promises = [];

    promises.push(this.monday.storage.instance.getItem(`${from}_${to}`));
    if (from !== to) {
      promises.push(this.monday.storage.instance.getItem(`${to}_${from}`));
    }

    // we wait for both promises to get a full message list
    const messagesRaw = await Promise.all(promises);

    // we reduce array to single array
    const messagesArray = this.mergeStorageResults(messagesRaw);

    // put messages into state
    return messagesArray;
  }

  /**
   * Send a Message from a person to a Person
   *
   * @param   {Object}  from  Loggedin User ID
   * {
   *    context; monday.com context (for Notification only)
   *    currentUserId: user sending the message
   *    activeUserId: user recieving the message
   *    messageText: actual message
   *    setActiveChats: callback that recieves the updated chatlist
   * }
   *
   * @return  {[type]}  [return description]
   */
  async sendMessage({
    context,
    currentUserId,
    activeUserId,
    messageText,
    setActiveChats,
  }) {
    const storageKey = `${currentUserId}_${activeUserId}`;

    let messageContainer = [];

    // we get all the messages first (maybe she sent something from a different window)
    const getExistingMessages = await this.monday.storage.instance.getItem(
      storageKey
    );

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
    await this.monday.storage.instance.setItem(storageKey, messageString);

    // we make sure that the activeChat List of the user contains the Object
    this.updateList({
      key: `${currentUserId}_active`,
      userId: activeUserId,
      message: messageText,
      type: "active",
      setActiveChats,
    });

    // we add the Object to the unread List of the recieving user
    // as promise for speed
    if (activeUserId !== currentUserId) {
      this.updateList({
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
    if (context.instanceId > 0) {
      this.monday
        .api(
          `mutation {
          create_notification (user_id: ${activeUserId}, target_id: 879454657, text: "You just got a message!", target_type: Project) {
            text
          }
        }`
        )
        .then((res) => {
          console.log(res);
        });
    }

    // load all messages
    return this.loadMessages(currentUserId, activeUserId);
  }

  /**
   * merges two storage GET API requests to a single array
   *
   * @param   {Array}  responses  API responses from monday
   *
   * @return  {Array}             Merged values of responses
   */
  mergeStorageResults(responses) {
    return responses.reduce((accumulator, currentValue) => {
      const parsedValue = JSON.parse(currentValue.data.value);
      if (!parsedValue) {
        return accumulator;
      }
      return accumulator.concat(parsedValue);
    }, []);
  }

  /**
   * Update a list (active/unread) of active chats
   *
   * @param   {String}  key             Key for the Storage API
   * @param   {Int}  userId          User Id that owns that list
   * @param   {String}  message         Last Message to appear on List
   * @param   {String}  type            Type of conversation (active/unread)
   * @param   {func}  setActiveChats  Callback that recieves the updated List
   *
   * @return  {Array}                  All the chats
   */
  async updateList({ key, userId, message, type, setActiveChats = (r) => {} }) {
    const chatsRaw = await this.monday.storage.instance.getItem(key);

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

    this.monday.storage.instance.setItem(key, JSON.stringify(chats));

    return chats;
  }

  /**
   * Remove an Item from a List
   *
   * @param   {String}  key     Storage Key
   * @param   {Int}  userId     UserId that owns that List
   *
   * @return  {Promise}         Return Monday API promise
   */
  async removeFromList({ key, userId }) {
    const chatsRaw = await this.monday.storage.instance.getItem(key);

    let chats = JSON.parse(chatsRaw.data.value);

    if (!chats) {
      return;
    }

    const chatlistWithoutChat = [];
    for (let i = 0; i < chats.length; i++) {
      if (chats[i].userId !== userId) {
        chatlistWithoutChat.push(chats[i]);
      }
    }

    return this.monday.storage.instance.setItem(
      key,
      JSON.stringify(chatlistWithoutChat)
    );
  }
}

export default MondayChatDataLayer;
