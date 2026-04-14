'use client'
import { useState } from 'react';
import { useAuraStore, Journey } from '@/store/useAuraStore';
import * as chrono from 'chrono-node';
import { CalendarClock, Hash, Sparkles } from 'lucide-react';

export const InputNLP = () => {
  const [value, setValue] = useState('');
  const { addTask, journeys, addJourney } = useAuraStore();

  // 1. DATA
  const textForChrono = value.replace(/(\d{1,2})h(?:00)?/gi, '$1:00');
  const parsedResults = chrono.pt.parse(textForChrono);
  let parsedDate: Date | null = null;
  let cleanText = value;

  if (parsedResults.length > 0) {
    parsedDate = parsedResults[0].start.date();
    cleanText = textForChrono.replace(parsedResults[0].text, '').replace(/10:00/g, '').trim();
  }

  // 2. HASHTAGS (Auto-criação)
  const hashtagMatch = cleanText.match(/#(\w+)/); // Pega qualquer #palavra
  let detectedJourney: Journey | undefined = undefined;
  let newJourneyName = '';

  if (hashtagMatch) {
    newJourneyName = hashtagMatch[1]; // Nome sem o #
    detectedJourney = journeys.find(j => j.name.toLowerCase() === newJourneyName.toLowerCase());
    cleanText = cleanText.replace(hashtagMatch[0], '').trim();
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      let finalJourneyId = detectedJourney?.id || null;

      // Se a jornada não existe, cria ela agora!
      if (hashtagMatch && !detectedJourney) {
        const newId = Date.now().toString();
        // Paleta de cores bonitas para novas jornadas
        const auraColors = ['#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6', '#F43F5E', '#06B6D4'];
        const randomColor = auraColors[Math.floor(Math.random() * auraColors.length)];
        
        const newJourney: Journey = { id: newId, name: newJourneyName, color: randomColor };
        addJourney(newJourney);
        finalJourneyId = newId;
      }

      addTask({ 
        text: cleanText || 'Nova Quest',
        priority: 'medium', 
        tags: [],
        dueDate: parsedDate ? parsedDate.toISOString() : null,
        journeyId: finalJourneyId
      });
      setValue('');
    }
  };

  const formatFriendlyDate = (date: Date) => {
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).replace('.,', ' -'); 
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Adicione uma quest... (ex: Consulta amanhã às 10h #saude)"
        className="w-full p-4 pl-6 pr-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg focus:ring-2 focus:ring-aura-primary outline-none transition-all text-zinc-900 dark:text-zinc-100"
      />
      
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
        
        {/* Visual do Projeto (Existente ou Novo) */}
        {hashtagMatch && (
          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-sm transition-all"
            style={{ backgroundColor: detectedJourney ? detectedJourney.color : '#52525B' }} // Cinza se for novo
          >
            {detectedJourney ? <Hash size={12} /> : <Sparkles size={12} />}
            {newJourneyName}
          </div>
        )}

        {/* Visual da Data */}
        {parsedDate && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-aura-primary/10 text-aura-primary rounded-md text-xs font-semibold">
            <CalendarClock size={14} />
            {formatFriendlyDate(parsedDate)}
          </div>
        )}
      </div>
    </div>
  );
};