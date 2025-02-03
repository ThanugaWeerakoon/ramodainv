import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, writeBatch, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './Checkout.css';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};



function Checkout() {
  const [checkoutProductId, setCheckoutProductId] = useState(''); 
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [productDetails, setProductDetails] = useState(null);
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  

  // Fetch product details based on productId
  const fetchProductDetails = async (productId) => {
    if (!productId) return;

    const productRef = doc(db, 'products', productId);
    try {
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        setProductDetails(productSnap.data());
      } else {
        alert('Product not found.');
        setProductDetails(null);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to fetch product details.');
    }
  };

  

 
  const searchProducts = async (searchTerm) => {
    if (searchTerm.length === 0) {
      setProductSuggestions([]);
      return;
    }

    setLoading(true);

    const productsRef = collection(db, 'products');
    
    
    const q = query(
      productsRef,
      where('product_id', '>=', searchTerm),
      where('product_id', '<=', searchTerm + '\uf8ff')
    );

    try {
      const querySnapshot = await getDocs(q);
      const suggestions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().product_name
      }));

      
      if (suggestions.length === 0) {
        const nameQuery = query(
          productsRef,
          where('product_name', '>=', searchTerm),
          where('product_name', '<=', searchTerm + '\uf8ff')
        );
        
        const nameQuerySnapshot = await getDocs(nameQuery);
        const nameSuggestions = nameQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().product_name
        }));

        setProductSuggestions(nameSuggestions);
      } else {
        setProductSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      alert('Failed to search products.');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useRef(debounce(searchProducts, 300)).current;

 
  const addToCart = () => {
    if (!productDetails) return;

    const productInCart = {
      id: productDetails.product_id,
      name: productDetails.product_name,
      price: productDetails.price,
      quantity: checkoutQuantity,
      total: productDetails.price * checkoutQuantity,
    };

    setCart([...cart, productInCart]);
    setCheckoutQuantity(1);
    setProductDetails(null);
    setCheckoutProductId('');
  };

  
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  
  useEffect(() => {
    const newTotal = cart.reduce((acc, item) => acc + item.total, 0);
    setTotalPrice(newTotal);
  }, [cart]);

 
  const processCheckout = async (e) => {
    e.preventDefault();

    const batch = writeBatch(db);
    let allProductsInStock = true;

    for (const item of cart) {
      const productRef = doc(db, 'products', item.id);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const productData = productSnap.data();
        if (productData.stock < item.quantity) {
          allProductsInStock = false;
          alert(`Not enough stock for ${item.name}.`);
          break;
        }
      } else {
        allProductsInStock = false;
        alert('One of the products in the cart no longer exists.');
        break;
      }
    }

    if (!allProductsInStock) return;

    for (const item of cart) {
      const productRef = doc(db, 'products', item.id);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const productData = productSnap.data();
        const newStock = productData.stock - item.quantity;
        batch.update(productRef, { stock: newStock });

        const salesRef = collection(db, 'sales');
        batch.set(doc(salesRef), {
          product_id: item.id,
          quantity: item.quantity,
          sale_price: item.price,
          total_price: item.total,
          timestamp: new Date(),
        });
      }
    }

    await batch.commit();
    alert('Sale processed and stock updated!');

// Generate invoice number before printing
const newInvoiceNumber = `INV-${Date.now()}`;
setInvoiceNumber(newInvoiceNumber);

