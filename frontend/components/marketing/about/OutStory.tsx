import React from "react";
import Image from "next/image";

const OurStory: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-6 lg:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
            Our Story
          </h2>

          <div className="space-y-6 text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
            {/* Paragraph 1 */}
            <p>
              College fondation Sina Gerard (CFSG) is a private educational
              institution in Rwanda dedicated to providing quality education and
              practical skills development. The institution offers learning
              opportunities from Nursery Education through Primary Education,
              Lower Secondary Education, and Technical and Vocational Education
              and Training (TVET), preparing learners with academic knowledge,
              technical competence, and good moral values. The school is committed
              to providing a safe, supportive, and student-centered learning
              environment where every learner is encouraged to achieve academic
              excellence, develop practical skills, and become a responsible member
              of society.
            </p>

            {/* Paragraph 2 */}
            <p>
              Since its establishment in 2008, College fondation Sina Gerard has
              grown from a small institution to a comprehensive educational center
              serving over 1250 students across four education levels. Under the
              visionary leadership of Dr. Sina Gerard, the school has maintained its
              commitment to excellence and innovation in education.
            </p>

            {/* Paragraph 3 */}
            <p>
              The institution continues to expand its facilities, programs, and partnerships to ensure every learner receives the best possible preparation for their future. Our graduates have gone on to successful careers in academia, technical fields, entrepreneurship, and public service.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">

          <div className="relative w-full h-[220px] sm:h-[260px] rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/out1.jpg" 
              alt="CFSG Campus Main Building"
              fill
              className="object-cover object-center hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            <div className="relative w-full h-[160px] sm:h-[180px] rounded-2xl overflow-hidden shadow-md">
              <Image
                src="/out2.jpg"
                alt="Students studying in classroom"
                fill
                className="object-cover object-center hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="relative w-full h-[160px] sm:h-[180px] rounded-2xl overflow-hidden shadow-md">
              <Image
                src="/out3.jpg"
                alt="TVET Workshop Training"
                fill
                className="object-cover object-center hover:scale-105 transition-transform duration-500"
              />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default OurStory;