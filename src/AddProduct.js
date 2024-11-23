import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Import the Firestore instance
import './AddProduct.css'; // External CSS for styling

function AddProduct() {
  // State for the Add Product form
  const [productID, setProductID] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productCategory, setProductCategory] = useState('');

  // Add Product to Firestore with manual Product ID as Document ID
  const addProduct = async (e) => {
    e.preventDefault();
    try {
      const productRef = doc(db, 'products', productID);

      await setDoc(productRef, {
        product_id: productID,
        product_name: productName,
        price: parseFloat(productPrice),
        stock: parseInt(productStock),
        category: productCategory,
        created_at: new Date(),
      });

      alert(`Product added successfully with ID: ${productID}`);
      // Reset form fields
      setProductID('');
      setProductName('');
      setProductPrice('');
      setProductStock('');
      setProductCategory('');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product.');
    }
  };

  return (
    <div className="add-product-container">
      <header className="header">
        <h1>RA-MÓDA</h1>
        <p className="subtitle">Your Fashion, Our Passion</p>
      </header>
      <div className="form-container">
        <h2>Add New Product</h2>
        <form onSubmit={addProduct} className="product-form">
          <label>Product ID (Custom ID):</label>
          <input
            type="text"
            value={productID}
            onChange={(e) => setProductID(e.target.value)}
            required
          />
          <br />
          <label>Product Name:</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
          <br />
          <label>Price:</label>
          <input
            type="number"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            required
          />
          <br />
          <label>Stock Quantity:</label>
          <input
            type="number"
            value={productStock}
            onChange={(e) => setProductStock(e.target.value)}
            required
          />
          <br />
          <label>Category:</label>
          <input
            type="text"
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            required
          />
          <br />
          <button type="submit" className="submit-btn">Add Product</button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
