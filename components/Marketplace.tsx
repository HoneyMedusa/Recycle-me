
import React, { useState, useRef, useEffect } from 'react';
import { analyzeWasteImage, findRecyclingLocations } from '../services/gemini';
import { WasteAnalysis, RecyclingCenter, WasteType } from '../types';

interface MarketplaceProps {
  onEarningsUpdate: (amount: number, material: WasteType, weight: number) => void;
}

interface BookingDetails {
  centerName: string;
  date: string;
  time: string;
  type: 'collection' | 'delivery';
}

const Marketplace: React.FC<MarketplaceProps> = ({ onEarningsUpdate }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WasteAnalysis | null>(null);
  const [locations, setLocations] = useState<RecyclingCenter[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Booking States
  const [bookingHub, setBookingHub] = useState<RecyclingCenter | null>(null);
  const [bookingForm, setBookingForm] = useState<Partial<BookingDetails>>({ type: 'delivery' });
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  // Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setError(null);
    setAnalysis(null);
    setImage(null);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera access is not supported by your browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      }).catch(async () => {
        return await navigator.mediaDevices.getUserMedia({ video: true });
      });

      streamRef.current = stream;
      setIsCameraActive(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera access error:", err);
      stopCamera();
      setError("Could not access camera. Try using 'Photo Upload'.");
    }
  };

  const captureSinglePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImage(dataUrl);
      stopCamera();
      
      setIsAnalyzing(true);
      analyzeWasteImage(dataUrl.split(',')[1])
        .then(handleAnalysisResult)
        .catch(err => {
          setError(err.message);
          setIsAnalyzing(false);
        });
    }
  };

  const handleAnalysisResult = async (result: WasteAnalysis) => {
    if (result.type === WasteType.NON_RECYCLABLE) {
      setError("Error: Only recyclable goods can be uploaded. Please scan plastic, glass, metal, paper, or electronics.");
      setImage(null);
      setIsAnalyzing(false);
      return;
    }

    setAnalysis(result);
    try {
      const nearLocations = await findRecyclingLocations("Sandton");
      setLocations(nearLocations);
    } catch (e) {}
    setIsAnalyzing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImage(base64);
      setIsAnalyzing(true);
      setError(null);
      
      try {
        const result = await analyzeWasteImage(base64.split(',')[1]);
        handleAnalysisResult(result);
      } catch (err: any) {
        setError(err.message || "Analysis failed.");
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingForm.date && bookingForm.time) {
      setIsBookingSuccess(true);
      setTimeout(() => {
        setIsBookingSuccess(false);
        setBookingHub(null);
        setBookingForm({ type: 'delivery' });
      }, 3000);
    }
  };

  const confirmListing = () => {
    if (analysis) {
      onEarningsUpdate(analysis.estimatedValue, analysis.type, analysis.estimatedWeight);
      alert(`🚀 Success! Listing created. You'll receive R ${analysis.estimatedValue.toFixed(2)} once verified.`);
      setAnalysis(null);
      setImage(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Marketplace Context Header */}
      <div className="glass-morphism p-6 rounded-[2rem] border-l-4 border-indigo-500 bg-indigo-500/5">
        <h3 className="text-xl font-bangers text-indigo-400 mb-2 uppercase tracking-widest">The Smart Marketplace</h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          Recycle Me turns your environmental responsibility into a revenue stream. 
          Use the <strong>AI Scanner</strong> below to identify recyclables. We estimate weight and market value instantly. 
          Once identified, you can book a collection from a nearby hub or choose to drop it off yourself. 
          Your payout is processed as soon as the hub verifies the material.
        </p>
      </div>

      <section className="relative glass-morphism p-8 rounded-[2.5rem] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
            <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-2 uppercase tracking-tighter">Scan & Earn Cash</h2>
            <p className="text-slate-400 max-w-md mx-auto">Upload a photo to receive an instant AI payout estimate.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={startCamera}
              disabled={isCameraActive || isAnalyzing}
              className="funky-gradient px-10 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span>LIVE SCANNER</span>
            </button>

            <label className="cursor-pointer bg-slate-800 border border-white/10 px-10 py-4 rounded-2xl font-bold hover:bg-slate-700 transition-all inline-block">
              <span>PHOTO UPLOAD</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>
      </section>

      {isCameraActive && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg aspect-[3/4] sm:aspect-video bg-slate-900 rounded-3xl overflow-hidden border-2 border-indigo-500">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
              <button onClick={captureSinglePhoto} className="bg-white text-slate-900 p-6 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
              </button>
              <button onClick={stopCamera} className="bg-black/50 text-white p-6 rounded-full backdrop-blur-md border border-white/10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-slate-700 rounded-full animate-spin"></div>
          <p className="text-purple-400 font-mono animate-pulse uppercase tracking-[0.2em] text-xs font-bold">Identifying materials...</p>
        </div>
      )}

      {analysis && (
        <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-10 duration-500">
          <div className="space-y-6">
            <div className="glass-morphism rounded-[2.5rem] overflow-hidden border-2 border-purple-500/30 shadow-2xl">
              {image && <img src={image} alt="Waste Preview" className="w-full h-72 object-cover" />}
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-purple-500/20 text-purple-300 px-4 py-1.5 rounded-full text-xs font-bold border border-purple-500/30 uppercase tracking-widest">
                    {analysis.type}
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Estimated Payout</p>
                    <span className="text-green-400 font-bangers text-4xl">R {analysis.estimatedValue.toFixed(2)}</span>
                  </div>
                </div>
                <div className="grid gap-4">
                  <button onClick={confirmListing} className="w-full bg-green-500 hover:bg-green-400 text-slate-900 font-black py-5 rounded-2xl transition-all shadow-xl shadow-green-900/20 uppercase tracking-widest">
                    Confirm Listing
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 h-fit">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <h3 className="text-2xl font-bangers tracking-wider text-slate-100 uppercase">PARTNER HUBS</h3>
            </div>
            
            {locations.length === 0 && (
              <div className="p-10 glass-morphism rounded-3xl border border-white/5 text-center">
                 <p className="text-slate-500 text-sm uppercase font-bold tracking-widest">Scan waste to locate nearby hubs</p>
              </div>
            )}

            {locations.map((loc, idx) => (
              <div key={idx} className="glass-morphism p-6 rounded-3xl hover:border-pink-500/50 transition-all border border-white/5 bg-slate-900/20 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-100 group-hover:text-pink-400 transition-colors">{loc.name}</h4>
                    <p className="text-[11px] text-slate-400">{loc.address}</p>
                  </div>
                  <span className="text-pink-400 font-mono text-xs font-bold bg-pink-500/10 px-2 py-1 rounded-lg border border-pink-500/20">{loc.distance || '2.4km'}</span>
                </div>
                <button 
                  className="w-full funky-gradient text-slate-900 text-[10px] font-black py-3 rounded-xl uppercase tracking-[0.2em] transition-all"
                  onClick={() => setBookingHub(loc)}
                >
                  Book Collection / Drop-off
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal Overlay */}
      {bookingHub && (
        <div className="fixed inset-0 bg-slate-950/90 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="glass-morphism w-full max-w-lg p-8 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
            {!isBookingSuccess ? (
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-bangers text-purple-400 uppercase tracking-widest">Schedule Transfer</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Center: {bookingHub.name}</p>
                  </div>
                  <button type="button" onClick={() => setBookingHub(null)} className="text-slate-500 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Select Date</label>
                    <input 
                      type="date" 
                      required
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                      className="w-full bg-slate-900 p-4 rounded-2xl border border-white/5 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Arrival Time</label>
                    <input 
                      type="time" 
                      required
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                      className="w-full bg-slate-900 p-4 rounded-2xl border border-white/5 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Service Type</label>
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setBookingForm({...bookingForm, type: 'delivery'})}
                        className={`py-4 rounded-2xl border font-bold uppercase text-[10px] tracking-widest transition-all ${bookingForm.type === 'delivery' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                      >
                        Self Drop-off
                      </button>
                      <button 
                        type="button"
                        onClick={() => setBookingForm({...bookingForm, type: 'collection'})}
                        className={`py-4 rounded-2xl border font-bold uppercase text-[10px] tracking-widest transition-all ${bookingForm.type === 'collection' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                      >
                        Home Collection
                      </button>
                   </div>
                   {bookingForm.type === 'collection' && (
                     <p className="text-[9px] text-pink-400 font-bold uppercase italic text-center mt-2">A R25 convenience fee applies to Home Collections</p>
                   )}
                </div>

                <button type="submit" className="w-full funky-gradient py-5 rounded-2xl font-bold uppercase tracking-widest shadow-xl">
                   Confirm My Booking
                </button>
              </form>
            ) : (
              <div className="py-12 text-center space-y-6 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/40">
                  <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-4xl font-bangers text-green-400 uppercase tracking-widest">Booking Confirmed!</h3>
                <div className="space-y-1">
                  <p className="text-slate-300 font-medium">Arrival Scheduled for {bookingForm.date} at {bookingForm.time}</p>
                  <p className="text-slate-500 text-xs uppercase font-bold">Ref: BK-{Math.floor(Math.random() * 99999)}</p>
                </div>
                <p className="text-slate-400 text-sm italic">"See you soon! A confirmation SMS has been sent to your device."</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
