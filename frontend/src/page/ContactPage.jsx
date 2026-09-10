import { useLayoutEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/axiosClient";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "Tư vấn tác phẩm",
  message: "",
};

const SUBJECTS = [
  "Tư vấn tác phẩm",
  "Hợp tác nghệ sĩ",
  "Truyền thông và sự kiện",
  "Hỗ trợ kỹ thuật",
  "Khác",
];

const MESSAGE_LIMIT = 1200;

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const change = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = form.phone.replace(/\D/g, "");

    if (form.name.trim().length < 2) {
      nextErrors.name = "Vui lòng nhập họ tên hợp lệ.";
    }

    if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = "Email chưa đúng định dạng.";
    }

    if (form.phone.trim() && (phoneDigits.length < 8 || phoneDigits.length > 15)) {
      nextErrors.phone = "Số điện thoại chưa hợp lệ.";
    }

    if (form.message.trim().length < 10) {
      nextErrors.message = "Hãy chia sẻ thêm một chút để ArtMind có thể hỗ trợ bạn tốt hơn.";
    }

    return nextErrors;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (busy) return;

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Vui lòng kiểm tra lại thông tin trong biểu mẫu.");
      return;
    }

    setBusy(true);

    try {
      await api.post("/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });

      setSent(true);
      setForm(initialForm);
      setErrors({});
      toast.success("ArtMind đã nhận được lời nhắn của bạn.");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể gửi lời nhắn lúc này. Vui lòng thử lại.";

      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setSent(false);
    setForm(initialForm);
    setErrors({});
  };

  return (
    <main className="min-h-screen bg-[#F7F4EF] text-[#2A2421] selection:bg-[#9B2C2C] selection:text-[#F7F4EF]">
      <section className="grid min-h-[calc(100svh-80px)] lg:grid-cols-[0.92fr_1.08fr]">
        {/* LEFT / BRAND STORY */}
        <aside className="relative isolate overflow-hidden bg-[#1C1715] px-6 py-16 text-[#F7F4EF] md:px-12 md:py-20 lg:px-16 lg:py-24 xl:px-20">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <span className="absolute -left-12 -top-20 font-['Playfair_Display'] text-[250px] leading-none text-white/[0.025] md:text-[310px]">
              C
            </span>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(212,175,55,0.08),transparent_30%)]" />
          </div>

          <div className="relative z-10 mx-auto flex h-full w-full max-w-2xl flex-col justify-between">
            <div>
              <div className="flex items-center gap-4">
                <span className="h-px w-12 bg-[#D4AF37]" />
                <span className="text-[8px] font-bold tracking-[4px] text-[#D4AF37]">
                  LIÊN HỆ / ARTMIND
                </span>
              </div>

              <h1 className="mt-8 max-w-xl font-['Playfair_Display'] text-5xl font-medium leading-[0.96] md:text-6xl lg:text-[70px] xl:text-[76px]">
                Hãy bắt đầu
                <br />
                một cuộc <em className="font-normal text-[#D4AF37]">đối thoại.</em>
              </h1>

              <p className="mt-8 max-w-lg text-sm leading-8 text-[#D0C5B6] md:text-[15px]">
                Bạn cần tư vấn chọn tranh, muốn hợp tác cùng ArtMind hay đơn giản
                là có một câu hỏi? Chúng tôi luôn sẵn lòng lắng nghe.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
                <span className="h-2 w-2 rotate-45 border border-[#D4AF37]" />
                <span className="h-px w-20 bg-[#4A3E38]" />
                <span className="text-[7px] tracking-[3px] text-[#A39585]">
                  OPEN DIALOGUE
                </span>
              </div>
            </div>

            <div className="mt-16 lg:mt-24">
              <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-lg">
                <MiniFact eyebrow="PHẢN HỒI" value="1–2 ngày làm việc" />
                <MiniFact eyebrow="NỘI DUNG" value="Được bảo mật" />
              </div>

              <div className="border-t border-[#3D332E]">
                <ContactInfo
                  number="01"
                  label="EMAIL"
                  value="hello@artmind.vn"
                  href="mailto:hello@artmind.vn"
                />
                <ContactInfo
                  number="02"
                  label="ĐIỆN THOẠI"
                  value="+84 28 3822 2026"
                  href="tel:+842838222026"
                />
                <ContactInfo
                  number="03"
                  label="KHÔNG GIAN"
                  value="Quận 1, TP. Hồ Chí Minh"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT / CONTACT FORM */}
        <section className="relative flex items-center justify-center overflow-hidden bg-[#F7F4EF] px-6 py-16 md:px-12 md:py-20 lg:px-16 lg:py-24 xl:px-20">
          <div className="relative z-10 w-full max-w-2xl">
            {sent ? (
              <SuccessState onReset={resetForm} />
            ) : (
              <form onSubmit={submit} aria-busy={busy} noValidate>
                <div className="mb-10 flex items-end justify-between gap-6 border-b border-[#D8CFC0] pb-6">
                  <div>
                    <span className="text-[8px] font-bold tracking-[4px] text-[#9B2C2C]">
                      GỬI LỜI NHẮN
                    </span>
                    <h2 className="mt-3 font-['Playfair_Display'] text-3xl font-medium md:text-4xl">
                      Viết cho ArtMind.
                    </h2>
                  </div>

                  <span className="shrink-0 font-['Playfair_Display'] text-lg text-[#7A6C63]" aria-hidden="true">
                    01 — 05
                  </span>
                </div>

                <Field label="Họ và tên" required error={errors.name} htmlFor="contact-name">
                  <input
                    id="contact-name"
                    required
                    autoComplete="name"
                    name="name"
                    value={form.name}
                    onChange={change}
                    placeholder="Tên của bạn"
                    className={inputStyle}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                  />
                </Field>

                <div className="grid gap-0 md:grid-cols-2 md:gap-7">
                  <Field label="Email" required error={errors.email} htmlFor="contact-email">
                    <input
                      id="contact-email"
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      name="email"
                      value={form.email}
                      onChange={change}
                      placeholder="email@example.com"
                      className={inputStyle}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "contact-email-error" : undefined}
                    />
                  </Field>

                  <Field label="Số điện thoại" error={errors.phone} htmlFor="contact-phone">
                    <input
                      id="contact-phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      name="phone"
                      value={form.phone}
                      onChange={change}
                      placeholder="09xx xxx xxx"
                      className={inputStyle}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                    />
                  </Field>
                </div>

                <Field label="Bạn quan tâm đến" htmlFor="contact-subject">
                  <div className="relative">
                    <select
                      id="contact-subject"
                      name="subject"
                      value={form.subject}
                      onChange={change}
                      className={`${inputStyle} cursor-pointer appearance-none pr-8`}
                    >
                      {SUBJECTS.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-xs text-[#9B2C2C]" aria-hidden="true">
                      ↓
                    </span>
                  </div>
                </Field>

                <Field label="Lời nhắn" required error={errors.message} htmlFor="contact-message">
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    maxLength={MESSAGE_LIMIT}
                    name="message"
                    value={form.message}
                    onChange={change}
                    placeholder="Hãy chia sẻ điều bạn đang quan tâm…"
                    className={`${inputStyle} min-h-36 resize-y`}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "contact-message-error" : undefined}
                  />

                  <div className="mt-2 flex justify-end text-[7px] tracking-[1.5px] text-[#7A6C63]" aria-live="polite">
                    {form.message.length} / {MESSAGE_LIMIT}
                  </div>
                </Field>

                <div className="mt-2 flex flex-col gap-6 border-t border-[#D8CFC0] pt-7 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rotate-45 border border-[#9B2C2C]" />
                    <span className="max-w-[230px] text-[7px] leading-5 tracking-[2px] text-[#7A6C63]">
                      PRIVATE &amp; CONFIDENTIAL
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="group flex min-w-[190px] items-center justify-between gap-8 bg-[#D4AF37] px-6 py-4 text-[9px] font-bold tracking-[0.22em] text-[#2A2421] transition-colors duration-200 hover:bg-[#b89528] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <span>{busy ? "ĐANG GỬI…" : "GỬI LỜI NHẮN"}</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>

                <p className="sr-only" aria-live="polite">
                  {busy ? "Đang gửi lời nhắn tới ArtMind." : ""}
                </p>
              </form>
            )}
          </div>
        </section>
      </section>

      <section className="border-t border-[#E0D7C8] bg-[#EAE2D2] px-6 py-16 text-center md:py-20">
        <span className="text-[8px] tracking-[4px] text-[#9B2C2C]">
          ARTMIND / OPEN CONVERSATIONS
        </span>

        <blockquote className="mx-auto mt-5 max-w-3xl font-['Playfair_Display'] text-3xl font-medium leading-tight md:text-5xl">
          Mọi cuộc gặp gỡ với nghệ thuật
          <br />
          <em className="font-normal text-[#9B2C2C]">đều bắt đầu bằng một câu hỏi.</em>
        </blockquote>

        <div className="mx-auto mt-9 flex max-w-sm items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-[#C8BBA8]" />
          <span className="h-2 w-2 rotate-45 border border-[#9B2C2C]" />
          <span className="h-px flex-1 bg-[#C8BBA8]" />
        </div>
      </section>
    </main>
  );
}

