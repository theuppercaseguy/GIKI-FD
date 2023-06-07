import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
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

  const [isUploading, setisUploading] = useState(false);
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const checkFormValidity = () => {
    if (FoodName && FoodPrice && FoodId && foodIsActive && selectedCategory && selectedImage) {
      setIsFormFilled(true);
    } else {
      setIsFormFilled(false);
    }
  };

  useEffect(() => {
    checkFormValidity();
  }, [FoodName, FoodPrice, FoodId, foodIsActive, selectedCategory, selectedImage]);

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

    // setisUploading(true);
    const response = await fetch(selectedImage.uri);
    const blob = await response.blob();

    // const sanitizedFoodName = FoodName.replace(/\s+/g, '-'); // Replace spaces with hyphen
    const filename = `Images/${selectedCategory}/${FoodName}`; // Include the original format of the picture in the filename

    // const storage = getStorage();
    const storageRef = ref(storage, filename);

    try {
      const snapshot = await uploadBytesResumable(storageRef, blob);
      const bytesTransferred = snapshot.bytesTransferred;
      const totalBytes = snapshot.totalBytes;

      if (bytesTransferred < totalBytes) {
        throw new Error("Image size exceeds 2MB limit.");
        // setErrorMessage("Image size exceeds 2MB limit.");
      }

      setSelectedImage(null);
    } catch (error) {
      console.log("Error uploading image: ", error);
      setErrorMessage("Failed to upload photo.");
    }
  };


  const UploadFoodItemData = async () => {
    try {
      setLoading(true);
      // Check if the food name already exists
      const foodRef = firebase.firestore().collection(selectedCategory);
      const querySnapshot = await foodRef.where('Name', '==', FoodName).get();

      console.log("name: ",querySnapshot);

      if (!querySnapshot.empty) {
        setError('An item with the same name already exists.');
        setLoading(false);
        return;
      }

      // Upload the data to Firestore
      const docRef = await foodRef.add({
        id: FoodId,
        name: FoodName,
        price: FoodPrice,
        Description: FoodDescription,
        isActive: foodIsActive,
        ImagePath: selectedImage,
        priority:0,
      });

      // Retrieve the auto-generated document ID
      const newDocumentId = docRef.id;

      // Reset the form fields
      resetForm();

      setLoading(false);
      setError('');
      // setSuccess(`Data uploaded successfully! Document ID: ${newDocumentId}`);
    } catch (error) {
      console.error('Error uploading data:', error);
      setError('Error uploading data. Please try again.');
      setLoading(false);
    }

  };


  const handleUploadFoodItem = async () => {
    if (isFormFilled) {
      try {
        setisUploading(true);

        const imageUploadPromise = UploadImage();
        const dataUploadPromise = UploadFoodItemData();

        await Promise.all([imageUploadPromise, dataUploadPromise]);

        setisUploading(false);
        alert("Successfully uploaded Food ITEM");
      } catch (error) {
        console.log('Error uploading:', error);

        setErrorMessage("Error uploading:");
        setisUploading(false);

        // If an error occurs, delete the uploaded image from storage if it exists
        if (selectedImage) {
          const filename = `Images/${selectedCategory}/${FoodName}`;
          const storageRef = ref(storage, filename);
          await deleteObject(storageRef);
        }

        // Rollback the data upload if the image was uploaded successfully
        if (error.message === 'Image upload failed.') {
          // Delete the data that was uploaded
          const foodRef = firebase.firestore().collection(selectedCategory);
          const querySnapshot = await foodRef.where('name', '==', FoodName).get();
          if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            await foodRef.doc(docId).delete();
          }
        }
      }
    }
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
                <Image source={{ uri: selectedImage.uri }} style={styles.uploadedImage} />
              ) : (
                <Text>Upload Image...</Text>
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

            <TouchableOpacity
              style={[styles.uploadButton, !isFormFilled || isUploading ? styles.disabledButton : null]}
              onPress={handleUploadFoodItem}
              disabled={!isFormFilled || isUploading}
            >
              <Text style={styles.uploadButtonText}>
                {isUploading ? 'UpLoading...' : 'Upload'}
              </Text>
            </TouchableOpacity>


            {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}


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
  errorMessage: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
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
    // height: 150,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
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
