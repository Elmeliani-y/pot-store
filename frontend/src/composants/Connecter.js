import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import icone from "../Images/icone.PNG";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Connecter = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null); // State for popup message
  const [popupType, setPopupType] = useState(null); // State for popup type (success or failure)
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "L'email est requis.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide.";
    }
    if (!formData.password) newErrors.password = "Le mot de passe est requis.";
    if (formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClosePopup = (e) => {
    if (e.target.classList.contains("popup-overlay")) {
      setPopupMessage(null);
      setPopupType(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("La réponse du serveur n'est pas au format JSON.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || "Erreur de connexion"
        );
      }

      const data = await response.json();
      console.log(data);

      if (data.token && data.user) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.user.id);
        if (data.user.role === "admin") {
          navigate("/Admin/TableauBord");
        } else if (data.user.role === "client") {
          navigate("/");
        }
      } else {
        setErrors({ message: "unauthorized" });
      }
    } catch (error) {
      console.error("Erreur de connexion:", error.message);
      setPopupMessage(error.message || "Une erreur de connexion.");
      setPopupType("failure");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = sessionStorage.getItem("authToken");
    if (!storedToken) {
      navigate("/Connecter");
    }
  }, [navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      {popupMessage && (
        <div className="popup-overlay" onClick={handleClosePopup}>
          <div className={`popup ${popupType}`}>{popupMessage}</div>
        </div>
      )}
      <div className="auth-card">
        <div className="auth-header">
          <img src={icone} alt="Logo" className="auth-logo" />
          <h2 className="auth-title">
            <Link to="/Connecter" className="auth-title-link auth-title-active">Se connecter</Link>
            <span> | </span>
            <Link to="/Inscrire" className="auth-title-link auth-title-inactive">S'inscrire</Link>
          </h2>
        </div>
        <p className="auth-subtitle">Entrez vos informations pour vous connecter.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email" // Added name attribute
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password" // Added name attribute
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          <button type="submit" className="auth-button">
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Connecter;
