import React from 'react'
import Hero from './LandingPage/Hero'

const Welcome = (auth) => {

  return (
   
    <div>
        <Hero auth={auth} />
        Welcome
    </div>
  )
}

export default Welcome