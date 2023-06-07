import React, { createContext, useState } from 'react';

// Create the CartContext
export const CartContext = createContext();

// Create the CartProvider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const clearCartItems = () => {
    setCartItems([]);
  };
  
  const updateCartItems = (newCartItems) => {
    setCartItems(newCartItems);
  };

  return (
    <CartContext.Provider value={{ cartItems, updateCartItems }}>
      {children}
    </CartContext.Provider>
  );
};
