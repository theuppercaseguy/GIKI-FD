import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, Image, StyleSheet, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { fbauth, auth, db, storage } from '../firebaseauth';
import { ref, uploadBytesResumable } from 'firebase/storage';

import * as ImagePicker from 'expo-image-picker';

const AdminScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('uploadFood'); // State to keep track of active tab


  const [FoodId, setFoodId] = useState('');
  const [FoodName, setFoodName] = useState('');
  const [FoodPrice, setFoodPrice] = useState('');
  const [FoodDescription, setFoodDescription] = useState('');

  const [foodIsActive, setFoodIsActive] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('');
  const categories = ['KFC', 'McDonalds', 'DD', 'Layers'];
  const [dropdownVisible, setDropdownVisible] = useState(false); // State to toggle dropdown visibility
  const [selectedImage, setSelectedImage] = useState(null);
  const [Uploading, setUploading] = useState(false);


  const handleFoodIsActiveChange = (value) => {
    setFoodIsActive(value);
    setIsModalVisible(false);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };


  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setDropdownVisible(false);
  };

  const handleSignOut = () => {
    fbauth
      .signOut(auth)
      .then(() => {
        navigation.replace('LoginScreen');
      })
      .catch(error => alert(error.message));
  };



  // const handleImageUpload = async () => {
  //   try {
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //       allowsEditing: true,
  //       aspect: [1, 1],
  //       quality: 1,
  //     });

  //     if (!result.cancelled) {
  //       setSelectedImage(result.uri);
  //     } else {
  //       console.log('Image selection cancelled');
  //     }
  //   } catch (error) {
  //     console.log('Error uploading image:', error);
  //   }
  // };


  const PickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        const source = { uri: result.uri };
        console.log("source: ", source);
        setSelectedImage(source);
      }
    } catch (error) {
      console.log("Error selecting image: ", error);
      alert("Failed to select image.");
    }
  };

  const UploadImage = async () => {
    setUploading(true);
    const response = await fetch(selectedImage.uri);
    const blob = await response.blob();

    const sanitizedFoodName = FoodName.replace(/\s+/g, '-'); // Replace spaces with hyphen
    const filename = `Images/${selectedCategory}/${sanitizedFoodName}`; // Include the original format of the picture in the filename

    // const storage = getStorage();
    const storageRef = ref(storage, filename);

    try {
      const snapshot = await uploadBytesResumable(storageRef, blob);
      const bytesTransferred = snapshot.bytesTransferred;
      const totalBytes = snapshot.totalBytes;

      if (bytesTransferred < totalBytes) {
        throw new Error("Image size exceeds 2MB limit.");
        
      }

      setUploading(false);
      alert("Photo Uploaded.");
      setSelectedImage(null);
    } catch (error) {
      console.log("Error uploading image: ", error);
      setUploading(false);
      alert("Failed to upload photo.");
    }
  };


  const handleUploadFoodItem = () => {
    console.log(FoodName, FoodPrice, FoodId, foodIsActive, selectedCategory, selectedImage);
    UploadImage();

  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.adminText}>Admin</Text>
      </View>

      <View style={styles.tabButtons}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'uploadFood' && styles.activeTabButton]}
          onPress={() => setActiveTab('uploadFood')}
        >
          <Text style={styles.tabButtonText}>Upload Food Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'activeFoodItems' && styles.activeTabButton]}
          onPress={() => setActiveTab('activeFoodItems')}
        >
          <Text style={styles.tabButtonText}>Active Food Items</Text>
        </TouchableOpacity>
      </View>

      {/* Render content based on active tab */}
      {activeTab === 'uploadFood' ? (
        <View style={styles.content}>

          <ScrollView style={styles.scrollContent}>
            <TouchableOpacity style={styles.uploadImageContainer} onPress={PickImage}>
              {selectedImage ? (
                <Image source={{}} style={styles.uploadedImage} />
              ) : (
                <Text style={styles.uploadImageText}>Upload Image...</Text>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Food Name"
              onChangeText={(text) => setFoodName(text)}
              value={FoodName}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              onChangeText={(text) => setFoodDescription(text)}
              value={FoodDescription}
            />
            <TextInput
              style={styles.input}
              placeholder="Unique ID"
              onChangeText={(text) => setFoodId(text)}
              value={FoodId}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              onChangeText={(text) => setFoodPrice(text)}
              value={FoodPrice}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.dropdownContainer} onPress={toggleModal}>
              <Text>{foodIsActive || 'Select IsActive...'}</Text>
            </TouchableOpacity>

            {/* IsACtive selection */}
            <Modal visible={isModalVisible} animationType="slide" transparent>
              <View style={styles.modalContainer}>
                <View style={styles.dropdownModal}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleFoodIsActiveChange('true')}
                  >
                    <Text style={styles.optionText}>True</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleFoodIsActiveChange('false')}
                  >
                    <Text style={styles.optionText}>False</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* category selection */}
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => setDropdownVisible(true)}
            >
              <Text>{selectedCategory || 'Select a category'}</Text>
            </TouchableOpacity>

            <Modal visible={dropdownVisible} animationType="fade" transparent>
              <View style={styles.modalContainer}>
                <View style={styles.dropdownModal}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={styles.dropdownItem}
                      onPress={() => handleCategorySelect(category)}
                    >
                      <Text>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Modal>

            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadFoodItem}>
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Render active food items */}

          <Modal visible={dropdownVisible} animationType="fade" transparent>
            <View style={styles.modalContainer}>
              <View style={styles.dropdownModal}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.dropdownItem}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <Text>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>

        </View>
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bottomBarButton, activeTab === 'ordered-Food' && styles.activeTabButton]}
          onPress={() => setActiveTab('ordered-Food')}
        >
          <Text style={styles.bottomBarButtonText}>Ordered Food</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomBarButton, activeTab === 'Order-details' && styles.activeTabButton]}
          onPress={() => setActiveTab('Order-details')}
        >
          <Text style={styles.bottomBarButtonText}>Orders-details</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );



};

export default AdminScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // To provide space for the bottom bar
  },
  optionText: {
    fontSize: 16,
  },
  dropdownContainer: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    // textAlign:"center"
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 5,

  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  topBar: {
    paddingTop: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',

  },
  adminText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#0782F9',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  tabButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#0782F9',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  content: {
    flex: 1,
    width: '100%',
    padding: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  bottomBarButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  bottomBarButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  uploadImageContainer: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    height: 150,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#0782F9',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
