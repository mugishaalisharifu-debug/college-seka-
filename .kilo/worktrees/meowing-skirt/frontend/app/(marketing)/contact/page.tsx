import ContactCards from '@/components/marketing/contact/ContactCard'
import ContactFormSection from '@/components/marketing/contact/ContactFormSection'
import ContactHeroSection from '@/components/marketing/contact/ContactHero'
import React from 'react'

const page = () => {
  return (
    <div>
      <ContactHeroSection/>
      <ContactCards/>
      <ContactFormSection/>
    </div>
  )
}

export default page