"use client";

import { useState } from "react";
import { Star, Quote, Send } from "lucide-react";

const INITIAL_REVIEWS = [
  {
    id: 1,
    name: "Sarah M.",
    role: "Digital Nomad",
    text: "A true sanctuary in the heart of the city. The attention to detail in the styling and the absolute stillness of the space made my stay unforgettable.",
    rating: 5,
  },
  {
    id: 2,
    name: "David K.",
    role: "Business Traveler",
    text: "Perfectly located for my trips to JKIA. The suite is immaculate, and the cobalt palette creates such a calming atmosphere for unwinding after meetings.",
    rating: 5,
  },
  {
    id: 3,
    name: "Elena R.",
    role: "Architect",
    text: "As someone who appreciates design, I was blown away by the curation of this space. It's rare to find such a consistent and sophisticated aesthetic in Nairobi.",
    rating: 5,
  },
];

export default function Reviews() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", role: "", text: "", rating: 5 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // In a real app, this would call an API to save to a database.
    // For now, we simulate a successful submission.
    setTimeout(() => {
      setSubmitted(false);
      setIsFormOpen(false);
      // Optimistically add the review to the wall for this session
      setReviews([{ ...formData, id: Date.now() }, ...reviews]);
    }, 2000);
  };

  return (
    <section id="reviews" className="section-pad" style={{ backgroundColor: "#0B1526" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="eyebrow">The Guest Circle</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-serif text-white mb-5">Shared Experiences</h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto">
            A collection of moments from those who have found stillness at Serenity Suites.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-sm p-8 border transition-all duration-300 hover:border-[#B8935A]/40 group"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(184,147,90,0.1)" }}
            >
              <Quote size={24} style={{ color: "#D4B483", opacity: 0.3 }} className="mb-4 group-hover:opacity-100 transition-opacity" />
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={12}
                    style={{ color: j < review.rating ? "#D4B483" : "rgba(212,180,131,0.1)" }}
                  />
                ))}
              </div>
              <p className="text-white/70 text-sm leading-relaxed italic mb-6">
                "{review.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#B8935A]/20 flex items-center justify-center text-[#D4B483] text-xs font-serif">
                  {review.name[0]}
                </div>
                <div>
                  <p className="text-white text-xs font-medium">{review.name}</p>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          {!isFormOpen ? (
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 text-sm rounded-sm border transition-all duration-300 hover:bg-white/5"
              style={{ borderColor: "rgba(184,147,90,0.35)", color: "#D4B483" }}
            >
              Share Your Experience
            </button>
          ) : (
            <div
              className="max-w-xl mx-auto rounded-sm p-8 border animate-in fade-in zoom-in duration-300"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(184,147,90,0.2)" }}
            >
              {submitted ? (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#B8935A] text-[#0B1526] flex items-center justify-center mx-auto mb-4">
                    <Send size={20} />
                  </div>
                  <h3 className="text-white text-xl font-serif mb-2">Thank you for sharing.</h3>
                  <p className="text-white/50 text-sm">Your experience has been added to the circle.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white text-xl font-serif">Leave a Testimonial</h3>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-white/30 hover:text-white text-xs uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-white/40 text-[10px] uppercase tracking-widest">Name</label>
                      <input
                        required
                        className="bg-white/5 border border-white/10 rounded-sm p-3 text-white text-sm focus:outline-none focus:border-[#B8935A]"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-white/40 text-[10px] uppercase tracking-widest">Role/Title</label>
                      <input
                        placeholder="e.g. Frequent Traveler"
                        className="bg-white/5 border border-white/10 rounded-sm p-3 text-white text-sm focus:outline-none focus:border-[#B8935A]"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/40 text-[10px] uppercase tracking-widest">Your Experience</label>
                    <textarea
                      required
                      rows={4}
                      className="bg-white/5 border border-white/10 rounded-sm p-3 text-white text-sm focus:outline-none focus:border-[#B8935A] resize-none"
                      value={formData.text}
                      onChange={(e) => setFormData({...formData, text: e.target.value})}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/40 text-[10px] uppercase tracking-widest text-center block mb-2">Rating</label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFormData({...formData, rating: num})}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            size={24}
                            style={{ color: num <= formData.rating ? "#D4B483" : "rgba(212,180,131,0.2)" }}
                            fill={num <= formData.rating ? "#D4B483" : "none"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 text-sm font-medium rounded-sm transition-all duration-300 hover:opacity-90 shadow-lg"
                    style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
                  >
                    Submit Testimonial
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
