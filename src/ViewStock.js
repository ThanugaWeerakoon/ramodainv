import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Import the Firestore instance
import './ViewStock.css'; // External CSS for styling

function ViewStock() {
  // State to store products from Firestore
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the products from Firestore when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="view-stock-container">
      <header className="header">
        <h1>RA-MÓDA</h1>
        <p className="subtitle">Your Fashion, Our Passion</p>
      </header>
      <div className="stock-list-container">
        <h2>View Products in Stock</h2>
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <table className="product-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Stock Quantity</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.product_id}</td>
                  <td>{product.product_name}</td>
                  <td>Rs{product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>{product.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ViewStock;
