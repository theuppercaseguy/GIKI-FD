import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseauth';

const OrderDetailsScreen = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const ordersQuery = query(collection(db, 'Orders'), where('isConfirmed', '==', 'confirmed'));
            const querySnapshot = await getDocs(ordersQuery);
            const ordersData = querySnapshot.docs.map((doc) => doc.data());
            setOrders(ordersData);
            // console.log("orders: ", orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
        console.log("orders", orders);
    };

    const renderFoodItemsByCategory = (category) => {
        let totalprice = 0;
        const filteredFoodItems = orders.reduce((acc, order) => {
            const foodItems = order.FoodItems.filter((item) => item.category === category);
            totalprice += foodItems.reduce((sum, item) => sum + item.price * item.amount, 0);
            return [...acc, ...foodItems];
        }, []);
        console.log("filter: ", filteredFoodItems);

        return (
            <View key={category} style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>{category}</Text>

                {filteredFoodItems.map((item, index) => (

                    <View key={`${item.name}-${item.amount}`}>

                        {/* <Text style={styles.calcprice}>Calculate Price: {totalprice = Number(item.price) * Number(item.amount)}</Text> */}

                        <View style={styles.itemContainer}>
                            <Text>{index + 1}. {item.name} x {item.amount}</Text>
                            <Text>Price: {item.price}</Text>
                        </View>

                    </View>
                ))}
                <Text style={styles.TotalPrice}>Total Price: {totalprice}</Text>
            </View>
        );
    };

    return (
        // <Text style={styles.title}>Order Details</Text>

        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Order Details</Text>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {renderFoodItemsByCategory('KFC')}
                {renderFoodItemsByCategory('McDonalds')}
                {renderFoodItemsByCategory('Layers')}
                {renderFoodItemsByCategory('DD')}
            </ScrollView>

        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderWidth: 1,
        // borderColor: "red",
        marginBottom: 250, // Adjust the marginBottom to leave space for the bottom bar
        // paddingBottom: 150, // Adjust the marginBottom to leave space for the bottom bar

    },
    TotalPrice: {
        fontWeight: 'bold',
        marginRight: 5,
        fontWeight: 'bold',
        color: 'green',
    },
    scrollView: {
        // paddingBottom: 150, // Adjust the marginBottom to leave space for the bottom bar
        // flex: 1,
    },
    // calcprice: {
    //     display: "none",
    // },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: "center",
    },
    categoryContainer: {
        marginBottom: 20,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    orderContainer: {
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#CCCCCC',
    },
    itemContainer: {
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between"
    },
});

export default OrderDetailsScreen;
