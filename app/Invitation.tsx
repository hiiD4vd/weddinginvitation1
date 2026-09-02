"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BendingGallery from "./BendingGallery";
import WishStack from "./WishStack";
import { INTRO_FAILSAFE_MS, shouldUnlockScroll } from "./introLifecycle";

export default function Invitation() {
  const modalRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const introVidRef = useRef<HTMLVideoElement>(null);
  const hvRef = useRef<HTMLVideoElement>(null);
  const introFadingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [introStarted, setIntroStarted] = useState(false);
  const [introGone, setIntroGone] = useState(false);
  const [heroPlaybackFailed, setHeroPlaybackFailed] = useState(false);
  const [copiedAcct, setCopiedAcct] = useState<string | null>(null);
  const [wishes, setWishes] = useState([
    { name: "Dina", text: "Selamat menempuh hidup baru! Semoga bahagia sampai kakek nenek. ❤️" },
    { name: "Rizky", text: "Barakallah! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah." },
    { name: "Sinta", text: "Congratulations Viktor & Paula! Wish you all the best." },
    { name: "Andri", text: "Akhirnya! Kalian berdua memang ditakdirkan untuk bersama. 🎉" },
    { name: "Lina", text: "Mendoakan yang terbaik untuk kalian berdua. Amin." },
  ]);
  const [wishForm, setWishForm] = useState<Record<string, string>>({});

  // --- helper: render teks ke canvas → data URL (kartu ucapan buat WishStack) ---
  const makeWishCard = (name: string, text: string) => {
    const W = 512, H = 640;   // portrait — cocok rasio kartu stack
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const c = cv.getContext("2d");
    if (!c) return "";
    c.fillStyle = "#fcf9f5";
    c.fillRect(0, 0, W, H);
    c.strokeStyle = "#66021f";
    c.lineWidth = 6;
    c.strokeRect(14, 14, W - 28, H - 28);
    c.fillStyle = "#66021f";
    c.font = "40px Georgia, serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("\u201C", W / 2, 90);
    c.fillStyle = "#66021f";
    c.font = "italic 44px Georgia, serif";
    c.fillText(name, W / 2, 165);
    c.strokeStyle = "rgba(102,2,31,0.3)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(W * 0.25, 205);
    c.lineTo(W * 0.75, 205);
    c.stroke();
    c.font = "italic 30px Georgia, serif";
    c.fillStyle = "#2d1520";
    const words = text.split(" ");
    let line = "";
    let y = 260;
    const maxW = W - 100;
    let lines = 0;
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (c.measureText(test).width > maxW && line) {
        c.fillText(line, W / 2, y);
        line = w;
        y += 44;
        lines++;
        if (lines >= 6) break;
      } else {
        line = test;
      }
    }
    if (line && lines < 6) c.fillText(line, W / 2, y);
    return cv.toDataURL("image/png");
  };

  const galItems = useMemo(
    () => [
      { image: "/template-assets/300592484d1f31590325.png", text: "Viktor & Paula" },
      { image: "/template-assets/ChatGPT_Image_Aug_3_.png", text: "Prewedding 01" },
      { image: "/template-assets/image-gen_1-Photoroo.png", text: "Prewedding 02" },
      { image: "/template-assets/ChatGPT_Image_Nov_17.png", text: "Prewedding 03" },
    ],
    [],
  );

  const [wishCards, setWishCards] = useState<{ image: string; text: string }[]>([]);

  // generate kartu ucapan HANYA di client (document gak ada saat SSR)
  useEffect(() => {
    const build = () => setWishCards(wishes.map((w) => ({ image: makeWishCard(w.name, w.text), text: w.name })));
    build();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishes]);

  const playHero = useCallback(() => {
    const video = hvRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    if (video.readyState === 0) video.load();
    void video.play().then(() => setHeroPlaybackFailed(false)).catch(() => {
      // iOS Low Power Mode may reject even muted playback. Keep the static
      // poster visible instead of exposing Safari's large native play badge.
      setHeroPlaybackFailed(true);
    });
  }, []);

  // Keep playback tied to the opening gesture. Retrying after the intro ends is
  // too late on iOS because the browser no longer considers it a user action.
  useEffect(() => {
    const v = hvRef.current;
    if (!v || !introStarted) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) playHero();
        else { v.pause(); }
      });
    }, { threshold: 0.1 });
    io.observe(v);
    return () => io.disconnect();
  }, [introStarted, playHero]);

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

  const finishIntro = useCallback(() => {
    if (introFadingRef.current) return;
    introFadingRef.current = true;
    introRef.current?.classList.add("gone");
    window.setTimeout(() => setIntroGone(true), 1200);
  }, []);

  // --- Cover: video amplop terbuka, slow-mo ending + fade dissolve -> hero terlihat ---
  useEffect(() => {
    if (!shouldUnlockScroll({ started: introStarted, gone: introGone })) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => { document.documentElement.style.overflow = ""; };
  }, [introGone, introStarted]);

  useEffect(() => {
    const vid = introVidRef.current;
    if (!vid) return;
    const SLOW_START = 1.6, SLOW_RATE = 0.6, FADE_START = 0.9;
    const onTime = () => {
      if (!vid.duration) return;
      const remaining = vid.duration - vid.currentTime;
      if (remaining <= SLOW_START && vid.playbackRate !== SLOW_RATE) vid.playbackRate = SLOW_RATE;
      if (remaining <= FADE_START) finishIntro();
    };
    const resetVideo = () => { vid.currentTime = 0; };
    vid.addEventListener("timeupdate", onTime);
    vid.addEventListener("loadeddata", resetVideo);
    for (const event of ["ended", "error", "stalled", "abort"]) {
      vid.addEventListener(event, finishIntro);
    }
    return () => {
      vid.removeEventListener("timeupdate", onTime);
      vid.removeEventListener("loadeddata", resetVideo);
      for (const event of ["ended", "error", "stalled", "abort"]) {
        vid.removeEventListener(event, finishIntro);
      }
    };
  }, [finishIntro]);

  useEffect(() => {
    if (!introStarted || introGone) return;
    const timeout = window.setTimeout(finishIntro, INTRO_FAILSAFE_MS);
    return () => window.clearTimeout(timeout);
  }, [finishIntro, introGone, introStarted]);

  const startIntro = () => {
    if (introStarted) return;
    setIntroStarted(true);
    playHero();
    const vid = introVidRef.current;
    if (vid) {
      void vid.play().catch(finishIntro);
    } else {
      finishIntro();
    }
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
      <video id="cover-vid" ref={introVidRef} preload="metadata" playsInline muted>
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
      <video
        id="hv"
        ref={hvRef}
        className={heroPlaybackFailed ? "playback-failed" : undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster="/template-assets/hero-poster.jpg"
        onError={() => console.warn("Hero video gagal dimuat, fallback ke background maroon.")}
      >
        <source src="/template-assets/bg_video.mp4" type="video/mp4" />
        <source src="https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/IMG_6230%20(1).MP4" type="video/mp4" />
      </video>
      <div className="ho"></div>
    </div>
    <div className="hc">
      <div className="htop rv">
        <span className="hs">Hari Bahagia</span>
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
        <div className="dfi"><img src="/template-assets/Group_170.png" alt="Foto mempelai pria" loading="lazy" decoding="async" /></div>
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
        <div className="dfi"><img src="/template-assets/Group_169.png" alt="Foto mempelai wanita" loading="lazy" decoding="async" /></div>
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
      <span className="ctitle">Acara Dimulai Dalam</span>
      <div className="timer">
        <div className="tu"><span className="tn" id="cd-d">000</span><small>Hari</small></div>
        <span className="tc">:</span>
        <div className="tu"><span className="tn" id="cd-h">00</span><small>Jam</small></div>
        <span className="tc">:</span>
        <div className="tu"><span className="tn" id="cd-m">00</span><small>Menit</small></div>
        <span className="tc">:</span>
        <div className="tu"><span className="tn" id="cd-s">00</span><small>Detik</small></div>
      </div>
      <button className="calbtn rv" onClick={saveToCalendar}>Simpan di Kalender</button>
    </div>
    {/* Sobekan BAWAH: diturunkan (margin negatif) supaya area transparan di bawah massa
         overlap ke section merah schedule → sebagian di merah, sebagian di cream */}
    <div className="torn tf" style={{marginBottom: "-36px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
  </section>

  {/* HASIL EDIT USER Tadi */}
  <section className="sb" id="schedule">
    <div style={{textAlign: "center", padding: "3rem 2rem 3.5rem"}}>
      <span className="stitle rv">Rangkaian Acara</span>
      <div className="timeline">
        <div className="te rv"><span className="tt">16:00</span>
          <div className="tnd"><img src="/template-assets/ChatGPT_Image_Nov_17.png" alt="" loading="lazy" decoding="async" /></div><span className="tl">Akad
            Nikah</span>
        </div>
        <div className="te rv"><span className="tt">17:00</span>
          <div className="tnd"><span className="tdm"></span></div><span className="tl">Resepsi</span>
        </div>
        <div className="te rv"><span className="tt">19:00</span>
          <div className="tnd"><span className="tdm"></span></div><span className="tl">Makan Malam</span>
        </div>
        <div className="te rv"><span className="tt">20:00</span>
          <div className="tnd"><img src="/template-assets/ChatGPT_Image_Nov_17.png" alt="" loading="lazy" decoding="async" /></div><span
            className="tl">Pesta</span>
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

      <p className="lvname">Gedung Bapelkes Cikarang</p>
      <p className="lvaddr">Jl. Raya Jatibening No. 47, Cikarang Pusat<br />Kabupaten Bekasi, Jawa Barat</p>
      <img src="/template-assets/image-gen_1-Photoroo.png" className="vsk" alt="Gedung Bapelkes Cikarang" loading="lazy" decoding="async" />

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
      <span className="dtitle rv">Kisah Kami</span>
      <p className="dsub rv">Kisah perjalanan cinta kami, dari pertemuan pertama hingga langkah menuju pelaminan.</p>
      <div className="dframes">
        <div className="dpair rv">
          <div className="dfi"><img src="/template-assets/Group_170.png" alt="Pertama Bertemu" loading="lazy" decoding="async" /></div>
          <div className="dtxt"><strong>Pertama Bertemu — 2019</strong>Pertama kali kami bertemu dan saling mengenal, awal dari sebuah cerita yang tak terlupakan.</div>
        </div>
        <div className="dpair ladies rv">
          <div className="dfi"><img src="/template-assets/Group_169.png" alt="Menjalin Hubungan" loading="lazy" decoding="async" /></div>
          <div className="dtxt"><strong>Menjalin Hubungan — 2021</strong>Dari teman menjadi kekasih, kami tumbuh bersama melewati suka dan duka.</div>
        </div>
        <div className="dpair rv">
          <div className="dfi"><img src="/template-assets/Group_170.png" alt="Lamaran" loading="lazy" decoding="async" /></div>
          <div className="dtxt"><strong>Lamaran — April 2026</strong>Kami memantapkan hati untuk melangkah bersama menuju jenjang yang lebih serius.</div>
        </div>
      </div>
    </div>
  </section>

  {/* DETAILS — jadi section putih (BendingGallery 3D di sini) */}
  <section className="sc" id="details">
    <div className="torn" style={{marginTop: "-36px", marginBottom: "-1px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
    <div className="gallery3d">
      <BendingGallery
        items={galItems}
        bend={2}
      />
    </div>
    <div className="torn tf" style={{marginBottom: "-36px"}}><img src="/template-assets/Mask_group_2_1_Trace.svg" alt="" /></div>
  </section>

  {/* RSVP */}
  <section className="sb" id="rsvp">
    <div className="rv" style={{textAlign: "center", padding: "3rem 2rem 0"}}>
      <span className="rtitle">Konfirmasi Kehadiran</span>
      <p className="rsub">Untuk membantu kami mempersiapkan hari bahagia,<br />silakan konfirmasi kehadiranmu.</p>
      <button className="rbtn" id="rbtn" onClick={openModal}>RSVP</button>
      <span className="cls">Sampai jumpa di hari bahagia!</span>
      <p className="cln">Viktor &amp; Paula</p>
    </div>
  </section>

  {/* RSVP MODAL */}
  <div className="mo" id="modal" ref={modalRef} onClick={onModalBg}>
    <div className="mb">
      <button className="mc" id="mc" onClick={closeModal}>&#215;</button>
      <h2>Konfirmasi Kehadiran</h2>
      <p className="mst">Mohon konfirmasi sebelum 20 Maret</p>
      <form id="mf" onSubmit={onSubmit}>
        <label>Nama kamu</label>
        <input type="text" placeholder="Nama lengkap" required />
        <label>Apakah kamu akan hadir?</label>
        <div className="rg">
          <label><input type="radio" name="att" value="yes" /> Ya, saya hadir</label>
          <label><input type="radio" name="att" value="no" /> Maaf, saya tidak bisa</label>
          <label><input type="radio" name="att" value="maybe" /> Masih ragu</label>
        </div>
        <label>Acara mana yang akan kamu hadiri?</label>
        <div className="rg">
          <label><input type="checkbox" name="ev" value="akad" /> Akad Nikah</label>
          <label><input type="checkbox" name="ev" value="resepsi" /> Resepsi</label>
        </div>
        <label>Jumlah tamu</label>
        <input type="text" inputMode="numeric" placeholder="mis. 2" />
        <label>Ucapan kamu</label>
        <input type="text" placeholder="Tulis pesan untuk kedua mempelai" />
        <button type="submit" className="msub">KIRIM</button>
      </form>
    </div>
  </div>

  {/* WEDDING GIFT */}
  <section className="sb" id="gift">
    <div className="rv" style={{textAlign: "center", padding: "3rem 2rem"}}>
      <span className="gtitle">Kado Pernikahan</span>
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
      <span className="dtitle" style={{color: "var(--burg)"}}>Ucapan &amp; Doa</span>
      <p className="dsub" style={{color: "var(--dark)"}}>Ucapan &amp; doa dari keluarga dan sahabat. Geser untuk melihat.</p>

      {/* Deck kartu ucapan — swipe buat buang, kartu berikutnya muncul */}
      <div className="wc-wrap">
        <WishStack cards={wishCards} sensitivity={160} autoplay autoplayDelay={4000} />
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
      <p className="made">Dibuat dengan &#9825; oleh <b>Dinikahan</b></p>
      <a className="wa-btn" href="https://wa.me/628123456789" target="_blank" rel="noreferrer">Hubungi Panitia (WhatsApp)</a>
    </div>
  </section>

  <audio id="aud" loop ref={audioRef}>
    <source src="https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/Alex%20Warren%20-%20Ordinary%20Lyrics.mp3"
      type="audio/mpeg" />
  </audio>
  <button id="mbtn" title="Aktifkan musik" onClick={toggleMusic} style={{ opacity: playing ? 1 : 0.6 }}>
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  </button>



    </>
  );
}
