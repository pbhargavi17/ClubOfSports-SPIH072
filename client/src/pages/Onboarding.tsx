// Floodlit Clubhouse reminder: onboarding is a short confident passage into play—not a form maze.
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, ImagePlus, LockKeyhole, MapPin, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { BrandMark } from "@/components/Brand";
import { PricingCard, SectionKicker, SportCard } from "@/components/ProductPrimitives";
import { SportTemplateForm } from "@/components/SportTemplateForm";
import { primaryUser, sports, subscriptionPlans } from "@/lib/mock-data";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { login } from "@/lib/api";
import { toast } from "sonner";

type Step = "sign-in" | "otp" | "identity" | "sport";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("sign-in");
  const [selectedSport, setSelectedSport] = useState("Badminton");
  const [sportStage, setSportStage] = useState<"pick" | "fill">("pick");
  const [name, setName] = useState("Arjun Sharma");
  
  // Auth state
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (!auth) return;
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  }, []);

  const requestOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Enter a valid phone number");
      return;
    }
    // Using demo flow since Firebase billing is not enabled
    setStep("otp");
    toast.success("Demo mode: Use OTP 123456");
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;
    
    setLoading(true);
    try {
      if (code === "123456") {
        await login("DEMO_TOKEN", name, phoneNumber);
        setStep("identity");
      } else {
        toast.error("Invalid OTP");
      }
    } catch (e: any) {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const toApp = (plan = "Free") => { 
    localStorage.setItem("clubofsports-onboarded", "true"); 
    localStorage.setItem("clubofsports-plan", plan); 
    setLocation("/app"); 
  };
  
  const progress = ["sign-in", "otp", "identity", "sport"].indexOf(step) + 1;
  
  return (
    <div className="onboarding-page">
      <header>
        <BrandMark />
        <Link href="/" className="back-home"><ArrowLeft size={16} /> Back to home</Link>
      </header>
      <main>
        <aside className="onboarding-aside">
          <div>
            <SectionKicker>ONE ATHLETE IDENTITY</SectionKicker>
            <h1>A better<br />way to find<br /><em>your people.</em></h1>
            <p>Four quick choices are enough to start finding the players and sessions that work for you.</p>
          </div>
          <div className="onboarding-steps">
            {["Your contact", "Verify", "Your identity", "Your sport"].map((label, index) => (
              <div key={label} className={index + 1 <= progress ? "done" : ""}>
                <span>{index + 1 < progress ? <Check size={13} /> : `0${index + 1}`}</span>{label}
              </div>
            ))}
          </div>
          <p className="aside-foot">No payment is collected in this prototype.</p>
        </aside>
        
        <section className="onboarding-panel">
          <div className="step-progress">
            <span>STEP {String(progress).padStart(2, "0")} / 04</span>
            <i><b style={{ width: `${progress * 25}%` }} /></i>
          </div>
          
          <div id="recaptcha-container"></div>
          
          {step === "sign-in" && (
            <div className="step-content">
              <SectionKicker>LET’S START HERE</SectionKicker>
              <h2>What’s your<br /><em>playing number?</em></h2>
              <p>We’ll send a one-time code to verify your number.</p>
              <label className="field-label">MOBILE NUMBER
                <input 
                  autoFocus 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210" 
                />
              </label>
              <button className="button-lime wide" disabled={loading} onClick={requestOtp}>
                {loading ? <Loader2 className="animate-spin" size={17} /> : "Continue"} <ArrowRight size={17} />
              </button>
              <small className="terms">By continuing, you agree to use ClubOfSports respectfully.</small>
            </div>
          )}
          
          {step === "otp" && (
            <div className="step-content">
              <SectionKicker>VERIFY YOUR CONTACT</SectionKicker>
              <h2>Enter the code<br />we <em>sent you.</em></h2>
              <p>Enter the 6-digit OTP sent via SMS to {phoneNumber}.</p>
              <div className="otp-display">
                {otp.map((digit, i) => (
                  <input 
                    key={i} 
                    id={`otp-${i}`}
                    maxLength={1} 
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value;
                      const newOtp = [...otp];
                      newOtp[i] = val;
                      setOtp(newOtp);
                      if (val && i < 5) (document.getElementById(`otp-${i+1}`) as HTMLInputElement)?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && i > 0) (document.getElementById(`otp-${i-1}`) as HTMLInputElement)?.focus();
                    }}
                  />
                ))}
              </div>
              <button className="button-lime wide" disabled={loading} onClick={verifyOtp}>
                {loading ? <Loader2 className="animate-spin" size={16} /> : <LockKeyhole size={16} />} Verify & continue
              </button>
              <button className="text-button" onClick={() => setStep("sign-in")}>Use a different number</button>
            </div>
          )}
          
          {step === "identity" && (
            <div className="step-content">
              <SectionKicker>WELCOME TO CLUBOFSPORTS</SectionKicker>
              <h2>Make it easy for<br />a good player to <em>find you.</em></h2>
              <div className="identity-photo">
                <img src={primaryUser.avatar} alt="" />
                <button><ImagePlus size={17} />Change photo</button>
              </div>
              <div className="field-grid">
                <label className="field-label">YOUR NAME
                  <input value={name} onChange={(event) => setName(event.target.value)} />
                </label>
                <label className="field-label">CITY
                  <div className="field-with-icon"><MapPin size={16} /><input value="Hyderabad" readOnly /></div>
                </label>
                <label className="field-label">SKILL LEVEL
                  <select defaultValue="Intermediate">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>
                <label className="field-label">AVAILABILITY
                  <select defaultValue="Weekdays, evenings">
                    <option>Weekdays, evenings</option>
                    <option>Weekend mornings</option>
                    <option>Weekends</option>
                  </select>
                </label>
              </div>
              <button className="button-lime wide" onClick={() => setStep("sport")}>Continue <ArrowRight size={17} /></button>
            </div>
          )}
          
          {step === "sport" && (
            <div className="step-content wide-step">
              <SectionKicker>YOUR PRIMARY SPORT</SectionKicker>
              <h2>What do you<br /><em>show up for?</em></h2>
              <p>This shapes your first recommendations. You can add more sports after you are in.</p>
              
              {sportStage === "pick" ? (
                <>
                  <div className="onboarding-sports">
                    {sports.map((sport) => (
                      <SportCard key={sport.id} sport={sport} selected={sport.name === selectedSport} onClick={() => setSelectedSport(sport.name)} />
                    ))}
                  </div>
                  <button className="button-lime wide" onClick={() => setSportStage("fill")}>
                    Build my sport profile <ArrowRight size={17} />
                  </button>
                </>
              ) : (
                <div style={{ marginTop: 24, textAlign: "left" }}>
                  <SportTemplateForm 
                    sportName={selectedSport} 
                    onSaved={() => toApp("Free")} 
                    onCancel={() => setSportStage("pick")}
                  />
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
