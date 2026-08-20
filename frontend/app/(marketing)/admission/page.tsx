import AdmissionHeroSection from '@/components/marketing/admission/AdmissionHero'
import AdmissionProcess from '@/components/marketing/admission/AdmissionSection'
import ReadyToJoinSectionAdmission from '@/components/marketing/admission/ReadyTo'
import RequiredDocuments from '@/components/marketing/admission/RequiredDocuments'
import React from 'react'

const page:React.FC = () => {
  return (
    <div>
      <AdmissionHeroSection/>
      <AdmissionProcess/>
      <RequiredDocuments/>
      <ReadyToJoinSectionAdmission/>
    </div>
  )
}

export default page