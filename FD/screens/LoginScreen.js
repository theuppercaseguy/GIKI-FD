import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Platform, ScrollView, Dimensions, KeyboardAvoidingView, StyleSheet, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { auth, fbauth, db } from '../firebaseauth'
import { collection, doc, getDoc } from "firebase/firestore"



const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoading(true);
        const userRef = doc(collection(db, 'users'), user.uid);
        try {
          const docSnapshot = await getDoc(userRef);
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            const isAdmin = userData.isAdmin;
            if (isAdmin) {
              console.log('User is an admin');
              navigation.replace('AdminScreen');
            } else {
              console.log('User is not an admin');
              navigation.replace('UserScreen');
            }
          } else {
            console.log('User document does not exist');
          }
        } catch (error) {
          setShowPopup(true);
          setPopupMessage('Error Logging in, please Try again Later...');
          console.log('Error getting user document:', error);
        } finally {
          setIsLoading(false);
        }
      }
    });

    // Clean up the subscription
    return unsubscribe;
  }, []);



  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (email === '' || password === '') {
      console.log("Error loging in\nemail and password left blank");
      setPopupMessage('Please fill in all fields.');
      setShowPopup(true);
      setIsLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setPopupMessage("Please enter a valid email address.");
      setShowPopup(true);
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setPopupMessage("Password should be at least 8 characters long.");
      setShowPopup(true);
      setIsLoading(false);
      return;
    }

    // setIsLoading(true);

    try {
      const userCredentials = await fbauth.signInWithEmailAndPassword(auth, email, password);
      const user = userCredentials.user;
      console.log('Logged in with:', user.email);
      // setIsLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      // setIsLoading(false);
      if (error.code === "auth/wrong-password") {
        setPopupMessage("Invalid password. Please try again.");
        // setIsLoading(false);
      } else if (error.code === "auth/user-not-found") {
        setPopupMessage("User not found. Please check your email or register a new account.");
        // setIsLoading(false);

      } else if (error.code === "auth/too-many-requests") {
        setPopupMessage("Too many attemps. Plz try again latter.");
        // setIsLoading(false);
      } else {
        setPopupMessage("An error occurred during login. Please try again.");
        // setIsLoading(false);
      }
      setShowPopup(true);
    }
    // setIsLoading(false);
  }

  const handleRegister = () => {
    navigation.navigate("RegistrationScreen");
  }

  return (

    <KeyboardAvoidingView style={styles.container} behavior="height">
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/LOGO.png')} style={styles.logo} />
            <Text style={styles.title}>GIK-FD</Text>
          </View>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={text => setEmail(text)}
            style={[styles.input, email === '']}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={text => setPassword(text)}
            style={[styles.input, password === '']}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
        {showPopup && (
          <View style={styles.popupContainer}>
            <Text style={styles.popupText}>{popupMessage}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleLogin} style={[styles.button, isLoading && styles.disabledButton]} disabled={isLoading}>
            <Text style={styles.buttonText}>{isLoading ? 'Loading...' : 'Login'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.registerLink}>Don't have an Account? Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default LoginScreen;

const { width, height } = Dimensions.get('window');
const isAndroid = Platform.OS === 'android';
// export default LoginScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
    // paddingHorizontal:10,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: height * 0.01,
  },
  buttonContainer: {
    width: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#0782F9',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',

  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonOutline: {
    backgroundColor: 'white',
    marginTop: height * 0.01,
    borderColor: '#0782F9',
    borderWidth: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: isAndroid ? 16 : 18,
  },
  buttonOutlineText: {
    color: '#0782F9',
    fontWeight: '700',
    fontSize: isAndroid ? 16 : 18,
  },
  registerLink: {
    marginTop: height * 0.02,
    color: '#0782F9',
    fontWeight: '400',
    fontSize: isAndroid ? 14 : 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  errorInput: {
    borderColor: 'red',
    borderWidth: 2,
  },
  popupContainer: {
    // backgroundColor: 'red',
    padding: 10,
    margin: 5,
  },
  popupText: {
    color: 'red',
    // fontWeight: 'bold',
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.04,
    width: width * 0.7,
    height: width * 0.7,
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: isAndroid ? 24 : 26,
    fontWeight: 'bold',
    marginTop: height * 0.02,
    marginBottom: height * 0.04,
  },
});