/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Instagram, Mail, MapPin } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
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

  const characters = text.split("");
  const totalChars = characters.length;

  return (
    <p ref={containerRef} className={`${className} flex flex-wrap`}>
      {characters.map((char, i) => {
        // Calculate the range for this specific character
        const start = i / totalChars;
        const end = (i + 1) / totalChars;

        // Map the container's scroll progress to this character's opacity and position
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const y = useTransform(scrollYProgress, [start, end], [10, 0]);

        return (
          <motion.span
            key={i}
            style={{ opacity, y }}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
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

  // Image moves up at 20% of scroll speed for a deep premium feel
  const heroImgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroImgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  // Headline drifts up slightly
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  // Headline fades out as you scroll past
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="py-6 flex justify-center border-b border-gray-100">
        <img
          src="/images/virekalogo.png"
          alt="Vireka Group Logo"
          className="h-14 w-auto object-contain"
        />
      </header>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '3456 / 1903' }}
      >
        {/* Parallax image */}
        <motion.img
          src="/images/virekaherosec.png"
          alt="Vireka Group Hero Banner"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ y: heroImgY, scale: heroImgScale }}
        />

        {/* Dark overlay so text stays readable */}
        <div className="absolute inset-0 bg-black/5 z-[1]" />

        {/* Headline – drifts + fades as hero scrolls away */}
        <motion.div
          className="absolute bottom-[10%] left-[100px] text-white z-10"
          style={{ y: heroTextY, opacity: heroTextOpacity }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[32px] md:text-[54px] font-bold leading-tight"
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
        <FadeUp className="w-full md:w-1/2 flex relative" y={60}>
          <img
            src="/images/foundersimg.png"
            alt="Founders of Vireka Group"
            className="w-full h-auto object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-end px-[100px] pb-12 text-white bg-gradient-to-t from-black/40 to-transparent">
            <h3 className="text-3xl md:text-[40px] font-bold leading-tight mb-2 tracking-tight">
              Reka &amp; Vicky
            </h3>
            <p className="text-[20px] md:text-[24px] font-light tracking-wide text-gray-200">
              Founders of Vireka Group
            </p>
          </div>
        </FadeUp>

        {/* Right – copy */}
        <FadeUp delay={0.2} className="w-full md:w-1/2 p-10 md:p-20 flex flex-col justify-center bg-white" y={40}>
          <h2 className="text-[46px] font-bold mb-8">About Us</h2>
          <div className="space-y-6 text-gray-500 leading-relaxed text-base">
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
            <p>
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
                <h2 className="text-[#1A3673] text-[34px] md:text-[42px] font-bold mb-8">
                  Founders' Philosophy
                </h2>
              </FadeUp>
              <TypingText
                className="text-[28px] md:text-[39px] text-gray-500 leading-snug font-medium"
                text='"Success comes to those who dream big, stay resilient, and create value that goes beyond business."'
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Ecosystem ───────────────────────────────────────────────────── */}
      <section className="pt-24 pb-8 px-[100px]">
        <FadeUp className="mb-16">
          <h2 className="text-[50px] font-[600] text-black">Our Ecosystem of Businesses</h2>
          <p className="max-w-[750px] font-[200] text-black mt-4 mb-20 text-[18.6px]">
            Discover the ventures that form the core of the Vireka Group's identity-dynamic brands
            built to deliver exceptional experiences.
          </p>
        </FadeUp>

        <FadeUp delay={0.2} className="flex justify-center items-center w-full" y={80}>
          <img
            src="/images/virekaecosystem.png"
            alt="Vireka Group Ecosystem"
            className="w-full h-auto object-cover max-w-6xl -mb-12 relative z-10"
          />
        </FadeUp>
      </section>

      {/* ── Milestones & Memories ───────────────────────────────────────────── */}
      <section className="py-24 px-[100px] bg-white">
        <FadeUp className="mb-12">
          <h2 className="text-[48px] font-bold mb-4 text-black">Milestones &amp; Memories</h2>
          <p className="text-black max-w-[600px] text-[16px]">
            Celebrating key moments that shape our journey-where people, purpose, and progress come
            together under the Vireka Group story.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
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
                  South Indian Flavors &amp;
                  <br />
                  Star Moments – A Day
                  <br />
                  to Remember
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
            <div key={i}>
              <FadeUp delay={i * 0.15} y={50}>
                <div className="flex flex-col hover:bg-gray-200 transition-colors duration-300 p-4 -m-4 cursor-pointer h-full">
                  <div className="overflow-hidden rounded-md mb-4">
                    <img
                      src={card.src}
                      alt={card.alt}
                      className="w-full aspect-[4/3] object-cover"
                    />
                  </div>
                  <div className="px-2">
                    <h3 className="font-bold text-[32px] mb-4 text-black leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-[18px] text-black max-w-[430px] leading-relaxed font-normal">
                      {card.body}
                    </p>
                  </div>
                </div>
              </FadeUp>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#f0f0f0] py-20 px-[160px]">
        <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32">
          {/* Left column */}
          <FadeUp y={30}>
            <h2 className="text-[52px] font-bold mb-8 text-black tracking-tight">Contact Us</h2>
            <div className="text-black text-[18px] space-y-4 mb-12">
              <p>Want to get in touch with us?</p>
              <p>
                Feel free to send us an email, and we'll get back to
                <br />
                you as soon as possible.
              </p>
            </div>

            <div className="space-y-10">
              <div>
                <h3 className="font-medium text-[32px] mb-5 text-black">Vireka Group</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-[20px] font-medium text-black">
                    <MapPin className="w-6 h-6 shrink-0" strokeWidth={2.5} />
                    <span>463 Aldborough Road South, Ilford, Essex, UK</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[20px] font-medium text-black">
                    <Mail className="w-6 h-6 shrink-0" strokeWidth={2.5} />
                    <span>bdm@virekagroup.co.uk</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-[32px] mb-4 text-black">Follow Us</h3>
                <p className="text-[18px] text-black mb-5">Stay connected and see our latest updates.</p>
                <a
                  href="https://www.instagram.com/virekagroup/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-[20px] font-medium text-black hover:text-blue-900 transition-colors cursor-pointer inline-flex"
                >
                  <Instagram className="w-6 h-6 shrink-0" strokeWidth={2.5} />
                  <span>virekagroup</span>
                </a>
              </div>
            </div>
          </FadeUp>

          {/* Right column – form */}
          <FadeUp delay={0.2} y={30}>
            <h2 className="text-[52px] font-bold mb-8 text-black tracking-tight">Get in Touch</h2>
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
                className="w-full p-4 bg-white border-none focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all text-[18px] text-gray-800 placeholder-gray-400"
              />
              <input
                type="tel"
                required
                placeholder="Contact Number"
                className="w-full p-4 bg-white border-none focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all text-[18px] text-gray-800 placeholder-gray-400"
              />
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full p-4 bg-white border-none focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all text-[18px] text-gray-800 placeholder-gray-400"
              />
              <textarea
                placeholder="Message"
                required
                rows={4}
                className="w-full p-4 bg-white border-none focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all text-[18px] text-gray-800 placeholder-gray-400 resize-none"
              />
              <div className="pt-8 mt-4">
                <button
                  type="submit"
                  className="w-full bg-black text-white py-4 hover:bg-zinc-900 transition-all duration-300 text-[17px] font-medium tracking-wide uppercase"
                >
                  Submit
                </button>
              </div>
            </form>
          </FadeUp>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-black text-[#8c8c8c] py-6 text-center">
        <p className="text-[14px] text-gray-400">Copyright © 2025 Vireka Group - All Rights Reserved.</p>
      </footer>
    </div>
  );
}
