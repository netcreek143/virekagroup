/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Instagram, Mail, MapPin } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import Lenis from 'lenis';

// ─── Reusable fade-up wrapper ────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = '',
  y = 40,
}: {
  children: React.ReactNode | React.ReactNode[];
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Scroll-driven Typing text component ─────────────────────────────────────
function TypingText({ text, className = "" }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Start appearing when the container starts entering from the bottom
    // Finish appearing when the container is fully visible
    offset: ["start 0.95", "end 0.8"]
  });

  const words = text.split(" ");
  const totalChars = text.length;
  let charIndexTracker = 0;

  return (
    <p ref={containerRef} className={`${className} flex flex-wrap`}>
      {words.map((word, i) => {
        const wordChars = word.split("");
        return (
          <span key={i} className="inline-block whitespace-nowrap">
            {wordChars.map((char) => {
              const currentPos = charIndexTracker++;
              const start = currentPos / totalChars;
              const end = (currentPos + 1) / totalChars;

              // eslint-disable-next-line react-hooks/rules-of-hooks
              const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const y = useTransform(scrollYProgress, [start, end], [10, 0]);

              return (
                <motion.span key={currentPos} style={{ opacity, y }} className="inline-block">
                  {char}
                </motion.span>
              );
            })}
            {/* Handle the space after the word */}
            {i < words.length - 1 && (
              <motion.span
                key={`space-${i}`}
                style={{
                  opacity: useTransform(scrollYProgress, [charIndexTracker / totalChars, (charIndexTracker + 1) / totalChars], [0, 1])
                }}
                className="inline-block"
              >
                &nbsp;
              </motion.span>
            )}
            {/* Increment index for the space character */}
            {(() => { if (i < words.length - 1) charIndexTracker++; return null; })()}
          </span>
        );
      })}
    </p>
  );
}