const inputStyle = `
  w-full
  border-0
  border-b
  border-[#D8CFC0]
  bg-transparent
  px-0
  py-3
  text-sm
  text-[#2A2421]
  outline-none
  transition-colors
  duration-200
  placeholder:text-[#A39585]
  hover:border-[#C8BBA8]
  focus:border-[#9B2C2C]
  disabled:cursor-not-allowed
  disabled:opacity-60
`;

function Field({ label, required = false, error, htmlFor, children }) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className="mb-7">
      <label htmlFor={htmlFor} className="mb-2 block text-[8px] font-bold uppercase tracking-[2px] text-[#7A6C63]">
        {label}
        {required ? <span className="ml-1 text-[#9B2C2C]">*</span> : null}
      </label>

      <div className={error ? "[&_input]:border-[#9B2C2C] [&_textarea]:border-[#9B2C2C]" : ""}>
        {children}
      </div>

      {error ? (
        <p id={errorId} className="mt-2 text-[11px] leading-5 text-[#9B2C2C]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ContactInfo({ number, label, value, href }) {
  const content = (
    <>
      <small className="block text-[7px] font-bold tracking-[3px] text-[#A39585]">{label}</small>
      <span className="mt-2 block font-['Playfair_Display'] text-lg font-normal text-[#F7F4EF] transition-colors duration-200 group-hover:text-[#D4AF37]">
        {value}
      </span>
    </>
  );

  return (
    <div className="grid grid-cols-[40px_1fr] gap-4 border-b border-[#3D332E] py-5">
      <span className="font-['Playfair_Display'] text-sm text-[#D4AF37]">{number}</span>

      {href ? (
        <a
          href={href}
          className="group rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-4 focus-visible:ring-offset-[#1C1715]"
        >
          {content}
        </a>
      ) : (
        <div>{content}</div>
      )}
    </div>
  );
}

function MiniFact({ eyebrow, value }) {
  return (
    <div className="border-l border-[#3D332E] pl-4">
      <span className="block text-[7px] font-bold tracking-[2.5px] text-[#A39585]">{eyebrow}</span>
      <span className="mt-2 block font-['Playfair_Display'] text-sm text-[#F7F4EF]">{value}</span>
    </div>
  );
}

function SuccessState({ onReset }) {
  return (
    <div className="border border-[#D8CFC0] bg-[#F7F4EF] p-8 text-center md:p-12" role="status" aria-live="polite">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#9B2C2C] font-['Playfair_Display'] text-2xl text-[#9B2C2C]">
        ✓
      </div>

      <span className="mt-7 block text-[8px] font-bold tracking-[4px] text-[#9B2C2C]">MESSAGE RECEIVED</span>

      <h2 className="mt-5 font-['Playfair_Display'] text-4xl font-medium text-[#1C1715] md:text-5xl">Cảm ơn bạn.</h2>

      <div className="mx-auto my-7 flex max-w-xs items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-[#D8CFC0]" />
        <span className="h-2 w-2 rotate-45 border border-[#9B2C2C]" />
        <span className="h-px flex-1 bg-[#D8CFC0]" />
      </div>

      <p className="mx-auto max-w-md text-sm leading-7 text-[#524640]">
        Lời nhắn đã được gửi tới ArtMind. Chúng tôi sẽ phản hồi trong khoảng 1–2 ngày làm việc.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-8 bg-[#D4AF37] px-6 py-4 text-[9px] font-bold tracking-[0.22em] text-[#2A2421] transition-colors duration-200 hover:bg-[#b89528] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
      >
        GỬI LỜI NHẮN KHÁC →
      </button>
    </div>
  );
}
