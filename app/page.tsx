"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Layout from "./components/Layout";
import ProgramSelector from "./components/ProgramSelector";
import ProgramCustomizer from "./components/ProgramCustomizer";
import ExercisePlayer from "./components/ExercisePlayer";
import { PROGRAMS } from "./data/programs";
import { Program, BreathingPattern, ExerciseEquipment } from "./types";
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
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeProgram, setActiveProgram] = useState<Program | null>(null); // Program actually being played
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

        if (parsed.isCustomizing) setIsCustomizing(parsed.isCustomizing);

        if (parsed.activeProgram) setActiveProgram(parsed.activeProgram);
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
      currentExerciseIndex,
      breathingPattern,
      location,
      selectedEquipment: Array.from(selectedEquipment)
    };
    localStorage.setItem("flowlift_state", JSON.stringify(stateToSave));
  }, [selectedPrograms, isCustomizing, activeProgram, currentExerciseIndex, breathingPattern, location, selectedEquipment, isLoaded]);

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

  const handleStartWorkout = (customizedProgram: Program) => {
    setActiveProgram(customizedProgram);
    setIsCustomizing(false);
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
      <div className="flex justify-center items-center mb-8">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500">
          FlowLift
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {!isCustomizing && !activeProgram ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProgramSelector
              programs={PROGRAMS}
              selectedPrograms={selectedPrograms}
              onToggle={handleProgramToggle}
              onNext={handleStartCustomization}
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
            />
          </motion.div>
        ) : activeProgram ? (
          <motion.div
            key="player"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <button
              onClick={handleBackToCustomization}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              กลับไปหน้าปรับแต่ง
            </button>
            <ExercisePlayer
              exercise={activeProgram.exercises[currentExerciseIndex]}
              breathingPattern={breathingPattern}
              onNext={handleNextExercise}
              onPrev={handlePrevExercise}
              isFirst={currentExerciseIndex === 0}
              isLast={currentExerciseIndex === activeProgram.exercises.length - 1}
              currExerciseIdx={currentExerciseIndex}
              totalExercises={activeProgram.exercises.length}
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
