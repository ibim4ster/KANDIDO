import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import { generateCVFeedback, generateInterviewQuestions, analyzeGaps, enrichProfile, translateProfile } from '../utils/gemini';
import { ArrowLeft, Mail, Phone, Linkedin, Briefcase, GraduationCap, Code, Lightbulb, Languages, Sparkles, FolderGit2, Award, Car, Clock, Heart, BookOpen, Loader2, MapPin, Globe, MessageSquare, AlertTriangle, Search, Download, FileJson, FileText, Tag, Save, X } from 'lucide-react';

export default function CandidateProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isAnalyzingGaps, setIsAnalyzingGaps] = useState(false);
  const [isEnrichingProfile, setIsEnrichingProfile] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!user || !id) return;
      try {
        const docRef = doc(db, 'candidates', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCandidate(data);
          if (data.notes) setNotes(data.notes);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `candidates/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [id, user]);

  const handleGenerateFeedback = async () => {
    if (!candidate?.originalText || !id) return;
    setIsGeneratingFeedback(true);
    try {
      const feedback = await generateCVFeedback(candidate.originalText);
      const docRef = doc(db, 'candidates', id);
      await updateDoc(docRef, { aiSuggestions: feedback });
      setCandidate({ ...candidate, aiSuggestions: feedback });
    } catch (error: any) {
      console.error("Error generating feedback:", error);
      alert("Hubo un error al generar las sugerencias.");
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!candidate?.originalText || !id) return;
    setIsGeneratingQuestions(true);
    try {
      const questions = await generateInterviewQuestions(candidate.originalText);
      const docRef = doc(db, 'candidates', id);
      await updateDoc(docRef, { interviewQuestions: questions });
      setCandidate({ ...candidate, interviewQuestions: questions });
    } catch (error: any) {
      console.error("Error generating questions:", error);
      alert("Hubo un error al generar las preguntas.");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAnalyzeGaps = async () => {
    if (!candidate?.originalText || !id) return;
    setIsAnalyzingGaps(true);
    try {
      const gaps = await analyzeGaps(candidate.originalText);
      const docRef = doc(db, 'candidates', id);
      await updateDoc(docRef, { gapAnalysis: gaps });
      setCandidate({ ...candidate, gapAnalysis: gaps });
    } catch (error: any) {
      console.error("Error analyzing gaps:", error);
      alert("Hubo un error al analizar los huecos.");
    } finally {
      setIsAnalyzingGaps(false);
    }
  };

  const handleEnrichProfile = async () => {
    if (!candidate?.personalData?.name || !id) return;
    setIsEnrichingProfile(true);
    try {
      const links = [candidate.personalData.linkedin, candidate.personalData.portfolio].filter(Boolean);
      const enriched = await enrichProfile(candidate.personalData.name, links);
      const docRef = doc(db, 'candidates', id);
      await updateDoc(docRef, { enrichedData: enriched });
      setCandidate({ ...candidate, enrichedData: enriched });
    } catch (error: any) {
      console.error("Error enriching profile:", error);
      alert("Hubo un error al enriquecer el perfil.");
    } finally {
      setIsEnrichingProfile(false);
    }
  };

  const handleTranslate = async () => {
    if (!candidate || !id) return;
    setIsTranslating(true);
    try {
      const targetLang = prompt("¿A qué idioma quieres traducir el perfil? (ej. Inglés, Español, Francés)");
      if (!targetLang) {
        setIsTranslating(false);
        return;
      }
      
      // Create a copy without the large original text and AI generated fields to save tokens
      const { originalText, aiSuggestions, interviewQuestions, gapAnalysis, enrichedData, ...dataToTranslate } = candidate;
      
      const translatedData = await translateProfile(dataToTranslate, targetLang);
      
      // Merge translated data back
      const updatedCandidate = { ...candidate, ...translatedData };
      const docRef = doc(db, 'candidates', id);
      await updateDoc(docRef, updatedCandidate);
      setCandidate(updatedCandidate);
      alert(`Perfil traducido al ${targetLang} con éxito.`);
    } catch (error: any) {
      console.error("Error translating profile:", error);
      alert("Hubo un error al traducir el perfil.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    setIsSavingNotes(true);
    try {
      const docRef = doc(db, 'candidates', id);
      await updateDoc(docRef, { notes });
      setCandidate({ ...candidate, notes });
    } catch (error: any) {
      console.error("Error saving notes:", error);
      alert("Hubo un error al guardar las notas.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleAddTag = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim() && id) {
      const tag = newTag.trim();
      const currentTags = candidate.tags || [];
      if (!currentTags.includes(tag)) {
        const updatedTags = [...currentTags, tag];
        try {
          const docRef = doc(db, 'candidates', id);
          await updateDoc(docRef, { tags: updatedTags });
          setCandidate({ ...candidate, tags: updatedTags });
          setNewTag('');
        } catch (error) {
          console.error("Error adding tag:", error);
        }
      }
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!id) return;
    const updatedTags = (candidate.tags || []).filter((t: string) => t !== tagToRemove);
    try {
      const docRef = doc(db, 'candidates', id);
      await updateDoc(docRef, { tags: updatedTags });
      setCandidate({ ...candidate, tags: updatedTags });
    } catch (error) {
      console.error("Error removing tag:", error);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(candidate, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `candidato_${candidate.personalData?.name || 'anonimo'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportBlindCV = () => {
    const blindCandidate = { ...candidate };
    delete blindCandidate.personalData;
    delete blindCandidate.originalText;
    delete blindCandidate.userId;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(blindCandidate, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `cv_ciego_${id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] p-4">
        <h2 className="text-2xl font-display font-bold text-zinc-900 mb-4">Candidato no encontrado</h2>
        <button onClick={() => navigate('/dashboard')} className="text-indigo-600 hover:underline font-medium">
          Volver al panel
        </button>
      </div>
    );
  }

  const { personalData, workExperience, education, hardSkills, softSkills, languages, aiSuggestions, interviewQuestions, gapAnalysis, enrichedData, tags, projects, certifications, driverLicense, availability, hobbies, publications } = candidate;

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-zinc-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors bg-zinc-50 hover:bg-zinc-100 px-4 py-2 rounded-full border border-zinc-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors bg-white hover:bg-zinc-50 px-4 py-2 rounded-full border border-zinc-200"
            >
              {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
              Traducir
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors bg-white hover:bg-zinc-50 px-4 py-2 rounded-full border border-zinc-200"
            >
              <FileJson className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={handleExportBlindCV}
              className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors bg-white hover:bg-zinc-50 px-4 py-2 rounded-full border border-zinc-200"
            >
              <FileText className="w-4 h-4" />
              CV Ciego
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Personal Info & Skills */}
          <div className="lg:col-span-4 space-y-8">
            {/* Profile Card */}
            <div className="bg-white p-8 rounded-[24px] shadow-sm border border-zinc-200">
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 transform -rotate-3">
                <span className="text-3xl font-display font-bold text-indigo-600">
                  {personalData?.name?.charAt(0) || '?'}
                </span>
              </div>
              <h1 className="text-3xl font-display font-bold text-zinc-900 mb-2 leading-tight">{personalData?.name || 'Sin nombre'}</h1>
              <p className="text-sm text-zinc-400 mb-8 font-medium">Analizado el {new Date(candidate.createdAt).toLocaleDateString()}</p>
              
              <div className="space-y-4">
                {personalData?.email && (
                  <div className="flex items-center gap-3 text-sm text-zinc-600 group">
                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                      <Mail className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500" />
                    </div>
                    <a href={`mailto:${personalData.email}`} className="hover:text-indigo-600 truncate font-medium">{personalData.email}</a>
                  </div>
                )}
                {personalData?.phone && (
                  <div className="flex items-center gap-3 text-sm text-zinc-600 group">
                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                      <Phone className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500" />
                    </div>
                    <span className="font-medium">{personalData.phone}</span>
                  </div>
                )}
                {personalData?.location && (
                  <div className="flex items-center gap-3 text-sm text-zinc-600 group">
                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                      <MapPin className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500" />
                    </div>
                    <span className="font-medium">{personalData.location}</span>
                  </div>
                )}
                {personalData?.linkedin && (
                  <div className="flex items-center gap-3 text-sm text-zinc-600 group">
                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                      <Linkedin className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500" />
                    </div>
                    <a href={personalData.linkedin.startsWith('http') ? personalData.linkedin : `https://${personalData.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 truncate font-medium">
                      Perfil de LinkedIn
                    </a>
                  </div>
                )}
                {personalData?.portfolio && (
                  <div className="flex items-center gap-3 text-sm text-zinc-600 group">
                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                      <Globe className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500" />
                    </div>
                    <a href={personalData.portfolio.startsWith('http') ? personalData.portfolio : `https://${personalData.portfolio}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 truncate font-medium">
                      Portfolio / Web
                    </a>
                  </div>
                )}
              </div>

              {/* Extra details like availability and driver license */}
              {(availability || driverLicense) && (
                <div className="mt-8 pt-6 border-t border-zinc-100 space-y-4">
                  {availability && (
                    <div className="flex items-center gap-3 text-sm text-zinc-600">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      <span className="font-medium">{availability}</span>
                    </div>
                  )}
                  {driverLicense && (
                    <div className="flex items-center gap-3 text-sm text-zinc-600">
                      <Car className="w-4 h-4 text-zinc-400" />
                      <span className="font-medium">Carnet: {driverLicense}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white p-8 rounded-[24px] shadow-sm border border-zinc-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Tag className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-lg font-display font-semibold text-zinc-900">Etiquetas</h2>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags && tags.map((tag: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200/60 flex items-center gap-2">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Añadir etiqueta y presionar Enter..."
                className="w-full px-4 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Notes */}
            <div className="bg-white p-8 rounded-[24px] shadow-sm border border-zinc-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center border border-yellow-100">
                  <FileText className="w-4 h-4 text-yellow-600" />
                </div>
                <h2 className="text-lg font-display font-semibold text-zinc-900">Notas Privadas</h2>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escribe tus notas sobre el candidato aquí..."
                className="w-full h-32 px-4 py-3 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none mb-4"
              />
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {isSavingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar Notas
              </button>
            </div>

            {/* Hard Skills */}
            {hardSkills && hardSkills.length > 0 && (
              <div className="bg-white p-8 rounded-[24px] shadow-sm border border-zinc-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <Code className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h2 className="text-lg font-display font-semibold text-zinc-900">Habilidades Técnicas</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hardSkills.map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-zinc-50 text-zinc-700 rounded-lg text-sm font-medium border border-zinc-200/60">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {softSkills && softSkills.length > 0 && (
              <div className="bg-white p-8 rounded-[24px] shadow-sm border border-zinc-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                  </div>
                  <h2 className="text-lg font-display font-semibold text-zinc-900">Habilidades Blandas</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {softSkills.map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-amber-50/50 text-amber-800 rounded-lg text-sm font-medium border border-amber-100/50">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <div className="bg-white p-8 rounded-[24px] shadow-sm border border-zinc-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <Languages className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-display font-semibold text-zinc-900">Idiomas</h2>
                </div>
                <div className="space-y-4">
                  {languages.map((lang: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-zinc-900">{lang.language}</span>
                      <span className="text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-100">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hobbies */}
            {hobbies && hobbies.length > 0 && (
              <div className="bg-white p-8 rounded-[24px] shadow-sm border border-zinc-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
                    <Heart className="w-4 h-4 text-rose-600" />
                  </div>
                  <h2 className="text-lg font-display font-semibold text-zinc-900">Aficiones</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hobbies.map((hobby: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-zinc-50 text-zinc-700 rounded-lg text-sm font-medium border border-zinc-200/60">
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Experience, Education, Projects & AI */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* AI Assistant Section */}
            <div className="bg-gradient-to-br from-indigo-900 to-zinc-900 p-8 rounded-[24px] shadow-lg border border-indigo-500/20 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[60px] rounded-full transform translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-indigo-300" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white">Asistente IA</h2>
                </div>
                <p className="text-indigo-100/80 mb-8 max-w-2xl">
                  Utiliza nuestras herramientas de inteligencia artificial para analizar en profundidad el perfil, preparar entrevistas y validar información.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Enriquecer Perfil */}
                  <button
                    onClick={handleEnrichProfile}
                    disabled={isEnrichingProfile}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 group-hover:scale-110 transition-transform">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Enriquecer Perfil</h3>
                        <p className="text-xs text-indigo-200/70">Búsqueda web (Scraping)</p>
                      </div>
                    </div>
                    {isEnrichingProfile ? <Loader2 className="w-4 h-4 animate-spin text-indigo-300" /> : (enrichedData ? <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md">Completado</span> : <span className="text-xs bg-white/10 text-white/50 px-2 py-1 rounded-md">Generar</span>)}
                  </button>

                  {/* Generador de Entrevistas */}
                  <button
                    onClick={handleGenerateQuestions}
                    disabled={isGeneratingQuestions}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Entrevista</h3>
                        <p className="text-xs text-indigo-200/70">Preguntas personalizadas</p>
                      </div>
                    </div>
                    {isGeneratingQuestions ? <Loader2 className="w-4 h-4 animate-spin text-indigo-300" /> : (interviewQuestions ? <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md">Completado</span> : <span className="text-xs bg-white/10 text-white/50 px-2 py-1 rounded-md">Generar</span>)}
                  </button>

                  {/* Mejorar CV */}
                  <button
                    onClick={handleGenerateFeedback}
                    disabled={isGeneratingFeedback}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Mejorar CV</h3>
                        <p className="text-xs text-indigo-200/70">Sugerencias de IA</p>
                      </div>
                    </div>
                    {isGeneratingFeedback ? <Loader2 className="w-4 h-4 animate-spin text-indigo-300" /> : (aiSuggestions ? <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md">Completado</span> : <span className="text-xs bg-white/10 text-white/50 px-2 py-1 rounded-md">Generar</span>)}
                  </button>

                  {/* Gap Analysis */}
                  <button
                    onClick={handleAnalyzeGaps}
                    disabled={isAnalyzingGaps}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-300 group-hover:scale-110 transition-transform">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Análisis de Huecos</h3>
                        <p className="text-xs text-indigo-200/70">Auditoría de fechas</p>
                      </div>
                    </div>
                    {isAnalyzingGaps ? <Loader2 className="w-4 h-4 animate-spin text-indigo-300" /> : (gapAnalysis ? <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md">Completado</span> : <span className="text-xs bg-white/10 text-white/50 px-2 py-1 rounded-md">Generar</span>)}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Results Sections */}
            {enrichedData && (
              <div className="bg-sky-50 p-8 rounded-[24px] border border-sky-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center border border-sky-200">
                      <Search className="w-5 h-5 text-sky-600" />
                    </div>
                    <h2 className="text-xl font-display font-semibold text-sky-900">Perfil Enriquecido</h2>
                  </div>
                </div>
                <p className="text-sky-900/80 leading-relaxed whitespace-pre-line font-light">
                  {enrichedData}
                </p>
              </div>
            )}

            {interviewQuestions && (
              <div className="bg-emerald-50 p-8 rounded-[24px] border border-emerald-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-display font-semibold text-emerald-900">Preguntas de Entrevista</h2>
                  </div>
                </div>
                <div className="text-emerald-900/80 leading-relaxed whitespace-pre-line font-light markdown-body">
                  {interviewQuestions}
                </div>
              </div>
            )}

            {aiSuggestions && (
              <div className="bg-indigo-50 p-8 rounded-[24px] border border-indigo-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-display font-semibold text-indigo-900">Sugerencias de Mejora (CV)</h2>
                  </div>
                </div>
                <p className="text-indigo-900/80 leading-relaxed whitespace-pre-line font-light">
                  {aiSuggestions}
                </p>
              </div>
            )}

            {gapAnalysis && (
              <div className="bg-rose-50 p-8 rounded-[24px] border border-rose-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center border border-rose-200">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                    </div>
                    <h2 className="text-xl font-display font-semibold text-rose-900">Análisis de Huecos</h2>
                  </div>
                </div>
                <p className="text-rose-900/80 leading-relaxed whitespace-pre-line font-light">
                  {gapAnalysis}
                </p>
              </div>
            )}

            {/* Experience */}
            {workExperience && workExperience.length > 0 && (
              <div className="bg-white p-10 rounded-[24px] shadow-sm border border-zinc-200">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-200">
                    <Briefcase className="w-5 h-5 text-zinc-700" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-zinc-900">Experiencia Laboral</h2>
                </div>
                <div className="space-y-10">
                  {workExperience.map((exp: any, idx: number) => (
                    <div key={idx} className="relative pl-8 border-l-2 border-zinc-100 last:border-0 last:pb-0">
                      <div className="absolute w-4 h-4 bg-white border-2 border-indigo-500 rounded-full -left-[9px] top-1.5 ring-4 ring-white"></div>
                      <h3 className="text-xl font-display font-semibold text-zinc-900 mb-1">{exp.role}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-zinc-500 mb-4">
                        <span className="font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">{exp.company}</span>
                        <span className="hidden sm:inline text-zinc-300">•</span>
                        <span className="font-medium tracking-wide uppercase text-xs">{exp.startDate} - {exp.endDate || 'Presente'}</span>
                      </div>
                      <p className="text-zinc-600 leading-relaxed whitespace-pre-line font-light">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
              <div className="bg-white p-10 rounded-[24px] shadow-sm border border-zinc-200">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-200">
                    <FolderGit2 className="w-5 h-5 text-zinc-700" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-zinc-900">Proyectos</h2>
                </div>
                <div className="grid gap-6">
                  {projects.map((project: any, idx: number) => (
                    <div key={idx} className="p-6 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-display font-semibold text-zinc-900">{project.name}</h3>
                        {project.url && (
                          <a href={project.url.startsWith('http') ? project.url : `https://${project.url}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm font-medium">
                            Ver proyecto
                          </a>
                        )}
                      </div>
                      <p className="text-zinc-600 text-sm leading-relaxed mb-4">{project.description}</p>
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-white border border-zinc-200 text-zinc-600 rounded text-xs font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <div className="bg-white p-10 rounded-[24px] shadow-sm border border-zinc-200">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-200">
                    <GraduationCap className="w-5 h-5 text-zinc-700" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-zinc-900">Formación Académica</h2>
                </div>
                <div className="space-y-8">
                  {education.map((edu: any, idx: number) => (
                    <div key={idx} className="relative pl-8 border-l-2 border-zinc-100 last:border-0 last:pb-0">
                      <div className="absolute w-4 h-4 bg-white border-2 border-zinc-300 rounded-full -left-[9px] top-1.5 ring-4 ring-white"></div>
                      <h3 className="text-lg font-display font-semibold text-zinc-900 mb-1">{edu.degree}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-zinc-500 mt-2">
                        <span className="font-medium text-zinc-700 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-100">{edu.institution}</span>
                        <span className="hidden sm:inline text-zinc-300">•</span>
                        <span className="font-medium tracking-wide uppercase text-xs">{edu.startDate} - {edu.endDate || 'Presente'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications && certifications.length > 0 && (
              <div className="bg-white p-10 rounded-[24px] shadow-sm border border-zinc-200">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-200">
                    <Award className="w-5 h-5 text-zinc-700" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-zinc-900">Certificaciones</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {certifications.map((cert: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-xl border border-zinc-100 bg-zinc-50/50">
                      <h3 className="font-semibold text-zinc-900 mb-1">{cert.name}</h3>
                      <div className="text-sm text-zinc-500 flex justify-between">
                        <span>{cert.issuer}</span>
                        <span>{cert.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Publications */}
            {publications && publications.length > 0 && (
              <div className="bg-white p-10 rounded-[24px] shadow-sm border border-zinc-200">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-200">
                    <BookOpen className="w-5 h-5 text-zinc-700" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-zinc-900">Publicaciones</h2>
                </div>
                <div className="space-y-6">
                  {publications.map((pub: any, idx: number) => (
                    <div key={idx} className="border-b border-zinc-100 last:border-0 pb-6 last:pb-0">
                      <h3 className="text-lg font-semibold text-zinc-900 mb-1">{pub.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-zinc-500 mb-2">
                        <span className="font-medium text-zinc-700">{pub.publisher}</span>
                        <span>•</span>
                        <span>{pub.date}</span>
                      </div>
                      {pub.url && (
                        <a href={pub.url.startsWith('http') ? pub.url : `https://${pub.url}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm font-medium">
                          Ver publicación
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
