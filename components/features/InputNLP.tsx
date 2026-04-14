'use client'
import { useState } from 'react';
import { useAuraStore } from '@/store/useAuraStore';
import * as chrono from 'chrono-node';
import { CalendarClock, Hash, Sparkles } from 'lucide-react';

export const InputNLP = () => {
  const [value, setValue] = useState('');
  const { addTask, journeys } = useAuraStore(); // Removi o addJourney daqui, o addTask resolve

  // 1. TRATAMENTO DE DATA
  const textForChrono = value.replace(/(\d{1,2})h(?:00)?/gi, '$1:00');
  const parsedResults = chrono.pt.parse(textForChrono);
  let parsedDate: Date | null = null;
  let cleanText = value;

  if (parsedResults.length > 0) {
    parsedDate = parsedResults[0].start.date();
    // Limpa a data do texto para não salvar "Reunião amanhã" no nome da task
    cleanText = cleanText.replace(parsedResults[0].text, '').trim();
  }

  // 2. TRATAMENTO DE HASHTAGS
  const hashtagMatch = cleanText.match(/#(\w+)/);
  let detectedJourney = journeys.find(j => 
    hashtagMatch && j.name.toLowerCase() === hashtagMatch[1].toLowerCase()
  );
  
  const newJourneyName = hashtagMatch ? hashtagMatch[1] : '';

  // Remove a hashtag do texto final da task
  if (hashtagMatch) {
    cleanText = cleanText.replace(hashtagMatch[0], '').trim();
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      // REGRA: Se a jornada existe, manda o ID. Se não existe, manda o NOME da hashtag.
      // O nosso Store (addTask) vai saber o que fazer com isso.
      const journeyRef = detectedJourney ? detectedJourney.id : (newJourneyName || null);

      await addTask({ 
        text: cleanText || 'Nova Quest',
        priority: 'medium', 
        dueDate: parsedDate ? parsedDate.toISOString() : null,
        journeyId: journeyRef // Enviamos a string da hashtag ou o ID real
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
        placeholder="Adicione uma quest... (ex: Academia amanhã #saude)"
        className="w-full p-4 pl-6 pr-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg focus:ring-2 focus:ring-aura-primary outline-none transition-all text-zinc-900 dark:text-zinc-100"
      />
      
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
        {/* Indicador de Jornada */}
        {hashtagMatch && (
          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-sm transition-all"
            style={{ backgroundColor: detectedJourney ? detectedJourney.color : '#52525B' }}
          >
            {detectedJourney ? <Hash size={12} /> : <Sparkles size={12} />}
            {newJourneyName}
          </div>
        )}

        {/* Indicador de Data */}
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