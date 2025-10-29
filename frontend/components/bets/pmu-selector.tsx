'use client';

import { useState, useEffect } from 'react';
import { pmuAPI, type PMUMeeting, type PMURace, type PMUParticipant } from '@/lib/api/pmu';
import { ChevronRight, Calendar, MapPin, Trophy, Clock, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getLocalDateString } from '@/lib/date-utils';
import BetTypeSelector from './bet-type-selector';
import { type PMUBetType, formatPMUBetCode, formatSelectionsDisplay } from '@/lib/pmu-bet-types';

interface PMUSelectorProps {
  onSelect: (data: {
    hippodrome: string;
    hippodromeCode: string;
    raceNumber: string;
    horsesSelected: string;
    betType: string;
    date: string;
    pmuCode: string;
  }) => void;
}

export default function PMUSelector({ onSelect }: PMUSelectorProps) {
  const [step, setStep] = useState<'betType' | 'hippodrome' | 'race' | 'horse'>('betType');
  const [selectedBetType, setSelectedBetType] = useState<PMUBetType | null>(null);
  const [meetings, setMeetings] = useState<PMUMeeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<PMUMeeting | null>(null);
  const [selectedRace, setSelectedRace] = useState<PMURace | null>(null);
  const [participants, setParticipants] = useState<PMUParticipant[]>([]);
  const [selectedHorses, setSelectedHorses] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  // Load today's program
  useEffect(() => {
    loadProgram();
  }, [selectedDate]);

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
    
    // Load participants
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
      // Deselect
      newSelection = selectedHorses.filter(h => h !== horseNumber);
    } else {
      // Select
      if (selectedHorses.length >= (selectedBetType.maxSelections || selectedBetType.minSelections)) {
        // Max reached, replace last if single selection, otherwise don't add
        if (selectedBetType.maxSelections === 1) {
          newSelection = [horseNumber];
        } else {
          return; // Max reached
        }
      } else {
        newSelection = [...selectedHorses, horseNumber];
      }
    }

    setSelectedHorses(newSelection);
  };

  const handleConfirmSelection = () => {
    if (!selectedBetType || !selectedMeeting || !selectedRace || selectedHorses.length < selectedBetType.minSelections) {
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
    });
  };

  const formatTime = (timestamp: number | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading && meetings.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Chargement du programme PMU...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Selector */}
      <div className="flex items-center space-x-2 pb-4 border-b">
        <Calendar className="h-5 w-5 text-gray-400" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setStep('hippodrome');
            setSelectedMeeting(null);
            setSelectedRace(null);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <button
          onClick={() => {
            setStep('hippodrome');
            setSelectedMeeting(null);
            setSelectedRace(null);
          }}
          className={`hover:text-primary-600 ${step === 'hippodrome' ? 'font-semibold text-primary-600' : ''}`}
        >
          Hippodrome
        </button>
        {selectedMeeting && (
          <>
            <ChevronRight className="h-4 w-4" />
            <button
              onClick={() => {
                setStep('race');
                setSelectedRace(null);
              }}
              className={`hover:text-primary-600 ${step === 'race' ? 'font-semibold text-primary-600' : ''}`}
            >
              Course
            </button>
          </>
        )}
        {selectedRace && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-primary-600">Cheval</span>
          </>
        )}
      </div>

      {/* Step 1: Select Hippodrome */}
      {step === 'hippodrome' && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-3">Sélectionnez un hippodrome</h3>
          {meetings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucune réunion disponible pour cette date</p>
          ) : (
            meetings.map((meeting) => (
              <button
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
                      <p className="font-semibold text-gray-900">{meeting.hippodrome.name}</p>
                      <p className="text-sm text-gray-500">{meeting.races.length} courses</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Step 2: Select Race */}
      {step === 'race' && selectedMeeting && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-3">
            Sélectionnez une course - {selectedMeeting.hippodrome.name}
          </h3>
          {selectedMeeting.races.map((race) => (
            <button
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
      )}

      {/* Step 3: Select Horse */}
      {step === 'horse' && selectedRace && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-3">
            Sélectionnez un cheval - Course {selectedRace.number}
          </h3>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            </div>
          ) : participants.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucun partant disponible</p>
          ) : (
            participants.map((participant) => (
              <button
                key={participant.number}
                onClick={() => handleToggleHorse(participant.number)}
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">{participant.number}</span>
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
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Œillères</span>
                    )}
                    {participant.firstTime && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Inédit</span>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
