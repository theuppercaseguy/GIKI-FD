import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebaseauth';

const ViewOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const { displayName } = currentUser;
        try {
          const ordersQuery = query(
            collection(db, 'orders'),
            where('userName', '==', displayName)
          );
          const querySnapshot = await getDocs(ordersQuery);
          const ordersData = querySnapshot.docs.map((doc) => doc.data());
          setOrders(ordersData);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      }
    };

    fetchOrders();
  }, []);

  const handleLogout = () => {
    // Implement your logout logic here
  };

  const handleGoToCart = () => {
    // Navigate to the cart screen
    navigation.navigate('Cart');
  };

  const handleGoToMenu = () => {
    // Navigate to the menu screen
    navigation.navigate('Menu');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Placed Orders</Text>
        <Button title="Sign Out" styles={styles.Buttons} onPress={handleLogout} color="#0782F9" />
      </View>

      <ScrollView style={styles.ordersContainer}>
        {orders.map((order) => (
          <View key={order.orderId} style={styles.orderItem}>
            <Text>Order ID: {order.orderId}</Text>
            {order.foodItems.map((foodItem) => (
              <View key={foodItem.itemId}>
                <Text>Name: {foodItem.name}</Text>
                <Text>Amount: {foodItem.amount}</Text>
                <Text>Total Price: {foodItem.totalPrice}</Text>
                <Button
                  title={foodItem.confirmed ? 'Confirmed' : 'Confirm'}
                  onPress={() => handleConfirmOrder(order.orderId, foodItem.itemId)}
                  disabled={foodItem.confirmed}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button styles={styles.Buttons} title="Go to Cart" onPress={handleGoToCart} color="#999999" />
        <Button styles={styles.Buttons} title="Go to Menu" onPress={handleGoToMenu} color="#999999" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  topBar: {
    paddingTop:35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  ordersContainer: {
    flex: 1,
    padding: 16,
  },
  orderItem: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    padding: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    padding: 16,
  },
});

export default ViewOrdersScreen;
