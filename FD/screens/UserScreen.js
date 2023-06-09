import { useNavigation } from '@react-navigation/native';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { SafeAreaView, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Timestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth, fbauth, storage } from '../firebaseauth';
import { StatusBar } from 'expo-status-bar';
import { CartContext } from './CartContext';
import { getDownloadURL, ref } from 'firebase/storage';



const UserScreen = ({ route }) => {
  const navigation = useNavigation();
  const { cartItems, updateCartItems } = useContext(CartContext);

  const [selectedRestaurant, setSelectedRestaurant] = useState('KFC');
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [cartItems, setCartItems] = useState([]);

  const clearCartItems = () => {
    updateCartItems([]);
  };

  useEffect(() => {
    // Fetch food items based on the selected restaurant
    fetchFoodItems(selectedRestaurant);
  }, [selectedRestaurant]);

  const handleRestaurantSelection = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setFoodItems([]);
    await fetchFoodItems();
  };

  const handleGoToCart = () => {
    // Navigate to the cart screen
    navigation.navigate('CartScreen', { cartItems });
  };

  const handleAddToCart = (item) => {
    // Create a new object with the desired properties
    const newItem = {
      id: item.id,
      Name: item.Name,
      Price: item.Price,
      Category:selectedRestaurant,
    };
    console.log(selectedRestaurant);
    // Add the new item to the cart
    updateCartItems((prevCartItems) => [...prevCartItems, newItem]);
    console.log("Added to Cart:\n\n");
  };

  const handleSignOut = () => {

    fbauth
      .signOut(auth)
      .then(() => {
        console.log("user logged out");
        navigation.replace('LoginScreen');
      })
      .catch(error => alert(error.message));
    clearCartItems();
  };

  const fetchFoodItems = async (restaurant) => {
    try {
      setLoading(true);
      const foodItemsQuery = query(
        collection(db, restaurant),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(foodItemsQuery);

      const itemss = [];
      for (const doc of querySnapshot.docs) {
        const item = doc.data();
        const storageRef = ref(storage, `Images/${restaurant}/${item.Name}`);
        const downloadURL = await getDownloadURL(storageRef);
        item.ImagePath = downloadURL;

        itemss.push(item);
      }
      console.log("items: ", restaurant);
      console.log("items: ", itemss);

      setFoodItems(itemss);
      setLoading(false);

    } catch (error) {
      console.log('Error fetching food items:', error);
      setLoading(false);
    }
  };
  const handleViewOrders = () => {
    navigation.navigate('ViewOrdersScreen'); // Replace 'ViewOrders' with the actual screen name for your "View Orders" screen
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor='transparent' />

      <View style={styles.topBar}>
        <Text style={styles.menuTitle}>Menu</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.restaurantBar}>
        <TouchableOpacity
          style={[
            styles.restaurantButton,
            selectedRestaurant === 'KFC' && styles.selectedRestaurantButton,
          ]}
          onPress={() => handleRestaurantSelection('KFC')}
          disabled={selectedRestaurant === 'KFC'}
        >
          <Text style={styles.restaurantButtonText}>KFC</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.restaurantButton,
            selectedRestaurant === 'McDonalds' && styles.selectedRestaurantButton,
          ]}
          onPress={() => handleRestaurantSelection('McDonalds')}
          disabled={selectedRestaurant === 'McDonalds'}
        >
          <Text style={styles.restaurantButtonText}>McDonald's</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.restaurantButton,
            selectedRestaurant === 'DD' && styles.selectedRestaurantButton,
          ]}
          onPress={() => handleRestaurantSelection('DD')}
          disabled={selectedRestaurant === 'DD'}
        >
          <Text style={styles.restaurantButtonText}>DD</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.restaurantButton,
            selectedRestaurant === "Layer's" && styles.selectedRestaurantButton,
          ]}
          onPress={() => handleRestaurantSelection("Layers")}
          disabled={selectedRestaurant === "Layers"}
        >
          <Text style={styles.restaurantButtonText}>Layers</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>

        <View style={styles.foodItemsContainer}>
          {loading ? (
            <Text>Loading...</Text>
          ) : foodItems.length === 0 ? (
            <Text>No items yet</Text>
          ) : (
            foodItems
              .sort((a, b) => b.Priority - a.Priority)
              .map((item) => (
                <View key={item.id} style={styles.foodItem}>

                  <ImageBackground
                    source={{ uri: item.ImagePath }}
                    style={styles.foodImage}
                  >
                    <View style={styles.foodImageOverlay}></View>
                  </ImageBackground>
                  <View style={styles.foodItemInfo}>
                    <Text style={styles.foodItemName}>{item.Name}</Text>
                    <Text style={styles.foodItemPrice}>Rs: {item.Price}/-</Text>
                  </View>
                  <View style={styles.taxContainer}>
                    <Text style={styles.taxText}>Including TAX</Text>
                  </View>
                  <Text style={styles.foodItemDescription}>{item.Description}</Text>
                  <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => handleAddToCart(item)}
                  >
                    <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              ))
          )}
        </View>
      </ScrollView>


      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleViewOrders} style={styles.viewOrdersButton}>
          <Text style={styles.viewOrdersButtonText}>View Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartButton} onPress={handleGoToCart}>
          <Text style={styles.cartButtonText}>Go to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 25,
  },

  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 20,

  },
  restaurantBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    height: 50,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 50,
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  restaurantButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  selectedRestaurantButton: {
    backgroundColor: '#ccc',
  },
  restaurantButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodItemsContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 25,
  },
  foodItem: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  foodImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  foodItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  foodItemName: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  foodItemPrice: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taxContainer: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginRight: 10,
  },
  taxText: {
    fontSize: 12,
    fontFamily: 'Roboto',
  },
  foodItemDescription: {
    marginTop: 10,
    fontSize: 16,
  },
  addToCartButton: {
    backgroundColor: '#0782F9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },


  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2C3E50',
    borderTopRightRadius:5,
    borderTopRightRadius:5,

  },
  viewOrdersButton: {
    backgroundColor: '#999999',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  viewOrdersButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  cartButton: {
    backgroundColor: '#999999',
    padding: 10,
    borderRadius: 5,
  },
  cartButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: '#0782F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

});

export default UserScreen;
