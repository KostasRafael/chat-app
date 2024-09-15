import {
  StyleSheet,
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useEffect, useState } from "react";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Time,
} from "react-native-gifted-chat";
import {
  collection,
  query,
  orderBy,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomActions from "./CustomActions";
import MapView from "react-native-maps";

const Chat = ({ route, navigation, db, isConnected, storage }) => {
  const [messages, setMessages] = useState([]);
  const { name, backgroundColor, userID } = route.params;

  //adds new messages to db when sent
  const onSend = (newMessages) => {
    addDoc(collection(db, "messages"), newMessages[0]);
  };

  let unsubMessages;
  useEffect(() => {
    //sets screen title to name
    navigation.setOptions({ title: name });

    if (isConnected === true) {
      //unregister current onSnapshot() listener to avoid having multiple listeners
      if (unsubMessages) unsubMessages();
      unsubMessages = null;

      //gets messages from db
      const getMessages = query(
        collection(db, "messages"),
        orderBy("createdAt", "desc")
      );

      //updates db with new messages and displays them
      unsubMessages = onSnapshot(getMessages, (docs) => {
        let newMessages = [];

        docs.forEach((doc) => {
          newMessages.push({
            id: doc.id,
            ...doc.data(),
            createdAt: new Date(doc.data().createdAt.toMillis()),
          });
        });
        cacheMessages(newMessages);
        setMessages(newMessages);
      });
    } else loadCachedMessages();

    //stops listening for new data
    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, [isConnected]);

  //adds messages to client cache
  const cacheMessages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem(
        "all_messages",
        JSON.stringify(messagesToCache)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  //loads data from client cache instead of db
  const loadCachedMessages = async () => {
    const cachedMessages = (await AsyncStorage.getItem("all_messages")) || [];
    setMessages(JSON.parse(cachedMessages));
  };

  //changes to color of message bubbles
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#302b41",
          },
          left: {
            backgroundColor: "#d9d2e9",
          },
        }}
      />
    );
  };

  //changes color of the message times
  const renderTime = (props) => {
    return (
      <Time
        {...props}
        timeTextStyle={{
          left: {
            color: "black",
          },
          right: {
            color: "white",
          },
        }}
      />
    );
  };
  //

  //removes text inout bar if no connection
  const renderInputToolbar = (props) => {
    if (isConnected === true) return <InputToolbar {...props} />;
    else return null;
  };

  //adds action menu to text input bar
  const renderCustomActions = (props) => {
    return (
      <CustomActions
        storage={storage}
        {...props}
        accessible={true}
        accesssibilityLabel="More options"
        accessibilityHint="Lets you take and send photos and your current location"
      />
    );
  };

  //renders mapview if location is shared
  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        renderTime={renderTime}
        renderActions={renderCustomActions}
        renderInputToolbar={renderInputToolbar}
        renderCustomView={renderCustomView}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: userID,
          name: name,
        }}
      />
      {Platform.OS === "android" ? (
        <KeyboardAvoidingView behavior="height" />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Chat;
