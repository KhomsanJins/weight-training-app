"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronRight, ChevronLeft, RefreshCw } from "lucide-react"; // Start Over icon
import { Exercise, BreathingPattern } from "../types";
import { cn } from "@/lib/utils";

interface ExercisePlayerProps {
    exercise: Exercise;
    breathingPattern: BreathingPattern;
    onNext: () => void;
    onPrev: () => void;
    isFirst: boolean;
    isLast: boolean;
    currExerciseIdx: number;
    totalExercises: number;
}

export default function ExercisePlayer({
    exercise,
    breathingPattern,
    onNext,
    onPrev,
    isFirst,
    isLast,
    currExerciseIdx,
    totalExercises,
}: ExercisePlayerProps) {
    const [isActive, setIsActive] = useState(false);
    const [currentSet, setCurrentSet] = useState(1);
    const [reps, setReps] = useState(0);
    const [phase, setPhase] = useState<"inhale" | "holdIn" | "exhale" | "holdOut" | "rest">(
        "inhale"
    );
    const [restTimeLeft, setRestTimeLeft] = useState(0);

    // Reset state when exercise changes
    useEffect(() => {
        // If we are already active (coming from previous exercise), keep active.
        // If it's the first load, isActive is false by default.
        // We only reset counters.
        setCurrentSet(1);
        setReps(0);
        setPhase("inhale");
        setRestTimeLeft(0);
    }, [exercise]);

    // Breathing Loop & Rest Timer
    useEffect(() => {
        if (!isActive) return;

        let timeout: NodeJS.Timeout;

        if (phase === "rest") {
            if (restTimeLeft > 0) {
                timeout = setTimeout(() => setRestTimeLeft(restTimeLeft - 1), 1000);
            } else {
                // Rest finished
                if (currentSet < exercise.defaultSets) {
                    // Next set same exercise
                    setPhase("inhale");
                    setCurrentSet(s => s + 1);
                    setReps(0);
                } else if (!isLast) {
                    // Exercise finished, go to next exercise
                    onNext();
                    // State will reset via the [exercise] useEffect, keeping isActive=true
                } else {
                    // Workout finished
                    setIsActive(false);
                }
            }
            return () => clearTimeout(timeout);
        }

        const runPhase = () => {
            switch (phase) {
                case "inhale":
                    timeout = setTimeout(() => setPhase("holdIn"), breathingPattern.inhale * 1000);
                    break;
                case "holdIn":
                    timeout = setTimeout(() => setPhase("exhale"), breathingPattern.holdIn * 1000);
                    break;
                case "exhale":
                    timeout = setTimeout(() => {
                        setReps((r) => {
                            const newReps = r + 1;
                            // Check if set is done
                            if (newReps >= exercise.defaultReps) {
                                // Whether it's the last set or intermediate set, we rest.
                                // UNLESS it's the very last set of the very last exercise?
                                // User said "continuously". So usually last exercise done = finish.
                                if (currentSet < exercise.defaultSets || !isLast) {
                                    setRestTimeLeft(exercise.defaultRest);
                                    setPhase("rest");
                                    return newReps;
                                } else {
                                    // Total finish
                                    setIsActive(false);
                                    return newReps;
                                }
                            } else {
                                setPhase("holdOut");
                            }
                            return newReps;
                        });
                    }, breathingPattern.exhale * 1000);
                    break;
                case "holdOut":
                    timeout = setTimeout(() => setPhase("inhale"), breathingPattern.holdOut * 1000);
                    break;
            }
        };

        runPhase();
        return () => clearTimeout(timeout);
    }, [isActive, phase, breathingPattern, restTimeLeft, exercise, currentSet, isLast, onNext]);

    const togglePlay = () => setIsActive(!isActive);
    const reset = () => {
        setIsActive(false);
        setReps(0);
        setCurrentSet(1);
        setPhase("inhale");
        setRestTimeLeft(0);
    };

    const skipRest = () => {
        setRestTimeLeft(0);
    };

    const getInstruction = () => {
        switch (phase) {
            case "inhale":
                return "หายใจเข้า";
            case "holdIn":
                return "กลั้น (เต็ม)";
            case "exhale":
                return "หายใจออก";
            case "holdOut":
                return "กลั้น (หมด)";
            case "rest":
                return "พักเซ็ต";
        }
    };

    const glowColor =
        phase === "inhale"
            ? "shadow-[0_0_50px_rgba(59,130,246,0.6)]" // Blue
            : phase === "exhale"
                ? "shadow-[0_0_50px_rgba(239,68,68,0.6)]" // Red
                : phase === "rest"
                    ? "shadow-[0_0_50px_rgba(34,197,94,0.6)]" // Green for rest
                    : "shadow-[0_0_30px_rgba(255,255,255,0.2)]"; // Neutral

    return (
        <div className="flex flex-col items-center justify-center p-8 w-full max-w-2xl mx-auto relative">
            {/* Global Progress */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currExerciseIdx) / totalExercises) * 100}%` }}
                    className="h-full bg-blue-500"
                />
            </div>
            <div className="absolute top-2 right-0 text-xs text-gray-500 font-mono">
                ท่าที่ {currExerciseIdx + 1}/{totalExercises}
            </div>

            {/* Header */}
            <div className="text-center mb-8 mt-6">
                <h2 className="text-3xl font-bold text-white mb-2">{exercise.name}</h2>
                <p className="text-gray-400">{exercise.description}</p>
                <div className="mt-2 flex flex-col items-center gap-2">
                    <div className="flex gap-4 justify-center text-sm text-gray-500 font-mono">
                        <span className={cn(currentSet <= exercise.defaultSets ? "text-blue-400 font-bold" : "")}>
                            เซ็ตที่: {currentSet}/{exercise.defaultSets}
                        </span>
                        <span>เป้าหมาย: {exercise.defaultReps} ครั้ง</span>
                        <span>พัก: {exercise.defaultRest} วิ</span>
                    </div>
                    {/* Set Progress Bar */}
                    <div className="w-full max-w-xs h-1 bg-gray-800 rounded-full overflow-hidden mt-1">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentSet - 1) / exercise.defaultSets) * 100}%` }}
                            className="h-full bg-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* Breathing Circle */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                <motion.div
                    animate={{
                        scale:
                            phase === "inhale" || phase === "holdIn"
                                ? 1.5
                                : phase === "exhale" || phase === "holdOut"
                                    ? 1.0
                                    : phase === "rest" ? 1.2 : 1,
                        opacity: phase === "holdIn" || phase === "holdOut" ? 0.8 : 1,
                    }}
                    transition={{
                        duration:
                            phase === "inhale"
                                ? breathingPattern.inhale
                                : phase === "exhale"
                                    ? breathingPattern.exhale
                                    : 0.5,
                        ease: "easeInOut",
                    }}
                    className={cn(
                        "absolute w-40 h-40 rounded-full bg-linear-to-br from-blue-500 to-purple-600 transition-shadow duration-500",
                        phase === "rest" ? "from-green-500 to-emerald-600" : "",
                        glowColor
                    )}
                />
                <div className="relative z-10 text-center">
                    <motion.div
                        key={phase}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-2xl font-bold text-white drop-shadow-md"
                    >
                        {isActive ? getInstruction() : "พร้อมไหม?"}
                    </motion.div>

                    {phase === "rest" ? (
                        <div className="text-5xl font-black text-white mt-2">
                            {restTimeLeft}
                        </div>
                    ) : (
                        <div className="text-4xl font-black text-white mt-2">
                            {reps}
                        </div>
                    )}

                    <div className="text-xs text-gray-300 uppercase tracking-widest mt-1">
                        {phase === "rest" ? "วินาที" : "ครั้งที่ทำไป"}
                    </div>

                    {phase === "rest" && (
                        <div className="flex flex-col items-center mt-4">
                            <span className="text-sm text-gray-400 mb-2">
                                {currentSet >= exercise.defaultSets ? "เตรียมตัวท่าต่อไป..." : "พักเซ็ต"}
                            </span>
                            <button onClick={skipRest} className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-white">
                                ข้ามเวลาพัก
                            </button>
                        </div>
                    )}

                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                <button
                    onClick={onPrev}
                    disabled={isFirst}
                    className="p-4 rounded-full bg-gray-800 text-white disabled:opacity-30 hover:bg-gray-700 transition"
                >
                    <ChevronLeft size={24} />
                </button>

                <button
                    onClick={togglePlay}
                    className="p-6 rounded-full bg-white text-black hover:scale-105 transition active:scale-95 shadow-xl"
                >
                    {isActive ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" />}
                </button>

                <button
                    onClick={reset}
                    className="p-4 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
                    title="Reset Reps"
                >
                    <RefreshCw size={24} />
                </button>

                <button
                    onClick={onNext}
                    disabled={isLast}
                    className="p-4 rounded-full bg-gray-800 text-white disabled:opacity-30 hover:bg-gray-700 transition"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
}
