"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Wind, X, Trophy, Home as HomeIcon, RotateCcw } from "lucide-react";
import Layout from "./components/Layout";
import ProgramSelector from "./components/ProgramSelector";
import ProgramCustomizer from "./components/ProgramCustomizer";
import ExercisePlayer from "./components/ExercisePlayer";
import BreathingSettings from "./components/BreathingSettings";
import { PROGRAMS } from "./data/programs";
import { Program, BreathingPattern, ExerciseEquipment, WorkoutMode } from "./types";
import { cn } from "@/lib/utils";

const DEFAULT_BREATHING: BreathingPattern = {
  inhale: 2,
  holdIn: 1,
  exhale: 2,
  holdOut: 2,
};

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedPrograms, setSelectedPrograms] = useState<Program[]>([]);
  const [savedPrograms, setSavedPrograms] = useState<Program[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeProgram, setActiveProgram] = useState<Program | null>(null); // Program actually being played
  const [isWorkoutFinished, setIsWorkoutFinished] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeMode, setActiveMode] = useState<WorkoutMode>("timer");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [breathingPattern, setBreathingPattern] = useState<BreathingPattern>(
    DEFAULT_BREATHING
  );

  // Lifted state for persistence
  const [location, setLocation] = useState<"home" | "gym">("home");
  const [selectedEquipment, setSelectedEquipment] = useState<Set<ExerciseEquipment | string>>(new Set(["bodyweight", "dumbbell", "bench"]));

  // Load state on mount
  useEffect(() => {
    const savedState = localStorage.getItem("flowlift_state");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.selectedPrograms) {
          setSelectedPrograms(parsed.selectedPrograms);
        } else if (parsed.selectedProgram) {
          setSelectedPrograms([parsed.selectedProgram]);
        }

        if (parsed.savedPrograms) setSavedPrograms(parsed.savedPrograms);

        if (parsed.isCustomizing) setIsCustomizing(parsed.isCustomizing);

        if (parsed.activeProgram) setActiveProgram(parsed.activeProgram);
        if (parsed.activeMode) setActiveMode(parsed.activeMode);
        if (parsed.currentExerciseIndex !== undefined) setCurrentExerciseIndex(parsed.currentExerciseIndex);
        if (parsed.breathingPattern) setBreathingPattern(parsed.breathingPattern);

        if (parsed.location) setLocation(parsed.location);
        if (parsed.selectedEquipment) setSelectedEquipment(new Set(parsed.selectedEquipment));
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save state on change
  useEffect(() => {
    if (!isLoaded) return; // Don't save initial null states overwriting storage
    const stateToSave = {
      selectedPrograms,
      isCustomizing,
      activeProgram,
      activeMode,
      currentExerciseIndex,
      breathingPattern,
      location,
      selectedEquipment: Array.from(selectedEquipment),
      savedPrograms
    };
    localStorage.setItem("flowlift_state", JSON.stringify(stateToSave));
  }, [selectedPrograms, isCustomizing, activeProgram, activeMode, currentExerciseIndex, breathingPattern, location, selectedEquipment, savedPrograms, isLoaded]);

  const handleProgramToggle = (program: Program) => {
    setSelectedPrograms(prev => {
      const exists = prev.find(p => p.id === program.id);
      if (exists) {
        return prev.filter(p => p.id !== program.id);
      } else {
        return [...prev, program];
      }
    });
  };

  const handleStartCustomization = () => {
    setIsCustomizing(true);
  };

  const handleStartWorkout = (customizedProgram: Program, mode: WorkoutMode) => {
    setActiveProgram(customizedProgram);
    setActiveMode(mode);
    setIsCustomizing(false);
    setCurrentExerciseIndex(0);
  };

  const handleFinishWorkout = () => {
    setIsWorkoutFinished(true);
  };

  const handleExitWorkout = () => {
    setIsWorkoutFinished(false);
    setActiveProgram(null);
    setCurrentExerciseIndex(0);
  };

  const handleRestartWorkout = () => {
    setIsWorkoutFinished(false);
    setCurrentExerciseIndex(0);
  };

  const handleNextExercise = () => {
    if (activeProgram && currentExerciseIndex < activeProgram.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleBackToMenu = () => {
    setIsCustomizing(false);
    // Optional: Keep selection or clear? Let's keep selection so they can edit.
  };

  const handleBackToCustomization = () => {
    setActiveProgram(null);
    setIsCustomizing(true);
  }

  const handleCancelCustomization = () => {
    setIsCustomizing(false);
  }

  const handleSaveProgram = (name: string, exercises: any[]) => {
    const newProgram: Program = {
      id: `custom-${Date.now()}`,
      name: name,
      description: "Custom saved program",
      exercises: exercises
    };
    setSavedPrograms(prev => [...prev, newProgram]);
  };

  const handleDeleteProgram = (programId: string) => {
    setSavedPrograms(prev => prev.filter(p => p.id !== programId));
    setSelectedPrograms(prev => prev.filter(p => p.id !== programId));
  };

  if (!isLoaded) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-center items-center py-8">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500">
          FlowLift
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {isWorkoutFinished && activeProgram ? (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-md mx-auto"
          >
            <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(234,179,8,0.5)]">
              <Trophy size={48} className="text-black" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">ยินดีด้วย!</h2>
            <p className="text-gray-400 mb-8">
              คุณทำโปรแกรม <span className="text-white font-bold">"{activeProgram.name}"</span> สำเร็จแล้ว
            </p>

            <div className="space-y-3 w-full">
              <button
                onClick={handleExitWorkout}
                className="w-full py-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition-all flex items-center justify-center gap-2"
              >
                <HomeIcon size={20} />
                กลับหน้าหลัก
              </button>
              <button
                onClick={handleRestartWorkout}
                className="w-full py-4 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-white font-bold transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                เริ่มใหม่
              </button>
            </div>
          </motion.div>
        ) : !isCustomizing && !activeProgram ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProgramSelector
              programs={PROGRAMS}
              savedPrograms={savedPrograms}
              selectedPrograms={selectedPrograms}
              onToggle={handleProgramToggle}
              onNext={handleStartCustomization}
              onDelete={handleDeleteProgram}
            />
          </motion.div>
        ) : isCustomizing && !activeProgram ? (
          <motion.div
            key="customizer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ProgramCustomizer
              programs={selectedPrograms}
              breathingPattern={breathingPattern}
              onBreathingChange={setBreathingPattern}
              onStart={handleStartWorkout}
              onCancel={handleCancelCustomization}
              location={location}
              setLocation={setLocation}
              selectedEquipment={selectedEquipment}
              setSelectedEquipment={setSelectedEquipment}
              onSave={handleSaveProgram}
              isSavedProgram={selectedPrograms.length === 1 && savedPrograms.some(p => p.id === selectedPrograms[0].id)}
            />
          </motion.div>
        ) : activeProgram ? (
          <motion.div
            key="player"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleBackToCustomization}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                กลับไปหน้าปรับแต่ง
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50"
              >
                <Wind size={16} />
                <span>ตั้งค่าหายใจ</span>
              </button>
            </div>

            {/* Settings Modal */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                >
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md relative flex flex-col gap-4">
                    <div className="mt-2">
                      <BreathingSettings
                        pattern={breathingPattern}
                        onChange={setBreathingPattern}
                      />
                    </div>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span>ตกลง</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <ExercisePlayer
              exercise={activeProgram.exercises[currentExerciseIndex]}
              breathingPattern={breathingPattern}
              onNext={handleNextExercise}
              onPrev={handlePrevExercise}
              onFinish={handleFinishWorkout}
              isFirst={currentExerciseIndex === 0}
              isLast={currentExerciseIndex === activeProgram.exercises.length - 1}
              currExerciseIdx={currentExerciseIndex}
              totalExercises={activeProgram.exercises.length}
              mode={activeMode}
            />

            {/* Progress Bar */}
            <div className="mt-8 flex justify-center gap-2">
              {activeProgram.exercises.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    idx === currentExerciseIndex ? "w-8 bg-blue-500" : "w-2 bg-gray-700"
                  )}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Layout >
  );
}
