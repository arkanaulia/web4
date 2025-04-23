"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import JackCard from "./components/JackCard";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroWrapperRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { height: "65vh" },
        {
          height: "100vh",
          ease: "none",
          scrollTrigger: {
            trigger: heroWrapperRef.current,
            start: "bottom bottom", // ⬅ Snap to bottom when bottom hits viewport bottom
            end: "+=35vh", // ⬅ Amount of scroll to expand fully
            scrub: true,
            pin: true,
            pinSpacing: false, // ⬅ Prevent extra space being added below when pinned
            anticipatePin: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="scroll-smooth">
      <div className="h-[200vh]">
        {/* Sticky intro section */}
        <div className="sticky top-0 left-0 z-20">
          <div className="NAME w-full h-[35vh] bg-[url(/hero1.png)] bg-cover bg-center flex items-center justify-center">
            <div className="flex flex-row items-end justify-center gap-12 w-[900px]">
              <Image
                src="/logo.svg"
                alt="logo"
                width={2000}
                height={2000}
                className="w-max h-44"
              />
              <div className="inline-flex flex-col items-start">
                <h1 className="text-orange-500 text-4xl font-display -mb-1 mix-blend-difference">
                  Everything.
                </h1>
                <p className="text-white text-md font-light font-sans">
                  Unfortunately born to be jack of all trades—analyze, design,
                  code, write, fix, plan—you name it. Not too flashy, just the
                  one who gets it done when no one else can. Because in the end,
                  everyone needs everything.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* HERO section */}
        <div ref={heroWrapperRef}>
          <div
            ref={heroRef}
            className="HERO w-full flex flex-row h-[65vh] bg-[#151515] justify-between z-10"
          >
            <div className="w-max">
              <Image
                src="/herologo.svg"
                alt="herologo"
                width={2000}
                height={1000}
                className="h-full w-full pl-5"
              />
            </div>
            <div className="w-[85%] p-6">
              <JackCard />
            </div>
          </div>
        </div>

        {/* More content */}
        <div className="h-[100vh] bg-[#222] text-white flex items-center justify-center text-xl">
          Keep Scrolling...
        </div>
      </div>
    </div>
  );
}
