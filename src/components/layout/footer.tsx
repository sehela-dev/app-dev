"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const MainFooterComponent = () => {
  const pathname = usePathname();
  const showCta = pathname === "/";

  return (
    <footer className="ref-footer text-brand-500 font-sans">
      {showCta && (
        <div className="footer-cta">
          <h2>
            Your mat is <em>waiting.</em>
          </h2>
          <p>First class at Sehela Space? Come 15 minutes early.</p>
          <div className="hero-ctas">
            <Link href="/book" className="btn-primary">
              Book a Class
            </Link>
            <a href="https://wa.me/62811149688" className="btn-ghost">
              WhatsApp Us
            </a>
          </div>
        </div>
      )}

      <div className="footer-body">
        <div className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://book.sehelaspace.com/_next/image?url=%2Fassets%2Fsehela-light.png&w=256&q=75" alt="Sehela Space" />
        </div>
        <p className="blurb">A yoga studio in South Jakarta with two homes — Pondok Labu and Kemang.</p>

        <div className="footer-col">
          <h4>Contacts</h4>
          <div>
            <a href="https://wa.me/62811149688">Pondok Labu · +62 811-1496-88</a>
          </div>
          <div>
            <a href="https://wa.me/6281110002826">Kemang Studio · +62 811-1000-2826</a>
          </div>
          <div>
            <a href="https://wa.me/6281110101800">Partnership · Amyra Amalia +62 811-1010-1800</a>
          </div>
          <div>sehelaspace@gmail.com</div>
          <a href="https://instagram.com/sehelaspace" target="_blank" rel="noopener noreferrer">
            @sehelaspace
          </a>

        </div>

        <div className="footer-col">
          <h4>Locations</h4>
          <a href="#locations">Pondok Labu</a>
          <a href="#locations">Kemang (inside East Kemang Padel Club)</a>
        </div>

        <div className="footer-col">
          <h4>More</h4>
          <a href="/terms-and-conditions">Terms and Conditions</a>
        </div>
      </div>

      <div className="footer-bottom">© 2026 Sehela Space. All rights reserved.</div>
    </footer>
  );
};
