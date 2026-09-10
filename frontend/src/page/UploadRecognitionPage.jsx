import { useEffect, useLayoutEffect, useRef, useState } from "react";
import api from "../services/axiosClient";
import toast from "react-hot-toast";
import GalleryGrid from "../components/gallery/GalleryGrid";

// Luôn để browser bắt đầu trang ở đầu khi reload, giống HomePage.
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function useRevealOnScroll(refreshKey) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-recognize-reveal]"));

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            window.requestAnimationFrame(() => {
              entry.target.classList.add("is-visible");
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.04, rootMargin: "0px 0px -7% 0px" }
    );

    elements.forEach((element) => observer.observe(element));

    const frame = window.requestAnimationFrame(() => {
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
          element.classList.add("is-visible");
          observer.unobserve(element);
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [refreshKey]);
}

export default function Recognize() {
  const [preview, setPreview] = useState();
  const [result, setResult] = useState();
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  // Không khôi phục vị trí scroll cũ khi reload trang.
  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);

    // Một frame bổ sung để chặn việc browser restore scroll sau khi layout hoàn tất.
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useRevealOnScroll(`${Boolean(preview)}-${Boolean(result)}-${busy}`);

  const pick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview((current) => {
      if (current?.startsWith?.("blob:")) URL.revokeObjectURL(current);
      return previewUrl;
    });
    setResult(undefined);
    setBusy(true);

    const form = new FormData();
    form.append("image", file);

    try {
      const { data } = await api.post("/images/recognize", form);
      setResult(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(
    () => () => {
      if (preview?.startsWith?.("blob:")) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  const confidence = Math.round((result?.analysis?.confidence || 0) * 100);
  const hasSimilar = Boolean(result?.similar?.length);

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F4EF] text-[#2A2421] selection:bg-[#9B2C2C] selection:text-[#F7F4EF]">
      <style>{`
        [data-recognize-reveal] {
          --reveal-delay: 80ms;
          opacity: 0;
          transform: translate3d(0, 54px, 0);
          filter: blur(2px);
          transition:
            opacity 1.05s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay),
            transform 1.45s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay),
            filter 1.1s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay);
        }

        [data-recognize-reveal="line"] {
          opacity: 1;
          filter: none;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 1.25s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay);
        }

        [data-recognize-reveal].is-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          filter: blur(0);
        }

        [data-recognize-reveal="line"].is-visible {
          transform: scaleX(1);
        }

        @keyframes recognizeDrift {
          0%, 100% { transform: translate3d(-2%, -1%, 0) scale(1); }
          50% { transform: translate3d(2%, 1.5%, 0) scale(1.05); }
        }

        @keyframes recognizeScan {
          0% { transform: translateY(-120%); opacity: 0; }
          15% { opacity: 0.7; }
          85% { opacity: 0.7; }
          100% { transform: translateY(650%); opacity: 0; }
        }

        @keyframes recognizePulse {
          0%, 100% { opacity: 0.35; transform: scale(0.94); }
          50% { opacity: 1; transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-recognize-reveal] {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            transition: none !important;
          }

          .recognize-motion {
            animation: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          01. HERO / VISUAL INTELLIGENCE
      ===================================================== */}
      <section className="relative overflow-hidden border-b border-[#3D332E] bg-[#1C1715] text-[#F7F4EF]">
        <div className="recognize-motion pointer-events-none absolute -inset-[10%] opacity-[0.2] [animation:recognizeDrift_14s_ease-in-out_infinite] [background-image:radial-gradient(circle_at_18%_20%,#D4AF37_0,transparent_27%),radial-gradient(circle_at_82%_40%,#9B2C2C_0,transparent_25%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:80px_80px]" />
        <span className="pointer-events-none absolute -right-8 -top-24 hidden font-['Playfair_Display'] text-[310px] italic leading-none text-white/[0.025] lg:block">
          V
        </span>

        <div className="relative z-10 mx-auto grid max-w-[1600px] lg:min-h-[700px] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col justify-between border-[#3D332E] px-6 pb-12 pt-28 md:px-12 lg:border-r lg:px-16 lg:pb-16 lg:pt-36 xl:px-24">
            <div data-recognize-reveal style={{ "--reveal-delay": "50ms" }}>
              <div className="mb-11 flex items-center gap-4 text-[9px] font-semibold uppercase tracking-[0.34em] text-[#D4AF37]">
                <span className="h-px w-12 bg-[#D4AF37]" />
                ARTMIND / VISUAL INTELLIGENCE
              </div>

              <p className="font-['Playfair_Display'] text-[11px] italic tracking-[0.22em] text-[#D4AF37]/80">
                Recognition studio · MMXXVI
              </p>

              <h1 className="mt-5 max-w-3xl font-['Playfair_Display'] text-5xl font-medium leading-[0.98] tracking-[-0.035em] sm:text-6xl md:text-7xl xl:text-[86px]">
                Mỗi hình ảnh đều có
                <em className="font-normal text-[#D4AF37]"> một ngôn ngữ.</em>
              </h1>

              <p className="mt-8 max-w-xl text-sm leading-8 text-[#D0C5B6] md:text-base">
                Tải lên một bức tranh để ArtMind đọc các tín hiệu thị giác, khám phá
                phong cách, bảng màu chủ đạo và những tác phẩm có liên hệ gần nhất.
              </p>
            </div>

            <div className="mt-14 border-t border-[#3D332E] pt-6 text-[8px] uppercase leading-5 tracking-[0.25em] text-[#A39585]">
              Computer vision / Curated archive
              <br />
              Machine reading / Human looking
            </div>
          </div>

          {/* UPLOAD STUDIO */}
          <div className="relative flex min-h-[560px] items-center bg-[#120F0E] px-6 py-14 md:px-12 lg:min-h-full lg:px-14 xl:px-20">
            <div
              data-recognize-reveal
              style={{ "--reveal-delay": "150ms" }}
              className="relative w-full"
            >
              <div className="mb-5 flex items-center justify-between gap-5 text-[8px] font-bold uppercase tracking-[0.28em]">
                <span className="text-[#D4AF37]">01 / Upload artwork</span>
                <span className="text-white/35">JPG · PNG · WEBP</span>
              </div>

              <label className="group relative block min-h-[420px] cursor-pointer overflow-hidden border border-[#5E5048] bg-[#1C1715] transition duration-700 hover:-translate-y-1 hover:border-[#D4AF37]/80 hover:shadow-[0_28px_80px_rgba(0,0,0,0.32)] md:min-h-[500px]">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={pick}
                  className="sr-only"
                />

                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Ảnh đã tải lên"
                      className="absolute inset-0 h-full w-full object-cover transition duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,15,14,0.04),rgba(18,15,14,0.1)_52%,rgba(18,15,14,0.9)_100%)]" />
                    <div className="absolute inset-5 border border-white/15 md:inset-7" />

                    {busy && (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="recognize-motion absolute left-0 right-0 top-0 h-px bg-[#D4AF37] shadow-[0_0_22px_rgba(212,175,55,0.9)] [animation:recognizeScan_2.6s_ease-in-out_infinite]" />
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-7 md:p-9">
                      <div className="mb-5 h-px bg-white/25" />
                      <div className="flex items-end justify-between gap-6">
                        <div>
                          <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#D4AF37]">
                            IMAGE READY
                          </span>
                          <p className="mt-2 font-['Playfair_Display'] text-2xl text-white">
                            {busy ? "AI đang đọc tác phẩm…" : "Chọn ảnh khác"}
                          </p>
                        </div>
                        <span className="text-2xl text-white/60 transition-transform duration-500 group-hover:rotate-90">
                          +
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                    <div className="mb-8 flex h-20 w-20 items-center justify-center border border-[#5E5048] text-4xl font-light text-[#D4AF37] transition duration-500 group-hover:rotate-90 group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#1C1715]">
                      +
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                      DROP / SELECT IMAGE
                    </span>
                    <h2 className="mt-5 font-['Playfair_Display'] text-3xl font-medium text-[#F7F4EF] md:text-4xl">
                      Thả hoặc chọn một hình ảnh
                    </h2>
                    <p className="mt-4 max-w-md text-sm leading-7 text-[#AFA398]">
                      Bắt đầu quá trình nhận diện bằng một tác phẩm từ thiết bị của bạn.
                    </p>
                    <span className="mt-8 text-[8px] uppercase tracking-[0.24em] text-white/35">
                      JPG, PNG hoặc WEBP · tối đa 8 MB
                    </span>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          02. ANALYSIS
      ===================================================== */}
      <section className="relative border-b border-[#E0D7C8] bg-[#F7F4EF] px-6 py-24 md:px-12 md:py-28 lg:px-20">
        <div className="mx-auto max-w-[1500px]">
          <header
            data-recognize-reveal
            className="mb-14 grid gap-8 border-b border-[#D8CFC0] pb-9 lg:grid-cols-[0.65fr_1.35fr] lg:items-end"
          >
            <div>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
                  II / Visual reading
                </span>
                <span
                  data-recognize-reveal="line"
                  style={{ "--reveal-delay": "180ms" }}
                  className="h-px w-16 bg-[#9B2C2C]"
                />
              </div>
              <p className="mt-3 text-[9px] uppercase tracking-[0.24em] text-[#7A6C63]">
                ArtMind recognition engine
              </p>
            </div>

            <h2 className="font-['Playfair_Display'] text-4xl font-medium leading-[1.05] tracking-[-0.025em] md:text-6xl">
              {busy
                ? "AI đang đọc những tín hiệu thị giác."
                : result
                  ? "Những gì hệ thống nhìn thấy."
                  : "Kết quả sẽ xuất hiện tại đây."}
            </h2>
          </header>

          {busy ? (
            <div
              data-recognize-reveal
              className="grid min-h-[390px] place-items-center border border-[#D8CFC0] bg-[#ECE4D5] px-6 text-center"
            >
              <div>
                <div className="recognize-motion mx-auto flex h-20 w-20 items-center justify-center border border-[#C8BBA8] text-3xl text-[#9B2C2C] [animation:recognizePulse_1.4s_ease-in-out_infinite]">
                  ◎
                </div>
                <p className="mt-8 text-[8px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
                  ANALYZING IMAGE
                </p>
                <h3 className="mt-4 font-['Playfair_Display'] text-3xl font-medium md:text-4xl">
                  AI đang đọc tác phẩm…
                </h3>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#6F625A]">
                  Đang đối chiếu bố cục, phong cách, thể loại và bảng màu với kho lưu trữ.
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-20">
              <div className="grid gap-px border border-[#D8CFC0] bg-[#D8CFC0] md:grid-cols-2 xl:grid-cols-4">
                <Fact
                  index="01"
                  label="PHONG CÁCH"
                  value={result.analysis?.style || "—"}
                  delay="70ms"
                />
                <Fact
                  index="02"
                  label="THỂ LOẠI"
                  value={result.analysis?.category || "—"}
                  delay="160ms"
                />
                <Fact
                  index="03"
                  label="MÀU CHỦ ĐẠO"
                  value={result.analysis?.dominantColors?.join(", ") || "—"}
                  delay="250ms"
                />
                <Fact
                  index="04"
                  label="ĐỘ TIN CẬY"
                  value={`${confidence}%`}
                  delay="340ms"
                  accent
                />
              </div>

              <div data-recognize-reveal style={{ "--reveal-delay": "120ms" }}>
                <div className="mb-10 flex flex-col justify-between gap-6 border-b border-[#D8CFC0] pb-7 md:flex-row md:items-end">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
                      III / Related works
                    </span>
                    <h3 className="mt-4 font-['Playfair_Display'] text-4xl font-medium tracking-[-0.02em] md:text-5xl">
                      Tác phẩm tương đồng
                      <em className="font-normal text-[#9B2C2C]"> trong kho lưu trữ.</em>
                    </h3>
                  </div>
                  <span className="text-[8px] uppercase tracking-[0.24em] text-[#7A6C63]">
                    {String(result.similar?.length || 0).padStart(2, "0")} MATCHES
                  </span>
                </div>

                {hasSimilar ? (
                  <GalleryGrid items={result.similar} />
                ) : (
                  <div className="flex min-h-[320px] flex-col items-center justify-center border border-dashed border-[#C8BBA8] bg-[#ECE4D5]/45 px-6 text-center">
                    <span className="font-['Playfair_Display'] text-6xl text-[#9B2C2C]/40">◇</span>
                    <h4 className="mt-5 font-['Playfair_Display'] text-2xl font-medium">
                      Chưa có tác phẩm tương đồng
                    </h4>
                    <p className="mt-3 max-w-md text-sm leading-7 text-[#6F625A]">
                      Phân tích đã hoàn tất nhưng hiện chưa có đối chiếu phù hợp trong kho lưu trữ.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              data-recognize-reveal
              className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden border border-[#D8CFC0] bg-[#ECE4D5] px-6 text-center"
            >
              <span className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 font-['Playfair_Display'] text-[230px] italic leading-none text-[#9B2C2C]/[0.035]">
                AI
              </span>
              <span className="relative font-['Playfair_Display'] text-7xl leading-none text-[#9B2C2C]/30">
                ◎
              </span>
              <p className="relative mt-7 text-[8px] font-bold uppercase tracking-[0.3em] text-[#9B2C2C]">
                WAITING FOR ARTWORK
              </p>
              <h3 className="relative mt-4 font-['Playfair_Display'] text-3xl font-medium md:text-4xl">
                Hãy bắt đầu bằng một hình ảnh.
              </h3>
              <p className="relative mt-4 max-w-lg text-sm leading-7 text-[#6F625A]">
                Hệ thống kết hợp thị giác máy tính với dữ liệu của phòng tranh để đưa ra
                những liên hệ có ý nghĩa.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative mt-8 inline-flex items-center gap-5 border border-[#9B2C2C] px-6 py-4 text-[9px] font-bold tracking-[0.22em] text-[#9B2C2C] transition duration-300 hover:-translate-y-0.5 hover:bg-[#9B2C2C] hover:text-[#F7F4EF]"
              >
                CHỌN MỘT TÁC PHẨM
                <span className="text-base">→</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          03. CLOSING NOTE
      ===================================================== */}
      <section className="relative overflow-hidden bg-[#EAE2D2] px-6 py-20 text-center md:px-12 md:py-24">
        <span className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 font-['Playfair_Display'] text-[170px] leading-none text-[#9B2C2C]/[0.06] md:text-[220px]">
          “
        </span>
        <div data-recognize-reveal className="relative mx-auto max-w-4xl">
          <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#9B2C2C]">
            ARTMIND / RECOGNITION NOTE
          </p>
          <blockquote className="mt-7 font-['Playfair_Display'] text-3xl font-medium leading-[1.12] md:text-5xl">
            Máy có thể nhận ra tín hiệu.
            <br />
            <em className="font-normal text-[#9B2C2C]">Ánh nhìn mới tạo nên ý nghĩa.</em>
          </blockquote>
        </div>
      </section>
    </main>
  );
}

function Fact({ index, label, value, delay, accent = false }) {
  return (
    <article
      data-recognize-reveal
      style={{ "--reveal-delay": delay }}
      className="group min-h-[220px] bg-[#F7F4EF] p-7 transition duration-500 hover:bg-[#ECE4D5] md:p-8"
    >
      <div className="flex items-start justify-between gap-5">
        <span className="font-['Playfair_Display'] text-2xl italic text-[#D4AF37]">{index}</span>
        <span className="mt-3 h-px w-10 bg-[#C8BBA8] transition-all duration-500 group-hover:w-16 group-hover:bg-[#9B2C2C]" />
      </div>
      <small className="mt-10 block text-[8px] font-bold uppercase tracking-[0.27em] text-[#7A6C63]">
        {label}
      </small>
      <p
        className={`mt-3 font-['Playfair_Display'] text-2xl font-medium leading-tight md:text-3xl ${
          accent ? "text-[#9B2C2C]" : "text-[#2A2421]"
        }`}
      >
        {value}
      </p>
    </article>
  );
}
