import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import icone from "../Images/icone.PNG";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Inscrire = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    ville: "",
    adress: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [cities, setCities] = useState([]);
  const [popupMessage, setPopupMessage] = useState(null); // State for popup message
  const [popupType, setPopupType] = useState(null); // State for popup type (success or failure)
  const navigate = useNavigate();

  useEffect(() => {
    const staticCities = [
      "Casablanca",
      "Rabat",
      "Marrakech",
      "Fès",
      "Tanger",
      "Agadir",
      "Meknès",
      "Oujda",
      "Kenitra",
      "Tétouan",
      "Safi",
      "Mohammedia",
      "Khouribga",
      "El Jadida",
      "Béni Mellal",
      "Nador",
      "Taza",
      "Settat",
      "Larache",
      "Khemisset",
    ];
    setCities(staticCities);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "email":
        if (!value) {
          error = "L'email est requis.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "L'email n'est pas valide.";
        }
        break;

      case "password":
        if (!value) {
          error = "Le mot de passe est requis.";
        } else if (value.length < 6) {
          error = "Le mot de passe doit contenir au moins 6 caractères.";
        }
        break;

      case "confirmPassword":
        if (!value) {
          error = "La confirmation du mot de passe est requise.";
        } else if (value !== formData.password) {
          error = "Les mots de passe ne correspondent pas.";
        }
        break;

      case "nom":
        if (!value) {
          error = "Le nom est requis.";
        }
        break;

      case "prenom":
        if (!value) {
          error = "Le prénom est requis.";
        }
        break;

      case "telephone":
        if (!value) {
          error = "Le téléphone est requis.";
        } else if (!/^\d+$/.test(value)) {
          error = "Le téléphone doit contenir uniquement des chiffres.";
        }
        break;

      case "ville":
        if (!value) {
          error = "La ville est requise.";
        }
        break;

      case "adress":
        if (!value) {
          error = "L'adresse est requise.";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form submitted", formData); // Debugging: Log form data

    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = [error];
      }
    });

    if (Object.keys(newErrors).length > 0) {
      console.log("Validation errors", newErrors); // Debugging: Log validation errors
      setErrors(newErrors);
      setPopupMessage("Veuillez corriger les erreurs dans le formulaire.");
      setPopupType("failure");
      return;
    }

    try {
      const dataToSend = {
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        ville: formData.ville,
        adress: formData.adress,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      };

      console.log("Sending data to API", dataToSend); // Debugging: Log data being sent

      const response = await api.post("/register", dataToSend);
      console.log("API response", response.data); // Debugging: Log API response

      // Store the token and user information in localStorage
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("userId", response.data.user.id);

      setPopupMessage("Création du compte réussie !");
      setPopupType("success");
      setTimeout(() => navigate("/"), 2000); // Redirect to home page after 2 seconds
    } catch (error) {
      console.error("Error during registration", error.response?.data || error.message); // Debugging: Log error details
      if (error.response?.data?.errors) {
        setPopupMessage(`Erreur: ${JSON.stringify(error.response.data.errors)}`);
      } else {
        setPopupMessage("Une erreur de l'inscription. Veuillez réessayer.");
      }
      setPopupType("failure");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleClosePopup = (e) => {
    if (e.target.classList.contains("popup-overlay")) {
      setPopupMessage(null);
      setPopupType(null);
    }
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
            <Link to="/Connecter" className="auth-title-link auth-title-inactive">Se connecter</Link>
            <span> | </span>
            <Link to="/Inscrire" className="auth-title-link auth-title-active">S'inscrire</Link>
          </h2>
        </div>
        <p className="auth-subtitle">Entrez vos informations pour vous inscrire.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="prenom">Prénom</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="nom">Nom</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="telephone">Téléphone</label>
              <input
                type="text"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="ville">Ville</label>
              <select
                id="ville"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                required
              >
                <option value="">Choisir une ville</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="adress">Adresse</label>
              <input
                type="text"
                id="adress"
                name="adress"
                value={formData.adress}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button type="submit" className="auth-button">
            S'inscrire
          </button>
        </form>
        <p className="auth-footer">
          Déjà inscrit ? <Link to="/Connecter">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Inscrire;
