'use client';
import { motion } from 'framer-motion';

export function GoldenGlow() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Sol: Manifesto */}
        <div className="z-10">
          <h2 className="text-8xl font-black italic uppercase leading-[0.8] tracking-tighter">
            CÖMERTLİK <br />
            <span className="text-[var(--acid-green)]">PARLATIR.</span>
          </h2>
          <p className="mt-8 text-xl text-white/50 max-w-sm uppercase font-medium">
            Hediye gönderen ve momentlara fısıldayanlar, topluluğun kalbinde
            altın bir ışıkla ön plana çıkar.
          </p>
        </div>

        {/* Sağ: Glowing Profile Card Simulation */}
        <div className="relative flex justify-center items-center">
          {/* Aura Background */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute w-[400px] h-[400px] bg-[var(--acid-green)] blur-[120px] rounded-full"
          />

          <motion.div
            whileHover={{ y: -20, rotateY: 10 }}
            className="relative w-72 h-96 rounded-[3rem] bg-zinc-900 border-2 border-[var(--acid-green)] overflow-hidden gift-glow"
          >
            <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-[var(--acid-green)] text-black text-[10px] font-black uppercase">
              Top Gifter
            </div>
            <img
              src="/avatars/demo-user.jpg"
              className="w-full h-full object-cover grayscale opacity-80"
            />
            <div className="absolute bottom-8 left-8">
              <h4 className="text-3xl font-black italic uppercase italic">
                Alex, 24
              </h4>
              <p className="text-[var(--acid-green)] text-xs font-bold tracking-widest mt-1">
                EŞLEŞMEDE ÖNCELİKLİ
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
