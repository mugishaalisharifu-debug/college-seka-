"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

const SUBJECT_CATEGORIES: Record<string, string> = {
  admissions: "Admissions Inquiry",
  tvet: "School Fees Question",
  academics: "Academic Programs & Support",
  visit: "Schedule Visit",
  other: "Other Inquiries",
};

const ContactFormSection: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    //limitation message to 500 characters
    if (name === "message" && value.length > 500) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const category = SUBJECT_CATEGORIES[formData.subject] || "Other Inquiries";

      await api.post("/admin/public/contact", {
        sender: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        category,
        subject: category,
        message: formData.message,
      });

      alert("Message sent successfully!");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to send the message."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-[#fcf8f2] py-16 md:py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Left Column*/}
        <div className="lg:col-span-7 flex flex-col">
          <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
            Send Us a Message
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed mb-8">
            Fill out the form below and we will get back to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name & Email row*/}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl bg-[#faf6f0] dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#faf6f0] dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                />
              </div>
            </div>

            {/* PHONE NUMBER */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+250 ___ ___ ___"
                className="w-full px-4 py-3 rounded-xl bg-[#faf6f0] dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
              />
            </div>

            {/* SUBJECT DROPDOWN */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Subject
              </label>
              <select
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#faf6f0] dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all cursor-pointer"
              >
                <option value="" disabled>
                  Select a subject
                </option>
                <option value="admissions">General Admissions Inquiry</option>
                <option value="tvet">School Fess Question</option>
                <option value="academics">Academic Programs & Support</option>
                <option value="visit">Program Information</option>
                <option value="visit">Schedule Visit</option>
                <option value="other">Other Inquiries</option>
              </select>
            </div>

            {/* MESSAGE TEXTAREA */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Message
              </label>
              <textarea
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                className="w-full px-4 py-3 rounded-xl bg-[#faf6f0] dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all resize-none"
              />
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 self-start">
                Maximum 500 characters ({500 - formData.message.length} left)
              </span>
            </div>

            {/* SUBMIT BUTTON */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <Send className="text-white h-5 2-5"/>
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>

        {/* Right column for map */}
        <div className="lg:col-span-5 flex flex-col">
          <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
            Our Location
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed mb-8">
            College fondation Sina Gerard is located in Rwanda. Use the map below to find our campus.
          </p>

          {/* embedded google map*/}
          <div className="relative w-full h-[380px] sm:h-[450px] rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-md bg-zinc-100 dark:bg-zinc-900">
            <iframe
              title="College fondation Sina Gerard Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127582.38318182285!2d29.8800!3d-1.6800!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwNDAnNDguMCJTIDI5wrA1Mic0OC4wIkU!5e0!3m2!1sen!2srw!4v1700000000000!5m2!1sen!2srw"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full grayscale-[0.1] contrast-[1.02]"
            ></iframe>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ContactFormSection;