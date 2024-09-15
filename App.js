// import screens
import Start from "./components/Start";
import Chat from "./components/Chat";

// import react Navigations
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

//import react components
import { Alert } from "react-native";
import { useEffect } from "react";

//import firestore
import { initializeApp } from "firebase/app";
import {
  disableNetwork,
  enableNetwork,
  getFirestore,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

//import netInfo
import { useNetInfo } from "@react-native-community/netinfo";

// Create the navigator
const Stack = createNativeStackNavigator();

const App = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyAhW5CbRm__A3OKBkkQOwjSWWtwiumB6u4",
    authDomain: "chatapp-cf188.firebaseapp.com",
    projectId: "chatapp-cf188",
    storageBucket: "chatapp-cf188.appspot.com",
    messagingSenderId: "1011508160945",
    appId: "1:1011508160945:web:9752aa4a25f797213ab590",
  };

  //initialize firebase
  const app = initializeApp(firebaseConfig);

  //initialize firestore + make a reference to service
  const db = getFirestore(app);

  //initialize storage handler
  const storage = getStorage(app);

  //state that represents connectivity status
  const connectionStatus = useNetInfo();

  //listens for changes in connection status, will alert if connection is lost
  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert("Connection lost.");

      //disables firebase db reconnection attempts
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      //re-enables firebase db reconnection attempts
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Chat">
          {(props) => (
            <Chat
              isConnected={connectionStatus.isConnected}
              db={db}
              storage={storage}
              {...props}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
