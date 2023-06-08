import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { ScrollView, Image, KeyboardAvoidingView, StyleSheet, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { fbauth, auth, db, storage } from '../firebaseauth';
import { getDownloadURL, ref, uploadBytesResumable, uploadBytes, deleteObject, updateMetadata, move } from 'firebase/storage';
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc, query, where } from 'firebase/firestore';

import * as ImagePicker from 'expo-image-picker';
const AdminScreen = () => {
  const navigation = useNavigation();


  const [FoodId, setFoodId] = useState('');
  const [FoodName, setFoodName] = useState('');
  const [FoodPrice, setFoodPrice] = useState('');
  const [FoodDescription, setFoodDescription] = useState('');

  const [foodIsActive, setFoodIsActive] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('KFC');
  const categories = ['KFC', 'McDonalds', 'DD', 'Layers'];
  const [dropdownVisible, setDropdownVisible] = useState(false); // State to toggle dropdown visibility
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageEdit, setselectedImageEdit] = useState(null);

  const [isUploading, setisUploading] = useState(false);
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('uploadFood'); // State to keep track of active tab
  const [FoodItems, setFoodItems] = useState([]); // State to keep track of active tab

  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setisDeleting] = useState(false); // State to keep track of active tab
  const [isSaving, setisSaving] = useState(false); // State to keep track of active tab
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [selectedDeleteFoodItemName, setSelectedDeleteFoodItemName] = useState('');

  // food editing 
  const [isEditing, setIsEditing] = useState(false);


  const checkFormValidity = () => {
    if (FoodName && FoodPrice && FoodId && foodIsActive && selectedCategory && selectedImage) {
      setIsFormFilled(true);
    } else {
      setIsFormFilled(false);
    }
  };


  useEffect(() => {
    checkFormValidity();
    fetchFoodItems(selectedCategory);
  }, [FoodName, FoodPrice, FoodId, foodIsActive, selectedCategory, selectedImage]);

  const handleFoodIsActiveChange = (value) => {
    setFoodIsActive(value);
    setIsModalVisible(false);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const fetchFoodItems = async (cat) => {
    setErrorMessage(null);
    console.log("cat: ", cat);
    if (!cat) {
      console.log('Invalid category');
      return;
    }

    setIsLoading(true);
    try {
      const foodItemsRef = collection(db, cat);

      const querySnapshot = await getDocs(foodItemsRef);
      // console.log("FI0: ",querySnapshot);
      const foodItemsretreived = [];

      for (const doc of querySnapshot.docs) {
        const item = doc.data();
        const storageRef = ref(storage, `Images/${selectedCategory}/${item.Name}`);
        const downloadURL = await getDownloadURL(storageRef);
        item.ImagePath = downloadURL;
        console.log("path: ", item.ImagePath);
        foodItemsretreived.push(item);
      }

      setFoodItems(foodItemsretreived);

      console.log("Food items recived: ", FoodItems.length);

    } catch (error) {
      console.log('Error fetching food items:', error);
    }
    setIsLoading(false);
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setDropdownVisible(false);
    setSuccessMessage(null);
    try {
      // Fetch food items for the selected category
      await fetchFoodItems(category);
    } catch (error) {
      console.log('Error fetching food items:', error);
      setErrorMessage('Error fetching food items');
    }
  };

  const handleSignOut = () => {
    fbauth
      .signOut(auth)
      .then(() => {
        navigation.replace('LoginScreen');
      })
      .catch(error => alert(error.message));
  };

  const PickImage = async (edit) => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        const source = { uri: result.uri };

        if (edit === "editing") {
          setselectedImageEdit(source)
        } else {
          setSelectedImage(source);
        }
        console.log("selected image: ", selectedImage);
      }
      // console.log("selected image: ",selectedImage);
      return result;

    } catch (error) {
      console.log("Error selecting image: ", error);
      alert("Failed to select image.");
    }
  };

  const UploadImage = async () => {
    let completed = false;

    const response = await fetch(selectedImage.uri);
    const blob = await response.blob();
    const filename = `Images/${selectedCategory}/${FoodName}`; // Include the original format of the picture in the filename

    const storageRef = ref(storage, filename);

    try {
      const snapshot = await uploadBytesResumable(storageRef, blob);
      const bytesTransferred = snapshot.bytesTransferred;
      const totalBytes = snapshot.totalBytes;

      if (bytesTransferred < totalBytes) {
        throw new Error("Image size exceeds 2MB limit.");
        // setErrorMessage("Image size exceeds 2MB limit.");
      }
      completed = true;

      setSelectedImage(null);
    } catch (error) {
      console.log("Error uploading image: ", error);
      setErrorMessage("Failed to upload photo.");
      completed = false;
    }
    return completed;
  };


  const UploadFoodItemData = async () => {
    let completed = false;
    try {
      // setisUploading(true);
      const foodRef = collection(db, selectedCategory);
      const querySnapshot = await getDocs(query(foodRef, where('Name', '==', FoodName)));

      if (!querySnapshot.empty) {
        setErrorMessage('An item with the same name already exists.');
        // setisUploading(false);
        return;
      }
      const docRef = await addDoc(foodRef, {
        id: FoodId,
        Name: FoodName,
        Price: FoodPrice,
        Description: FoodDescription,
        isActive: Boolean(foodIsActive),
        ImagePath: selectedImage,
        Priority: 0,
      });

      // Retrieve the auto-generated document ID
      const newDocumentId = docRef.id;
      console.log("Doc ID: ", newDocumentId);

      // setisUploading(false);
      setErrorMessage('');
      completed = true;

      // setSuccess(`Data uploaded successfully! Document ID: ${newDocumentId}`);
    } catch (error) {
      console.error('Error uploading data:', error);
      setErrorMessage('Error uploading data. Please try again.');
      // setisUploading(false);
      completed = false;
    }
    return completed;
  };

  const handleUploadFoodItem = async () => {
    let imageUploaded = false;
    let dataUploaded = false;

    if (isFormFilled) {
      setisUploading(true);

      try {
        dataUploaded = await UploadFoodItemData();

        if (dataUploaded) {
          imageUploaded = await UploadImage();
        }

        if (!dataUploaded || !imageUploaded) {
          if (dataUploaded && !imageUploaded) {
            const foodRef = collection(db, selectedCategory);
            const querySnapshot = await getDocs(query(foodRef, where('Name', '==', FoodName)));

            if (!querySnapshot.empty) {
              const docId = querySnapshot.docs[0].id;
              await deleteDoc(doc(foodRef, docId));
            }
            setErrorMessage('Image upload failed.');
          }
          // setisUploading(false);
          return;
        }
        setFoodName('');
        setFoodDescription('');
        setFoodIsActive(null);
        setFoodId(null);
        setFoodPrice(null);

        alert('Successfully uploaded Food ITEM');
      } catch (error) {
        console.log('Error uploading:', error);
        setErrorMessage('Error uploading. Please try again.');
      } finally {
        setisUploading(false);
      }

    }
  };

  const [editedFields, setEditedFields] = useState({
    Name: '',
    Description: '',
    Price: '',
    id: 0, // Provide an initial value of type number for id
    isActive: true, // Provide an initial value of type boolean for isActive
    ImagePath: '',
    Priority: 0,
  });


  const handleDeleteFooditem = async (name) => {
    let completed = false;
    try {
      setisDeleting(true); // Set isDeleting to true
      setSelectedDeleteFoodItemName(name);
      // Query for the document with the matching name
      const querySnapshot = await getDocs(
        query(collection(db, selectedCategory), where("Name", "==", name))
      );

      if (!querySnapshot.empty) {
        // Delete the document from Firestore
        await deleteDoc(doc(db, selectedCategory, querySnapshot.docs[0].id));
        completed = true
        // Delete the image from storage
        const storageRef = ref(
          storage,
          `Images/${selectedCategory}/${name}`
        );
        await deleteObject(storageRef);

        completed = true
        setSuccessMessage('Food item deleted successfully');
        setErrorMessage(null);

        console.log("Successfully deleted");
        fetchFoodItems(selectedCategory);
      } else {
        completed = false;
        setErrorMessage('Food item not found');
        setSuccessMessage(null);
      }
    } catch (error) {
      if (!completed) {
        setErrorMessage('Error deleting food item');
        setSuccessMessage(null);
      }
      console.log('Error deleting food item:', error);
    } finally {
      setisDeleting(false); // Set isDeleting back to false
    }
  }


  const handleEdit = (item) => {
    console.log("edit pressed");

    setSelectedItem(item);
    setIsEditing(true);
    setEditedFields({
      Name: item.Name,
      Description: item.Description,
      Price: item.Price,
      isActive: item.isActive,
      ImagePath: item.ImagePath,
      Priority: item.Priority,
      id: item.id,
    });

  };


  const handleSave = async () => {
    try {
      setErrorMessage("");
      setisSaving(true);

      const isDataChanged =
        editedFields.Name !== selectedItem.Name ||
        editedFields.Description !== selectedItem.Description ||
        editedFields.Price !== selectedItem.Price ||
        editedFields.isActive !== selectedItem.isActive ||
        (selectedImageEdit !== null && isImageVisible) ||
        editedFields.id !== selectedItem.id ||
        editedFields.Priority !== selectedItem.Priority;

      if (!isDataChanged) {
        setIsEditing(false);
        console.log("\n\nNothing changed...\n\n");
        return;
      }

      console.log("\n\nisDataChanged:\n", isDataChanged);

      const foodRef = collection(db, selectedCategory);
      const querySnapshot = await getDocs(
        query(foodRef, where("Name", "==", selectedItem.Name))
      );

      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;

        // Check if the name has changed
        if (selectedItem.Name !== editedFields.Name) {
          // Rename the existing image in storage
          const oldStorageRef = ref(
            storage,
            `Images/${selectedCategory}/${selectedItem.Name}`
          );
          const newStorageRef = ref(
            storage,
            `Images/${selectedCategory}/${editedFields.Name}`
          );

          // Get the download URL of the existing image
          const existingImageUrl = await getDownloadURL(oldStorageRef);

          // Fetch the existing image and upload it with the new name
          const response = await fetch(existingImageUrl);
          const blob = await response.blob();
          await uploadBytes(newStorageRef, blob);

          // Delete the existing image
          await deleteObject(oldStorageRef);
        }

        // Check if a new image has been selected
        if (selectedImageEdit && selectedImageEdit.uri) {
          // Upload the new image to storage
          const response = await fetch(selectedImageEdit.uri);
          const blob = await response.blob();
          const newStorageRef = ref(
            storage,
            `Images/${selectedCategory}/${editedFields.Name}`
          );
          await uploadBytes(newStorageRef, blob);

          // Update the image path in the editedFields object
          editedFields.ImagePath = `Images/${selectedCategory}/${editedFields.Name}`;
        }

        // Update the fields that have been edited
        const updatedFields = {
          Name: editedFields.Name,
          Description: editedFields.Description,
          Price: editedFields.Price,
          isActive: editedFields.isActive,
          id: editedFields.id,
          Priority: editedFields.Priority,
          ImagePath: editedFields.ImagePath || selectedItem.ImagePath,
        };

        await updateDoc(doc(foodRef, docId), updatedFields);

        setSuccessMessage("Food item updated successfully");
        setErrorMessage(null);
      } else {
        setErrorMessage("Food item not found");
        setSuccessMessage(null);
      }
      await fetchFoodItems(selectedCategory);
    } catch (error) {
      console.log("Error saving food item:", error);
      setErrorMessage("Error saving food item. Please try again.");
      setSuccessMessage(null);
    } finally {
      setisSaving(false);
      setIsEditing(false);
      setEditedFields({
        Name: "",
        Description: "",
        Price: "",
        isActive: true,
        ImagePath: "",
        Priority: 1,
        id: 0,
      });
      setselectedImageEdit(null);
      console.log(editedFields);
      // setSuccessMessage(null);
    }
  };







  const handleCancel = () => {
    // Clear the edited fields
    setEditedFields({
      Name: "",
      Description: "",
      Price: "",
      isActive: true,
      ImagePath: "",
      Priority: 1,
      id: 0,
    });

    setSelectedItem(null);
    setSelectedImage(null);
    setselectedImageEdit(null);
    setIsEditing(false);
    // setEditedFields()
    setIsImageVisible(false);

    console.log("editfield: ", editedFields);
    console.log("selectedImage: ", selectedImage);
    console.log("selectedImageEdit: ", selectedImageEdit);
    console.log("selectedItem: ", selectedItem);
    console.log("isEditing: ", isEditing);
    console.log("IsImageVisible: ", isImageVisible);

  };

  const handleChangeField = (fieldName, value) => {
    setEditedFields((prevFields) => ({
      ...prevFields,
      [fieldName]: value,
    }));
    // console.log("Handle change: ", editedFields);

  };
  // const [isActive, setIsActive] = useState(false);
  const handleSetActive = () => {
    // setIsActive(true);
    handleChangeField('isActive', true);
  };

  const handleSetInactive = () => {
    // setIsActive(false);
    handleChangeField('isActive', false);
  };

  const handlePickImage = async () => {
    try {


      const result = await PickImage("editing"); // Wait for the image selection
      if (!result.cancelled && result) {
        setselectedImageEdit({ uri: result.uri });
        setIsImageVisible(true);
      }
    } catch (error) {
      console.log("Error selecting image: ", error);
      alert("Failed to select image.");
    }
  };
  const toggleImage = async () => {
    if (isImageVisible) {
      setIsImageVisible(false);
    } else {
      await handlePickImage();
      setIsImageVisible(true);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.adminText}>Admin</Text>
      </View>

      <View style={styles.tabButtons}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'uploadFood' && styles.activeTabButtonTop]}
          onPress={() => setActiveTab('uploadFood')}
        >
          <Text style={styles.tabButtonText}>Upload Food Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'activeFoodItems' && styles.activeTabButtonTop]}
          onPress={() => { setActiveTab('activeFoodItems'); fetchFoodItems(); }}
        >
          <Text style={styles.tabButtonText}>Food Items</Text>
        </TouchableOpacity>
      </View>

      {/* Render content based on active tab */}
      {activeTab === 'uploadFood' ? (
        <ScrollView style={styles.content}>
          <TouchableOpacity style={styles.uploadImageContainer} onPress={() => { PickImage(null) }}>
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
            keyboardType='numeric'
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

          {/* IsActive selection */}
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

          {/* Category selection */}
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

          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
          <TouchableOpacity
            style={[styles.uploadButton, !isFormFilled || isUploading ? styles.disabledButton : null]}
            onPress={handleUploadFoodItem}
            disabled={!isFormFilled || isUploading}
          >
            <Text style={styles.uploadButtonText}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      ) : (
        <ScrollView style={styles.content}>

          {/* Render active food items */}
          <View>
            {/* Category buttons */}
            <View style={styles.categoryBar}>
              {/* Category buttons */}
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === 'KFC' ? styles.selectedCategoryButton : null,
                ]}
                onPress={() => setSelectedCategory('KFC')}
              >
                <Text style={styles.categoryButtonText}>KFC</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === 'McDonalds' ? styles.selectedCategoryButton : null,
                ]}
                onPress={() => setSelectedCategory('McDonalds')}
              >
                <Text style={styles.categoryButtonText}>McDonalds</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === 'DD' ? styles.selectedCategoryButton : null,
                ]}
                onPress={() => setSelectedCategory('DD')}
              >
                <Text style={styles.categoryButtonText}>DD</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === 'Layers' ? styles.selectedCategoryButton : null,
                ]}
                onPress={() => setSelectedCategory('Layers')}
              >
                <Text style={styles.categoryButtonText}>Layers</Text>
              </TouchableOpacity>
              {/* Add more category buttons as needed */}
            </View>

            {isLoading ? (
              <Text>Loading...</Text>
            ) : (

              <>
                {FoodItems.length === 0 ? (
                  <Text>No items</Text>
                ) : (

                  <ScrollView style={styles.content}>
                    {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
                    {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}

                    {FoodItems
                      .sort((a, b) => b.Priority - a.Priority)
                      .map((FoodItem) => (
                        <View key={FoodItem.Name} style={styles.foodItemContainer}>

                          {/* Render food item details */}
                          {isEditing && selectedItem && (
                            <Modal visible={isEditing} animationType="slide" transparent={true} style={styles.EDITFIContainer}>
                              <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : null}>
                                <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">

                                  <TouchableOpacity onPress={toggleImage} disabled={isSaving}>
                                    {!isImageVisible ? (
                                      <Image
                                        source={{ uri: editedFields.ImagePath }}
                                        style={styles.foodItemImage}
                                      />
                                    ) : (
                                      <Image
                                        source={{ uri: selectedImageEdit?.uri || editedFields.ImagePath }}
                                        style={styles.foodItemImage}
                                      />
                                    )}
                                  </TouchableOpacity>


                                  <Text style={styles.modalTitle}>Edit Food Item</Text>

                                  <Text style={styles.label}>Name:</Text>
                                  <TextInput
                                    style={styles.input}
                                    placeholder="Food Name"
                                    onChangeText={(text) => handleChangeField('Name', text)}
                                    value={editedFields.Name}
                                    disabled={isSaving}
                                  />

                                  <Text style={styles.label}>Price:</Text>
                                  <TextInput
                                    style={styles.input}
                                    placeholder="Price"
                                    onChangeText={(text) => handleChangeField('Price', text)}
                                    value={editedFields.Price}
                                    keyboardType="numeric"
                                    disabled={isSaving}
                                  />

                                  <Text style={styles.label}>ID:</Text>
                                  <TextInput
                                    disabled={isSaving}
                                    style={styles.input}
                                    placeholder="ID"
                                    onChangeText={(text) => handleChangeField('id', text)}
                                    value={editedFields.id}
                                    keyboardType="numeric"
                                  />

                                  <Text style={styles.label}>Discription:</Text>
                                  <TextInput
                                    disabled={isSaving}
                                    style={styles.input}
                                    placeholder="Description"
                                    onChangeText={(text) => handleChangeField('Description', text)}
                                    value={editedFields.Description}
                                  />

                                  <Text style={styles.label}>Priority:</Text>
                                  <TextInput
                                    disabled={isSaving}
                                    style={styles.input}
                                    placeholder="Priority"
                                    onChangeText={(text) => handleChangeField('Priority', text)}
                                    value={editedFields.Priority.toString()}
                                    keyboardType="numeric"
                                  />

                                  <Text style={styles.label}>isActive Status:</Text>
                                  <View style={styles.container} disabled={isSaving}>
                                    <View style={styles.buttonContainer}>
                                      <TouchableOpacity
                                        style={[styles.button, editedFields.isActive ? styles.activeButton : null]}
                                        onPress={handleSetActive}
                                      >
                                        <Text style={[styles.buttonText, editedFields.isActive ? styles.activeButtonText : null]}>Active</Text>
                                      </TouchableOpacity>

                                      <TouchableOpacity
                                        style={[styles.button, !editedFields.isActive ? styles.activeButton : null]}
                                        onPress={handleSetInactive}
                                      >
                                        <Text style={[styles.buttonText, !editedFields.isActive ? styles.activeButtonText : null]}>Inactive</Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>


                                  <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
                                    {isSaving ?
                                      (
                                        <Text style={styles.saveButtonText}>Saving...</Text>
                                      ) : (
                                        <Text style={styles.saveButtonText}>Save</Text>
                                      )}
                                  </TouchableOpacity>

                                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                  </TouchableOpacity>

                                </ScrollView>
                              </KeyboardAvoidingView>
                            </Modal>

                          )}
                          {!isEditing && (
                            <View>
                              {FoodItem.ImagePath ? (
                                <Image source={{ uri: FoodItem.ImagePath }} style={styles.foodItemImage} />
                              ) : (
                                <View style={styles.emptyFoodItemImage}>
                                  <Text style={styles.emptyFoodItemImageText}>No Image</Text>
                                </View>
                              )}
                              <View style={styles.foodItemDetailsContainer}>
                                <View style={styles.foodItemRow}>
                                  {/* <Text >Name:</Text> */}
                                  <Text style={styles.foodItemName}>{FoodItem.Name}</Text>
                                  <Text >RS: </Text>
                                  <Text style={styles.foodItemPrice}>{FoodItem.Price}/-</Text>
                                </View>
                                <Text style={styles.foodItemDescription}>{FoodItem.Description}</Text>
                                <View style={styles.foodItemRow}>
                                  <Text>ID: </Text>
                                  <Text style={styles.foodItemId}> {FoodItem.id}</Text>
                                  <Text >Priority: </Text>
                                  <Text style={styles.foodItemPriority}>{FoodItem.Priority}</Text>
                                </View>
                                <View style={styles.foodItemRow}>
                                  <Text >Status: </Text>
                                  <Text style={styles.foodItemIsActive}>{FoodItem.isActive ? 'Active' : 'InActive'}</Text>
                                  <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(FoodItem)}>
                                    <Text style={styles.editButtonText}>Edit</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteFooditem(FoodItem.Name)}
                                    disabled={isDeleting} // Disable the delete button when isDeleting is true
                                  >
                                    <Text style={styles.deleteButtonText}>
                                      {isDeleting && FoodItem.Name === selectedDeleteFoodItemName
                                        ? "Deleting..."
                                        : "Delete"}
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          )}

                        </View>

                      ))}
                  </ScrollView>

                )}
              </>
            )}

          </View>

        </ScrollView >

      )}

      <View style={styles.bottomBar}>

        <TouchableOpacity
          style={[
            styles.bottomBarButton,
            activeTab === 'ordered-Food' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('ordered-Food')}
        >
          <Text style={styles.bottomBarButtonText}>Ordered Food</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.bottomBarButton,
            activeTab === 'Order-details' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('Order-details')}
        >
          <Text style={styles.bottomBarButtonText}>Orders Details</Text>
        </TouchableOpacity>
      </View>

    </View >
  );
};

