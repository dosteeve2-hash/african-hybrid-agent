"use client";

/* Motion signature STEEVE.DO — charte « Nuit Sahélienne & Or » §5bis
   [data-hero="n"] : séquence d'entrée · [data-reveal-group] : stagger au scroll
   Respecte prefers-reduced-motion. */

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function BrandMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const heroEls = gsap.utils
        .toArray<HTMLElement>("[data-hero]")
        .sort((a, b) => Number(a.dataset.hero || 0) - Number(b.dataset.hero || 0));
      if (heroEls.length) {
        gsap.from(heroEls, {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.05,
          clearProps: "all",
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const targets = Array.from(group.children);
        if (!targets.length) return;
        gsap.from(targets, {
          opacity: 0,
          y: 20,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          clearProps: "all",
          immediateRender: false,
          scrollTrigger: { trigger: group, start: "top 95%", once: true },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
