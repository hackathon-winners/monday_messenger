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
  listenToChanges(callback) {
    // get context
    this.monday.listen(["context", "settings"], (res) => {
      callback(res);
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
    const storageKeyActive = `cchat_${userId}_active`;

    const chatsRaw = await this.monday.storage.instance.getItem(
      storageKeyActive
    );

    const chatsArray = JSON.parse(chatsRaw.data.value);

    return chatsArray;
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

    promises.push(this.monday.storage.instance.getItem(`cchat_${from}_${to}`));
    if (from !== to) {
      promises.push(
        this.monday.storage.instance.getItem(`cchat_${to}_${from}`)
      );
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
    currentUserId,
    activeUserId,
    messageText,
    setActiveChats,
    itemId,
  }) {
    const storageKey = `cchat_${currentUserId}_${activeUserId}`;

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
      key: `cchat_${currentUserId}_active`,
      userId: activeUserId,
      message: messageText,
      setActiveChats,
      type: "active",
    });

    // we add the Object to the unread List of the recieving user
    // as promise for speed
    if (activeUserId !== currentUserId) {
      this.updateList({
        key: `cchat_${activeUserId}_active`,
        userId: currentUserId,
        message: messageText,
        type: "unread",
      });
    }

    // Notification Logic
    // if
    // - we have an item ID
    // And
    // - the channel was not muted
    if (itemId > 0) {
      this.loadMutedChats(currentUserId).then((isMutedArray) => {
        if (!isMutedArray.includes(activeUserId)) {
          this.monday
            .api(
              `mutation {
                    create_notification (user_id: ${activeUserId}, target_id: ${itemId}, text: "You just got a message!", target_type: Project) {
                        text
                    }
                }`
            )
            .then((res) => {
              console.log(res);
            });
        }
      });
    }

    // load all messages
    return this.loadMessages(currentUserId, activeUserId);
  }

  /**
   * Mute a Channel
   *
   * @param   {String}  key     Storage Key
   * @param   {Int}  userId     UserId that owns that List
   *
   * @return  {Promise}         Return Monday API promise
   */
  async toggleChannelUnread({ currentUserId, userId }) {
    const storageKey = `cchat_${currentUserId}_active`;
    const chatsRaw = await this.monday.storage.instance.getItem(storageKey);

    let chats = JSON.parse(chatsRaw.data.value);

    if (!chats) {
      chats = [];
    }
    for (let i = 0; i < chats.length; i++) {
      if (chats[i].userId === userId) {
        chats[i].type = chats[i].type === "unread" ? "active" : "unread";
      }
    }
    return this.monday.storage.instance.setItem(
      storageKey,
      JSON.stringify(chats)
    );
  }

  /**
   * Mute a Channel
   *
   * @param   {String}  key     Storage Key
   * @param   {Int}  userId     UserId that owns that List
   *
   * @return  {Promise}         Return Monday API promise
   */
  async toggleMuteChannel({ currentUserId, userId }) {
    const storageKey = `cchat_${currentUserId}_active`;
    const chatsRaw = await this.monday.storage.instance.getItem(storageKey);

    let chats = JSON.parse(chatsRaw.data.value);

    if (!chats) {
      chats = [];
    }
    for (let i = 0; i < chats.length; i++) {
      if (chats[i].userId === userId) {
        chats[i].muted = !chats[i].muted;
      }
    }
    return this.monday.storage.instance.setItem(
      storageKey,
      JSON.stringify(chats)
    );
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
    let newItem = undefined;

    if (!chats) {
      chats = [];
    }

    for (let i = 0; i < chats.length; i++) {
      if (chats[i].userId === userId) {
        chats[i].last_seen_at = Date.now();
        chats[i].last_message = message;
        chats[i].type = type;

        // we set the flag
        newItem = { ...chats[i] };
      }
    }
    if (!newItem) {
      newItem = {
        userId: userId,
        last_seen_at: Date.now(),
        last_message: message,
        type: type,
      };
      chats.push(newItem);
    }

    setActiveChats(chats);

    this.monday.storage.instance.setItem(key, JSON.stringify(chats));

    // return new/updated Item
    return newItem;
  }
}

export default MondayChatDataLayer;
