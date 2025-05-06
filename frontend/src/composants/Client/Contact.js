import React from 'react';
import Footer from '../../layout/Footer';
import ContactForm from '../../layout/ContactForm';
import Navigation from "../../layout/Navigation";

const Contact = () => {
  return (
    <div>
      <Navigation />
      <ContactForm/>
      <Footer/>
    </div>
  );
};

export default Contact;