// Wait for state update before printing
setTimeout(() => {
  printBill();

  // Clear the cart and total after printing
  setCart([]);
  setTotalPrice(0);
}, 100); // Small delay to ensure state updates
   
  };

  // Print the bill
  const printBill = () => {
    const printContent = document.getElementById('printable-bill').innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent; // Restore the original content
  };

  return (
    <div className="checkout-container">
      <h2>Process Checkout</h2>

      <div className="product-search-section">
        <label>Product ID or Name:</label>
        <input
          type="text"
          value={checkoutProductId}
          onChange={(e) => {
            const searchTerm = e.target.value.toUpperCase(); // Convert input to uppercase
            setCheckoutProductId(searchTerm);
            debouncedSearch(searchTerm); // Trigger the debounced search
          }}
        />

        {productSuggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {productSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="suggestion-item"
                onClick={() => {
                  setCheckoutProductId(suggestion.id);
                  fetchProductDetails(suggestion.id);
                  setProductSuggestions([]);
                }}
              >
                {suggestion.name} ({suggestion.id})
              </div>
            ))}
          </div>
        )}

        {productDetails && (
          <div className="product-details">
            <h3>Product Details</h3>
            <p><strong>Name:</strong> {productDetails.product_name}</p>
            <p><strong>Price:</strong> Rs{productDetails.price}</p>
            <p><strong>Stock:</strong> {productDetails.stock}</p>
            <label>Quantity:</label>
            <input
              type="number"
              value={checkoutQuantity}
              onChange={(e) => setCheckoutQuantity(parseInt(e.target.value, 10))}
              min="1"
              max={productDetails.stock}
            />
            <button onClick={addToCart}>Add to Cart</button>
          </div>
        )}
      </div>

      <div className="cart-section">
        <h3>Cart</h3>
        {cart.length === 0 ? (
          <p>No items in cart</p>
        ) : (
          <div>
            <ul className="cart-items-list">
              {cart.map((item, index) => (
                <li key={index} className="cart-item">
                  <strong>{item.name}</strong> (x{item.quantity}) - Rs{item.total.toFixed(2)}
                  <button onClick={() => removeFromCart(item.id)} className="remove-btn">Remove</button>
                </li>
              ))}
            </ul>
            <p className="total-price"><strong>Total Price: </strong>Rs{totalPrice.toFixed(2)}</p>
          </div>
        )}

        <button onClick={processCheckout} disabled={cart.length === 0} className="process-btn">
          Process Sale
        </button>
      </div>

      {loading && <div className="loading-spinner">Loading...</div>}

      <div id="printable-bill" style={{ display: 'none', fontFamily: 'Arial, sans-serif', maxWidth: '400px', margin: 'auto', padding: '20px', border: '1px solid #ddd', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)' }}>
  <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '10px' }}>
    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>RA-MÓDA</h1>
    <p style={{ fontSize: '14px', color: '#555' }}>Fashion Store | Contact: 076-608-2153</p>
  </div>

  <h2 style={{ textAlign: 'center', marginBottom: '5px' }}>Invoice</h2>
  <p style={{ textAlign: 'center', fontSize: '12px', color: '#888' }}>Thank You For Choosing Us!</p>

  <div style={{ marginBottom: '10px', fontSize: '14px' }}>
    <p><strong>Sale Date:</strong> {new Date().toLocaleDateString()}</p>
    <p><strong>Sale Time:</strong> {new Date().toLocaleTimeString()}</p>
    <p><strong>Invoice Number:</strong> {invoiceNumber}</p>
  </div>

  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
    <thead>
      <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #000' }}>
        <th style={{ textAlign: 'left', padding: '5px', marginLeft:'45px' }}>Item</th>
        <th style={{ textAlign: 'center', padding: '5px' }}>Qty</th>
        <th style={{ textAlign: 'right', padding: '15px' }}>Price</th>
      </tr>
    </thead>
    <tbody>
      {cart.map((item, index) => (
        <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
          <td style={{ padding: '5px' }}>{item.name}</td>
          <td style={{ textAlign: 'center', padding: '5px' }}>{item.quantity}</td>
          <td style={{ textAlign: 'right', padding: '15px' }}>Rs{item.total.toFixed(2)}</td>
        </tr>
      ))}
    </tbody>
  </table>

  <p style={{ textAlign: 'right', fontSize: '16px', fontWeight: 'bold' ,marginRight:'15px'}}>Total: Rs{totalPrice.toFixed(2)}</p>

  <p style={{ fontSize: '12px', textAlign: 'center', marginTop: '10px', color: '#666' }}>
    Returns or exchanges are accepted within <strong>7 days</strong> of purchase only.
  </p>
</div>

</div>
    
  );
}

export default Checkout;
