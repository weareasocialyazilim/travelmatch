import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-emerald-400/20 rounded-full opacity-30" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] border border-teal-400/20 rounded-full opacity-30" />
          <div className="absolute top-1/2 right-1/3 w-80 h-80 border border-green-400/20 rounded-full opacity-30" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#A6E5C1] via-teal-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/50">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight bg-gradient-to-r from-[#A6E5C1] via-emerald-300 to-teal-300 bg-clip-text text-transparent">
            travelmatch
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-light">
            connect with solo travelers and explore the world together
          </p>

          {/* App Store Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8">
            <Link
              href="https://apps.apple.com"
              target="_blank"
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-md border border-[#A6E5C1]/30 rounded-2xl px-8 py-4 hover:bg-white/10 hover:border-[#A6E5C1]/50 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-emerald-500/30">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs text-slate-400">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </div>
            </Link>

            <Link
              href="https://play.google.com"
              target="_blank"
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-md border border-[#A6E5C1]/30 rounded-2xl px-8 py-4 hover:bg-white/10 hover:border-[#A6E5C1]/50 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-emerald-500/30">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs text-slate-400">GET IT ON</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </div>
            </Link>
          </div>

          {/* Become Partner CTA */}
          <div className="pt-12">
            <Link href="/partner">
              <button className="group relative bg-gradient-to-r from-[#FF6F61] via-[#FF8A7A] to-[#FFA593] hover:from-[#FF5F51] hover:via-[#FF7A6A] hover:to-[#FF9583] text-white px-10 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-2xl hover:shadow-[#FF6F61]/50 flex items-center gap-3 mx-auto hover:scale-105">
                <span>partner with us</span>
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* App Screenshots Section */}
      <section className="py-20 px-4 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Phone Mockup 1 - Map View */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] p-3 shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-emerald-500/30 border border-[#A6E5C1]/20">
                <div className="bg-gradient-to-br from-slate-900 to-black rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-600/20 to-teal-900/20 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#A6E5C1] to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
                        <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-[#A6E5C1] mb-2">Explore</p>
                      <p className="text-sm text-slate-400">Find travelers near you</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Mockup 2 - Activity View */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] p-3 shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-teal-500/30 border border-teal-400/20">
                <div className="bg-gradient-to-br from-slate-900 to-black rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                  <div className="w-full h-full bg-gradient-to-br from-teal-600/20 to-cyan-900/20 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg shadow-teal-500/50">
                        <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-teal-400 mb-2">Match</p>
                      <p className="text-sm text-slate-400">Find your travel companions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Mockup 3 - Chat View */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] p-3 shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-[#FF6F61]/30 border border-[#FF6F61]/20">
                <div className="bg-gradient-to-br from-slate-900 to-black rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                  <div className="w-full h-full bg-gradient-to-br from-red-600/20 to-orange-900/20 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#FF6F61] to-red-600 rounded-3xl flex items-center justify-center shadow-lg shadow-[#FF6F61]/50">
                        <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9H18V11H6M14,14H6V12H14M18,8H6V6H18"/>
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-[#FF6F61] mb-2">Share</p>
                      <p className="text-sm text-slate-400">Build lasting friendships</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#A6E5C1] via-teal-300 to-emerald-300 bg-clip-text text-transparent">
            how it works
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#A6E5C1] via-teal-400 to-emerald-500 mx-auto mb-16 rounded-full"></div>

          <div className="space-y-8 text-left max-w-2xl mx-auto">
            <div className="group hover:translate-x-2 transition-transform duration-300">
              <p className="text-lg leading-relaxed">
                <span className="text-slate-500">01.</span>{" "}
                <span className="text-[#A6E5C1] font-semibold">Sign up</span>{" "}
                <span className="text-slate-300">and tell us about your travel style and interests</span>
              </p>
            </div>

            <div className="group hover:translate-x-2 transition-transform duration-300">
              <p className="text-lg leading-relaxed">
                <span className="text-slate-500">02.</span>{" "}
                <span className="text-emerald-400 font-semibold">Browse travelers</span>{" "}
                <span className="text-slate-300">in your destination and see who shares your vibe</span>
              </p>
            </div>

            <div className="group hover:translate-x-2 transition-transform duration-300">
              <p className="text-lg leading-relaxed">
                <span className="text-slate-500">03.</span>{" "}
                <span className="text-teal-400 font-semibold">Match & chat</span>{" "}
                <span className="text-slate-300">with compatible travelers and plan your adventures</span>
              </p>
            </div>

            <div className="group hover:translate-x-2 transition-transform duration-300">
              <p className="text-lg leading-relaxed">
                <span className="text-slate-500">04.</span>{" "}
                <span className="text-[#A6E5C1] font-semibold">Explore together</span>{" "}
                <span className="text-slate-300">and turn solo travel into shared memories</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 bg-slate-950/50">
        <div className="max-w-6xl mx-auto">
          {/* Social Icons */}
          <div className="flex justify-center gap-8 mb-8">
            <Link href="https://instagram.com" target="_blank" className="text-slate-400 hover:text-[#FF6F61] transition-colors transform hover:scale-110 duration-300">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </Link>
            <Link href="https://tiktok.com" target="_blank" className="text-slate-400 hover:text-[#A6E5C1] transition-colors transform hover:scale-110 duration-300">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </Link>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <Link href="/terms" className="text-slate-400 hover:text-[#A6E5C1] transition-colors underline underline-offset-4">
              Terms and Conditions
            </Link>
            <Link href="/privacy" className="text-slate-400 hover:text-[#A6E5C1] transition-colors underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link href="/safety" className="text-slate-400 hover:text-[#A6E5C1] transition-colors underline underline-offset-4">
              Safety Tips & Event Etiquette
            </Link>
            <Link href="/community" className="text-slate-400 hover:text-[#A6E5C1] transition-colors underline underline-offset-4">
              Community Guidelines
            </Link>
            <Link href="/contact" className="text-slate-400 hover:text-[#A6E5C1] transition-colors underline underline-offset-4">
              Contact Us
            </Link>
          </div>

          <div className="text-center mb-6">
            <Link href="/partner" className="text-slate-400 hover:text-[#FF6F61] transition-colors underline underline-offset-4 text-sm font-medium">
              Partner with TravelMatch
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} TravelMatch Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
