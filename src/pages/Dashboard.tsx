import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db, logOut } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { extractTextFromFile } from '../utils/textExtractor';
import { parseCandidateCV, searchCandidates } from '../utils/gemini';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import { UploadCloud, FileText, Loader2, LogOut, Search, User as UserIcon, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [headhunterQuery, setHeadhunterQuery] = useState('');
  const [isHeadhunterSearching, setIsHeadhunterSearching] = useState(false);
  const [headhunterResults, setHeadhunterResults] = useState<string[] | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'candidates'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      docs.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setCandidates(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'candidates');
    });

    return () => unsubscribe();
  }, [user]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await extractTextFromFile(file);
      const parsedData = await parseCandidateCV(text);
      
      const candidateData = {
        userId: user.uid,
        originalFileName: file.name,
        originalFileType: file.type,
        originalText: text,
        ...parsedData,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'candidates'), candidateData);
      navigate(`/candidates/${docRef.id}`);
    } catch (error: any) {
      console.error("Error processing file:", error);
      if (error?.message?.includes('403') || error?.message?.includes('PERMISSION_DENIED')) {
        alert("Error de permisos con la IA. Por favor, verifica que tu API Key de Gemini sea válida y tenga permisos.");
      } else {
        alert("Hubo un error al procesar el archivo. Por favor, inténtalo de nuevo.");
      }
    } finally {
      setIsProcessing(false);
    }
  }, [user, navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: isProcessing
  } as any);

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  const handleHeadhunterSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headhunterQuery.trim() || candidates.length === 0) {
      setHeadhunterResults(null);
      return;
    }
    
    setIsHeadhunterSearching(true);
    try {
      const results = await searchCandidates(headhunterQuery, candidates);
      setHeadhunterResults(results);
    } catch (error) {
      console.error("Error searching candidates:", error);
      alert("Hubo un error al buscar candidatos.");
    } finally {
      setIsHeadhunterSearching(false);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    if (headhunterResults !== null) {
      return headhunterResults.includes(c.id);
    }
    
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = c.personalData?.name?.toLowerCase().includes(searchLower);
    const skillsMatch = c.hardSkills?.some((s: string) => s.toLowerCase().includes(searchLower)) ||
                        c.softSkills?.some((s: string) => s.toLowerCase().includes(searchLower));
    return nameMatch || skillsMatch;
  });

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-zinc-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transform -rotate-6">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-display font-bold tracking-tight">Kandido</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-zinc-50 rounded-full border border-zinc-200">
                <img src={user?.photoURL || ''} alt="" className="w-8 h-8 rounded-full bg-zinc-200" />
                <span className="hidden sm:block text-sm font-medium">{user?.displayName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upload */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[24px] shadow-sm border border-zinc-200">
              <h2 className="text-xl font-display font-semibold mb-6">Analizar nuevo CV</h2>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-[16px] p-10 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[0.98]' : 'border-zinc-200 hover:border-indigo-400 hover:bg-zinc-50'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input {...getInputProps()} />
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                    <p className="text-sm font-medium text-zinc-900">Procesando con IA...</p>
                    <p className="text-xs text-zinc-500 mt-2">Esto puede tomar unos segundos</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 border border-zinc-100">
                      <UploadCloud className="w-8 h-8 text-zinc-400" />
                    </div>
                    <p className="text-sm font-medium text-zinc-900">Arrastra un PDF o TXT aquí</p>
                    <p className="text-xs text-zinc-500 mt-2">o haz clic para seleccionar</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-indigo-50 p-8 rounded-[24px] border border-indigo-100/50">
              <h3 className="text-sm font-semibold text-indigo-900 mb-4 uppercase tracking-wider">Guía rápida</h3>
              <ul className="text-sm text-indigo-800/80 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                  Sube el currículum del candidato.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                  La IA extraerá la información clave.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                  Revisa el perfil estructurado.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                  Usa el buscador para encontrar talento.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[24px] shadow-sm border border-zinc-200 overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-8 border-b border-zinc-100 flex flex-col gap-6 bg-zinc-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-display font-semibold text-zinc-900">Histórico de Perfiles</h2>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o habilidad..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (headhunterResults) setHeadhunterResults(null);
                      }}
                      className="pl-11 pr-4 py-2.5 bg-white border border-zinc-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full transition-all"
                    />
                  </div>
                </div>

                {/* Headhunter Mode */}
                <form onSubmit={handleHeadhunterSearch} className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur-xl transition-all opacity-50 group-hover:opacity-100"></div>
                  <div className="relative flex items-center bg-white border border-indigo-100 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                    <div className="pl-4 pr-2 text-indigo-500">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Modo Headhunter: Ej. 'Candidatos en Madrid que hablen inglés'"
                      value={headhunterQuery}
                      onChange={(e) => setHeadhunterQuery(e.target.value)}
                      className="flex-1 py-3 px-2 bg-transparent text-sm focus:outline-none text-zinc-900 placeholder:text-zinc-400"
                    />
                    <button
                      type="submit"
                      disabled={isHeadhunterSearching || !headhunterQuery.trim()}
                      className="mr-2 px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isHeadhunterSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
                    </button>
                  </div>
                </form>
                
                {headhunterResults !== null && (
                  <div className="flex items-center justify-between text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                    <span>Resultados de IA: {filteredCandidates.length} candidatos encontrados.</span>
                    <button onClick={() => setHeadhunterResults(null)} className="hover:underline font-medium">Limpiar</button>
                  </div>
                )}
              </div>
              
              <div className="divide-y divide-zinc-100 flex-1">
                {filteredCandidates.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center h-full text-zinc-400">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-zinc-300" />
                    </div>
                    <p className="text-sm">
                      {searchTerm ? 'No se encontraron candidatos que coincidan con la búsqueda.' : 'Aún no has analizado ningún currículum.'}
                    </p>
                  </div>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      onClick={() => navigate(`/candidates/${candidate.id}`)}
                      className="p-6 hover:bg-zinc-50 cursor-pointer transition-colors flex items-start gap-5 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100 group-hover:scale-105 transition-transform">
                        <UserIcon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base font-semibold text-zinc-900 truncate">
                            {candidate.personalData?.name || 'Candidato sin nombre'}
                          </h3>
                          <span className="text-xs text-zinc-400 whitespace-nowrap ml-4 font-medium">
                            {new Date(candidate.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-500 truncate mb-3">
                          {candidate.workExperience?.[0]?.role || 'Sin rol especificado'} • {candidate.workExperience?.[0]?.company || ''}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.hardSkills?.slice(0, 4).map((skill: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200/50">
                              {skill}
                            </span>
                          ))}
                          {candidate.hardSkills?.length > 4 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-50 text-zinc-500 border border-zinc-200/50">
                              +{candidate.hardSkills.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
