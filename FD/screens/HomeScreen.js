import { useNavigation,NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth,fbauth } from '../firebaseauth';

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleSignOut = () => {
    fbauth
      .signOut(auth)
      .then(() => {
        navigation.replace('LoginScreen');
      })
      .catch(error => alert(error.message));
  };

  return (
    <View style={styles.container}>
      <Text>Email(Home Screen): {auth.currentUser?.email}</Text>
      <TouchableOpacity onPress={handleSignOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
};

// export default App;

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
   button: {
    backgroundColor: '#0782F9',
    width: '60%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
})