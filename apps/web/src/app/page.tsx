'use client';

import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        {/* Arka Plan: Samimi bir anın görselliği */}
        <div className="absolute inset-0 opacity-60">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&h=1200&fit=crop')`,
            }}
          />
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-7xl md:text-[12vw] font-light italic text-white leading-none tracking-tighter"
          >
            Sacred <br /> Moments.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-10 text-white/70 text-lg md:text-xl max-w-xl mx-auto font-medium"
          >
            Pasaportları unuttuk. Güveni ritüele dönüştürdük. Geleceğin deneyim
            hediyeleşme protokolü burada başlıyor.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-12 px-10 py-4 bg-white text-black font-bold uppercase text-xs tracking-[0.3em] rounded-full hover:bg-gray-100 transition-colors"
          >
            Harekete Katıl
          </motion.button>
        </div>
      </section>
    </main>
  );
}
