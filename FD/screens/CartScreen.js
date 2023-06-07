import React, { useContext, useState, useEffect } from 'react';
import { SafeAreaView, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CartContext } from './CartContext';
import { fbauth,auth } from '../firebaseauth';

const CartScreen = ({ route, navigation }) => {
  const { cartItems, updateCartItems } = useContext(CartContext);
  const [cartItemsList, setCartItemsList] = useState([]);
  const [quantityMap, setQuantityMap] = useState({});

  const clearCartItems = () => {
    updateCartItems([]);
    setCartItemsList([]);
    setQuantityMap({});
  };

  useEffect(() => {
    // Remove duplicates from cartItems array
    const uniqueCartItems = Array.from(new Set(cartItems.map((item) => item.Name))).map((name) => {
      return cartItems.find((item) => item.Name === name);
    });

    setCartItemsList(uniqueCartItems);

    // Create quantity map
    const map = {};
    cartItems.forEach((item) => {
      if (map[item.Name]) {
        map[item.Name]++;
      } else {
        map[item.Name] = 1;
      }
    });

    setQuantityMap(map);
  }, [cartItems]);

  const handleRemoveItem = (itemId) => {
    const updatedCartItemsList = cartItems.filter((item) => item.id !== itemId);
    updateCartItems(updatedCartItemsList);
  };

  const renderCartItem = ({ item }) => {
    const quantity = quantityMap[item.Name];

    return (
      <View style={styles.cartItem}>
        <View>
          <Text style={styles.itemName}>{item.Name} x {quantity}</Text>
          <Text style={styles.itemPrice}>Rs: {item.Price}</Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const calculateTotalPrice = () => {
    let totalPrice = 0;

    cartItemsList.forEach((item) => {
      const itemPrice = parseFloat(item.Price);
      const itemQuantity = quantityMap[item.Name];
      totalPrice += itemPrice * itemQuantity;
    });

    return totalPrice.toFixed(2);
  };

  const handleConfirmOrder = () => {
    // Handle the logic for confirming the order
    // You can implement this based on your requirements
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

  const handleGoBack = () => {
    navigation.goBack({ cartItemsList });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      {cartItemsList.length > 0 ? (
        <FlatList
          data={cartItemsList}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.cartItemsContainer}
        />
      ) : (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>No orders yet</Text>
        </View>
      )}
      {cartItemsList.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.confirmOrderButton} onPress={handleConfirmOrder}>
            <Text style={styles.confirmOrderButtonText}>Confirm Order</Text>
          </TouchableOpacity>
          <Text style={styles.totalPriceText}>Total Price: Rs {calculateTotalPrice()}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 25,
    // marginBottom: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 50,
    width: '100%',
    backgroundColor: '#f5f5f5',
    marginBottom:20,
  },
  backButton: {
    backgroundColor: '#0782F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    backgroundColor: '#0782F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cartItemsContainer: {
    padding: 16,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: 'gray',
  },
  removeButton: {
    backgroundColor: 'red',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#eaeaea',
    borderTopWidth: 1,
    borderTopColor: 'gray',
  },
  confirmOrderButton: {
    backgroundColor: 'green',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  confirmOrderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  totalPriceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;
