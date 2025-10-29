'use client';

import { useState, useEffect } from 'react';
import { pmuAPI, type PMUMeeting, type PMURace, type PMUParticipant } from '@/lib/api/pmu';
import { ChevronRight, Calendar, MapPin, Trophy, Clock, Check, ArrowRight, TrendingUp, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getLocalDateString } from '@/lib/date-utils';
import BetTypeSelector from './bet-type-selector';
import { HorsePerformanceCard } from './horse-performance-card';
import { type PMUBetType, formatPMUBetCode, formatSelectionsDisplay } from '@/lib/pmu-bet-types';

interface PMUSelectorProps {
  platforms: Array<{ id: string; name: string; isActive: boolean; platformType?: string; autoUpdateResults?: boolean }>;
  onSelect: (data: {
    hippodrome: string;
    hippodromeCode: string;
    raceNumber: string;
    horsesSelected: string;
    betType: string;
    date: string;
    pmuCode: string;
    platformId: string;
  }) => void;
}

export default function PMUSelector({ platforms, onSelect }: PMUSelectorProps) {
  const [step, setStep] = useState<'betType' | 'platform' | 'hippodrome' | 'race' | 'horse'>('betType');
  const [selectedBetType, setSelectedBetType] = useState<PMUBetType | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<PMUMeeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<PMUMeeting | null>(null);
  const [selectedRace, setSelectedRace] = useState<PMURace | null>(null);
  const [participants, setParticipants] = useState<PMUParticipant[]>([]);
  const [selectedHorses, setSelectedHorses] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [expandedHorseId, setExpandedHorseId] = useState<string | null>(null);

  // Load program when date changes or when moving to hippodrome step
  useEffect(() => {
    if (step === 'hippodrome' && meetings.length === 0) {
      loadProgram();
    }
  }, [step, selectedDate]);

  const loadProgram = async () => {
    try {
      setIsLoading(true);
      const data = selectedDate === getLocalDateString()
        ? await pmuAPI.getTodayProgram()
        : await pmuAPI.getProgramByDate(selectedDate);
      setMeetings(data.meetings || []);
    } catch (error) {
      console.error('Error loading PMU program:', error);
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBetType = (betType: PMUBetType) => {
    setSelectedBetType(betType);
    setStep('platform');
  };

  const handleSelectPlatform = (platformId: string) => {
    setSelectedPlatform(platformId);
    setStep('hippodrome');
  };

  const handleSelectMeeting = (meeting: PMUMeeting) => {
    setSelectedMeeting(meeting);
    setStep('race');
  };

  const handleSelectRace = async (race: PMURace) => {
    setSelectedRace(race);
    setSelectedHorses([]);
    setStep('horse');
    
    try {
      setIsLoading(true);
      const data = await pmuAPI.getRaceParticipants(
        selectedDate,
        selectedMeeting!.number,
        race.number
      );
      setParticipants(data.participants || []);
    } catch (error) {
      console.error('Error loading participants:', error);
      setParticipants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleHorse = (horseNumber: number) => {
    if (!selectedBetType) return;

    const isSelected = selectedHorses.includes(horseNumber);
    let newSelection: number[];

    if (isSelected) {
      newSelection = selectedHorses.filter(h => h !== horseNumber);
    } else {
      const maxSelections = selectedBetType.maxSelections || selectedBetType.minSelections;
      if (selectedHorses.length >= maxSelections) {
        if (maxSelections === 1) {
          newSelection = [horseNumber];
        } else {
          return;
        }
      } else {
        newSelection = [...selectedHorses, horseNumber];
      }
    }

    setSelectedHorses(newSelection);
  };

  const handleConfirmSelection = () => {
    if (!selectedBetType || !selectedPlatform || !selectedMeeting || !selectedRace || selectedHorses.length < selectedBetType.minSelections) {
      return;
    }

    const pmuCode = formatPMUBetCode(
      selectedMeeting.number,
      selectedRace.number,
      selectedHorses,
      selectedBetType.code
    );

    const horsesNames = selectedHorses
      .map(num => {
        const participant = participants.find(p => p.number === num);
        return participant ? `${num} - ${participant.name}` : num.toString();
      })
      .join(', ');

    onSelect({
      hippodrome: selectedMeeting.hippodrome.name,
      hippodromeCode: selectedMeeting.hippodrome.code,
      raceNumber: selectedRace.number.toString(),
      horsesSelected: horsesNames,
      betType: selectedBetType.name,
      date: selectedDate,
      pmuCode,
      platformId: selectedPlatform,
    });
  };

  const formatTime = (timestamp: string | number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const canProceed = () => {
    return selectedHorses.length >= selectedBetType!.minSelections;
  };

  // Calculer l'étape actuelle et le total
  const getStepNumber = () => {
    const steps = { betType: 1, platform: 2, hippodrome: 3, race: 4, horse: 5 };
    return steps[step];
  };

  const totalSteps = 5;
  const currentStepNumber = getStepNumber();
  const progressPercentage = ((currentStepNumber - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="space-y-4">
      {/* Barre de progression */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Étape {currentStepNumber} sur {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progressPercentage)}% complété
          </span>
        </div>
        
        {/* Barre de progression visuelle */}
        <div className="relative">
          {/* Ligne de fond */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            {/* Barre de progression */}
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Points d'étapes */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-0">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  stepNum < currentStepNumber
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : stepNum === currentStepNumber
                    ? 'bg-white border-primary-600 text-primary-600 ring-4 ring-primary-100'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {stepNum < currentStepNumber ? (
                  <Check className="h-3 w-3" />
                ) : (
                  stepNum
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Labels des étapes */}
        <div className="flex justify-between mt-3 px-0">
          {[
            { num: 1, label: 'Type' },
            { num: 2, label: 'Bookmaker' },
            { num: 3, label: 'Hippodrome' },
            { num: 4, label: 'Course' },
            { num: 5, label: 'Chevaux' }
          ].map(({ num, label }) => (
            <div
              key={num}
              className={`text-xs text-center transition-colors ${
                num === currentStepNumber
                  ? 'text-primary-600 font-semibold'
                  : num < currentStepNumber
                  ? 'text-gray-600'
                  : 'text-gray-400'
              }`}
              style={{ width: '20%' }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <button
          type="button"
          onClick={() => setStep('betType')}
          className={`hover:text-primary-600 transition-colors ${
            step === 'betType' ? 'font-semibold text-primary-600' : 'text-gray-600'
          }`}
        >
          Type de pari
        </button>
        {selectedBetType && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <button
              type="button"
              onClick={() => setStep('platform')}
              className={`hover:text-primary-600 transition-colors ${
                step === 'platform' ? 'font-semibold text-primary-600' : 'text-gray-600'
              }`}
            >
              Bookmaker
            </button>
          </>
        )}
        {selectedPlatform && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <button
              type="button"
              onClick={() => setStep('hippodrome')}
              className={`hover:text-primary-600 transition-colors ${
                step === 'hippodrome' ? 'font-semibold text-primary-600' : 'text-gray-600'
              }`}
            >
              Hippodrome
            </button>
          </>
        )}
        {selectedMeeting && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <button
              type="button"
              onClick={() => setStep('race')}
              className={`hover:text-primary-600 transition-colors ${
                step === 'race' ? 'font-semibold text-primary-600' : 'text-gray-600'
              }`}
            >
              Course
            </button>
          </>
        )}
        {selectedRace && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-semibold text-primary-600">Chevaux</span>
          </>
        )}
      </div>

      {/* Step 1: Select Bet Type */}
      {step === 'betType' && (
        <BetTypeSelector
          selectedType={selectedBetType?.code || null}
          onSelect={handleSelectBetType}
        />
      )}

      {/* Step 2: Select Platform */}
      {step === 'platform' && (
        <div className="space-y-3">
          <div className="flex items-start space-x-2 mb-3">
            <h3 className="font-semibold text-gray-900">Sélectionnez votre bookmaker</h3>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">💡 Pourquoi lier à un bookmaker ?</p>
                <p className="text-blue-800">Associer votre pari à un bookmaker (PMU, Betclic, Unibet...) permet de suivre vos performances par site et de gérer votre bankroll de manière indépendante sur chaque plateforme.</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {platforms.filter(p => p.isActive).map((platform) => (
              <button
                type="button"
                key={platform.id}
                onClick={() => handleSelectPlatform(platform.id)}
                className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                  selectedPlatform === platform.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedPlatform === platform.id ? 'bg-primary-600' : 'bg-gray-200'
                    }`}>
                      <span className={`font-bold ${selectedPlatform === platform.id ? 'text-white' : 'text-gray-700'}`}>
                        {platform.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{platform.name}</p>
                        {platform.platformType === 'PMU' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                            Auto
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                            Manuel
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {platform.platformType === 'PMU' 
                          ? 'Résultats mis à jour automatiquement'
                          : 'Vous devrez saisir le résultat'}
                      </p>
                    </div>
                  </div>
                  {selectedPlatform === platform.id && (
                    <Check className="h-5 w-5 text-primary-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Select Hippodrome */}
      {step === 'hippodrome' && (
        <div className="space-y-3">
          {/* Date Selector */}
          <div className="flex items-center space-x-2 pb-3 border-b">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setMeetings([]);
                loadProgram();
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">
              {selectedBetType?.name}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900">Sélectionnez un hippodrome</h3>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-medium mb-1">🏇 Choisissez votre réunion</p>
                <p className="text-green-800">Sélectionnez l'hippodrome où se déroule la course qui vous intéresse. Chaque réunion (R1, R2...) regroupe plusieurs courses.</p>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            </div>
          ) : meetings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucune réunion disponible</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {meetings.map((meeting) => (
                <button
                  type="button"
                  key={meeting.number}
                  onClick={() => handleSelectMeeting(meeting)}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-primary-600">R{meeting.number}</span>
                          <p className="font-semibold text-gray-900">{meeting.hippodrome.name}</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {meeting.hippodrome.code} • {meeting.races.length} courses
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Select Race */}
      {step === 'race' && selectedMeeting && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">
            Sélectionnez une course - {selectedMeeting.hippodrome.name}
          </h3>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-purple-900">
                <p className="font-medium mb-1">🏆 Sélectionnez la course</p>
                <p className="text-purple-800">Choisissez la course (C1, C2...) sur laquelle vous souhaitez parier. Vérifiez l'heure de départ et le montant des gains.</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedMeeting.races.map((race) => (
              <button
                type="button"
                key={race.number}
                onClick={() => handleSelectRace(race)}
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-primary-600">C{race.number}</span>
                      <span className="font-semibold text-gray-900">{race.name}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(race.startTime)}</span>
                      </span>
                      <span>{race.discipline}</span>
                      {race.distance && <span>{race.distance}m</span>}
                      <span className="flex items-center space-x-1">
                        <Trophy className="h-4 w-4" />
                        <span>{formatCurrency(race.prize)}</span>
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Select Horses */}
      {step === 'horse' && selectedRace && selectedBetType && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Sélectionnez {selectedBetType.minSelections === selectedBetType.maxSelections
                ? selectedBetType.minSelections
                : `${selectedBetType.minSelections} à ${selectedBetType.maxSelections}`} cheval(x)
            </h3>
            <span className="text-sm text-gray-600">
              {selectedHorses.length}/{selectedBetType.maxSelections || selectedBetType.minSelections} sélectionné(s)
            </span>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-900">
                <p className="font-medium mb-1">🎯 Faites votre pronostic</p>
                <p className="text-orange-800">Sélectionnez les chevaux selon votre type de pari ({selectedBetType.name}). Consultez les performances récentes pour vous aider dans votre choix.</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            </div>
          ) : participants.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucun partant disponible</p>
          ) : (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {participants.map((participant) => {
                  const isSelected = selectedHorses.includes(participant.number);
                  const selectionIndex = selectedHorses.indexOf(participant.number);
                  
                  return (
                    <button
                      type="button"
                      key={participant.number}
                      onClick={() => handleToggleHorse(participant.number)}
                      className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-primary-600' : 'bg-gray-200'
                          }`}>
                            <span className={`font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                              {participant.number}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{participant.name}</p>
                            {participant.recentForm && (
                              <p className="text-xs text-gray-500 font-mono">{participant.recentForm}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {participant.blinkers && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Œ</span>
                          )}
                          {participant.firstTime && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">I</span>
                          )}
                          {isSelected && (
                            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                              {selectedBetType.hasOrder ? (
                                <span className="text-white text-xs font-bold">{selectionIndex + 1}</span>
                              ) : (
                                <Check className="h-4 w-4 text-white" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Confirm Button */}
              <div className="pt-4 border-t">
                <button
                  type="button"
                  onClick={handleConfirmSelection}
                  disabled={!canProceed()}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <span>Valider la sélection</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                {selectedHorses.length > 0 && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    {formatSelectionsDisplay(selectedHorses, selectedBetType.hasOrder)}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
