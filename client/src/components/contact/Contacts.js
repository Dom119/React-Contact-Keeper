import React, { useContext, useEffect } from 'react'
import {CSSTransition, TransitionGroup} from 'react-transition-group'
import ContactItem from './ContactItem'
import ContactContext from '../../context/contact/contactContext.js'
import Spinner from '../layout/Spinner.js'

const Contacts = () => {

  const contactContext = useContext(ContactContext);

  const { contacts, filtered, getContact, loading } = contactContext;

  useEffect(() => {
    getContact();
    // eslint-disable-next-line
  },[])

  if (contacts !== null && contacts.length === 0 && !loading) {
    return <h4>Please add contact...</h4>
  }
  
  return (
    <React.Fragment>
      {contacts !== null && !loading ? (
        <TransitionGroup>
        {filtered !== null ? filtered.map(contact => (
          <CSSTransition key={contact._id} timeout={500} classNames='item'>
            <ContactItem  contact={contact}/>
          </CSSTransition>
        )) : contacts.map(contact => (
          <CSSTransition key={contact._id} timeout={500} classNames='item'>
            <ContactItem  contact={contact}/>
          </CSSTransition>        )) } 
      </TransitionGroup>
      ) : <Spinner /> }
      
    </React.Fragment>
  )
}

export default Contacts