const styles = StyleSheet.create({
  EDITFIContainer: {
    borderWidth: 2,
    borderColor: "red",
    width: "100%",
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: 'lightgray',
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  activeButtonText: {
    color: 'white',
  },




  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
  },
  categoryButton: {
    padding: 10,
    borderRadius: 5,
  },
  selectedCategoryButton: {
    backgroundColor: 'lightblue',
  },
  categoryButtonText: {
    color: '#000',
  },


  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: "center",
  },

  saveButton: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },




  foodItemLabel: {
    // fontWeight: 'bold',
    // fontSize: 12,
    // marginBottom: 5,
  },
  foodItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    // marginTop:10,

    borderWidth: 2,
    borderColor: "lightgrey",
    borderRadius: 4,

  },

  foodItemDetailsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    // borderRadius:20,
  },
  foodItemImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    marginBottom: 10,

  },
  emptyFoodItemImage: {
    borderRadius: 20,
    borderWidth: 20,
    borderColor: "black",
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyFoodItemImageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  foodItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  foodItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  foodItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  foodItemDescription: {
    fontSize: 16,
    marginBottom: 5,
  },
  foodItemId: {
    fontSize: 16,
    flex: 1,
    fontWeight: 'bold',
    marginRight: 10,
  },
  foodItemPriority: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodItemIsActive: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'blue',
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },


  content: {
    flex: 1,
    width: '100%',
  },






  container: {
    flex: 1,
    // paddingTop:25,

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
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
  },
  modalContainer: {
    paddingTop: 40,
    // flex:1,
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    // borderWidth:20,
    height: "100%",
    // width:"100%",
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    borderColor: "green",
    borderWidth: 2,
    // width: 400,
  },

  signOutButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
  },
  adminText: {
    fontSize: 18,
    fontWeight: 'bold',
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
    borderBottomWidth: 1,
    // borderBottomColor: 'blue',// Add a blue line under the top bar
  },

  tabButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -1, // Adjust the margin to bring the tabs up
    zIndex: 2,// Overlap the bottom bar
    marginBottom: 5,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  activeTabButtonTop: {
    borderBottomWidth: 2,
    borderBottomColor: 'blue',
  },
  activeTabButton: {
    borderTopWidth: 2,
    borderTopColor: 'blue',
  },
  tabButtonText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f6f6f6',
  },
  successMessage: {
    color: 'green',
    fontSize: 16,
    marginTop: 10,
  },
  uploadImageContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 5,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  uploadButton: {
    backgroundColor: 'blue',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  bottomBarButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: '#ccc',
  },
  bottomBarButtonText: {
    fontSize: 16,
  },
});




export default AdminScreen;
