"use client";

import { useEffect, useRef, useState } from "react";

export default function Invitation() {
  const modalRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  // Countdown
  useEffect(() => {
    const T = new Date("2027-07-05T16:00:00+02:00").getTime();
    const p = (n: number, w = 2) => String(n).padStart(w, "0");
    const tick = () => {
      let d = T - Date.now();
      if (d < 0) d = 0;
      const el = (id: string) => document.getElementById(id);
      el("cd-d")!.textContent = p(Math.floor(d / 864e5), 3);
      el("cd-h")!.textContent = p(Math.floor((d % 864e5) / 36e5));
      el("cd-m")!.textContent = p(Math.floor((d % 36e5) / 6e4));
      el("cd-s")!.textContent = p(Math.floor((d % 6e4) / 1e3));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("vis");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".rv").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Audio autoplay sekali saat user pertama kali klik di mana aja
  useEffect(() => {
    const tryPlay = () => {
      const aud = audioRef.current;
      if (aud && !playing) {
        aud.play().then(() => setPlaying(true)).catch(() => {});
      }
      document.removeEventListener("click", tryPlay);
    };
    document.addEventListener("click", tryPlay, { once: true });
    return () => document.removeEventListener("click", tryPlay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Audio autoPlay sekali saat user pertama kali klik di mana aja
  useEffect(() => {
    const tryPlay = () => {
      const aud = audioRef.current;
      if (aud && !playing) {
        aud.play().then(() => setPlaying(true)).catch(() => {});
      }
      document.removeEventListener("click", tryPlay);
    };
    document.addEventListener("click", tryPlay, { once: true });
    return () => document.removeEventListener("click", tryPlay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMusic = () => {
    const aud = audioRef.current;
    if (!aud) return;
    if (playing) {
      aud.pause();
      setPlaying(false);
    } else {
      aud.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const openModal = () => modalRef.current?.classList.add("open");
  const closeModal = () => modalRef.current?.classList.remove("open");
  const onModalBg = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) closeModal();
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Thank you! Your RSVP has been submitted.");
    closeModal();
    (e.target as HTMLFormElement).reset();
  };

  return (
    <>


  {/* HERO */}
  <section id="hero">
    <div id="hero-inner">
      <video id="hv" autoPlay muted loop playsInline preload="auto">
        <source src="/template-assets/bg_video.mp4" type="video/mp4" />
        <source src="https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/IMG_6230%20(1).MP4" type="video/mp4" />
      </video>
      <div className="ho"></div>
    </div>
    <div className="hc">
      <div className="htop rv">
        <span className="hs">Wedding Day</span>
        <p className="hdate">05.07.26</p>
      </div>
      <div className="hnames rv">
        <span className="hname">Viktor</span>
        <span className="hamp">&amp;</span>
        <span className="hname">Paula</span>
      </div>
    </div>
    {/* ============================================================
       BUNGA HERO - Edit CSS di atas untuk ubah ukuran/posisi/rotasi
       r1-r4 = bunga merah | w1-w3 = bunga putih
       ============================================================ */}
    <div className="hfl">
      <img className="r1" src="/template-assets/1.png" alt="red 1" />
      <img className="w1" src="/template-assets/8.png" alt="flower w1" />
      <img className="r2" src="/template-assets/2ruby.png" alt="red 2" />
      <img className="w2" src="/template-assets/6druby.png" alt="red-dark 2" />
      <img className="r3" src="/template-assets/4ruby.png" alt="red 3" />
      <img className="w3" src="/template-assets/noroot.png" alt="white 3" />
      <img className="r4" src="/template-assets/1ruby.png" alt="red 4 - dominant" />
    </div>

    {/* TORN PAPER UNTUK MEMOTONG BAWAH VIDEO (Dibuat Tinggi) */}
    <div className="video-mask"
      style={{position: "absolute", bottom: "0", left: "0", right: "0", zIndex: "2", background: "var(--burg)"}}>
      <div className="hero-torn">
        <img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" />
      </div>
      {/* Ubah angka height ini (misal 15vh, 20vh, atau 100px) untuk mengatur seberapa tinggi penutup merahnya */}
      <div style={{height: "-1vh"}}></div>
    </div>

  </section>

  {/* GREETING */}
  <section className="sb" id="greeting">
    <div className="rv">
      <span className="gtitle">Dear Friends and Family,</span>
      <p className="gp">As we get ready to say &ldquo;I do,&rdquo; we feel grateful for the wonderful people in our lives.
      </p>
      <p className="gp" style={{paddingBottom: "1rem"}}>Your support means the world to us, and we would be honored to have you
        with us as we begin our life together.</p>
    </div>
  </section>

  {/* COUNTDOWN */}
  <section className="sc" id="countdown">
    {/* Sobekan ATAS: dinaikkan (margin negatif) supaya area transparan di atas
         gelombangnya overlap ke section merah greeting → tanpa strip cream di atasnya */}
    <div className="torn" style={{marginTop: "-36px", marginBottom: "-1px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
    <div className="rv" style={{textAlign: "center", padding: "2.5rem 2rem"}}>
      <span className="ctitle">The Celebration Begins In</span>
      <div className="timer">
        <div className="tu"><span className="tn" id="cd-d">000</span><small>Days</small></div>
        <span className="tc">:</span>
        <div className="tu"><span className="tn" id="cd-h">00</span><small>Hours</small></div>
        <span className="tc">:</span>
        <div className="tu"><span className="tn" id="cd-m">00</span><small>Minutes</small></div>
        <span className="tc">:</span>
        <div className="tu"><span className="tn" id="cd-s">00</span><small>Seconds</small></div>
      </div>
    </div>
    {/* Sobekan BAWAH: diturunkan (margin negatif) supaya area transparan di bawah massa
         overlap ke section merah schedule → sebagian di merah, sebagian di cream */}
    <div className="torn tf" style={{marginBottom: "-36px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
  </section>

  {/* HASIL EDIT USER Tadi */}
  <section className="sb" id="schedule">
    <div style={{textAlign: "center", padding: "3rem 2rem 3.5rem"}}>
      <span className="stitle rv">Schedule of Events</span>
      <div className="timeline">
        <div className="te rv"><span className="tt">16:00</span>
          <div className="tnd"><img src="/template-assets/ChatGPT_Image_Nov_17.png" alt="" /></div><span className="tl">Wedding
            Ceremony</span>
        </div>
        <div className="te rv"><span className="tt">17:00</span>
          <div className="tnd"><span className="tdm"></span></div><span className="tl">Cocktail Hour</span>
        </div>
        <div className="te rv"><span className="tt">19:00</span>
          <div className="tnd"><span className="tdm"></span></div><span className="tl">Dinner</span>
        </div>
        <div className="te rv"><span className="tt">20:00</span>
          <div className="tnd"><img src="/template-assets/ChatGPT_Image_Nov_17.png" alt="" /></div><span
            className="tl">Party</span>
        </div>
      </div>
    </div>
  </section>

  {/* LOCATION */}
  <section className="sc" id="location">
    {/* Sobekan ATAS: gigi ke bawah (orientasi natural), naik -36px nyambung ke merah schedule di atas */}
    <div className="torn" style={{marginTop: "-36px", marginBottom: "-1px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
    <div className="rv" style={{textAlign: "center", padding: "2.5rem 2rem"}}>
      <span className="ltitle">Location</span>
      <p className="lvname">Chateau de Paon</p>
      <p className="lvaddr">Address: Petit Chemin de Saint-Gilles<br />13200 Arles, France</p>
      <img src="/template-assets/image-gen_1-Photoroo.png" className="vsk" alt="Chateau de Paon sketch" />
    </div>
    {/* Sobekan BAWAH: gigi ke atas (flip tf), turun -36px nyambung ke merah dresscode di bawah */}
    <div className="torn tf" style={{marginBottom: "-36px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
  </section>

  {/* DRESS CODE */}
  <section className="sb" id="dresscode">
    <div style={{textAlign: "center", padding: "3rem 2rem 3.5rem"}}>
      <span className="dtitle rv">Dress Code</span>
      <p className="dsub rv">We kindly invite you to dress in elegant attire that reflects the style and spirit of our
        special day.</p>
      <div className="swatches rv">
        <div className="sw" style={{background: "#4f5e3e"}}></div>
        <div className="sw" style={{background: "#2f0e1f"}}></div>
        <div className="sw" style={{background: "#3a3530"}}></div>
        <div className="sw" style={{background: "#e7dcc8"}}></div>
      </div>
      <div className="dframes">
        <div className="dpair rv">
          <div className="dfi"><img src="/template-assets/Group_170.png" alt="Gentlemen attire" /></div>
          <div className="dtxt"><strong>Gentlemen:</strong>Well-tailored suits with classic dress shoes are preferred.</div>
        </div>
        <div className="dpair ladies rv">
          <div className="dfi"><img src="/template-assets/Group_169.png" alt="Ladies attire" /></div>
          <div className="dtxt"><strong>Ladies:</strong>Formal dresses in elegant, polished styles are encouraged.</div>
        </div>
      </div>
    </div>
  </section>

  {/* DETAILS */}
  <section className="sc" id="details">
    {/* Sobekan ATAS: gigi ke bawah, naik -36px nyambung ke merah dresscode */}
    <div className="torn" style={{marginTop: "-36px", marginBottom: "-1px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
    <div className="rv" style={{textAlign: "center", padding: "2.5rem 2rem 0"}}>
      <span className="detitle">Details</span>
      <p>For additional information or questions,<br />please contact the wedding organizers.</p>
      <p className="cname">Ameila</p>
      <p className="cph">+31 6845965887</p>
      <br />
      <p>Your presence is the greatest gift to us. However, if you wish to honor us with a present, a contribution
        toward our future would be sincerely appreciated.</p>
    </div>
    {/* Flowers same as hero but flipped */}
    <div className="detfl">
      <img className="f1" src="/template-assets/2ruby.png" alt="" />
      <img className="fw1" src="/template-assets/noroot.png" alt="" />
      <img className="f2" src="/template-assets/4ruby.png" alt="" />
      <img className="f3" src="/template-assets/6druby.png" alt="" />
      <img className="fw2" src="/template-assets/ChatGPT_Image_Nov_17.png" alt="" />
      <img className="f4" src="/template-assets/1ruby.png" alt="" />
      <img className="f5" src="/template-assets/7uruby.png" alt="" />
      <img className="f6" src="/template-assets/1.png" alt="" />
      <img className="fw3" src="/template-assets/noroot.png" alt="" />
      <img className="f7" src="/template-assets/8ruby.png" alt="" />
      <img className="f8" src="/template-assets/2ruby.png" alt="" />
    </div>
    {/* Sobekan BAWAH: gigi ke atas (tf), turun -36px nyambung ke merah rsvp */}
    <div className="torn tf" style={{marginTop: "-1px", marginBottom: "-36px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
  </section>

  {/* RSVP */}
  <section className="sb" id="rsvp">
    <div className="rv" style={{textAlign: "center", padding: "3rem 2rem 0"}}>
      <span className="rtitle">Confirm Your Attendance</span>
      <p className="rsub">To help us prepare for a joyful celebration,<br />kindly confirm your attendance.</p>
      <button className="rbtn" id="rbtn" onClick={openModal}>RSVP</button>
      <span className="cls">Hope to see you there!</span>
      <p className="cln">Viktor and Paula</p>
    </div>
    <img src="/template-assets/300592484d1f31590325.png" className="cphoto" alt="Viktor and Paula" />
  </section>

  {/* RSVP MODAL */}
  <div className="mo" id="modal" ref={modalRef} onClick={onModalBg}>
    <div className="mb">
      <button className="mc" id="mc" onClick={closeModal}>&#215;</button>
      <h2>Confirm Your Attendance</h2>
      <p className="mst">Please RSVP before March 20</p>
      <form id="mf" onSubmit={onSubmit}>
        <label>Your name</label>
        <input type="text" placeholder="Your full name" required />
        <label>Will you come?</label>
        <div className="rg">
          <label><input type="radio" name="att" value="yes" /> Yes, I will</label>
          <label><input type="radio" name="att" value="no" /> Unfortunately, I can&#39;t :(</label>
        </div>
        <label>Do you have any food intolerances?</label>
        <input type="text" placeholder="Leave blank if none" />
        <button type="submit" className="msub">SUBMIT</button>
      </form>
    </div>
  </div>

  <audio id="aud" loop ref={audioRef}>
    <source src="https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/Alex%20Warren%20-%20Ordinary%20Lyrics.mp3"
      type="audio/mpeg" />
  </audio>
  <button id="mbtn" title="Toggle music" onClick={toggleMusic} style={{ opacity: playing ? 1 : 0.6 }}>
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  </button>



    </>
  );
}
