import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ukRegistrationSchema, type VehicleLookupResult } from "@motorcover/shared-types";
import { api, ApiError } from "../lib/api";
import { useBuyFlowStore } from "../lib/buy-flow-store";
import { useCurrentUser, useLogout } from "../lib/auth";

export function LandingPage() {
  const navigate = useNavigate();
  const setVehicle = useBuyFlowStore((s) => s.setVehicle);
  const reset = useBuyFlowStore((s) => s.reset);
  const [registration, setRegistration] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { data } = useCurrentUser();
  const logout = useLogout();
  const user = data?.user;

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const lookup = useMutation({
    mutationFn: (reg: string) =>
      api.post<{ vehicle: VehicleLookupResult & { id: string } }>("/vehicle-lookup", { registration: reg }),
    onSuccess: ({ vehicle }) => { reset(); setVehicle(vehicle); navigate("/vehicle-confirm"); },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);
    const parsed = ukRegistrationSchema.safeParse(registration);
    if (!parsed.success) { setValidationError(parsed.error.issues[0]?.message ?? "Enter a valid registration"); return; }
    lookup.mutate(parsed.data);
  }

  return (
    <div className="bg-paper text-ink antialiased">

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur border-b border-ink/10">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <Link to="/">
            <img src="/daydrive-logo.svg" alt="DayDrive" className="h-10 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink/70">
            <a href="#how" className="hover:text-ink transition">How it works</a>
            <a href="#covered" className="hover:text-ink transition">What's covered</a>
            <a href="#eligibility" className="hover:text-ink transition">Who's eligible</a>
            <a href="#faq" className="hover:text-ink transition">FAQs</a>
          </nav>
          <div className="flex items-center gap-2 text-sm">
            {user ? (
              <>
                {user.role === "ADMIN" && (
                  <Link to="/admin" className="text-amber-600 hover:text-amber-500 font-medium px-3 py-1.5 rounded-lg transition">Admin</Link>
                )}
                <Link to="/portal" className="text-ink/70 hover:text-ink font-medium px-3 py-1.5 transition">My documents</Link>
                <button onClick={() => logout.mutate()} className="rounded-full bg-ink text-paper px-5 py-2.5 font-bold hover:bg-ink-700 transition">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-ink/70 hover:text-ink font-medium px-3 py-1.5 transition">Log in</Link>
                <a href="#quote" className="rounded-full bg-ink text-paper px-5 py-2.5 font-bold hover:bg-ink-700 transition">Get my quote</a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 -right-24 w-[42rem] h-[42rem] rounded-full bg-mint/25 blur-[130px] pointer-events-none" />
        <div className="mx-auto max-w-6xl px-5 pt-14 pb-28 grid lg:grid-cols-[1.05fr_.95fr] gap-12 lg:gap-16 items-center relative">

          {/* Left copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white text-ink px-3.5 py-1.5 text-xs font-bold tracking-wide ring-1 ring-ink/10 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" /> INSTANT COVER · ONE PRICE · £15
            </span>
            <h1 className="font-display font-bold tracking-[-0.02em] text-[3.4rem] sm:text-7xl leading-[0.92] mt-6">
              Insure a car<br />for the day.<br />
              <span className="text-mint-700">Sorted in minutes.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-ink/65 max-w-md leading-relaxed">
              Fully comprehensive 1-day cover. No effect on the owner's no-claims bonus. Drive away in under 15 minutes.
            </p>
            <div className="mt-7 flex items-center gap-4">
              <div className="flex -space-x-2">
                <span className="w-8 h-8 rounded-full bg-mint ring-2 ring-paper" />
                <span className="w-8 h-8 rounded-full bg-ink ring-2 ring-paper" />
                <span className="w-8 h-8 rounded-full bg-mint-600 ring-2 ring-paper" />
              </div>
              <div className="text-sm">
                <div className="text-amber-500 leading-none">★★★★★</div>
                <div className="text-ink/55 mt-0.5">Rated excellent by UK drivers</div>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-ink/55">
              <span className="inline-flex items-center gap-1.5"><span className="text-mint-700">✓</span> FCA authorised</span>
              <span className="inline-flex items-center gap-1.5"><span className="text-mint-700">✓</span> Highway Insurance underwriter</span>
            </div>
          </div>

          {/* Right: photo + floating quote card */}
          <div className="relative pb-16 sm:pb-20">
            <img
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1100&q=75"
              alt="Driver behind the wheel"
              className="w-full h-[26rem] sm:h-[30rem] object-cover object-center rounded-[2rem] shadow-2xl ring-1 ring-ink/10"
              loading="eager"
            />
            <form
              id="quote"
              onSubmit={handleSubmit}
              className="absolute -bottom-6 left-4 right-4 sm:-bottom-8 sm:-left-6 sm:right-6 bg-white/85 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-[0_30px_80px_-24px_rgba(11,12,30,.5)] ring-1 ring-white/60"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[11px] font-bold tracking-widest text-ink/40">STEP 1 OF 5</p>
                  <h2 className="font-display text-xl font-semibold mt-0.5">Enter your reg plate</h2>
                </div>
                <span className="text-xs font-bold text-mint-700 bg-mint/[.12] rounded-full px-2.5 py-1">~2 min</span>
              </div>

              {/* UK number plate */}
              <div style={{ display:"flex", alignItems:"stretch", overflow:"hidden", background:"#ffd80a", borderRadius:"9px", boxShadow:"inset 0 0 0 2px rgba(0,0,0,.18), 0 14px 34px -12px rgba(11,12,30,.4)" }}>
                <div style={{ background:"#063298", color:"#fff", width:"38px", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"4px", fontWeight:800, fontSize:"11px", letterSpacing:".05em" }}>
                  <span style={{ color:"#ffd80a", fontSize:"9px", lineHeight:1 }}>★</span>
                  UK
                </div>
                <input
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value.toUpperCase())}
                  placeholder="AB12 CDE"
                  maxLength={8}
                  autoComplete="off"
                  aria-label="Vehicle registration"
                  style={{ background:"transparent", border:"none", outline:"none", width:"100%", padding:"14px 8px", textAlign:"center", textTransform:"uppercase", color:"#111", fontFamily:'"Clash Display", system-ui, sans-serif', fontWeight:700, fontSize:"2.1rem", letterSpacing:"0.1em" }}
                />
              </div>

              {validationError && <p className="text-xs text-red-500 mt-1.5 text-center">{validationError}</p>}

              <button
                type="submit"
                disabled={lookup.isPending}
                className="mt-4 w-full rounded-xl bg-mint hover:bg-mint-600 text-ink font-bold py-3.5 text-lg transition shadow-lg shadow-mint/40 disabled:opacity-50"
              >
                {lookup.isPending ? "Looking up vehicle…" : "Get my quote →"}
              </button>

              {lookup.isError && (
                <p className="mt-2 text-center text-xs text-red-500">
                  {lookup.error instanceof ApiError ? lookup.error.message : "Something went wrong looking up that vehicle."}
                </p>
              )}
              <p className="mt-2.5 text-center text-xs text-ink/50">Cover starts the minute you choose · Documents emailed instantly</p>
            </form>
          </div>
        </div>
      </section>

      {/* ── WHY ONE DAY ── */}
      <section className="bg-ink text-paper py-20">
        <div className="mx-auto max-w-6xl px-5 grid lg:grid-cols-2 gap-12 items-center reveal">
          <div>
            <p className="text-mint font-bold tracking-widest text-sm">WHY ONE DAY?</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold mt-3">Cover that fits the day, not the year.</h2>
            <div className="mt-6 space-y-5 text-paper/70 text-lg leading-relaxed">
              <p>Sometimes you only need a car for a few hours. Borrowing your mate's van to move a sofa. Driving your mum's car to the airport. Test driving before you buy. An annual policy makes no sense for that — and going uninsured isn't an option.</p>
              <p>DayDrive gives you a full 24 hours of comprehensive cover on a car you don't own. The owner's policy stays untouched. Their no-claims bonus stays safe. You drive legally from the moment your cover starts.</p>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
            <img src="https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?auto=format&fit=crop&w=900&q=75" alt="Everyday UK hatchback" className="w-full h-80 object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="reveal">
            <p className="text-mint-700 font-bold tracking-widest text-sm">HOW IT WORKS</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold mt-3">Three steps. Fifteen minutes. Done.</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { n: "01", title: "Tell us about you and the car", body: "Registration, your licence details, when you want cover to start. Two minutes of typing." },
              { n: "02", title: "Get your price", body: "One clear price for 24 hours of comprehensive cover. No hidden admin fees bolted on at checkout." },
              { n: "03", title: "Drive", body: "Pay by card. Your Certificate of Insurance lands in your inbox straight away. Cover starts at the time you picked — down to the minute." },
            ].map((s) => (
              <div key={s.n} className="reveal bg-white rounded-2xl p-7 ring-1 ring-ink/5">
                <div className="font-display text-5xl font-bold text-mint">{s.n}</div>
                <h3 className="font-display text-xl font-semibold mt-3">{s.title}</h3>
                <p className="mt-2 text-ink/65">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT'S COVERED ── */}
      <section id="covered" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-5 grid md:grid-cols-2 gap-8">
          <div className="reveal rounded-2xl bg-mint/[.08] ring-1 ring-mint/20 p-8">
            <h3 className="font-display text-2xl font-semibold flex items-center gap-2"><span className="text-mint-700">✓</span> Comprehensive as standard</h3>
            <ul className="mt-5 space-y-3 text-ink/75">
              {["Damage to the car you're driving", "Damage to other vehicles and property", "Injury to other people", "Fire and theft", "Legal minimum cover for driving in the EU"].map((item) => (
                <li key={item} className="flex gap-3"><span className="text-mint-700 font-bold shrink-0">✓</span> {item}</li>
              ))}
            </ul>
          </div>
          <div className="reveal rounded-2xl bg-ink/[.03] ring-1 ring-ink/10 p-8">
            <h3 className="font-display text-2xl font-semibold flex items-center gap-2"><span className="text-ink/40">✗</span> What's not covered</h3>
            <ul className="mt-5 space-y-3 text-ink/70">
              {["Racing, track days, rallies", "Hire and reward (deliveries, taxi work)", "Driving other cars not named on the policy", "Anything dishonest — the car must be roadworthy, taxed and MOT'd"].map((item) => (
                <li key={item} className="flex gap-3"><span className="text-ink/35 font-bold shrink-0">✗</span> {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── WHO CAN GET COVER ── */}
      <section id="eligibility" className="py-20">
        <div className="mx-auto max-w-4xl px-5 reveal">
          <p className="text-mint-700 font-bold tracking-widest text-sm">WHO CAN GET COVER</p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold mt-3">Can I get a policy?</h2>
          <p className="mt-4 text-ink/65 text-lg">You can get 1-day cover with DayDrive if you:</p>
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            {["Are aged 19 to 75", "Held a full UK/EU licence for 6+ months", "Have no more than 6 penalty points", "Not disqualified in the last 3 years"].map((item) => (
              <div key={item} className="bg-white rounded-xl p-4 ring-1 ring-ink/5 flex gap-3"><span className="text-mint-700 shrink-0">✓</span> {item}</div>
            ))}
            <div className="bg-white rounded-xl p-4 ring-1 ring-ink/5 flex gap-3 sm:col-span-2"><span className="text-mint-700 shrink-0">✓</span> Insuring a car, van or motorhome worth under £65,000</div>
          </div>
          <p className="mt-5 text-ink/60">The vehicle needs valid tax and MOT. That's it.</p>
        </div>
      </section>

      {/* ── COMMON USES ── */}
      <section className="py-20 bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-5">
          <div className="reveal">
            <p className="text-mint font-bold tracking-widest text-sm">COMMON USES</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold mt-3">When a day is all you need.</h2>
          </div>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=600&q=70", title: "Borrowing a car", body: "A friend's car for the weekend errand. A parent's car while yours is in the garage." },
              { img: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=70", title: "Moving day", body: "Insure a borrowed van for 24 hours instead of paying hire-company insurance rates." },
              { img: "https://images.unsplash.com/photo-1453491945771-a1e904948959?auto=format&fit=crop&w=600&q=70", title: "Test drives", body: "Buying privately? Cover yourself for the test drive and the trip home." },
            ].map((c) => (
              <div key={c.title} className="reveal rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
                <img src={c.img} alt="" className="w-full h-36 object-cover" loading="lazy" />
                <div className="p-6">
                  <h3 className="font-display text-lg font-semibold text-mint">{c.title}</h3>
                  <p className="mt-2 text-paper/70">{c.body}</p>
                </div>
              </div>
            ))}
            <div className="reveal rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
              <h3 className="font-display text-lg font-semibold text-mint">Sharing the driving</h3>
              <p className="mt-2 text-paper/70">Long trip, two drivers. Add yourself to the journey, not to their annual policy.</p>
            </div>
            <div className="reveal rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
              <h3 className="font-display text-lg font-semibold text-mint">Emergencies</h3>
              <p className="mt-2 text-paper/70">Pick someone up, cover a school run, get to a hospital. Cover starts in minutes.</p>
            </div>
            <div className="reveal rounded-2xl bg-mint p-6 flex items-center justify-center text-center text-ink">
              <div>
                <div className="font-display text-3xl font-bold">£15</div>
                <div className="font-semibold mt-1">One day. One price.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY DAYDRIVE ── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="reveal">
            <p className="text-mint-700 font-bold tracking-widest text-sm">WHY DAYDRIVE</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold mt-3">Why drivers pick us.</h2>
          </div>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "Instant documents", body: "Certificate emailed the moment you pay. Show it on your phone if you're stopped." },
              { title: "No no-claims risk", body: "Your policy is separate. If anything happens, the owner's bonus is untouched." },
              { title: "Cover to the minute", body: 'Start at 2pm, not "sometime today". You choose the exact start time.' },
              { title: "Honest pricing", body: "The price you see is the price you pay. No fees appearing at the last step." },
              { title: "UK support", body: "Real people if something goes wrong, seven days a week." },
            ].map((f) => (
              <div key={f.title} className="reveal bg-white rounded-2xl p-6 ring-1 ring-ink/5">
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-ink/65">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section id="faq" className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="font-display text-4xl sm:text-5xl font-semibold reveal">FAQs</h2>
          <div className="mt-8 divide-y divide-ink/10">
            {[
              { q: "How quickly does cover start?", a: 'As soon as you want it to. Pick "now" and you\'re insured the minute payment goes through. Documents arrive by email straight away.' },
              { q: "Will this affect the car owner's insurance?", a: "No. Your DayDrive policy is completely separate. Any claim goes against your policy, not theirs — their no-claims bonus is never at risk." },
              { q: "Does the policy show on the Motor Insurance Database?", a: "Yes, but it can take up to a few days to appear. Always keep your Certificate of Insurance on your phone or printed when driving — that's your proof of cover if you're stopped before the database updates." },
              { q: "Can I drive someone else's car on my own annual policy instead?", a: '"Driving other cars" extensions are rarer than people assume, and where they exist they\'re third-party only — you\'d pay for any damage to the car you\'re driving. A 1-day comprehensive policy closes that gap.' },
              { q: "What do I need to get a quote?", a: "The vehicle registration, your driving licence details, and a payment card. Three minutes start to finish." },
              { q: "Can I extend my cover?", a: "Yes — buy another policy before the first one ends so there's no gap." },
              { q: "What if I make a mistake on my application?", a: "Contact us before your cover starts and we'll fix it. Wrong details can invalidate a policy, so check the certificate the moment it arrives." },
            ].map(({ q, a }) => (
              <details key={q} className="py-5">
                <summary className="flex justify-between items-center font-semibold text-lg">
                  {q} <span className="chev text-mint-700 ml-4 shrink-0">+</span>
                </summary>
                <p className="mt-3 text-ink/65">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 grain relative overflow-hidden">
        <div className="absolute inset-0 bg-mint" />
        <div className="mx-auto max-w-3xl px-5 text-center relative text-ink">
          <h2 className="font-display text-5xl sm:text-6xl font-bold reveal">Need to drive today?</h2>
          <p className="mt-4 text-xl font-medium reveal">Get covered in the next 15 minutes. One day. One price. £15.</p>
          <a href="#quote" className="inline-block mt-8 rounded-full bg-ink text-paper px-8 py-4 text-lg font-bold hover:bg-ink-700 transition shadow-xl">
            Get my quote now →
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-ink-800 text-paper/55 py-12 text-sm">
        <div className="mx-auto max-w-6xl px-5">
          <img src="/daydrive-logo-white.svg" alt="DayDrive" className="h-9 w-auto" />
          <div className="mt-5 space-y-2 max-w-3xl">
            <p>DayDrive.co.uk is a trading style of <span className="text-paper/80">[legal entity name]</span>, registered in England and Wales, company number <span className="text-paper/80">[number]</span>.</p>
            <p>DayDrive.co.uk is an introducer to <span className="text-paper/80">[authorised firm]</span>, which is authorised and regulated by the Financial Conduct Authority, FRN <span className="text-paper/80">[number]</span>. We do not provide advice or arrange insurance ourselves.</p>
            <p>Authorised and regulated by the Financial Conduct Authority, FRN <span className="text-paper/80">[number]</span>.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-paper/70 font-medium">
            <a href="#" className="hover:text-mint transition">Privacy Policy</a>
            <a href="#" className="hover:text-mint transition">Terms of Use</a>
            <a href="#" className="hover:text-mint transition">Complaints</a>
            <a href="#" className="hover:text-mint transition">Cookie Policy</a>
          </div>
          <p className="mt-8 text-xs text-paper/35">Underwritten by Highway Insurance Company Limited. Eligibility figures are typical market criteria — replace with your underwriter's actual terms before publishing.</p>
        </div>
      </footer>

    </div>
  );
}