export default function App() {
  // ── Lenis Smooth Scroll Initialization ─────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // ── Hero parallax setup ───────────────────────────────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroImgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroImgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="py-4 md:py-6 flex justify-center border-b border-gray-100 bg-white z-50">
        <img
          src="/images/virekalogo.png"
          alt="Vireka Group Logo"
          className="h-10 md:h-14 w-auto object-contain"
        />
      </header>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden aspect-[3/4] md:aspect-[3456/1903]"
      >
        <motion.img
          src="/images/virekaherosec.png"
          alt="Vireka Group Hero Banner"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ y: heroImgY, scale: heroImgScale }}
        />
        <div className="absolute inset-0 bg-black/10 z-[1]" />

        <motion.div
          className="absolute bottom-[8%] md:bottom-[10%] left-6 md:left-12 lg:left-24 xl:left-32 text-white z-10 max-w-[90%]"
          style={{ y: heroTextY, opacity: heroTextOpacity }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[28px] sm:text-[36px] md:text-[54px] font-bold leading-[1.1]"
          >
            Driven by Vision
            <br />
            Defined by Success
          </motion.h1>
        </motion.div>
      </section>

      {/* ── About Us ────────────────────────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row items-stretch overflow-hidden">
        {/* Left – image */}
        <FadeUp className="w-full md:w-1/2 flex relative bg-gray-50" y={60}>
          <div className="w-full h-full relative aspect-[4/5] md:aspect-auto overflow-hidden">
            <img
              src="/images/foundersimg.png"
              alt="Founders of Vireka Group"
              className="w-full h-full object-cover transition-opacity duration-300"
              onLoad={(e) => (e.currentTarget.style.opacity = '1')}
              style={{ opacity: 0 }}
            />
          </div>
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:px-24 lg:pb-16 text-white bg-gradient-to-t from-black/60 via-black/20 to-transparent">
            <h3 className="text-2xl sm:text-3xl md:text-[32px] lg:text-[40px] font-bold leading-tight mb-2 tracking-tight">
              Reka &amp; Vicky
            </h3>
            <p className="text-lg md:text-[20px] lg:text-[24px] font-light tracking-wide text-gray-200">
              Founders of Vireka Group
            </p>
          </div>
        </FadeUp>

        {/* Right – copy */}
        <FadeUp delay={0.2} className="w-full md:w-1/2 p-8 md:p-12 lg:p-20 xl:p-24 flex flex-col justify-center bg-white" y={40}>
          <h2 className="text-3xl md:text-[40px] lg:text-[46px] font-bold mb-6 md:mb-8">About Us</h2>
          <div className="space-y-4 md:space-y-6 text-gray-600 leading-relaxed text-sm md:text-base lg:text-lg">
            <p>
              Vireka Group stands as a reflection of vision, ambition, and the belief that powerful
              ideas can create lasting impact. The journey began in 1995, when its founders set out
              with a shared entrepreneurial spirit to build ventures that enhance experiences and
              redefine industries.
            </p>
            <p>
              This vision took shape in 2008 with the formation of Vireka Group, a UK-based
              conglomerate built on the pillars of trust, innovation, and continuous evolution.
              Founded by Mr. Vicky and Mrs. Reka Vicky, the group has grown into a dynamic and
              diversified organization with a strong presence across hospitality, entertainment, and
              emerging business opportunities.
            </p>
            <p className="hidden lg:block">
              With over 25 years of collective experience, the founders have cultivated a portfolio
              that reflects both creative excellence and strategic growth. Their leadership, driven by
              integrity and a passion for bringing ideas to life, continues to shape the direction of
              the group.
            </p>
            <p>
              Today, Vireka Group is not just a collection of businesses, but a platform that brings
              together vision, experience, and execution, consistently creating value and setting new
              benchmarks across industries.
            </p>
          </div>
        </FadeUp>
      </section>

      {/* ── Founders' Philosophy ─────────────────────────────────────────────── */}
      <section
        className="w-full overflow-hidden flex items-center justify-center p-6 md:p-20"
        style={{
          minHeight: '500px',
          backgroundImage: "url('/images/fouphilsecbg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#f2f2f2',
        }}
      >
        <div className="max-w-[1100px] mx-auto w-full relative z-10">
          <div className="flex flex-col items-center justify-center -translate-x-[20px] -translate-y-[20px]">
            <div className="w-full text-left max-w-5xl">
              <FadeUp>
                <h2 className="text-[#1A3673] text-[34px] md:text-[42px] font-bold mb-3">
                  Founders' Philosophy
                </h2>
              </FadeUp>
              <TypingText
                className="text-[28px] md:text-[39px] text-gray-500 leading-snug font-medium max-w-[1000px]"
                text='"Success comes to those who dream big, stay resilient, and create value that goes beyond business."'
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Ecosystem ───────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 xl:px-32 max-w-[1920px] mx-auto overflow-hidden">
        <FadeUp className="mb-12 md:mb-16">
          <h2 className="text-3xl md:text-[42px] lg:text-[50px] font-semibold text-black">Our Ecosystem of Businesses</h2>
          <p className="max-w-[750px] font-light text-black mt-4 text-base md:text-lg lg:text-[18.6px]">
            Discover the ventures that form the core of the Vireka Group's identity-dynamic brands
            built to deliver exceptional experiences.
          </p>
        </FadeUp>

        <FadeUp delay={0.2} className="flex justify-center items-center w-full" y={60}>
          <img
            src="/images/virekaecosystem.png"
            alt="Vireka Group Ecosystem"
            className="w-full h-auto object-contain max-w-6xl lg:-mb-12 relative z-10"
          />
        </FadeUp>
      </section>

      {/* ── Milestones & Memories ───────────────────────────────────────────── */}
      < section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 xl:px-32 bg-white max-w-[1920px] mx-auto" >
        <FadeUp className="mb-12">
          <h2 className="text-3xl md:text-[42px] lg:text-[48px] font-bold mb-4 text-black">Milestones &amp; Memories</h2>
          <p className="text-black max-w-[600px] text-base md:text-[16px]">
            Celebrating key moments that shape our journey-where people, purpose, and progress come
            together under the Vireka Group story.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
          {[
            {
              src: '/images/mm1.png',
              alt: 'Grand Opening',
              title: 'Saravanaa Bhavan Wembley Grand opening',
              body: 'A proud milestone celebrated with esteemed guests. A moment of joy, culture, and togetherness, Marking the beginning of many flavorful experiences ahead.',
            },
            {
              src: '/images/mm2.png',
              alt: 'Star Moments',
              title: (
                <>
                  South Indian Flavors &amp; Star Moments – A Day to Remember
                </>
              ),
              body: 'A remarkable day with Actor Dhanush at Saravanaa Bhavan Kenton celebrating culture, food, and cherished moments together.',
            },
            {
              src: '/images/mm3.png',
              alt: 'Celebratory',
              title: 'Celebratory &amp; Emotional',
              body: 'A memorable musical moment at Saravanaa Bhavan! We were thrilled to host the sensational Sid Sriram, filling the air with energy, smiles, and unforgettable vibes.',
            },
          ].map((card, i) => (
            <div key={i} className="group">
              <FadeUp delay={i * 0.15} y={50}>
                <div className="flex flex-col hover:bg-gray-50 md:hover:bg-gray-100 transition-colors duration-300 p-0 md:p-6 md:-m-6 cursor-pointer h-full">
                  <div className="overflow-hidden mb-6">
                    <img
                      src={card.src}
                      alt={card.alt}
                      className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="px-1 md:px-0">
                    <h3 className="font-bold text-xl md:text-2xl lg:text-[28px] xl:text-[32px] mb-4 text-black leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-base lg:text-[18px] text-gray-700 leading-relaxed font-normal">
                      {card.body}
                    </p>
                  </div>
                </div>
              </FadeUp>
            </div>
          ))}
        </div>
      </section >

      {/* ── Contact ─────────────────────────────────────────────────────────── */}
      < section className="bg-[#f8f8f8] py-16 px-6 md:py-24 md:px-12 lg:px-24 xl:px-32 max-w-[1920px] mx-auto" >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-16 lg:gap-24 xl:gap-32">
          {/* Left column */}
          <FadeUp y={30}>
            <h2 className="text-3xl md:text-[42px] lg:text-[52px] font-bold mb-6 md:mb-8 text-black tracking-tight">Contact Us</h2>
            <div className="text-black text-base md:text-[18px] space-y-4 mb-10 md:mb-12">
              <p>Want to get in touch with us?</p>
              <p>
                Feel free to send us an email, and we'll get back to
                you as soon as possible.
              </p>
            </div>

            <div className="space-y-8 md:space-y-10">
              <div>
                <h3 className="font-semibold text-2xl md:text-[32px] mb-4 md:mb-5 text-black">Vireka Group</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 text-lg md:text-[20px] font-medium text-black">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 shrink-0 mt-1" strokeWidth={2.5} />
                    <span>463 Aldborough Road South, Ilford, Essex, UK</span>
                  </div>
                  <div className="flex items-center space-x-3 text-lg md:text-[20px] font-medium text-black">
                    <Mail className="w-5 h-5 md:w-6 md:h-6 shrink-0" strokeWidth={2.5} />
                    <span className="break-all">bdm@virekagroup.co.uk</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-2xl md:text-[32px] mb-3 md:mb-4 text-black">Follow Us</h3>
                <p className="text-base md:text-[18px] text-gray-600 mb-4 md:mb-5">Stay connected and see our latest updates.</p>
                <a
                  href="https://www.instagram.com/virekagroup/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-lg md:text-[20px] font-medium text-black hover:text-blue-900 transition-colors cursor-pointer inline-flex"
                >
                  <Instagram className="w-5 h-5 md:w-6 md:h-6 shrink-0" strokeWidth={2.5} />
                  <span>virekagroup</span>
                </a>
              </div>
            </div>
          </FadeUp>

          {/* Right column – form (Reverted to original non-card aesthetic) */}
          <FadeUp delay={0.2} y={30}>
            <h2 className="text-2xl md:text-[36px] lg:text-[42px] font-bold mb-6 md:mb-8 text-black tracking-tight">Get in Touch</h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                alert('Form submitted successfully!');
              }}
            >
              <input
                type="text"
                required
                placeholder="Name"
                className="w-full p-4 bg-white border-none focus:outline-none focus:ring-1 focus:ring-black transition-all text-base md:text-[18px] text-gray-800 placeholder-gray-400 rounded-none shadow-sm"
              />
              <input
                type="tel"
                required
                placeholder="Contact Number"
                className="w-full p-4 bg-white border-none focus:outline-none focus:ring-1 focus:ring-black transition-all text-base md:text-[18px] text-gray-800 placeholder-gray-400 rounded-none shadow-sm"
              />
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full p-4 bg-white border-none focus:outline-none focus:ring-1 focus:ring-black transition-all text-base md:text-[18px] text-gray-800 placeholder-gray-400 rounded-none shadow-sm"
              />
              <textarea
                placeholder="Message"
                required
                rows={4}
                className="w-full p-4 bg-white border-none focus:outline-none focus:ring-1 focus:ring-black transition-all text-base md:text-[18px] text-gray-800 placeholder-gray-400 resize-none rounded-none shadow-sm"
              />
              <div className="pt-4 md:pt-6">
                <button
                  type="submit"
                  className="w-full bg-black text-white py-4 md:py-5 hover:bg-zinc-800 transition-all duration-300 text-sm md:text-base font-bold tracking-widest uppercase rounded-none"
                >
                  SUBMIT
                </button>
              </div>
            </form>
          </FadeUp>
        </div>
      </section >

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      < footer className="bg-black text-gray-400 py-6 md:py-8 text-center px-6" >
        <p className="text-xs md:text-sm lg:text-base font-light tracking-wide">
          Copyright © 2026 <span className="text-white font-medium">Vireka Group</span> - All Rights Reserved.
        </p>
      </footer >
    </div >
  );
}
