'use client';

import { motion } from 'framer-motion';
import { TESTIMONIALS_CONTENT } from '@/constants/content';

/**
 * Testimonials Section
 *
 * Features:
 * - Rotating card carousel
 * - Fluid typography
 * - Social proof
 */

export function Testimonials() {
  const testimonials = TESTIMONIALS_CONTENT.tr;

  return (
    <section
      className="relative overflow-hidden"
      style={{ padding: 'clamp(4rem, 10vw, 8rem) clamp(1rem, 5vw, 4rem)' }}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span
            className="inline-block px-4 py-1 bg-[#00f0ff] text-black font-bold transform rotate-1"
            style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}
          >
            GERÇEK HİKAYELER
          </span>
          <h2
            className="font-syne font-bold mt-4"
            style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}
          >
            <span className="text-[#ff0099]">Onlar</span> Başardı
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, rotate: -2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -10, rotate: index % 2 === 0 ? 2 : -2 }}
                className="sticker bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 p-6 h-full"
              >
                {/* Avatar & Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ccff00] to-[#ff0099] flex items-center justify-center"
                    style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div
                      className="font-bold text-white"
                      style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}
                    >
                      {testimonial.name}, {testimonial.age}
                    </div>
                    <div
                      className="text-gray-500"
                      style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }}
                    >
                      {testimonial.city}
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <p
                  className="text-gray-300 italic"
                  style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
                >
                  &ldquo;{testimonial.text}&rdquo;
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
