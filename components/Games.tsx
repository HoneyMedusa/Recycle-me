
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

interface GamesProps {
  onPointsEarned: (points: number) => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

const WASTE_POOL = [
  { name: 'Plastic Bottle', type: 'RECYCLABLE', icon: '🥤' },
  { name: 'Apple Core', type: 'TRASH', icon: '🍎' },
  { name: 'Aluminum Can', type: 'RECYCLABLE', icon: '🥫' },
  { name: 'Cardboard Box', type: 'RECYCLABLE', icon: '📦' },
  { name: 'Glass Jar', type: 'RECYCLABLE', icon: '🫙' },
  { name: 'Used Napkin', type: 'TRASH', icon: '🧻' },
  { name: 'Broken Mirror', type: 'TRASH', icon: '🪞' },
  { name: 'Old Battery', type: 'RECYCLABLE', icon: '🔋' }, // Electronics category
];

const Games: React.FC<GamesProps> = ({ onPointsEarned }) => {
  const [gameMode, setGameMode] = useState<'lobby' | 'sorter' | 'quiz'>('lobby');
  
  // Sorter Game State
  const [currentWaste, setCurrentWaste] = useState(WASTE_POOL[0]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  // Quiz Game State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState<string | null>(null);

  // Sorting Game Logic
  useEffect(() => {
    let timer: any;
    if (gameMode === 'sorter' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && gameMode === 'sorter') {
      alert(`Game Over! You earned ${score} points!`);
      onPointsEarned(score);
      setGameMode('lobby');
    }
    return () => clearInterval(timer);
  }, [gameMode, timeLeft]);

  const handleSort = (type: 'RECYCLABLE' | 'TRASH') => {
    if (currentWaste.type === type) {
      setScore(s => s + 10);
    } else {
      setScore(s => Math.max(0, s - 5));
    }
    setCurrentWaste(WASTE_POOL[Math.floor(Math.random() * WASTE_POOL.length)]);
  };

  // Quiz Game Logic
  const fetchQuiz = async () => {
    setIsQuizLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate 5 multiple choice questions about pollution, climate change, and recycling specific to South Africa. Include South African contexts like load shedding impacts on waste, local bird species affected by plastic, or SA waste management laws. Return as JSON array.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answerIndex: { type: Type.NUMBER },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "answerIndex", "explanation"]
            }
          }
        }
      });
      const data = JSON.parse(response.text || "[]");
      setQuizQuestions(data);
      setGameMode('quiz');
      setScore(0);
    } catch (e) {
      alert("Failed to load quiz. Check your connection!");
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleQuizAnswer = (idx: number) => {
    const q = quizQuestions[currentQuestionIndex];
    if (idx === q.answerIndex) {
      setScore(s => s + 50);
      setShowExplanation(`Correct! ${q.explanation}`);
    } else {
      setShowExplanation(`Incorrect. ${q.explanation}`);
    }
  };

  const nextQuizStep = () => {
    setShowExplanation(null);
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      alert(`Quiz Complete! Total Score: ${score}`);
      onPointsEarned(score);
      setGameMode('lobby');
      setCurrentQuestionIndex(0);
    }
  };

  if (gameMode === 'lobby') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="text-center py-12 glass-morphism rounded-[3rem] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500"></div>
          <h2 className="text-5xl font-bangers tracking-widest text-white mb-4">ECO-ARCADE</h2>
          <p className="text-slate-400 max-w-sm mx-auto uppercase text-xs font-bold tracking-[0.2em] leading-relaxed">
            Play games, learn about our planet, and earn real XP for rewards!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Recycle Rush Card */}
          <button 
            onClick={() => { setGameMode('sorter'); setScore(0); setTimeLeft(30); }}
            className="group relative glass-morphism rounded-[3rem] border-2 border-indigo-500/10 overflow-hidden text-left p-10 transition-all hover:scale-[1.03] hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10"
          >
            {/* Background Decoration Icon */}
            <div className="absolute top-[-20px] right-[-20px] text-[10rem] opacity-[0.03] group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 select-none">♻️</div>
            
            {/* Distinct Visual Icon */}
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 shadow-lg">
              ♻️
            </div>

            <h3 className="text-3xl font-bangers text-indigo-400 mb-2 tracking-wider group-hover:text-indigo-300 transition-colors">RECYCLE RUSH</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">Test your reflexes! Sort falling items into the correct bins before the timer hits zero.</p>
            
            <div className="flex items-center gap-3">
              <span className="bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/40 group-hover:translate-x-1 transition-transform">
                PLAY NOW
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">30s Blitz</span>
            </div>
          </button>

          {/* Pollution Pro Card */}
          <button 
            disabled={isQuizLoading}
            onClick={fetchQuiz}
            className="group relative glass-morphism rounded-[3rem] border-2 border-yellow-500/10 overflow-hidden text-left p-10 transition-all hover:scale-[1.03] hover:border-yellow-500/40 hover:shadow-2xl hover:shadow-yellow-500/10 disabled:opacity-50"
          >
            {/* Background Decoration Icon */}
            <div className="absolute top-[-20px] right-[-20px] text-[10rem] opacity-[0.03] group-hover:-rotate-12 group-hover:scale-110 transition-all duration-700 select-none">💡</div>

            {/* Distinct Visual Icon */}
            <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-yellow-500/30 group-hover:bg-yellow-500 group-hover:text-slate-900 transition-all duration-500 shadow-lg">
              💡
            </div>

            <h3 className="text-3xl font-bangers text-yellow-400 mb-2 tracking-wider group-hover:text-yellow-300 transition-colors">POLLUTION PRO</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">Mastermind trivia! Challenge your knowledge with smart environmental quiz questions.</p>
            
            <div className="flex items-center gap-3">
              <span className="bg-yellow-500 text-slate-950 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-yellow-900/20 group-hover:translate-x-1 transition-transform">
                {isQuizLoading ? 'LOADING AI...' : 'START QUIZ'}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trivia Mode</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (gameMode === 'sorter') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-12 animate-in zoom-in duration-300">
        <div className="flex justify-between w-full max-w-md px-6 items-center">
          <div className="text-3xl font-bangers text-indigo-400">{timeLeft}s</div>
          <div className="text-3xl font-bangers text-green-400">SCORE: {score}</div>
        </div>

        <div className="relative glass-morphism w-48 h-48 rounded-[2rem] border-2 border-indigo-500/50 flex items-center justify-center text-7xl animate-bounce shadow-2xl shadow-indigo-500/20">
          {currentWaste.icon}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
            Current Item: {currentWaste.name}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full max-w-md px-4">
          <button 
            onClick={() => handleSort('RECYCLABLE')}
            className="funky-gradient p-8 rounded-[2rem] flex flex-col items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <span className="text-3xl">♻️</span>
            <span className="font-bold text-xs uppercase tracking-widest">Recyclable</span>
          </button>
          <button 
            onClick={() => handleSort('TRASH')}
            className="bg-slate-800 p-8 rounded-[2rem] flex flex-col items-center gap-3 border border-white/5 shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <span className="text-3xl">🗑️</span>
            <span className="font-bold text-xs uppercase tracking-widest">General Trash</span>
          </button>
        </div>

        <button 
          onClick={() => setGameMode('lobby')}
          className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
        >
          Quit Game
        </button>
      </div>
    );
  }

  if (gameMode === 'quiz') {
    const q = quizQuestions[currentQuestionIndex];
    return (
      <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 duration-500">
        <div className="flex justify-between items-center font-bangers text-xl">
          <span className="text-yellow-400">QUIZ {currentQuestionIndex + 1}/{quizQuestions.length}</span>
          <span className="text-indigo-400">PTS: {score}</span>
        </div>

        {!showExplanation ? (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white leading-relaxed">{q.question}</h3>
            <div className="grid gap-4">
              {q.options.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={() => handleQuizAnswer(i)}
                  className="w-full text-left p-5 glass-morphism rounded-2xl border border-white/10 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all flex items-center gap-4 group"
                >
                  <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold group-hover:bg-yellow-500 group-hover:text-slate-900 transition-colors">{String.fromCharCode(65 + i)}</span>
                  <span className="text-sm font-medium">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-morphism p-8 rounded-[2.5rem] border border-indigo-500/30 space-y-6 animate-in zoom-in duration-300">
            <div className="text-center">
               <div className="text-6xl mb-4">🌍</div>
               <p className="text-lg font-medium text-slate-100">{showExplanation}</p>
            </div>
            <button 
              onClick={nextQuizStep}
              className="w-full funky-gradient py-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg"
            >
              {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Games;
