import React from 'react'
import AboutHero from '@/components/marketing/about/heroSection'
import OurStory from '@/components/marketing/about/OutStory'
import SchoolFacilities from '@/components/marketing/about/schoolFacilities'
import StudentSupportServices from '@/components/marketing/about/studentSupport'
const page = () => {
  return (
    <div>
      <AboutHero/>
      <OurStory/>
      <SchoolFacilities/>
      <StudentSupportServices/>
    </div>
  )
}

export default page