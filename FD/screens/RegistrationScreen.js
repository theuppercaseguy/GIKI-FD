import { useNavigation } from '@react-navigation/native'
import React, { useState } from 'react'
import { Platform,Dimensions,KeyboardAvoidingView, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { auth, fbauth, db } from '../firebaseauth'
import { collection, doc, setDoc } from "firebase/firestore"

const RegistrationScreen = () => {
  const [name, setName] = useState('')
  const [contactNo, setCellNo] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation()
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleSignUp = async () => {
    if (email === '' || password === '' || name === '' || contactNo === '') {
      console.log("Error loging in\nblank fields");
      setShowPopup(true);
      setPopupMessage('Please fill in all fields.');
      return;
    }
    if (!validateEmail(email)) {
      setPopupMessage("Please enter a valid email address.");
      setShowPopup(true);
      return;
    }
    console.log(contactNo.length)
    if (contactNo.length != 11) {
      setPopupMessage("Contact number not right");
      setShowPopup(true);
      return;
    }

    if (password.length < 8) {
      setPopupMessage("Password should be at least 8 characters long.");
      setShowPopup(true);
      return;
    }

    setIsLoading(true);

    try {
      const userCredentials = await fbauth.createUserWithEmailAndPassword(auth, email, password);
      const user = userCredentials.user;

      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        phoneNo: contactNo,
        email: email,
        password: password,
        isAdmin: false,
      });

      console.log('Registered with:', user.email);
    } catch (error) {
      console.error("Registration error:", error);
      if (error.code === "auth/email-already-in-use") {
        console.log("@: Registration error:", error);
        setPopupMessage("The email address is already in use. Please use a different email.");
      } else {
        setPopupMessage("An error occurred during registration. Please try again.");
      }
      // alert(error.message);
      setShowPopup(true)
    }

    setIsLoading(false);

  }


  const handleLogIn = () => {
    navigation.navigate("LoginScreen");
  }
  return (
    <KeyboardAvoidingView style={styles.container} behavior="height">
      {showPopup && (
        <View style={styles.popupContainer}>
          <Text style={styles.popupText}>{popupMessage}</Text>
        </View>
      )}
      <View style={styles.inputContainer}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/LOGO.png')} style={styles.logo} />
          <Text style={styles.title}>GIK-FD</Text>
        </View>
        <Image source={'./assets/LOGO.png'} />
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={text => setName(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Phone (03xxxxxxxxx)"
          value={contactNo}
          onChangeText={text => setCellNo(text)}
          style={styles.input}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={text => setEmail(text)}
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={text => setPassword(text)}
          style={styles.input}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleSignUp} style={[styles.button, styles.buttonOutline, isLoading && styles.disabledButton]} disabled={isLoading}>

          <Text style={styles.buttonOutlineText}>{isLoading ? 'Loading...' : 'Register'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogIn}>
          <Text style={styles.registerLink}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default RegistrationScreen;


const { width, height } = Dimensions.get('window');
const isAndroid = Platform.OS === 'android';
// export default LoginScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: width * 0.8,
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
    marginTop: height * 0.05,
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
    position: 'absolute',
    top: height * 0.1,
    left: 0,
    right: 0,
    zIndex: 4,
    backgroundColor: 'red',
    padding: 10,
  },
  popupText: {
    color: 'white',
    fontWeight: 'bold',
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