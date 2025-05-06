import { Link, useLocation, useNavigate } from "react-router-dom";
import tudert from "../Images/tudert.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faShoppingCart,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';

import { fetchUtilisateur } from "../redux/actions/utilisateursActions";
import defaultUserPic from "../Images/defaul-user.png";

import "./Navigation.css"; // Importing a new CSS file for styling

const Navigation = () => {
  const dispatch = useDispatch();
  const panier = useSelector((state) => state.panier.panier || []);
  const { utilisateurActuel } = useSelector((state) => state.utilisateurs);
  const [cartCount, setCartCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Update cart count whenever panier changes
  useEffect(() => {
    const count = panier.reduce((total, item) => total + (item.quantité || 0), 0);
    setCartCount(count);
  }, [panier]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      const localPanier = JSON.parse(localStorage.getItem("panier")) || [];
      const count = localPanier.reduce((total, item) => total + (item.quantité || 0), 0);
      setCartCount(count);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const id = localStorage.getItem("userId");
      dispatch(fetchUtilisateur(id));
    }
  }, [isAuthenticated, dispatch]);

  const handleLoginClick = () => {
    navigate("/Connecter");
  };

  const handleProfileClick = () => {
    setShowProfile((prevState) => !prevState);
    setShowEditProfile(false);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
    setShowEditProfile(false);
  };

  const handleReturnToMenu = () => {
    setShowEditProfile(false);
  };

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} updated to:`, value);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    navigate("/Connecter");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo-container">
          <img
            src={tudert}
            alt="Tudert logo"
            className="logo"
          />
        </div>

        <ul className="nav-links">
          <li className={`nav-item ${isActive("/")}`}>
            <Link to="/">Accueil</Link>
          </li>
          <li className={`nav-item ${isActive("/Boutique")}`}>
            <Link to="/Boutique">Boutique</Link>
          </li>
          <li className={`nav-item ${isActive("/Contact")}`}>
            <Link to="/Contact">Contact</Link>
          </li>
        </ul>

        <div className="nav-icons">
          <Link to="/search" aria-label="Search">
            <FontAwesomeIcon icon={faSearch} className="icon" />
          </Link>
          <Link to="/Panier" aria-label="Cart" className="icon-container">
            <FontAwesomeIcon icon={faShoppingCart} className="icon" />
            <span className="cart-count">{cartCount}</span>
          </Link>
          {isAuthenticated ? (
            <button
              className="icon-button"
              onClick={handleProfileClick}
            >
              <FontAwesomeIcon icon={faUser} className="icon" />
            </button>
          ) : (
            <button
              className="login-button"
              onClick={handleLoginClick}
            >
              Se Connecter
            </button>
          )}
        </div>
      </div>
      <div className={`popup-cart ${showProfile ? "visible" : ""}`} style={{ zIndex: 1000, display: showProfile ? "flex" : "none", flexDirection: "column", alignItems: "center", padding: "20px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", width: "350px", border: "1px solid #46A358", overflow: "hidden" }}>
        <div className="popup-header" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100px", height: "100px", borderRadius: "50%", border: "2px solid #46A358", marginBottom: "10px" }}>
            <img
              src={utilisateurActuel?.photo || defaultUserPic}
              alt="Profile"
              style={{ width: "80px", height: "80px", borderRadius: "50%" }}
            />
          </div>
          <button
            style={{ backgroundColor: "#46A358", color: "white", border: "none", padding: "5px 15px", borderRadius: "5px", cursor: "pointer", fontSize: "14px", width: "80px" }}
          >
            Changer
          </button>
          <button
            onClick={handleCloseProfile}
            style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#46A358" }}
          >
            &times;
          </button>
        </div>
        {showProfile && !showEditProfile ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%" }}>
            <button
              onClick={() => setShowEditProfile(true)}
              style={{ backgroundColor: "#46A358", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", width: "80%", marginBottom: "10px" }}
            >
              View profile
            </button>
            <button
              onClick={handleLogout}
              style={{ backgroundColor: "#46A358", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", width: "80%" }}
            >
              Se déconnecter
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const success = true; // Simulate success or failure
              if (success) {
                alert("Les informations ont été modifiées avec succès.");
                setShowEditProfile(false);
              } else {
                alert("Échec de la modification des informations.");
                setShowEditProfile(false);
              }
            }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%" }}
          >
            <div style={{ display: "flex", gap: "10px", width: "100%" }}>
              <input
                type="text"
                name="nom"
                value={utilisateurActuel?.user?.nom || ""}
                placeholder="Nom"
                onChange={handleInputChange}
                style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #46A358", fontSize: "14px" }}
              />
              <input
                type="text"
                name="prenom"
                value={utilisateurActuel?.user?.prenom || ""}
                placeholder="Prénom"
                onChange={handleInputChange}
                style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #46A358", fontSize: "14px" }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px", width: "100%" }}>
              <input
                type="text"
                name="telephone"
                value={utilisateurActuel?.user?.telephone || ""}
                placeholder="Téléphone"
                onChange={handleInputChange}
                style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #46A358", fontSize: "14px" }}
              />
              <input
                type="text"
                name="ville"
                value={utilisateurActuel?.user?.ville || ""}
                placeholder="Ville"
                onChange={handleInputChange}
                style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #46A358", fontSize: "14px" }}
              />
            </div>
            <input
              type="text"
              name="adress"
              value={utilisateurActuel?.user?.adress || ""}
              placeholder="Adresse"
              onChange={handleInputChange}
              style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #46A358", fontSize: "14px" }}
            />
            <input
              type="email"
              name="email"
              value={utilisateurActuel?.user?.email || ""}
              placeholder="Email"
              onChange={handleInputChange}
              style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #46A358", fontSize: "14px" }}
            />
            <div style={{ display: "flex", gap: "10px", width: "100%" }}>
              <button
                type="submit"
                style={{ backgroundColor: "#46A358", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", flex: 1, fontSize: "14px" }}
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={handleReturnToMenu}
                style={{ backgroundColor: "#ccc", color: "black", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", flex: 1, fontSize: "14px" }}
              >
                Retour
              </button>
            </div>
          </form>
        )}
      </div>
    </nav>
  );
};

export default Navigation;