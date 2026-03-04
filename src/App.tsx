/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Instagram, Mail, MapPin } from 'lucide-react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';
import Lenis from 'lenis';

// ─── Reusable fade-up wrapper ────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = '',
  y = 40,
  duration = 0.8,
}: {
  children: React.ReactNode | React.ReactNode[];
  delay?: number;
  className?: string;
  y?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Reusable 3D Tilt Image component ────────────────────────────────────────
function TiltImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-3deg", "3deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-auto object-contain"
        style={{
          transform: "translateZ(50px)",
        }}
      />
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
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', '-150%']);

  // ── Contact Form State ────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // The user's new working macro URL
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz3ytJwIi3s8kzY4ffGQYY__RfoY4zoHva3zFAEd9CxYWEkq-LJbUtPSfOC7IIG3Gw6/exec';

    const data = {
      formType: 'contact',
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      message: formData.message,
      source: window.location.pathname
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      // no-cors doesn't return a readable response so we assume success if no throw
      setSubmitStatus('success');
      setFormData({ name: '', mobile: '', email: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 4000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Navbar Scroll State ───────────────────────────────────────────────────
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 w-full flex justify-center border-b border-gray-100 z-[100] transition-all duration-300 ease-in-out ${isScrolled
          ? 'py-3 bg-white/95 backdrop-blur-md shadow-md'
          : 'py-4 md:py-6 bg-white'
          }`}
      >
        <img
          src="/images/virekalogo.png"
          alt="Vireka Group Logo"
          className={`w-auto object-contain transition-all duration-300 ease-in-out ${isScrolled ? 'h-8 md:h-10' : 'h-10 md:h-14'
            }`}
        />
      </header>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden aspect-[3/3.8] md:aspect-[3456/1650] xl:aspect-[3456/1800]"
      >
        {/* Desktop Image */}
        <motion.img
          src="/images/virekaherosec.jpg"
          alt="Vireka Group Hero Banner"
          className="hidden lg:block absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ y: heroImgY, scale: heroImgScale }}
        />
        {/* Mobile/Tablet Image */}
        <motion.img
          src="/images/virekaherosec.jpg"
          alt="Vireka Group Hero Banner"
          className="block lg:hidden absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ y: heroImgY, scale: heroImgScale }}
        />
        <div className="absolute inset-0 bg-black/10 z-[1]" />

        <motion.div
          className="absolute bottom-[8%] md:bottom-[10%] left-6 md:left-12 lg:left-24 xl:left-32 text-white z-10 max-w-[90%]"
          style={{ y: heroTextY }}
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
      <section className="flex flex-col md:flex-row items-stretch overflow-hidden lg:max-h-[600px]">
        {/* Left – image */}
        <div className="w-full md:w-1/2 flex relative bg-[#0f2347] overflow-hidden">
          <FadeUp className="w-full h-full flex flex-col relative" y={20} duration={0.4}>
            <div className="w-full h-full relative aspect-[4/3] md:aspect-auto overflow-hidden">
              <img
                src="/images/foundersimg.png"
                alt="Founders of Vireka Group"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:px-16 lg:pb-12 text-white bg-gradient-to-t from-black/60 via-black/20 to-transparent">
              <h3 className="text-xl sm:text-2xl md:text-[26px] lg:text-[32px] font-bold leading-tight mb-2 tracking-tight">
                Reka &amp; Vicky
              </h3>
              <p className="text-base md:text-[16px] lg:text-[20px] font-light tracking-wide text-gray-200">
                Founders of Vireka Group
              </p>
            </div>
          </FadeUp>
        </div>

        {/* Right – copy */}
        <FadeUp delay={0.2} className="w-full md:w-1/2 p-6 md:p-10 lg:p-14 xl:p-16 flex flex-col justify-center bg-white" y={40}>
          <h2 className="text-2xl md:text-[32px] lg:text-[38px] font-bold mb-4 md:mb-6">About Us</h2>
          <div className="space-y-3 md:space-y-4 text-gray-600 leading-relaxed text-sm md:text-sm lg:text-base">
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
        className="w-full bg-[#f2f2f2] overflow-hidden relative flex items-center py-4 sm:py-8 md:py-16 lg:py-0 lg:aspect-[3456/1200] xl:aspect-[3456/974]"
      >
        <img
          src="/images/fouphilsecbg.svg"
          className="absolute inset-0 w-full h-full object-cover z-0 
                     hidden md:block
                     md:translate-x-[40%] md:-translate-y-[20%]
                     lg:-translate-x-[0.5%] lg:-translate-y-[2%]
                     lg:scale-[1.05] opacity-90 pointer-events-none transition-transform duration-500"
          alt=""
        />

        {/* Proportional positioning that adapts across breakpoints */}
        <div className="relative z-10 w-full px-6 sm:px-10 md:pl-[12%] lg:pl-[18%] md:pr-[10%] lg:-translate-y-[28%]">
          <div className="w-full text-left max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
            <FadeUp>
              <h2 className="text-[#1A3673] text-[24px] sm:text-[30px] md:text-[clamp(1.6rem,3.8vw,2.6rem)] font-bold mb-3 sm:mb-4 md:mb-[0.4em] tracking-tight">
                Founders' Philosophy
              </h2>
            </FadeUp>
            <TypingText
              className="text-[17px] sm:text-[22px] md:text-[clamp(1.3rem,3vw,2.4rem)] text-gray-500 leading-relaxed md:leading-[1.35] font-medium max-w-[90vw] md:max-w-[1000px]"
              text='"Success comes to those who dream big, stay resilient, and create value that goes beyond business."'
            />
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

        <FadeUp delay={0.2} className="flex justify-center items-center w-full" y={60} duration={0.8}>
          <div style={{ perspective: "1000px" }} className="w-full max-w-6xl lg:-mb-12 relative z-10">
            <TiltImage
              src="/images/virekaecosystem.png"
              alt="Vireka Group Ecosystem"
              className="w-full"
            />
          </div>
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
              title: 'Celebratory & Emotional',
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

          {/* Right column – form */}
          <FadeUp delay={0.2} y={30}>
            <h2 className="text-2xl md:text-[36px] lg:text-[42px] font-bold mb-6 md:mb-8 text-black tracking-tight">Get in Touch</h2>
            <form
              className="space-y-4"
              onSubmit={handleFormSubmit}
            >
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Name"
                className="w-full p-4 bg-white border-none focus:outline-none focus:ring-1 focus:ring-black transition-all text-base md:text-[18px] text-gray-800 placeholder-gray-400 rounded-none cursor-text disabled:opacity-50"
                disabled={isSubmitting}
              />
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                required
                placeholder="Contact Number"
                className="w-full p-4 bg-white border-none focus:outline-none focus:ring-1 focus:ring-black transition-all text-base md:text-[18px] text-gray-800 placeholder-gray-400 rounded-none disabled:opacity-50"
                disabled={isSubmitting}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Email"
                className="w-full p-4 bg-white border-none focus:outline-none focus:ring-1 focus:ring-black transition-all text-base md:text-[18px] text-gray-800 placeholder-gray-400 rounded-none disabled:opacity-50"
                disabled={isSubmitting}
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Message"
                required
                rows={4}
                className="w-full p-4 bg-white border-none focus:outline-none focus:ring-1 focus:ring-black transition-all text-base md:text-[18px] text-gray-800 placeholder-gray-400 resize-none rounded-none disabled:opacity-50"
                disabled={isSubmitting}
              />
              <div className="pt-4 md:pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 md:py-5 transition-all duration-300 text-sm md:text-base font-bold bg-black tracking-widest uppercase rounded-none \${
                    submitStatus === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                    submitStatus === 'error' ? 'bg-red-600 text-white hover:bg-red-700' :
                    'bg-black text-white hover:bg-zinc-800 disabled:bg-gray-400'
                  }`}
                >
                  {isSubmitting ? 'Sending...' :
                    submitStatus === 'success' ? 'Sent ✓' :
                      submitStatus === 'error' ? 'Error - Retry' :
                        'SUBMIT'}
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
