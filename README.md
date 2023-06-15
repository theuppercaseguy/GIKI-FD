# GIKI-FD

Welcome to My App! This is a mobile application designed specifically for food delivery services at Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI), located in Pakistan. The app is built using React Native and Expo, providing a seamless and interactive user experience.

## Description

My App is a powerful mobile application designed to enhance the food delivery experience for students at GIKI. With its intuitive interface and robust functionality, users can easily order their favorite food items from various food joints like KFC, MCdonalds etc, track their orders, and enjoy a hassle-free dining experience right from their mobile devices.

## Overview

My App offers a comprehensive set of features to meet the needs of both customers and administrators. Here's an overview of how the app works:

### Customer Side

1. **Login Screen**: Upon launching the app, users are prompted to log in using their credentials. If they don't have an account, they can proceed to the registration screen.

2. **Registration Screen**: New users can create an account by providing the necessary information, including their name, email address, and password.

3. **Menu Screen**: Once logged in, customers are presented with a menu screen where they can browse and select their favorite food items from different food joints available on campus.

4. **Cart Screen**: Customers can review the items they have added to their cart, make modifications such as removing or adding more items, and proceed to place their order.

5. **Placed Orders Screen**: In this screen, customers can view the status of their orders. They can see if their order has been confirmed, track its progress, and view their order history. Customers also have the option to delete past orders.

<p float="left">
  <img src="/Demo-Pictures/login.jpg" width="250" />
  <img src="/Demo-Pictures/registration.jpg" width="250" /> 
  <img src="/Demo-Pictures/menu.jpg" width="250" /> 
  <img src="/Demo-Pictures/cart.jpg" width="250" /> 
  <img src="/Demo-Pictures/placedorders.jpg" width="250" /> 
</p>

### Admin Side

1. **Upload Food Item**: Admin users have access to an exclusive tab where they can add new food items to the database. This feature enables admins to keep the menu up to date.

2. **Food Items**: Admins can view all the food items available in the database. They can review the existing items and ensure the accuracy of the menu.

3. **Edit Food Item**: Admins have the authority to edit or update any food item in the database. This functionality allows them to make changes to item details such as price, description, or availability etc.

4. **Order Details**: Admins can access a comprehensive list of confirmed orders categorized by each food joint. This feature assists admins in managing inventory and coordinating with food joints to fulfill orders efficiently.

5. **Placed Orders**: Admins can view all placed orders, update their status to "Confirmed" and then to "delivered" if confirmed already , and delete orders from the system if required.

<p float="left">
  <img src="/Demo-Pictures/adminUploadFoodItem.jpg" width="250" />
  <img src="/Demo-Pictures/foodItems.jpg" width="250" /> 
  <img src="/Demo-Pictures/editFoodItem.jpg" width="250" /> 
  <img src="/Demo-Pictures/adminplacedorders.jpg" width="250" /> 
  <img src="/Demo-Pictures/orders.jpg" width="250" /> 

</p>

## Getting Started

To run the app locally, follow these steps:

1. Install Node.js (https://nodejs.org) if you haven't already.
2. Install Expo CLI globally by running `npm install -g expo-cli`.
3. Clone this repository and navigate to the project directory.
4. Change directories: `cd FD`.
5. Install dependencies by running `npm install`.
6. Start the app with `npx expo start`.
7. Use Expo Go (Android/iOS) or scan the QR code with the Expo app to open the app on your device.

## Dependencies

The app relies on the following dependencies (check `package.json` for the full list):
please make sure to view tha packages.json file, some of these dependencies may have been updated.

- "@react-native-picker/picker": "^2.4.10"
- "@react-navigation/core": "^6.4.8"
- "@react-navigation/native": "^6.1.6"
- "@react-navigation/native-stack": "^6.9.12"
- "expo": "^46.0.21"
- "expo-image-picker": "~13.3.1"
- "expo-status-bar": "~1.4.4"
- "firebase": "^9.22.1"
- "react": "^18.2.0"
- "react-google-drive-picker": "^1.2.2"
- "react-native": "^0.71.8"

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvement, please open an issue or submit a pull request.

## Testing

To test the admin side of the app, email me at `saadan06@gmail.com` with the subject: "Request for GIKI-FD admin privileges." If your email is already registered in the GIKI-FD database, you will be granted admin privileges.

## APK Conversion

i Havent been able or succesfull at converting this app into an apk file or an ios app file, so if anyones is able to, ill be much obliged.

## License

This project is licensed under the [MIT License](LICENSE).
