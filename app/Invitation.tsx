"use client";

import { useEffect, useRef, useState } from "react";
import BendingGallery from "./BendingGallery";

export default function Invitation() {
  const modalRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const introVidRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [introStarted, setIntroStarted] = useState(false);
  const [introGone, setIntroGone] = useState(false);
  const [copiedAcct, setCopiedAcct] = useState<string | null>(null);
  const [wishes, setWishes] = useState([
    { name: "Dina", text: "Selamat menempuh hidup baru! Semoga bahagia sampai kakek nenek. ❤️" },
    { name: "Rizky", text: "Barakallah! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah." },
    { name: "Sinta", text: "Congratulations Viktor & Paula! Wish you all the best." },
    { name: "Andri", text: "Akhirnya! Kalian berdua memang ditakdirkan untuk bersama. 🎉" },
    { name: "Lina", text: "Mendoakan yang terbaik untuk kalian berdua. Amin." },
    { name: "Bayu", text: "Bahagia selalu ya! Sampai jumpa di hari bahagia." },
    { name: "Nadia", text: "Semoga langgeng sampai maut memisahkan." },
    { name: "Yoga", text: "Selamat menempuh hidup baru, bro! Dari temen SMA yang paling bahagia liat kalian jadian." },
    { name: "Tari", text: "Masha Allah, begitu romantis kisahnya. Doa terbaik selalu ya." },
    { name: "Agus", text: "Ikut bahagia! Jangan lupa undang makan-maennya. 😄" },
    { name: "Vina", text: "Semoga pernikahan kalian diberkahi dan selalu langgeng." },
  ]);
  const [wishPage, setWishPage] = useState(0);
  const [wishForm, setWishForm] = useState<Record<string, string>>({});
  const WISH_PER_PAGE = 5;

  const copyAcct = (id: string, val: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(val).then(() => setCopiedAcct(id));
    } else {
      setCopiedAcct(id);
    }
    setTimeout(() => setCopiedAcct(null), 1800);
  };

  const submitWish = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nm = wishForm.name?.trim() || "Tamu";
    const tx = wishForm.text?.trim();
    if (!tx) return;
    setWishes((w) => [{ name: nm, text: tx }, ...w]);
    setWishForm({});
    (e.target as HTMLFormElement).reset();
  };

  // --- Cover: video amplop terbuka, slow-mo ending + fade dissolve -> hero terlihat ---
  useEffect(() => {
    // kunci scroll selama cover tampil
    if (!introGone) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => { document.documentElement.style.overflow = ""; };
  }, [introGone]);

  useEffect(() => {
    const vid = introVidRef.current;
    if (!vid) return;
    const SLOW_START = 1.6, SLOW_RATE = 0.6, FADE_START = 0.9;
    let dissolved = false;
    const dissolve = () => {
      if (dissolved) return;
      dissolved = true;
      setIntroGone(true);
    };
    const onTime = () => {
      if (!vid.duration) return;
      const remaining = vid.duration - vid.currentTime;
      if (remaining <= SLOW_START && vid.playbackRate !== SLOW_RATE) vid.playbackRate = SLOW_RATE;
      if (remaining <= FADE_START) dissolve();
    };
    vid.addEventListener("timeupdate", onTime);
    vid.addEventListener("loadeddata", () => { vid.currentTime = 0; });
    return () => vid.removeEventListener("timeupdate", onTime);
  }, []);

  const startIntro = () => {
    if (introStarted) return;
    setIntroStarted(true);
    const vid = introVidRef.current;
    if (vid) vid.play().catch(() => setIntroGone(true));
  };

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

  // --- Simpan di Kalender: generate .ics (2027-07-05 16:00, Chateau de Paon) ---
  const saveToCalendar = () => {
    const start = new Date("2027-07-05T16:00:00+02:00");
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
    const fmt = (d: Date) =>
      d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0") +
      "T" +
      String(d.getHours()).padStart(2, "0") +
      String(d.getMinutes()).padStart(2, "0") +
      String(d.getSeconds()).padStart(2, "0");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wedding//Viktor&Paula//EN",
      "BEGIN:VEVENT",
      "UID:" + Date.now() + "@wedding",
      "DTSTAMP:" + fmt(new Date()),
      "DTSTART:" + fmt(start),
      "DTEND:" + fmt(end),
      "SUMMARY:Viktor & Paula Wedding",
      "DESCRIPTION:Viktor & Paula Wedding - Chateau de Paon, Arles",
      "LOCATION:Chateau de Paon\\, Petit Chemin de Saint-Gilles\\, 13200 Arles\\, France",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Viktor-Paula-Wedding.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>

  {/* COVER: video amplop terbuka — layer paling depan nutupin hero,
      fade pelan menghilang -> hero makin terlihat */}
  {!introGone && (
    <div
      id="cover-intro"
      ref={introRef}
      className={introStarted ? "playing" : ""}
      onClick={startIntro}
    >
      <video id="cover-vid" ref={introVidRef} preload="auto" playsInline muted>
        <source src="/template-assets/video%20amplop%20terbuka.mp4" type="video/mp4" />
      </video>
      {!introStarted && (
        <button id="cover-tap" aria-label="Buka undangan" onClick={(e) => { e.stopPropagation(); startIntro(); }}>
          <span className="tap-text">Ketuk untuk membuka</span>
        </button>
      )}
    </div>
  )}

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
      <button className="calbtn rv" onClick={saveToCalendar}>Simpan di Kalender</button>
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

  {/* AYAT SUCI */}
  <section className="sb" id="greeting">
    <div className="rv">
      <span className="gtitle">Ayat Suci</span>
      <p className="gp">&ldquo;Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu
        dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa
        kasih dan sayang.&rdquo;</p>
      <p className="gp" style={{fontStyle: "normal", fontSize: ".9rem", color: "var(--gold)"}}>Q.S. Ar-Rum: 21</p>
      <p className="gp" style={{paddingBottom: "1rem"}}>&ldquo;Demikianlah mereka bukan lagi dua, melainkan satu.
        Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.&rdquo;</p>
      <p className="gp" style={{fontStyle: "normal", fontSize: ".9rem", color: "var(--gold)"}}>Matius 19: 6</p>
    </div>
  </section>

  {/* PROFIL MEMPELAI PRIA (putih) */}
  <section className="sc" id="profil-pria">
    <div className="torn" style={{marginTop: "-36px", marginBottom: "-1px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
    <div className="rv" style={{textAlign: "center", padding: "3rem 2rem"}}>
      <span className="dtitle" style={{color: "var(--burg)"}}>Profil Mempelai</span>
      <div className="dpair" style={{marginTop: "1.5rem"}}>
        <div className="dfi"><img src="/template-assets/Group_170.png" alt="Foto mempelai pria" /></div>
        <div className="dtxt" style={{textAlign: "left"}}>
          <strong>Viktor Pratama</strong>
          Putra pertama dari pasangan<br />Bapak Sutrisno &amp; Ibu Rahayu
          <a className="iglink" href="https://instagram.com/" target="_blank" rel="noreferrer">@viktorpratama</a>
        </div>
      </div>
    </div>
    <div className="torn tf" style={{marginBottom: "-36px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
  </section>

  {/* PROFIL MEMPELAI WANITA (merah) */}
  <section className="sb" id="profil-wanita">
    <div className="rv" style={{textAlign: "center", padding: "3rem 2rem"}}>
      <div className="dpair ladies" style={{marginTop: "0"}}>
        <div className="dfi"><img src="/template-assets/Group_169.png" alt="Foto mempelai wanita" /></div>
        <div className="dtxt" style={{textAlign: "left"}}>
          <strong>Paula Andini</strong>
          Putri kedua dari pasangan<br />Bapak Hendra &amp; Ibu Sulastri
          <a className="iglink" href="https://instagram.com/" target="_blank" rel="noreferrer">@paulaandini</a>
        </div>
      </div>
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
    {/* Sobekan ATAS */}
    <div className="torn" style={{marginTop: "-36px", marginBottom: "-1px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
    <div className="rv" style={{textAlign: "center", padding: "2.5rem 2rem"}}>
      <span className="ltitle">Waktu &amp; Lokasi</span>

      {/* AKAD NIKAH */}
      <div className="evt">
        <span className="evt-ic">&#9964;</span>
        <p className="evt-name">Akad Nikah</p>
        <p className="evt-time">Sabtu, 05 Juli 2026 · 08.00 WIB</p>
      </div>

      {/* RESEPSI */}
      <div className="evt">
        <span className="evt-ic">&#10024;</span>
        <p className="evt-name">Resepsi</p>
        <p className="evt-time">Sabtu, 05 Juli 2026 · 11.00 WIB</p>
      </div>

      <p className="lvname">Gedung Bapelkes Cikarang</p>
      <p className="lvaddr">Jl. Raya Jatibening No. 47, Cikarang Pusat<br />Kabupaten Bekasi, Jawa Barat</p>
      <img src="/template-assets/image-gen_1-Photoroo.png" className="vsk" alt="Gedung Bapelkes Cikarang" />

      <span className="dtitle rv" style={{fontSize: "1.6rem", marginTop: "1.6rem"}}>Live Streaming</span>
      <p className="ls-sub rv">Untuk yang tidak dapat hadir langsung, ikuti momen spesial kami melalui live streaming Instagram.</p>
      <a className="gmaps-btn" href="https://maps.google.com/?q=Gedung+Bapelkes+Cikarang" target="_blank" rel="noreferrer">Lihat Lokasi (Google Maps)</a>
      <a className="ig-btn" href="https://instagram.com/" target="_blank" rel="noreferrer">Ikuti Live di Instagram</a>
    </div>
    {/* Sobekan BAWAH */}
    <div className="torn tf" style={{marginBottom: "-36px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
  </section>

  {/* OUR STORY */}
  <section className="sb" id="ourstory">
    <div style={{textAlign: "center", padding: "3rem 2rem 3.5rem"}}>
      <span className="dtitle rv">Our Story</span>
      <p className="dsub rv">Kisah perjalanan cinta kami, dari pertemuan pertama hingga langkah menuju pelaminan.</p>
      <div className="dframes">
        <div className="dpair rv">
          <div className="dfi"><img src="/template-assets/Group_170.png" alt="First Meet" /></div>
          <div className="dtxt"><strong>First Meet — 2019</strong>Pertama kali kami bertemu dan saling mengenal, awal dari sebuah cerita yang tak terlupakan.</div>
        </div>
        <div className="dpair ladies rv">
          <div className="dfi"><img src="/template-assets/Group_169.png" alt="Relationship" /></div>
          <div className="dtxt"><strong>Relationship — 2021</strong>Dari teman menjadi kekasih, kami tumbuh bersama melewati suka dan duka.</div>
        </div>
        <div className="dpair rv">
          <div className="dfi"><img src="/template-assets/Group_170.png" alt="Engagement" /></div>
          <div className="dtxt"><strong>Engagement — April 2026</strong>Kami memantapkan hati untuk melangkah bersama menuju jenjang yang lebih serius.</div>
        </div>
      </div>
    </div>
  </section>

  {/* DETAILS — jadi section putih (BendingGallery 3D di sini) */}
  <section className="sc" id="details">
    <div className="torn" style={{marginTop: "-36px", marginBottom: "-1px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
    <div className="gallery3d">
      <BendingGallery
        items={[
          { image: "/template-assets/300592484d1f31590325.png", text: "Viktor & Paula" },
          { image: "/template-assets/ChatGPT_Image_Aug_3_.png", text: "Prewedding 01" },
          { image: "/template-assets/image-gen_1-Photoroo.png", text: "Prewedding 02" },
          { image: "/template-assets/ChatGPT_Image_Nov_17.png", text: "Prewedding 03" },
        ]}
        bend={2}
      />
    </div>
    <div className="torn tf" style={{marginBottom: "-36px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
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
          <label><input type="radio" name="att" value="no" /> Unfortunately, I can&#39;t</label>
          <label><input type="radio" name="att" value="maybe" /> Not sure yet</label>
        </div>
        <label>Which event will you attend?</label>
        <div className="rg">
          <label><input type="checkbox" name="ev" value="akad" /> Akad Nikah</label>
          <label><input type="checkbox" name="ev" value="resepsi" /> Resepsi</label>
        </div>
        <label>Number of guests</label>
        <input type="text" inputMode="numeric" placeholder="e.g. 2" />
        <label>Your wishes</label>
        <input type="text" placeholder="Leave a message for the couple" />
        <button type="submit" className="msub">SUBMIT</button>
      </form>
    </div>
  </div>

  {/* WEDDING GIFT */}
  <section className="sb" id="gift">
    <div className="rv" style={{textAlign: "center", padding: "3rem 2rem"}}>
      <span className="gtitle">Wedding Gift</span>
      <p className="gp">Mendoakan kami adalah hadiah terbaik. Namun jika ingin memberi tanda kasih, kami menerimanya melalui:
      </p>

      {/* BNI */}
      <div className="acct">
        <div className="acct-row">
          <div className="acct-bank">
            <span className="acct-bankname">BNI</span>
            <span className="acct-num">1234567890</span>
          </div>
          <button className="acct-copy" onClick={() => copyAcct("bni", "1234567890")}>
            {copiedAcct === "bni" ? "Tersalin!" : "Salin Rekening"}
          </button>
        </div>
        <span className="acct-an">a.n. Viktor Pratama</span>
      </div>

      {/* BCA */}
      <div className="acct">
        <div className="acct-row">
          <div className="acct-bank">
            <span className="acct-bankname">BCA</span>
            <span className="acct-num">9876543210</span>
          </div>
          <button className="acct-copy" onClick={() => copyAcct("bca", "9876543210")}>
            {copiedAcct === "bca" ? "Tersalin!" : "Salin Rekening"}
          </button>
        </div>
        <span className="acct-an">a.n. Paula Andini</span>
      </div>

      <p className="gp" style={{marginTop: "2rem"}}>Kirim kado fisik ke:</p>
      <p className="gift-addr">Jl. Raya Jatibening No. 47, Cikarang Pusat<br />Kabupaten Bekasi, Jawa Barat</p>

      {/* Form konfirmasi hadiah/transfer */}
      <p className="gp" style={{marginTop: "2rem"}}>Konfirmasi hadiah / transfer:</p>
      <form className="gift-form" onSubmit={(e) => { e.preventDefault(); alert("Terima kasih! Konfirmasi hadiah diterima."); (e.target as HTMLFormElement).reset(); }}>
        <input type="text" placeholder="Nama lengkap" required />
        <input type="text" placeholder="Bank (mis. BNI)" required />
        <input type="text" inputMode="numeric" placeholder="Nominal transfer" required />
        <button type="submit" className="msub w">KIRIM KONFIRMASI</button>
      </form>

      <p className="gp" style={{fontSize: ".9rem", color: "var(--gold)", marginTop: "1.6rem"}}>Untuk pertanyaan, hubungi panitia:</p>
      <p className="cname">Ameila</p>
      <p className="cph">+31 6845965887</p>
    </div>
  </section>

  {/* SECTION PUTIH #1 — WEDDING WISH */}
  <section className="sc" id="blank1">
    <div className="torn" style={{marginTop: "-36px", marginBottom: "-1px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
    <div className="rv" style={{textAlign: "center", padding: "3rem 2rem"}}>
      <span className="dtitle" style={{color: "var(--burg)"}}>Wedding Wish</span>
      <p className="dsub" style={{color: "var(--dark)"}}>Ucapan &amp; doa dari keluarga dan sahabat.</p>

      {/* Daftar ucapan */}
      <div className="wishlist">
        {wishes.slice(wishPage * WISH_PER_PAGE, wishPage * WISH_PER_PAGE + WISH_PER_PAGE).map((w, i) => (
          <div className="wishcard" key={i}>
            <span className="wish-name">{w.name}</span>
            <p className="wish-text">{w.text}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pager">
        <button className="pager-btn" disabled={wishPage === 0} onClick={() => setWishPage(wishPage - 1)}>&#8592;</button>
        {Array.from({ length: Math.ceil(wishes.length / WISH_PER_PAGE) }).map((_, i) => (
          <span key={i} className={"pager-dot" + (i === wishPage ? " on" : "")} onClick={() => setWishPage(i)}>{i + 1}</span>
        ))}
        <button className="pager-btn" disabled={wishPage >= Math.ceil(wishes.length / WISH_PER_PAGE) - 1} onClick={() => setWishPage(wishPage + 1)}>&#8594;</button>
      </div>

      {/* Form kirim ucapan */}
      <form className="wishform" onSubmit={submitWish}>
        <input
          type="text"
          placeholder="Nama kamu"
          value={wishForm.name || ""}
          onChange={(e) => setWishForm((f) => ({ ...f, name: e.target.value }))}
        />
        <textarea
          placeholder="Tulis ucapan &amp; doa..."
          rows={3}
          value={wishForm.text || ""}
          onChange={(e) => setWishForm((f) => ({ ...f, text: e.target.value }))}
          required
        />
        <button type="submit" className="msub w">KIRIM UCAPAN</button>
      </form>
    </div>
    <div className="torn tf" style={{marginBottom: "-36px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
  </section>

  {/* FOOTER */}
  <section className="sb" id="blanksep">
    <div className="rv" style={{textAlign: "center", padding: "3rem 2rem"}}>
      <span className="gs u">Terima kasih atas doa &amp; hadir kalian.</span>
      <p className="gp u">Kami menanti momen istimewa bersama kalian.</p>
      <p className="fnames">Viktor &amp; Paula</p>
      <p className="made">Made with &#9825; by <b>Dinikahan</b></p>
      <a className="wa-btn" href="https://wa.me/628123456789" target="_blank" rel="noreferrer">Hubungi Panitia (WhatsApp)</a>
    </div>
  </section>

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
