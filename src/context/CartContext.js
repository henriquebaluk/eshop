import React, { createContext, useState, useContext, useEffect } from "react";
import { db } from "../firebase";
import { doc, deleteDoc, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchCartItems = async () => {
      if (currentUser) {
        const q = query(collection(db, "carrinho"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
        setCartItems(items);
      }
    };
    fetchCartItems();
  }, [currentUser]);

  const addToCart = async (item) => {
    if (!currentUser) {
      alert("Você precisa estar logado para adicionar itens ao carrinho.");
      return;
    }

    const cartItem = { ...item, userId: currentUser.uid };
    const docRef = await addDoc(collection(db, "carrinho"), cartItem);
    setCartItems([...cartItems, { ...item, docId: docRef.id }]);
  };

  const removeFromCart = async (id) => {
    const itemToRemove = cartItems.find((item) => item.id === id);
    if (itemToRemove && itemToRemove.docId) {
      await deleteDoc(doc(db, "carrinho", itemToRemove.docId));
    }
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
