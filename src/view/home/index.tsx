"use client";

import { MainFooterComponent } from "@/components/layout";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export const HomeView = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll(".client-content .reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col w-full font-serif">
      <style>{`
        .client-content{
          --teal:#347582;--teal-deep:#1F4750;--mint:#DCF2ED;--mint-soft:#EAF7F2;--peach:#FFDFCF;--coral:#E68D70;--ink:#1F4750;--ink-soft:#4B7078;--line:rgba(52,117,130,0.2);--line-dark:rgba(220,242,237,0.18);
          font-family:var(--font-sans);font-weight:300;color:var(--ink);-webkit-font-smoothing:antialiased;background:var(--mint);
        }
        .client-content .wrap{padding:0 20px}
        .client-content section{position:relative}
        .client-content .reveal{opacity:0;transform:translateY(14px);transition:opacity .6s ease,transform .6s ease}
        .client-content .reveal.in{opacity:1;transform:translateY(0)}
        .client-content .hero{background:var(--teal-deep);color:var(--mint);overflow:hidden}
        .client-content .hero .wrap{padding:34px 20px 30px 20px}
        .client-content .hero-eyebrow{font-family:var(--font-sans);font-size:12.5px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--coral);margin-bottom:14px}
        .client-content .hero h1{font-family:var(--font-serif);font-weight:400;font-size:34px;line-height:1.14;letter-spacing:-0.01em}
        .client-content .hero h1 em{font-style:italic;font-weight:400;color:var(--peach)}
        .client-content .hero p.lead{margin-top:14px;font-size:15px;line-height:1.6;color:rgba(220,242,237,0.8)}
        .client-content .hero-ctas{margin-top:20px;display:flex;gap:10px;flex-wrap:wrap}
        .client-content .btn-primary{background:var(--coral);color:var(--teal-deep);padding:12px 20px;border-radius:999px;font-family:var(--font-sans);font-weight:700;font-size:14.5px;display:inline-block;border:none}
        .client-content .btn-ghost{border:1px solid var(--line-dark);color:var(--mint);padding:12px 20px;border-radius:999px;font-family:var(--font-sans);font-weight:700;font-size:14.5px;display:inline-block}
        .client-content .section-head{text-align:center;margin:0 auto 28px auto}
        .client-content .section-head .eyebrow{font-family:var(--font-sans);font-size:12.5px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--coral);margin-bottom:10px}
        .client-content .section-head h2{font-family:var(--font-serif);font-weight:400;font-size:27px;line-height:1.2;color:var(--ink)}
        .client-content .section-head p{margin-top:10px;font-size:14px;color:var(--ink-soft);line-height:1.55}
        .client-content .classes{padding:44px 0;background:var(--mint-soft)}
        .client-content .class-grid{display:grid;grid-template-columns:1fr;gap:12px}
        .client-content .class-card{background:var(--mint);border:1px solid var(--line);border-radius:16px;padding:20px 18px;display:flex;gap:14px;align-items:flex-start}
        .client-content .class-card .icon{width:22px;height:22px;flex:0 0 auto;margin-top:2px}
        .client-content .class-card h3{font-family:var(--font-serif);font-size:18.5px;font-weight:400;margin-bottom:4px;color:var(--teal)}
        .client-content .class-card p{font-size:13.5px;line-height:1.5;color:var(--ink-soft)}
        .client-content .tag{display:inline-block;margin-top:8px;font-family:var(--font-sans);font-size:11.5px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:var(--teal);background:rgba(52,117,130,0.12);padding:4px 10px;border-radius:999px}
        .client-content .class-card.more{display:block;background:var(--teal);color:var(--mint)}
        .client-content .class-card.more h3{color:var(--mint)}
        .client-content .class-card.more p{color:rgba(220,242,237,0.8);margin-bottom:10px}
        .client-content .class-card.more a{font-family:var(--font-sans);font-weight:700;font-size:13.5px;color:var(--peach);border-bottom:1px solid var(--peach);padding-bottom:2px}
        .client-content .classes-footnote{margin:24px auto 0 auto;text-align:center;font-size:13.5px;color:var(--ink-soft);line-height:1.55}
        .client-content .classes-footnote strong{color:var(--teal)}
        .client-content .classes-footnote a{color:var(--coral);font-weight:700;border-bottom:1px solid var(--coral)}
        .client-content .workshops{background:var(--teal);color:var(--mint);padding:40px 0}
        .client-content .workshops .eyebrow{font-family:var(--font-sans);font-size:12.5px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--peach);margin-bottom:10px}
        .client-content .workshops h2{font-family:var(--font-serif);font-weight:400;font-size:22px;line-height:1.25;margin-bottom:10px}
        .client-content .workshops p{font-size:13.5px;color:rgba(220,242,237,0.85);line-height:1.55;margin-bottom:18px}
        .client-content .training{background:var(--peach);padding:44px 0}
        .client-content .training .eyebrow{font-family:var(--font-sans);font-size:12.5px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--coral);margin-bottom:10px}
        .client-content .training .training-h2{font-family:var(--font-serif);font-weight:400;font-size:25px;line-height:1.2;color:var(--teal-deep);margin-bottom:12px}
        .client-content .training .training-p{font-size:14px;line-height:1.6;color:var(--ink-soft);margin-bottom:16px}
        .client-content .training .partner-line{display:flex;align-items:center;gap:8px;font-family:var(--font-sans);font-size:12.5px;font-weight:600;color:var(--teal-deep);margin-bottom:22px}
        .client-content .training .partner-line .dot{width:5px;height:5px;border-radius:50%;background:var(--coral)}
        .client-content .training-card{background:var(--mint-soft);border-radius:16px;padding:22px 20px;border:1px solid rgba(31,71,80,0.1)}
        .client-content .training-card .k{font-family:var(--font-sans);font-size:11.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--coral);margin-bottom:8px}
        .client-content .training-card .v{font-family:var(--font-serif);font-size:19px;color:var(--teal);margin-bottom:12px}
        .client-content .training-card p{font-size:13px;color:var(--ink-soft);line-height:1.55;margin-bottom:16px}
        .client-content .locations{padding:44px 0}
        .client-content .loc-grid{display:grid;grid-template-columns:1fr;gap:14px}
        .client-content .loc-card{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--mint-soft)}
        .client-content .loc-photo{height:120px;background:linear-gradient(135deg,var(--teal),var(--coral));position:relative}
        .client-content .loc-photo .loc-name{position:absolute;bottom:14px;left:18px;font-family:var(--font-serif);font-style:italic;font-size:20px;color:var(--mint)}
        .client-content .loc-body{padding:18px}
        .client-content .loc-body .addr{font-size:12.5px;color:var(--ink-soft);line-height:1.55;margin-bottom:6px}
        .client-content .loc-body .note{font-size:12px;color:var(--coral);font-weight:700;font-family:var(--font-sans);margin-bottom:10px}
        .client-content .loc-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:10px}
        .client-content .loc-actions a{font-family:var(--font-sans);font-size:12.5px;font-weight:700;color:var(--teal);border-bottom:1px solid var(--teal);padding-bottom:2px}
        .client-content .pricing{background:var(--mint-soft);padding:44px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
        .client-content .price-table{background:var(--mint);border:1px solid var(--line);border-radius:16px;overflow:hidden;margin-bottom:16px}
        .client-content .price-row{display:flex;flex-direction:column;gap:3px;padding:14px 18px;border-bottom:1px solid var(--line)}
        .client-content .price-row:last-child{border-bottom:none}
        .client-content .price-row .top-line{display:flex;justify-content:space-between;align-items:baseline}
        .client-content .price-row .name{font-family:var(--font-serif);font-size:15px;color:var(--ink)}
        .client-content .price-row .price{font-family:var(--font-serif);font-size:15px;color:var(--teal);font-weight:500}
        .client-content .price-row .meta{font-size:11.5px;color:var(--ink-soft)}
        .client-content .price-note{font-size:12px;color:var(--ink-soft);line-height:1.6;padding:12px 18px 4px 18px}
        .client-content .price-note strong{color:var(--teal)}
        .client-content .highlight-grid{display:grid;grid-template-columns:1fr;gap:14px;margin-bottom:16px}
        .client-content .price-highlight{background:var(--teal-deep);color:var(--mint);border-radius:16px;padding:22px 20px}
        .client-content .price-highlight .h-eyebrow{font-family:var(--font-sans);font-size:11.5px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:var(--peach);margin-bottom:8px}
        .client-content .price-highlight h3{font-family:var(--font-serif);font-size:19px;font-weight:400;margin-bottom:12px}
        .client-content .price-highlight ul{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}
        .client-content .price-highlight li{font-size:12.5px;color:rgba(220,242,237,0.85);padding-left:14px;position:relative}
        .client-content .price-highlight li::before{content:"—";position:absolute;left:0;color:var(--coral)}
        .client-content .price-highlight .packages{display:flex;flex-direction:column;gap:8px}
        .client-content .price-highlight .pkg{background:rgba(220,242,237,0.08);border:1px solid rgba(220,242,237,0.2);border-radius:10px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center}
        .client-content .price-highlight .pkg .label{font-family:var(--font-sans);font-size:13px;font-weight:600}
        .client-content .price-highlight .pkg .amt{font-family:var(--font-serif);font-size:16px;color:var(--peach)}
        .client-content .price-highlight .fine{margin-top:8px;font-size:11px;color:rgba(220,242,237,0.6)}
        .client-content .terms-btn{background:transparent;border:1px solid var(--teal);color:var(--teal);padding:10px 22px;border-radius:999px;font-family:var(--font-sans);font-weight:700;font-size:13.5px;cursor:pointer;display:inline-block}
        .client-content details.terms-details{margin-top:16px}
        .client-content details.terms-details summary{list-style:none}
        .client-content details.terms-details summary::-webkit-details-marker{display:none}
        .client-content .terms-panel{margin:14px 0 0 0;text-align:left;background:var(--mint);border:1px solid var(--line);border-radius:12px;padding:18px 20px;font-size:12.5px;color:var(--ink-soft);line-height:1.7}
        .client-content .terms-panel li{padding-left:14px;position:relative}
        .client-content .terms-panel li::before{content:"•";position:absolute;left:0;color:var(--coral)}
        .client-content .terms-panel .full-link{display:inline-block;margin-top:12px;font-weight:700;color:var(--coral);border-bottom:1px solid var(--coral)}
        .client-content .shop{padding:44px 0}
        .client-content .shop .eyebrow{font-family:var(--font-sans);font-size:12.5px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--coral);margin-bottom:10px}
        .client-content .shop h2{font-family:var(--font-serif);font-weight:400;font-size:24px;color:var(--ink);line-height:1.2;margin-bottom:10px}
        .client-content .shop p{font-size:14px;line-height:1.6;color:var(--ink-soft);margin-bottom:18px}
        .client-content .shop-visual{height:160px;border-radius:16px;background:linear-gradient(135deg,var(--peach),var(--mint-soft));border:1px solid var(--line);overflow:hidden;margin-bottom:18px}
        .client-content .shop-visual img{width:100%;height:100%;object-fit:cover}
      `}</style>

      <div className="client-content">
        {/* HERO — client content, client palette */}
        <section className="hero" id="home">
          <div className="wrap">
            <div className="hero-eyebrow">Pondok Labu · Kemang</div>
            <h1>
              Breathe to <em>make space.</em>
            </h1>
            <p className="lead">
              A single breath at Sehela brings you the space you need — to tune in with your body, to sit with your thoughts, or simply to focus on your day.
            </p>
            <div className="hero-ctas">
              <Link href="/book" className="btn-primary">
                Book a Class
              </Link>
            </div>
          </div>
        </section>

        <section className="classes reveal" id="classes">
          <div className="wrap">
            <div className="section-head">
              <div className="eyebrow">Find Your Class</div>
              <h2>A style for every body</h2>
              <p>There&apos;s a class paced for exactly where you are.</p>
            </div>
            <div className="class-grid">
              {[
                { title: "Hatha Yoga", desc: "Slow, deliberate, and rooted — a steady class for building a strong foundation and calming the mind." },
                { title: "Vinyasa Flow", desc: "Breath-linked movement that builds heat, rhythm, and focus." },
                { title: "Power Yoga", desc: "A stronger, faster-paced practice to build heat, strength, and a serious sweat." },
                { title: "Basic Yoga", desc: "No experience needed — just curiosity and an open mat. Perfect if you're new to yoga.", tag: "New to Yoga" },
                { title: "Yoga for 50s+", desc: "Gentle, chair-supported movement with props for comfort — built for strength, balance, and ease." },
                { title: "Prenatal Yoga", desc: "A safe, nurturing practice supportive through every trimester." },
              ].map((c) => (
                <div key={c.title} className="class-card">
                  <svg className="icon" viewBox="0 0 26 26" fill="none">
                    <circle cx="13" cy="13" r="10" stroke="#347582" strokeWidth="1.4" />
                    <circle cx="13" cy="13" r="4" fill="#E68D70" />
                  </svg>
                  <div>
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                    {c.tag && <span className="tag">{c.tag}</span>}
                  </div>
                </div>
              ))}
              <div className="class-card more">
                <h3>+ Many more to explore</h3>
                <p>Meditation, sound healing, reiki, access bar, and guest-led sessions rotate in regularly.</p>
                <Link href="/book">See full schedule &amp; book →</Link>
              </div>
            </div>
            <p className="classes-footnote">
              Have questions about the schedule? <strong>Message us on WhatsApp</strong> — full booking is on our <Link href="/book">booking site</Link>.
            </p>
          </div>
        </section>

        <section className="workshops reveal" id="workshops">
          <div className="wrap">
            <div className="eyebrow">Beyond the Mat</div>
            <h2>Special classes &amp; workshops, occasionally</h2>
            <p>From restorative evenings to alignment intensives, sound healing, and masterclasses — sometimes in-studio, sometimes off-site with guest teachers.</p>
            <a href="https://instagram.com/sehelaspace" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: "#FFDFCF", color: "#1F4750" }}>
              Follow @sehelaspace
            </a>
          </div>
        </section>

        <section className="training reveal" id="training">
          <div className="wrap">
            <div className="eyebrow">Deepen Your Practice</div>
            <h2 className="training-h2">Yoga Teacher Training</h2>
            <p className="training-p">
              In collaboration with One Song Yoga School, led by Denise Payne, Sehela Space hosts a teacher training program for practitioners ready to take their practice further — whether to teach, or simply to go deeper.
            </p>
            <div className="partner-line">
              <span className="dot" /> In partnership with One Song Yoga School
            </div>
            <div className="training-card">
              <div className="k">Program Details</div>
              <div className="v">Full curriculum &amp; enrollment</div>
              <p>Dates, curriculum, pricing, and application details for the current teacher training cohort are all listed on our website.</p>
              <a href="https://sehelaspace.com" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: "#347582", color: "#DCF2ED" }}>
                Visit sehelaspace.com
              </a>
            </div>
          </div>
        </section>

        <section className="locations reveal" id="locations">
          <div className="wrap">
            <div className="section-head">
              <div className="eyebrow">Two Studios, One Practice</div>
              <h2>Find us in South Jakarta</h2>
              <p>Every class package works across both studios.</p>
            </div>
            <div className="loc-grid">
              <div className="loc-card">
                <div className="loc-photo">
                  <div className="loc-name">Pondok Labu</div>
                </div>
                <div className="loc-body">
                  <div className="addr">Jl. Pd. Labu 1 No.8b, RT.3/RW.7, Pd. Labu, Kec. Cilandak, Kota Jakarta Selatan, DKI Jakarta 12450</div>
                  <div className="loc-actions">
                    <a href="https://www.google.com/maps/search/?api=1&query=Jl.+Pd.+Labu+1+No.8b+RT.3%2FRW.7+Pd.+Labu+Kec.+Cilandak+Kota+Jakarta+Selatan+12450" target="_blank" rel="noopener noreferrer">View on Google Maps</a>
                    <a href="https://wa.me/62811149688">WhatsApp</a>
                    <a href="https://instagram.com/sehelaspace" target="_blank" rel="noopener noreferrer">@sehelaspace</a>
                  </div>
                </div>
              </div>
              <div className="loc-card">
                <div className="loc-photo">
                  <div className="loc-name">Kemang</div>
                </div>
                <div className="loc-body">
                  <div className="addr">Jl. Kemang Timur No.76, RT.11/RW.3, Bangka, Kec. Mampang Prpt., Kota Jakarta Selatan, DKI Jakarta 12730</div>
                  <div className="note">Inside East Kemang Padel Club</div>
                  <div className="loc-actions">
                    <a href="https://www.google.com/maps/search/?api=1&query=Jl.+Kemang+Timur+No.76+RT.11%2FRW.3+Bangka+Kec.+Mampang+Prapatan+Kota+Jakarta+Selatan+12730" target="_blank" rel="noopener noreferrer">View on Google Maps</a>
                    <a href="https://wa.me/6281110002826">WhatsApp</a>
                    <a href="https://instagram.com/sehelaspace" target="_blank" rel="noopener noreferrer">@sehelaspace</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pricing reveal" id="pricing">
          <div className="wrap">
            <div className="section-head">
              <div className="eyebrow">Pricing</div>
              <h2>Practice at your own pace</h2>
              <p>Every class package can be used at both studios.</p>
            </div>
            <div className="price-table">
              {[
                { name: "Regular Class — 1 Session", price: "Rp150K", meta: "Drop-in" },
                { name: "Package — 3 Sessions", price: "Rp330K", meta: "First-timer only · 1 person · 30 days from first class" },
                { name: "Package — 5 Sessions", price: "Rp675K", meta: "1 person · 30 days from first class" },
                { name: "Package — 10 Sessions", price: "Rp1.200K", meta: "1 person · 60 days from first class" },
                { name: "Package — 20 Sessions", price: "Rp2.100K*", meta: "*Shareable between 2 people · 60 days from first class" },
                { name: "Package — 30 Sessions", price: "Rp2.940K*", meta: "*Shareable between 2 people · 60 days from first class" },
              ].map((r) => (
                <div key={r.name} className="price-row">
                  <div className="top-line">
                    <span className="name">{r.name}</span>
                    <span className="price">{r.price}</span>
                  </div>
                  <div className="meta">{r.meta}</div>
                </div>
              ))}
              <div className="price-note">
                All single sessions and packages must be <strong>used within 30 days of the purchase date</strong>. Once activated, the expiry countdown shown above begins on the date of your <strong>first class</strong>.
              </div>
            </div>
            <div className="highlight-grid">
              <div className="price-highlight">
                <div className="h-eyebrow">Special Program</div>
                <h3>Yoga for 50s+</h3>
                <ul>
                  <li>Chair-supported movements</li>
                  <li>Yoga blocks &amp; straps</li>
                  <li>Props for comfort &amp; support</li>
                </ul>
                <div className="packages">
                  <div className="pkg"><span className="label">2-Class Package</span><span className="amt">Rp300K</span></div>
                  <div className="pkg"><span className="label">4-Class Package</span><span className="amt">Rp500K</span></div>
                </div>
                <div className="fine">No drop-in available. Must be used within 30 days of purchase. Once activated, the expiry countdown shown above begins on the date of your first class.</div>
              </div>
              <div className="price-highlight">
                <div className="h-eyebrow">Special Program</div>
                <h3>Prenatal Yoga</h3>
                <div className="packages">
                  <div className="pkg"><span className="label">1 Session</span><span className="amt">Rp190K</span></div>
                  <div className="pkg"><span className="label">4-Class Package</span><span className="amt">Rp680K</span></div>
                </div>
                <div className="fine">Must be used within 30 days of purchase. Once activated, the expiry countdown shown above begins on the date of your first class.</div>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <details className="terms-details">
                <summary><span className="terms-btn">View Terms &amp; Conditions</span></summary>
                <div className="terms-panel">
                  <ul>
                    <li>All sessions and packages must be used within 30 days of the purchase date.</li>
                    <li>The package expiry date cannot be extended for any reason.</li>
                    <li>Packages are non-transferable and cannot be assigned to another person.</li>
                    <li>For shareable packages, the names of both customers and the class credit allocated to each must be provided at the time of purchase.</li>
                    <li>The expiry countdown starts from the first class attended by the customer (normal package) or by either customer (shared package).</li>
                    <li>The 3-class first-timer package is only available for individuals who have never attended a class at Sehela Space studios.</li>
                  </ul>
                  <a className="full-link" href="/terms-and-conditions">Read full Terms &amp; Conditions →</a>
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className="shop reveal" id="shop">
          <div className="wrap">
            <div className="eyebrow">Sehela Shop</div>
            <h2>Merch, mats &amp; more</h2>
            <p>Beyond classes, we carry Sehela Space merchandise alongside a curated selection of other yoga and wellness brands. Shop in-studio, or order online and pick up at either location.</p>
            <div className="shop-visual">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image src={'/assets/home-page/asset-3.png'} alt="home-page" height={160} width={200} />

            </div>
            <div className="hero-ctas" style={{ justifyContent: "flex-start" }}>
              <Link href="/shop" className="btn-primary" style={{ background: "#347582", color: "#DCF2ED" }}>Shop Online</Link>
              <a href="https://instagram.com/sehelaspace" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ borderColor: "rgba(31,71,80,0.3)", color: "#1F4750" }}>Via Instagram</a>
            </div>
          </div>
        </section>
      </div>


      <MainFooterComponent />
    </div>
  );
};
