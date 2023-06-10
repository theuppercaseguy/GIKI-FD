import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { addDoc, collection, query, where, deleteDoc, Timestamp, getDocs } from 'firebase/firestore';
import { db, auth, fbauth, storage } from '../firebaseauth';

import { CartContext } from './CartContext';

const ViewOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fetchingOrders, setfetchingOrders] = useState(true);
  const [deleteMessage, setDeleteMessage] = useState('');
  const { cartItems, updateCartItems } = useContext(CartContext);

  const fetchOrders = async () => {
    setfetchingOrders(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      const { displayName, email } = currentUser;
      console.log(displayName, email);
      try {
        const ordersQuery = query(
          collection(db, 'Orders'),
          where('Email', '==', email)
        );
        const querySnapshot = await getDocs(ordersQuery);
        const ordersData = querySnapshot.docs.map((doc) => doc.data());

        console.log("orders data", ordersData);
        setOrders(ordersData);

        console.log("orders data", ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    }
    setfetchingOrders(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleLogout = () => {
    // Implement your logout logic here
    fbauth
      .signOut(auth)
      .then(() => {
        console.log("user logged out");
        navigation.replace('LoginScreen');
      })
      .catch(error => alert(error.message));
    updateCartItems([]);
  };

  const handleGoToCart = () => {
    // Navigate to the cart screen
    navigation.navigate('CartScreen');
  };

  const handleGoToMenu = () => {
    // Navigate to the menu screen
    navigation.navigate('UserScreen');
  };


  const handleDeleteOrder = (timestamp) => {
    setDeleteLoading(true);
    setDeleteMessage('Deleting...');

    // Get the document reference based on the conditions
    const ordersRef = collection(db, 'Orders');

    const queryRef = query(
      ordersRef,
      where('Name', '==', auth.currentUser.displayName),
      where('isConfirmed', '==', 'delivered'),
      where('Time', '==', timestamp)
    );

    getDocs(queryRef)
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;

          // Delete the document
          deleteDoc(docRef)
            .then(() => {
              setDeleteLoading(false);
              setDeleteMessage('Order deleted successfully');
              // Refresh the orders after deletion
              fetchOrders();
            })
            .catch((error) => {
              setDeleteLoading(false);
              setDeleteMessage('Error deleting order.');
              console.log('Error deleting order: ' + error.message);
            });
        } else {
          setDeleteLoading(false);
          setDeleteMessage('Order not found');
        }
      })
      .catch((error) => {
        setDeleteLoading(false);
        setDeleteMessage('Error retrieving order. ');
        console.log('Error retrieving order: ' + error.message);
      });
  };


  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Placed Orders</Text>
        <Button title="Sign Out" onPress={handleLogout} color="#0782F9" />
      </View>

      <View style={{ flex: 1 }}>
        {fetchingOrders ? (
          <Text style={styles.noOrdersContainer}>Fetching Placed Orders...</Text>
        ) :

          orders.length === 0 ? (
            <View style={styles.noOrdersContainer}>
              <Text style={styles.noOrdersText}>No orders have been placed yet.</Text>
            </View>
          ) : (
            <ScrollView style={styles.ordersContainer}>
              {deleteMessage ? <Text>{deleteMessage}</Text> : null}
              {orders.map((order, index) => {
                if (order.isConfirmed === "delivered") {
                  return (
                    <View key={order.Name} style={styles.orderItem}>
                      <View style={styles.orderheadingContainer}>
                        <Text style={styles.orderHeading}>Past Order # {(index - orders.length) * -1}</Text>
                        <Text style={styles.orderTimeContainer}>
                          {order.Time.toDate().toLocaleDateString()} {'\n '}{order.Time.toDate().toLocaleTimeString()}
                        </Text>
                      </View>
                      {order.FoodItems.map((foodItem, foodIndex) => (
                        <View key={foodItem.category} style={styles.foodItem}>
                          <Text style={styles.foodItemHeading}>Food Item # {foodIndex + 1}</Text>
                          <View style={styles.foodItemDetails}>
                            <Text>Name: {foodItem.name} x {foodItem.amount}</Text>
                            <Text style={styles.individualPrice}>Price: {foodItem.price}/-</Text>
                          </View>
                        </View>
                      ))}
                      <Button
                        title={deleteLoading ? 'Deleting...' : 'Delete'}
                        onPress={() => handleDeleteOrder(order.Time)}
                        // style={styles.deleteButton}
                        color={deleteLoading ? "#bf3a3a" : "#ff0000"}
                      />

                    </View>
                  );
                }

                return (
                  <View key={order.Name} style={styles.orderItem}>
                    <View style={styles.orderheadingContainer}>
                      <Text style={styles.orderHeading}>Order # {index + 1}</Text>
                      <View style={styles.orderTimeContainer}>
                        <Text style={styles.orderTimeText}>
                          {order.Time.toDate().toLocaleDateString()} {'\n '}
                          {order.Time.toDate().toLocaleTimeString()}
                        </Text>
                      </View>
                    </View>

                    {order.FoodItems.map((foodItem, foodIndex) => (
                      <View key={foodItem.category} style={styles.foodItem}>
                        <Text style={styles.foodItemHeading}>Food Item # {foodIndex + 1}</Text>
                        <View style={styles.foodItemDetails}>
                          <Text>Name: {foodItem.name} x {foodItem.amount}</Text>
                          <Text style={styles.individualPrice}>Price: {foodItem.price}/-</Text>
                        </View>
                      </View>
                    ))}
                    <View style={styles.orderSummary}>
                      <View style={styles.orderStatusContainer}>
                        <Text style={styles.orderStatusText}>Order Status: {order.isConfirmed}</Text>
                      </View>
                      <View style={styles.totalPriceContainer}>
                        <Text style={styles.totalPriceText}>Total Price: {order.TotalPrice}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )
        }

        <View style={styles.bottomBar}>
          <Button style={styles.Buttons} title="Go to Cart" onPress={handleGoToCart} color="#999999" />
          <Button style={styles.Buttons} title="Go to Menu" onPress={handleGoToMenu} color="#999999" />
        </View>
      </View>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    padding: 10,
  },
  orderTimeContainer: {
    alignItems: 'flex-end',
  },
  orderTimeText: {
    fontSize: 14,
    color: '#555555',
  },
  orderheadingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
  },
  foodItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  individualPrice: {
    marginLeft: 'auto',
  },
  orderHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    // textAlign: "center",
  },
  orderItem: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  foodItem: {
    marginBottom: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 5,
    padding: 5,
  },
  orderSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: "space-between",
  },
  orderStatusContainer: {
    backgroundColor: '#999999',
    padding: 5,
    marginRight: 10,
    borderRadius: 5,
  },
  orderStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalPriceContainer: {
    backgroundColor: '#999999',
    borderRadius: 5,
    padding: 5,
  },
  totalPriceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  topBar: {
    paddingTop: 35,
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
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    padding: 16,
    // position:"relative",
    // bottom:0,
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  noOrdersText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default ViewOrdersScreen;
