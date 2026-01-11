'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CONTENT, Language } from '@/constants/content';
import { ArrowUpRight } from 'lucide-react';

interface MomentGridProps {
  lang?: Language;
}

export function MomentGrid({ lang = 'tr' }: MomentGridProps) {
  const { title, subtitle, items } = CONTENT[lang].moments;

  return (
    <section className="py-32 px-6 bg-[#080808]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black font-syne uppercase tracking-tighter mb-4"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white/40 uppercase tracking-widest"
            >
              {subtitle}
            </motion.p>
          </div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="px-8 py-4 border border-white/20 rounded-full font-bold hover:bg-white hover:text-black transition-all"
          >
            {lang === 'tr' ? 'Tümünü Keşfet' : 'Explore All'}
          </motion.button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="glass-card overflow-hidden group cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Location Badge */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                  {item.loc}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h4 className="text-lg font-bold mb-4 line-clamp-2 uppercase leading-tight font-syne">
                  {item.title}
                </h4>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--acid)] font-black text-lg">
                    {item.price}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[var(--acid)] group-hover:text-black transition-colors">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
