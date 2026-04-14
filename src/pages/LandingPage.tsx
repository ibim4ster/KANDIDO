import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Zap, LogIn, ArrowRight, Sparkles } from 'lucide-react';
import { signInWithGoogle } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transform -rotate-6">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight">Kandido</span>
          </div>
          <button
            onClick={handleLogin}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 rounded-full transition-colors border border-white/20"
          >
            <LogIn className="w-4 h-4" />
            Acceder
          </button>
        </div>
      </header>

      {/* Hero Section - Split Layout Style */}
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
          <div className="space-y-10 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>IA para Recursos Humanos</span>
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display font-bold leading-[0.9] tracking-tighter">
              El talento, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">decodificado.</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-lg leading-relaxed font-light">
              Transforma archivos PDF y TXT en perfiles estructurados. Ahorra horas de lectura manual y encuentra al candidato ideal en segundos con el poder de la IA.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button
                onClick={handleLogin}
                className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-medium text-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 group"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Continuar con Google
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          
          {/* Abstract Visual / Decorative */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 blur-[100px] rounded-full" />
            <div className="relative bg-zinc-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="space-y-6">
                <div className="h-4 w-1/3 bg-white/10 rounded-full" />
                <div className="space-y-3">
                  <div className="h-3 w-full bg-white/5 rounded-full" />
                  <div className="h-3 w-5/6 bg-white/5 rounded-full" />
                  <div className="h-3 w-4/6 bg-white/5 rounded-full" />
                </div>
                <div className="flex gap-3 pt-4">
                  <div className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs border border-indigo-500/20">React</div>
                  <div className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs border border-cyan-500/20">TypeScript</div>
                  <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/20">Liderazgo</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid md:grid-cols-3 gap-8 border-t border-white/10 pt-24">
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-colors">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-display font-semibold text-white mb-3">Extracción Automática</h3>
            <p className="text-zinc-400 font-light leading-relaxed">
              Sube currículums en PDF o TXT y nuestra IA extraerá experiencia, educación y habilidades automáticamente.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-colors">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20">
              <Search className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-display font-semibold text-white mb-3">Búsqueda Inteligente</h3>
            <p className="text-zinc-400 font-light leading-relaxed">
              Filtra tu base de datos de candidatos por habilidades, años de experiencia o idiomas en un instante.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-colors">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-display font-semibold text-white mb-3">Sugerencias de Mejora</h3>
            <p className="text-zinc-400 font-light leading-relaxed">
              Obtén recomendaciones generadas por IA para mejorar el impacto de los perfiles de tus candidatos.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
