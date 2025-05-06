import React, { useEffect, useState, useCallback } from "react";
import Footer from "../../layout/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Navigation from "../../layout/Navigation";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import ValiderCommande from "./ValiderCommande";
import LoadingScreen from "../../layout/LoadingScreen"; // Import the LoadingScreen component
import { useSelector, useDispatch } from 'react-redux'; // Import useSelector and useDispatch to connect to Redux store
import { createSelector } from 'reselect';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Memoized selector to avoid unnecessary re-renders
const selectPanierState = (state) => state.panier;
// Add debug logs to ensure proper memoization of the selector
// Update the selector to use `ligneCommandes` instead of `items`
const selectPanierItems = createSelector(
  [selectPanierState],
  (panierState) => panierState?.panier || [] // Ensure the selector handles undefined state
);

const Panier = () => {
  const [IdUser, setIdUser] = useState();
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Initialize useDispatch

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');

    if (!storedId && !token) {
      console.warn('User is not authenticated. Using localStorage for cart data.');
      const localPanier = JSON.parse(localStorage.getItem('panier')) || [];
      setProduites([]); // Clear produits as they are not fetched locally
      dispatch({
        type: 'FETCH_PANIER_SUCCESS',
        payload: { ligneCommandes: localPanier, produits: [] },
      });
    } else if (storedId) {
      console.log('Stored User ID:', storedId); // Debugging user ID
      setIdUser(Number(storedId));
    }
  }, [dispatch]);

  // Fetch cart data from localStorage if not authenticated
  useEffect(() => {
    const fetchLocalPanier = () => {
        const localPanier = JSON.parse(localStorage.getItem("panier")) || [];
        setProduites([]); // Clear produits as they are not fetched locally
        dispatch({
            type: 'FETCH_PANIER_SUCCESS',
            payload: { ligneCommandes: localPanier, produits: [] },
        });
        setLoading(false); // Ensure loading is set to false after fetching local data
    };

    fetchLocalPanier();
}, [dispatch]);

  const panier = useSelector(selectPanierItems); // Use memoized selector
  const [produites, setProduites] = useState([]);
  const [error, setError] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  // Update the fetchPanier function to handle the `ligneCommandes` structure
  useEffect(() => {
    const fetchPanier = async () => {
      try {
        console.log('Fetching cart data for User ID:', IdUser); // Debugging API call
        const response = await fetch(
          `http://127.0.0.1:8000/api/ligne-commandes?userId=${IdUser}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log('Cart Data:', data); // Debugging API response
        setProduites(data.produites || []);
        dispatch({
          type: 'FETCH_PANIER_SUCCESS',
          payload: { ligneCommandes: data.ligneCommandes || [], produits: data.produites || [] },
        });
      } catch (error) {
        console.error("Error fetching panier data:", error);
        setError(error.message);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    if (IdUser) {
      fetchPanier();
    }
  }, [IdUser, dispatch]);

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/produits");
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }
        const data = await response.json();
        setProduites(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProduits(); // Ensure product details are fetched
  }, []);

  // Added debug logs to verify the cart data and user ID.
  useEffect(() => {
    console.log("Current cart data:", panier); // Debug log for cart data
    console.log("Current user ID:", IdUser); // Debug log for user ID
  }, [panier, IdUser]);

  useEffect(() => {
    console.log("Selector output (panier):", panier);
}, [panier]);

const getProduitDetails = (IdProduite) => {
  const produit = produites.find((produite) => produite.id === IdProduite);
  if (!produit) {
    console.warn(`Produit with ID ${IdProduite} not found.`);
    return { nom: "Produit inconnu", prix: 0, image: "default-image.png" }; // Fallback values
  }
  return produit;
};

  const calculateItemTotal = (item) => {
    const produit = getProduitDetails(item.id_produite);
    return produit ? produit.prix * item.quantité : 0;
  };

  const calculateCartTotal = () => {
    return panier.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const calculateTotalItems = useCallback(() => {
    return panier.reduce((total, item) => total + item.quantité, 0);
  }, [panier]);

  // Update Redux state after successful API calls
  const updateReduxState = (updatedCart) => {
    dispatch({
      type: 'UPDATE_PANIER',
      payload: updatedCart,
    });
  };

  // Modify updateQuantity to update Redux state
  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/ligne-commandes/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantité: newQuantity }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      const data = await response.json();
      console.log("Quantity updated successfully:", data);

      // Update Redux state
      const updatedCart = panier.map((item) =>
        item.id === itemId ? { ...item, quantité: newQuantity } : item
      );
      updateReduxState(updatedCart);

      // Update local storage
      localStorage.setItem("panier", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError(error.message);
    }
  };

  const handleIncrement = (itemId, currentQuantity) => {
    const newQuantity = currentQuantity + 1;
    updateQuantity(itemId, newQuantity);
    toast.success("Quantity increased!", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: { backgroundColor: "green", color: "white" },
    });
  };

  // Correct the toast.POSITION usage in handleDecrement
const handleDecrement = (itemId, currentQuantity) => {
  if (currentQuantity > 1) {
    const newQuantity = currentQuantity - 1;
    updateQuantity(itemId, newQuantity);
    toast.info("Le produit a été retiré du panier", {
      position: "top-right", // Corrected usage
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: { backgroundColor: "blue", color: "white" },
    });
  }
};

  // Modify DeleteProduitPanier to update Redux state
  const DeleteProduitPanier = async (id) => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce produit de votre panier ?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/ligne-commandes/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      // Update Redux state
      const updatedCart = panier.filter((item) => item.id !== id);
      updateReduxState(updatedCart);
    } catch (error) {
      console.error("Error deleting product:", error);
      setError(error.message);
    }
  };

  // Updated the handleCheckout function to store cart data in the frontend.
  const handleCheckout = async () => {
    const localPanier = JSON.parse(localStorage.getItem("panier")) || [];
    const token = localStorage.getItem("authToken");

    if (!token) {
        navigate("/Connecter");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/api/ligne-commandes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ligneCommandes: localPanier }),
        });

        if (!response.ok) {
            throw new Error("Failed to send cart data to the backend");
        }

        toast.success("Checkout successful!", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: { backgroundColor: "green", color: "white" },
        });

        localStorage.removeItem("panier");
        dispatch({ type: 'FETCH_PANIER_SUCCESS', payload: { ligneCommandes: [], produits: [] } });
    } catch (error) {
        console.error("Error during checkout:", error);
        toast.error("Checkout failed. Please try again.", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: { backgroundColor: "red", color: "white" },
        });
    }
};

  useEffect(() => {
    const interval = setInterval(() => {
      // Fetch updated cart data periodically
      const localPanier = JSON.parse(localStorage.getItem("panier")) || [];
      dispatch({
        type: "FETCH_PANIER_SUCCESS",
        payload: { ligneCommandes: localPanier, produits: [] },
      });
    }, 3000); // Update every 3 seconds
  
    return () => clearInterval(interval);
  }, [dispatch]);

  // Update the cart count dynamically in the navigation
  useEffect(() => {
    const updateCartCount = () => {
      const totalItems = calculateTotalItems();
      const cartCountElement = document.querySelector(".cart-count");
      if (cartCountElement) {
        cartCountElement.textContent = totalItems;
      }
    };

    updateCartCount();
  }, [panier, calculateTotalItems]); // Ensure cart count updates instantly

  if (loading) return <LoadingScreen />; // Add loading screen

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (false) { // Placeholder condition to avoid using 'showValidation'
    return (
      <ValiderCommande
        panierItems={panier
          .filter((item) => item.id_utilisateur === IdUser)
          .map((item) => {
            const produit = getProduitDetails(item.id_produite);
            return {
              ...item,
              produit: produit,
            };
          })}
      />
    );
  }

  // Removed filtering by id_utilisateur since the cart is managed on the frontend.
  const userPanierItems = panier; // Display all items in the cart

  return (
    <div>
      <Navigation />
      <h5 className="my-4 container">Panier</h5>

      <div className="d-flex container">
        {/* Tableau des produits */}
        <div className="product-table">
          <table className="table table-borderless custom-table">
            <thead>
              <tr>
                <th className="border-bottom-green">Produit</th>
                <th className="border-bottom-green">Prix</th>
                <th className="border-bottom-green">Quantité</th>
                <th className="border-bottom-green">Total</th>
                <th className="border-bottom-green"></th>
              </tr>
            </thead>
            <tbody>
              {userPanierItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <div className="alert alert-info">
                      Votre panier est vide.{" "}
                      <a href="/boutique">Commencez vos achats</a>
                    </div>
                  </td>
                </tr>
              ) : (
                userPanierItems.map((item) => {
                  const produit = getProduitDetails(item.id_produite);
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {produit ? (
                            <img
                              src={`http://127.0.0.1:8000/images/${produit.image}`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = require('../../Images/default-image.png');
                              }}
                              alt={produit.nom}
                              style={{ width: "50px", height: "50px", marginRight: "10px" }}
                            />
                          ) : (
                            <span>Image non disponible</span>
                          )}
                          {produit ? produit.nom : "Produit non trouvé"}
                        </div>
                      </td>
                      <td>{produit ? `${produit.prix} DH` : "N/A"}</td>
                      <td>
                        <button
                          className="btn btn-success quantity-btn"
                          onClick={() =>
                            handleDecrement(item.id, item.quantité)
                          }
                          disabled={item.quantité <= 1}
                        >
                          -
                        </button>
                        <span className="quantity-value">{item.quantité}</span>
                        <button
                          className="btn btn-success quantity-btn"
                          onClick={() =>
                            handleIncrement(item.id, item.quantité)
                          }
                        >
                          +
                        </button>
                      </td>
                      <td>{produit ? calculateItemTotal(item) : "N/A"} DH</td>
                      <td>
                        <button
                          onClick={() => DeleteProduitPanier(item.id)}
                          className="btn-delete"
                          title="Supprimer"
                          style={{ border: "none", background: "transparent", cursor: "pointer" }}
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="delete-icon"
                            style={{ color: "red" }}
                            size="lg"
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Résumé du panier - Seulement si le panier n'est pas vide */}
        {userPanierItems.length > 0 && (
          <div className="cart-summary">
            <table className="table table-borderless custom-table ms-5">
              <tbody>
                <tr>
                  <th className="border-bottom-green">Total Panier</th>
                </tr>
                <tr>
                  <td className="bold-text">
                    Total d'articles :{" "}
                    <span className="bold-text">{calculateCartTotal()}</span> DH
                  </td>
                </tr>
                <tr>
                  <td className="bold-text">
                    Nombre d'articles : {userPanierItems.length}
                  </td>
                </tr>
                <tr>
                <td>
                <div className="card-footer bg-white border-top">
                <button 
                  className="btn btn-success w-100 mb-2 checkout-button"
                  onClick={handleCheckout}
                >
                  <span className="checkout-icon">✔</span> Check Out
                </button>
                <a href="/boutique" className="btn btn-outline-secondary w-100">
                  Continuer vos achats
                </a>
              </div>
              </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suggestions de produits */}
      {userPanierItems.length > 0 && (
  <div className="produits-container my-4 container">
    <h5>D'autres suggestions pour vous</h5>
    <div className="produits-grid">
      {produites.slice(-8).map((produit) => (
        <div
          key={produit.id}
          className="produit-card"
          onMouseEnter={() => setHoveredProduct(produit.id)}
          onMouseLeave={() => setHoveredProduct(null)}
        >
          <div className="produit-image-container">
            <img
              src={`http://127.0.0.1:8000/images/${produit.image}`}
              onError={(e) => { e.target.onerror = null; e.target.src = require('../../Images/default-image.png'); }}
              alt={produit.nom}
              className="produit-image"
            />
            {hoveredProduct === produit.id && (
              <div className="bg-gray">
                <div className="cart-icon-overlay">
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    className="cart-icon"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="produit-details">
            <h3 className="produit-nom">{produit.nom}</h3>
            <p className="produit-prix">{produit.prix} DH</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      <Footer />
      <ToastContainer />
    </div>
  );
};

export default Panier;
