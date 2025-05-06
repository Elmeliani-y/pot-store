import React, { useEffect, useState } from "react";
import Footer from "../../layout/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import envlope from '../../Images/envlope.PNG';
import Navigation from "../../layout/Navigation";

function ValiderCommande({ panierItems }) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState({
    nom: "",
    prenom: "",
    pays: "Maroc",
    ville: "",
    adress: "",
    email: "",
    telephone: "",
    notes: "",
  });

  const villes = [
    { nom: "Casablanca", frais: 30 },
    { nom: "Rabat", frais: 25 },
    { nom: "Marrakech", frais: 35 },
    { nom: "Fès", frais: 40 },
    { nom: "Tanger", frais: 45 },
    { nom: "Agadir", frais: 50 },
    { nom: "Meknès", frais: 35 },
    { nom: "Oujda", frais: 55 },
    { nom: "Kénitra", frais: 30 },
    { nom: "Tétouan", frais: 45 },
  ];

  const [fraisLivraison, setFraisLivraison] = useState(30);
  const totalproduites = panierItems.reduce(
    (total, item) => total + item.produit.prix * item.quantité,
    0
  );
  const totalGeneral = totalproduites + fraisLivraison;

  useEffect(() => {
    if (userData.ville) {
      const villeUtilisateur = villes.find((v) => v.nom === userData.ville);
      if (villeUtilisateur) {
        setFraisLivraison(villeUtilisateur.frais);
      }
    }
  }, [userData.ville]);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "nom":
      case "prenom":
        if (!value.trim()) error = "Ce champ est obligatoire";
        else if (value.length < 2)
          error = "Doit contenir au moins 2 caractères";
        else if (!/^[a-zA-ZÀ-ÿ -]+$/.test(value))
          error = "Caractères invalides";
        break;
      case "email":
        if (!value.trim()) error = "Ce champ est obligatoire";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Email invalide";
        break;
      case "telephone":
        if (!value.trim()) error = "Ce champ est obligatoire";
        else if (!/^0[5-7][0-9]{8}$/.test(value))
          error = "Numéro invalide (ex: 0612345678)";
        break;
      case "ville":
      case "adress":
        if (!value.trim()) error = "Ce champ est obligatoire";
        break;
      default:
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    if (name === "ville") {
      const villeSelectionnee = villes.find((v) => v.nom === value);
      if (villeSelectionnee) {
        setFraisLivraison(villeSelectionnee.frais);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    const requiredFields = [
      "nom",
      "prenom",
      "ville",
      "adress",
      "email",
      "telephone",
    ];

    requiredFields.forEach((field) => {
      const error = validateField(field, userData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };
  const generateOrderNumber = () => {
    let lastOrderNumber = parseInt(localStorage.getItem('lastOrderNumber')) || 0;
    lastOrderNumber++;
    localStorage.setItem('lastOrderNumber', lastOrderNumber);
    return `CMD-${lastOrderNumber}`;
  
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
  
    try {

      const userId = JSON.parse(localStorage.getItem("userId"));
      const numeroCommande = generateOrderNumber(userId);
  
      for (const item of panierItems) {
        const commandeData = {
          numero_commande: numeroCommande,
          user_id: JSON.parse(localStorage.getItem("userId")),
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          telephone: userData.telephone,
          adress: userData.adress,
          ville: userData.ville,
          notes: userData.notes || "",
          ligne_commande_id: item.id,
          total_produits: item.produit.prix * item.quantité,
          frais_livraison: fraisLivraison,
          total: item.produit.prix * item.quantité + fraisLivraison,
          methode_paiement: "à la livraison",
        };
  
        const response = await fetch("http://localhost:8000/api/commandes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(commandeData),
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(
            data.message ||
              (data.errors
                ? Object.values(data.errors).flat().join(", ")
                : "Erreur lors de la commande")
          );
        }
      }
  
      setShowModal(true);
        } catch (error) {
      setErrors((prev) => ({
        ...prev,
        form: error.message,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Navigation />
      <div>
        <div className="container-fluid p-5">
          <div className="row">
            <div className="col-md-7">
              <h5 className="fw-medium">Adresse de facturation</h5>
              <hr className="border-success" />
              {errors.form && (
                <div className="alert alert-danger">{errors.form}</div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col">
                    <label className="form-label">
                      Nom <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="nom"
                      className={`form-control ${
                        errors.nom ? "is-invalid" : "border-success"
                      }`}
                      value={userData.nom}
                      onChange={handleInputChange}
                    />
                    {errors.nom && (
                      <div className="invalid-feedback">{errors.nom}</div>
                    )}
                  </div>
                  <div className="col">
                    <label className="form-label">
                      Prénom <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      className={`form-control ${
                        errors.prenom ? "is-invalid" : "border-success"
                      }`}
                      value={userData.prenom}
                      onChange={handleInputChange}
                    />
                    {errors.prenom && (
                      <div className="invalid-feedback">{errors.prenom}</div>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <label className="form-label">
                      Pays <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="pays"
                      className="form-control border-success"
                      value={userData.pays}
                      readOnly
                    />
                  </div>
                  <div className="col">
                    <label className="form-label">
                      Ville <span className="text-danger">*</span>
                    </label>
                    <select
                      name="ville"
                      className={`form-select ${
                        errors.ville ? "is-invalid" : "border-success"
                      }`}
                      value={userData.ville}
                      onChange={handleInputChange}
                    >
                      <option value="">Sélectionnez une ville</option>
                      {villes.map((ville, index) => (
                        <option key={index} value={ville.nom}>
                          {ville.nom} (+{ville.frais} DH)
                        </option>
                      ))}
                    </select>
                    {errors.ville && (
                      <div className="invalid-feedback">{errors.ville}</div>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <label className="form-label">
                      Adresse <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="adress"
                      className={`form-control ${
                        errors.adress ? "is-invalid" : "border-success"
                      }`}
                      value={userData.adress}
                      onChange={handleInputChange}
                    />
                    {errors.adress && (
                      <div className="invalid-feedback">{errors.adress}</div>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${
                        errors.email ? "is-invalid" : "border-success"
                      }`}
                      value={userData.email}
                      onChange={handleInputChange}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
                  <div className="col">
                    <label className="form-label">
                      Téléphone <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-success">
                        +212
                      </span>
                      <input
                        type="tel"
                        name="telephone"
                        className={`form-control ${
                          errors.telephone ? "is-invalid" : "border-success"
                        }`}
                        value={userData.telephone}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.telephone && (
                      <div className="invalid-feedback">{errors.telephone}</div>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <label className="form-label">Notes de commande</label>
                    <textarea
                      name="notes"
                      className="form-control border-success"
                      rows="3"
                      value={userData.notes}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
              </form>
            </div>

            <div className="col-md-5">
              <div className="mb-4">
                <h5 className="fw-medium">Produits</h5>
                <hr className="border-success" />
                {panierItems.map((item, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center mb-3 bg-light p-3 rounded"
                  >
                    <img
                      src={`http://127.0.0.1:8000/images/${item.produit.image}`}
                      alt={item.produit.nom}
                      className="img-thumbnail me-3"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-0">{item.produit.nom}</h6>
                      <small className="text-muted">Réf: {item.produit.id}</small>
                    </div>
                    <span className="fw-bold me-3">(x {item.quantité})</span>
                    <span className="fw-bold text-success">
                      {item.produit.prix * item.quantité} DH
                    </span>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold">Total produits</span>
                  <span className="fw-bold">{totalproduites} DH</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold">Livraison ({userData.ville})</span>
                  <span className="fw-bold">{fraisLivraison} DH</span>
                </div>
                <hr className="border-success" />
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Total</span>
                  <span className="fw-bold">{totalGeneral} DH</span>
                </div>
              </div>

              <div>
                <h5 className="fw-medium">Paiement</h5>
                <div className="mb-3">
                  <select
                    className="form-select border-success"
                    value="Paiement à la livraison"
                    disabled
                  >
                    <option>Paiement à la livraison</option>
                  </select>
                </div>
              </div>
              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-success btn-lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting || panierItems.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      En cours...
                    </>
                  ) : (
                    "Valider la commande"
                  )}
                </button>
                {panierItems.length === 0 && (
                  <div className="alert alert-warning mt-3">
                    Votre panier est vide
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
         <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          size="lg"
          backdrop="static" // Empêche la fermeture en cliquant à l'extérieur
          keyboard={false} // Empêche la fermeture avec la touche ESC
        >
        <Modal.Header
          className="bg-light position-relative py-4"
          onClick={() => navigate("/confirmation-commande")}
        >
          {/* Bouton de fermeture positionné absolument en haut à droite */}
          <button
            type="button"
            className="btn-close position-absolute"
            style={{ top: '1rem', right: '1rem' }}
            onClick={() =>navigate("/confirmation-commande")}
            aria-label="Fermer"
          />
          
          {/* Contenu centré */}
          <div className="d-flex flex-column align-items-center text-center w-100">
            <div className="mb-3">
              <img
                src={envlope}
                alt="Icône enveloppe"
                className="img-fluid"
                style={{ maxWidth: '60px' }}
              />
            </div>
            <Modal.Title className="text-success w-100 fs-3 fw-bold">
              Votre commande a bien été reçue !
            </Modal.Title>
          </div>
        </Modal.Header>
          <Modal.Body className="py-4">
            {/* Ligne d'informations avec séparateurs */}
            <div className="d-flex justify-content-between mb-4 flex-wrap flex-md-nowrap">
              {[
                {
                  title: "N° commande",
                  content: `Réf : ${Math.floor(1000000000 + Math.random() * 9000000000)}`
                },
                {
                  title: "Date",
                  content: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                },
                {
                  title: "Total",
                  content: `${totalGeneral.toLocaleString('fr-FR')} Dhs`
                },
                {
                  title: "Méthode de paiement",
                  content: "Paiement à la livraison"
                }
              ].map((item, index, array) => (
                <div 
                  key={index}
                  className={`d-flex flex-column px-3 text-center ${index < array.length - 1 ? "border-end border-success" : ""}`}
                  style={{ flex: 1, minWidth: '25%' }}
                >
                  <div className="fw-bold text-muted small">{item.title}</div>
                  <div className="fw-semibold">{item.content}</div>
                </div>
              ))}
            </div>
        
            <h6 className="mt-4 text-success fw-bold">Détails de la commande</h6>
            <hr className="mt-2 mb-3" />
        
            <div className="mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {panierItems.map((item, index) => (
                <div
                  key={index}
                  className="d-flex align-items-center mb-3 bg-light p-3 rounded"
                >
                  <img
                    src={`http://127.0.0.1:8000/images/${item.produit.image}`}
                    alt={item.produit.nom}
                    className="img-thumbnail me-3"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                    }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1">{item.produit.nom}</h6>
                    <small className="text-muted">Réf: {item.produit.id}</small>
                  </div>
                  <span className="fw-bold me-3">(x {item.quantité})</span>
                  <span className="fw-bold text-success">
                    {(item.produit.prix * item.quantité).toLocaleString('fr-FR')} Dhs
                  </span>
                </div>
              ))}
            </div>
        
            <hr className="my-3" />
            <table className="w-100 mb-4">
              <tbody>
                <tr>
                  <td><h6 className="fw-semibold">Total des produits</h6></td>
                  <td className="text-end"><h6 className="text-success fw-bold">{totalproduites.toLocaleString('fr-FR')} Dhs</h6></td>
                </tr>
                <tr>
                  <td><h6 className="fw-semibold">Frais de livraison</h6></td>
                  <td className="text-end"><h6 className="text-success fw-bold">{fraisLivraison} Dhs</h6></td>
                </tr>
                <tr>
                  <td colSpan="2" className="pt-3">
                    <div className="d-flex justify-content-between align-items-center border-top pt-3">
                      <h5 className="fw-bold mb-0">Total général</h5>
                      <h4 className="text-success fw-bold mb-0">{totalGeneral.toLocaleString('fr-FR')} Dhs</h4>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
        
            <div className="alert alert-info mt-4 text-center">
              <p className="mb-0">
                Votre commande est en cours de traitement. Vous recevrez bientôt un email 
                de confirmation avec la date de livraison prévue pour vos articles.
              </p>
              <button 
                className="btn btn-success mt-3 px-4 py-2"
                onClick={() =>navigate("/confirmation-commande")}
              >
                Fermer
              </button>
            </div>
          </Modal.Body>
        </Modal>
        
      </div>
    </>
  );
}

export default ValiderCommande;
