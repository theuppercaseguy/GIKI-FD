import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseauth';

const PendingDetails = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchPendingOrders();
    }, []);

    const fetchPendingOrders = async () => {
        setIsLoading(true);
        try {
            const ordersQuery = query(collection(db, 'Orders'));
            const querySnapshot = await getDocs(ordersQuery);
            const allOrdersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            // Sort orders based on isConfirmed value: pending > confirmed > delivered
            const pendingOrdersData = allOrdersData.filter(order => order.isConfirmed === 'pending');
            const confirmedOrdersData = allOrdersData.filter(order => order.isConfirmed === 'confirmed');
            const deliveredOrdersData = allOrdersData.filter(order => order.isConfirmed === 'delivered');

            const sortedOrdersData = [...pendingOrdersData, ...confirmedOrdersData, ...deliveredOrdersData];

            setPendingOrders(sortedOrdersData);
            setIsLoading(false);
            // console.log("3", pendingOrders);
        } catch (error) {
            console.error('Error fetching pending orders:', error);
            setIsLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const orderRef = doc(db, 'Orders', orderId);
            await updateDoc(orderRef, { isConfirmed: newStatus });
            fetchPendingOrders(); // Refresh the list after updating the status
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const deleteOrder = async (orderId) => {
        try {
            const orderRef = doc(db, 'Orders', orderId);
            await deleteDoc(orderRef);
            fetchPendingOrders(); // Refresh the list after deleting the order
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    const renderOrderItem = (order, index) => {
        const { Time, Name, PhoneNumber, FoodItems, isConfirmed, TotalPrice } = order;
        // console.log("ssdf",Time, Name, PhoneNumber, FoodItems, isConfirmed,order.id );

        const updateStatus = async () => {
            try {
                let newStatus;
                setIsProcessing(true); // Set isProcessing to true when the button is pressed

                if (isConfirmed === 'pending') {
                    newStatus = 'confirmed';
                } else if (isConfirmed === 'confirmed') {
                    newStatus = 'delivered';
                }

                // console.log('status: ', newStatus);
                await updateOrderStatus(order.id, newStatus);

                // Refresh the list after updating the status
                fetchPendingOrders();
            } catch (error) {
                console.error('Error updating order status:', error);
            } finally {
                setIsProcessing(false); // Set isProcessing back to false after processing is complete
            }
        };
        console.log("asdf: ", Time, Name, PhoneNumber, isConfirmed, order.id);

        const renderStatusButton = () => {
            if (isConfirmed === 'pending') {
                return (
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={updateStatus}
                        disabled={isProcessing} //
                    >
                        <Text style={styles.buttonText} >
                            {isProcessing ? 'Processing...' : 'Confirm Order?'}
                        </Text>
                    </TouchableOpacity>
                );
            } else if (isConfirmed === 'confirmed') {
                return (
                    <TouchableOpacity
                        style={styles.buttonTextisDelivere}
                        onPress={updateStatus}
                        disabled={isProcessing}
                    >
                        <Text style={styles.buttonText}>
                            {isProcessing ? 'Processing...' : 'Order Delivered?'}
                        </Text>
                    </TouchableOpacity>
                );
            } else {
                return null;
            }
        };

        const renderDeleteButton = () => {
            if (isConfirmed === 'delivered') {
                return (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteOrder(order.id)}
                        disabled={isProcessing}
                    >
                        <Text style={styles.buttonText}>
                            {isProcessing ? 'Processing...' : 'Delete order!'}
                        </Text>
                    </TouchableOpacity>
                );
            } else {
                return null;
            }
        };

        return (
            <View key={Name} style={styles.orderContainer}>

                <View style={styles.rowContainer}>
                    <Text style={styles.orderNo}>Order No: {index + 1}</Text>
                    <Text>
                        {Time.toDate().toLocaleDateString()} {'\n'}
                        {Time.toDate().toLocaleTimeString()}
                    </Text>
                </View>

                <View style={styles.rowContainer}>
                    <Text>Name:{'\n'}{Name}</Text>
                    <Text>Contact:{'\n'} {PhoneNumber}</Text>
                </View>

                <View style={styles.foodItemsContainer}>
                    {FoodItems.map((foodItem, index) => (
                        <View key={`${foodItem.name}-${index}`} style={styles.foodItem}>
                            <Text>{index + 1}. {foodItem.name} x {foodItem.amount}</Text>
                            <Text>Price: {foodItem.price}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.rowContainer}>
                    {renderStatusButton()}
                    {renderDeleteButton()}
                    <View style={styles.totalPriceContainer}>
                        <Text style={styles.totalPriceLabel}>Total Price:</Text>
                        <Text style={styles.totalPriceValue}>Rs: {TotalPrice}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Pending Orders</Text>
            {isLoading ? (
                <Text>Fetching Orders...</Text>
            ) : (
                pendingOrders.length === 0 ? (
                    <Text>No Orders have been Placed Yet...</Text>
                ) : null
            )}


            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    {pendingOrders.map((order, index) => renderOrderItem(order, index))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        // backgroundColor: '#FFFFFF',
        padding: 10,
        // borderWidth: 1,
        // borderColor: "red",
        marginBottom: 150, // Adjust the marginBottom to leave space for the bottom bar
        // paddingBottom: 150, // Adjust the marginBottom to leave space for the bottom bar

    },
    scrollView: {
        // flex: 1,
    },
    foodItemsContainer: {
        marginBottom: 10,
    },
    foodItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    orderContainer: {
        marginBottom: 16,
        borderColor: '#CCCCCC',
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: "space-between",
        marginBottom: 8,
    },
    totalPriceContainer: {
        // flexDirection: 'row',
        alignItems: 'center',
    },
    totalPriceLabel: {
        fontWeight: 'bold',
        marginRight: 5,
    },
    totalPriceValue: {
        fontWeight: 'bold',
        color: 'green',
    },
    orderNo: {
        fontWeight: 'bold',
    },
    foodItemContainer: {
        marginBottom: 8,
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    deleteButton: {
        backgroundColor: '#FF0000',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    buttonTextisDelivere:{
        backgroundColor: 'grey',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 8, 
    }
});
export default PendingDetails;
