import React from 'react';
import { motion } from 'framer-motion';

interface StoreBadgeProps {
  platform: string;
  punchline: string;
  type: string;
  color: string;
  ribbonPos: string;
}

const StoreBadge = ({
  platform,
  punchline,
  type,
  color,
  ribbonPos,
}: StoreBadgeProps) => {
  const isPink = color === 'pink';
  const rotationClass = ribbonPos === 'left' ? '-rotate-45' : 'rotate-45';
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: ribbonPos === 'left' ? -1 : 1 }}
      className={`bg-zinc-950 border-2 p-6 w-full sm:w-64 group cursor-pointer relative overflow-hidden transition-all duration-300 ${isPink ? 'border-zinc-800 hover:border-[#FF00FF]' : 'border-zinc-800 hover:border-[#00FFFF]'}`}
    >
      <div
        className={`absolute ${ribbonPos === 'left' ? '-left-8' : '-right-8'} top-4 ${rotationClass} bg-white text-black text-[10px] font-black px-10 py-1 hidden group-hover:block z-20`}
      >
        SOON
      </div>

      <div
        className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-40 transition-opacity ${isPink ? 'text-[#FF00FF]' : 'text-[#00FFFF]'}`}
      >
        {type === 'apple' ? (
          <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.55-1.48.33-3.5-1.52-3.5-1.29.02-2.72.69-3.41 1.5-.7.82-1.31 2.1-1.12 3.48 1.45.11 2.93-.5 4.1-1.36.96-.7 1.83-1.63 1.95-3.12"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M5.006 20.375L3.92 23.327l-.608-2.61L12.008 1.487l9.049 18.067-.534 2.593-1.047-2.636"
              fill="none"
            />
            <path
              d="M4.322 22.09l7.632-7.632L3.02 22.844c-.2.1-.476.11-.692-.02"
              fill="currentColor"
            />
            <path
              d="M19.673 22.09l-7.585-7.584 8.826 8.35c.216.13.492.115.688.017"
              fill="currentColor"
            />
            <path
              d="M16.345 10.966l3.834 2.183 2.766-1.583c.803-.46.803-1.216 0-1.674l-1.396-.8"
              fill="currentColor"
            />
            <path
              d="M3.312 2.327l13.033 12.473-4.362-2.484L3.036 2.424c-.18-.282.046-.532.276-.097"
              fill="currentColor"
            />
            <defs>
              <linearGradient
                id="a"
                x1="12.008"
                y1="1.488"
                x2="12.008"
                y2="23.328"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stop-color="#3accbb" />
                <stop offset="1" stop-color="#3eb4d8" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>
      <div className="text-[10px] font-black uppercase mb-1 tracking-widest text-zinc-500 group-hover:text-white transition-colors">
        {platform}
      </div>
      <div className="text-sm font-black uppercase text-white leading-tight group-hover:translate-x-1 transition-transform">
        {punchline}
      </div>
    </motion.div>
  );
};

export default StoreBadge;
