"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise, Program, BreathingPattern, ExerciseEquipment, WorkoutMode } from "../types";
import { Check, Plus, Minus, Play, CheckCircle2, Circle, Clock, Wind, ArrowLeft, Dumbbell, Home, Building2, User, Weight, Armchair, Settings, Cable, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgramCustomizerProps {
    programs: Program[];
    breathingPattern: BreathingPattern;
    onBreathingChange: (pattern: BreathingPattern) => void;
    onStart: (program: Program, mode: WorkoutMode) => void;
    onCancel: () => void;
    location: "home" | "gym";
    setLocation: (loc: "home" | "gym") => void;
    selectedEquipment: Set<ExerciseEquipment | string>;
    setSelectedEquipment: (eq: Set<ExerciseEquipment | string>) => void;
}

// Extended type to include source program info
interface ExtendedExercise extends Exercise {
    programId: string;
    programName: string;
}

const getProgramBadgeColor = (id: string) => {
    switch (id) {
        case "push": return "bg-blue-500 text-white";
        case "pull": return "bg-purple-500 text-white";
        case "legs": return "bg-orange-500 text-white";
        case "upper": return "bg-yellow-500 text-black";
        case "lower": return "bg-green-500 text-white";
        default: return "bg-gray-600 text-white";
    }
};

interface ExerciseCardProps {
    exercise: ExtendedExercise;
    isSelected: boolean;
    selectionIndex: number;
    toggleSelection: (id: string) => void;
    updateExercise: (id: string, field: "defaultSets" | "defaultReps" | "defaultRest", delta: number) => void;
}

const ExerciseCard = ({ exercise, isSelected, selectionIndex, toggleSelection, updateExercise }: ExerciseCardProps) => {
    return (
        <div
            className={cn(
                "rounded-xl border transition-all relative group overflow-hidden",
                isSelected
                    ? "bg-blue-600/20 border-blue-500/50"
                    : "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50"
            )}
        >
            <div
                className="p-4 cursor-pointer"
                onClick={() => toggleSelection(exercise.id)}
            >
                <div className="grid grid-cols-[32px_auto] items-center gap-3">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all border-2 font-bold text-sm",
                        isSelected
                            ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/50 scale-110"
                            : "border-gray-600 text-gray-400 group-hover:border-gray-500"
                    )}>
                        {isSelected ? selectionIndex + 1 : <div className="w-2 h-2 rounded-full bg-gray-600" />}
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className={cn("font-bold text-lg", isSelected ? "text-white" : "text-gray-400")}>{exercise.name}</h3>
                            {/* Program Badge */}
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                                getProgramBadgeColor(exercise.programId)
                            )}>
                                {exercise.programName}
                            </span>
                        </div>
                        {/* Equipment Tags */}
                        <div className="flex gap-1 mb-1">
                            {exercise.equipment.map(e => (
                                <span key={e} className="text-[10px] bg-white/10 text-gray-400 px-1.5 rounded uppercase">{e}</span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{exercise.description}</p>
                    </div>
                </div>
            </div>

            {isSelected && (
                <div className="px-4 pb-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-3 mt-1">
                    {/* Sets */}
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 uppercase font-mono mb-1">เซ็ต</span>
                        <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={(e) => { e.stopPropagation(); updateExercise(exercise.id, "defaultSets", -1); }}
                                className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            >
                                <Minus size={12} />
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-white text-sm">
                                {exercise.defaultSets}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); updateExercise(exercise.id, "defaultSets", 1); }}
                                className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                    </div>

                    {/* Reps */}
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 uppercase font-mono mb-1">ครั้ง</span>
                        <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={(e) => { e.stopPropagation(); updateExercise(exercise.id, "defaultReps", -1); }}
                                className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            >
                                <Minus size={12} />
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-white text-sm">
                                {exercise.defaultReps}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); updateExercise(exercise.id, "defaultReps", 1); }}
                                className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                    </div>

                    {/* Rest */}
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 uppercase font-mono mb-1">พัก (วิ)</span>
                        <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={(e) => { e.stopPropagation(); updateExercise(exercise.id, "defaultRest", -5); }}
                                className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            >
                                <Minus size={12} />
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-white text-sm">
                                {exercise.defaultRest}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); updateExercise(exercise.id, "defaultRest", 5); }}
                                className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function ProgramCustomizer({
    programs,
    breathingPattern,
    onBreathingChange,
    onStart,
    onCancel,
    location,
    setLocation,
    selectedEquipment,
    setSelectedEquipment,
}: ProgramCustomizerProps) {
    const [exercises, setExercises] = useState<ExtendedExercise[]>([]);
    const [selectedOrderedIds, setSelectedOrderedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [mode, setMode] = useState<WorkoutMode>("timer");

    // Initialize exercises and default selection
    useEffect(() => {
        // Merge exercises from all programs
        const allExercises: ExtendedExercise[] = [];
        let uniqueIdCounter = 0;

        programs.forEach(program => {
            program.exercises.forEach(ex => {
                // Create unique ID by combining program ID and counter
                allExercises.push({
                    ...ex,
                    id: `${program.id}-${ex.id}-${uniqueIdCounter++}`,
                    programId: program.id,
                    programName: program.name
                });
            });
        });

        // Sort alphabetically
        allExercises.sort((a, b) => a.name.localeCompare(b.name));

        setExercises(allExercises);

        // Initially select nothing
        setSelectedOrderedIds([]);
    }, [programs]);

    const filteredExercises = useMemo(() => {
        const filtered = exercises.filter(ex => {
            // Filter by equipment
            const matchesEquipment = ex.equipment.some(eq => selectedEquipment.has(eq));

            // Filter by search query (search both English and Thai parts of the name)
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = ex.name.toLowerCase().includes(searchLower) ||
                ex.description.toLowerCase().includes(searchLower);

            return matchesEquipment && matchesSearch;
        });

        // Sort: selected exercises first (by selection order), then unselected alphabetically
        return filtered.sort((a, b) => {
            const aIndex = selectedOrderedIds.indexOf(a.id);
            const bIndex = selectedOrderedIds.indexOf(b.id);
            const aSelected = aIndex !== -1;
            const bSelected = bIndex !== -1;

            if (aSelected && bSelected) {
                // Both selected: sort by selection order
                return aIndex - bIndex;
            } else if (aSelected) {
                // Only a is selected: a comes first
                return -1;
            } else if (bSelected) {
                // Only b is selected: b comes first
                return 1;
            } else {
                // Neither selected: keep alphabetical order
                return a.name.localeCompare(b.name);
            }
        });
    }, [exercises, selectedEquipment, searchQuery, selectedOrderedIds]);

    const toggleSelection = (id: string) => {
        setSelectedOrderedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const updateExercise = (id: string, field: "defaultSets" | "defaultReps" | "defaultRest", delta: number) => {
        setExercises((prev) =>
            prev.map((e) =>
                e.id === id
                    ? { ...e, [field]: Math.max(1, e[field] + delta) }
                    : e
            )
        );
    };

    const toggleEquipment = (eq: ExerciseEquipment) => {
        const newSet = new Set(selectedEquipment);
        if (newSet.has(eq)) {
            newSet.delete(eq);
        } else {
            newSet.add(eq);
        }
        setSelectedEquipment(newSet);
    }



    const handleStart = () => {
        // Use selectedOrderedIds to determine the final exercise list order
        const selectedExercises = selectedOrderedIds
            .map(id => exercises.find(e => e.id === id))
            .filter((e): e is ExtendedExercise => e !== undefined);

        // Create a synthetic "Custom Program" name
        const programNames = programs.map(p => p.name).join(" + ");

        const customizedProgram: Program = {
            id: "custom-mixed",
            name: programNames,
            description: "Custom Mixed Program",
            exercises: selectedExercises,
        };
        onStart(customizedProgram, mode);
    };

    // Calculate Total Duration
    const totalDurationSeconds = selectedOrderedIds
        .map(id => exercises.find(e => e.id === id))
        .filter((e): e is ExtendedExercise => e !== undefined)
        .reduce((total, ex) => {
            const repDuration = breathingPattern.inhale + breathingPattern.holdIn + breathingPattern.exhale + breathingPattern.holdOut;
            const activeTime = ex.defaultSets * ex.defaultReps * repDuration;
            const restTime = ex.defaultSets * ex.defaultRest;
            return total + activeTime + restTime;
        }, 0);

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} นาที`;
    };

    // Calculate effective selected count (filtered & selected)
    const effectiveSelectedCount = selectedOrderedIds.length;

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                    <ArrowLeft size={20} />
                    <span className="font-bold">กลับ</span>
                </button>
            </div>

            <div className="p-4 space-y-4">
                <div className="space-y-6">
                    {/* Location & Equipment Filters */}
                    <div className="bg-gray-900/40 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-2xl">

                        <div className="flex items-center gap-2 mb-4 text-sm text-gray-400 font-medium px-1">
                            <span className="uppercase tracking-wider text-[10px] font-bold">สถานที่ & อุปกรณ์</span>
                        </div>

                        {/* Location Switch */}
                        <div className="flex bg-black/40 border border-white/5 rounded-2xl p-1 mb-5 relative overflow-hidden">
                            <button
                                onClick={() => setLocation("home")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-sm font-bold relative z-10",
                                    location === "home"
                                        ? "bg-linear-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-green-500/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Home size={16} />
                                <span>ที่บ้าน (Home)</span>
                            </button>
                            <button
                                onClick={() => setLocation("gym")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-sm font-bold relative z-10",
                                    location === "gym"
                                        ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Building2 size={16} />
                                <span>ยิม (Gym)</span>
                            </button>

                        </div>

                        {/* Equipment Checkboxes */}
                        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide mask-linear-fade">
                            {[
                                { id: "bodyweight", label: "น้ำหนักตัว", icon: <User size={14} /> },
                                { id: "dumbbell", label: "ดัมเบล", icon: <Dumbbell size={14} /> },
                                { id: "barbell", label: "บาร์เบล", icon: <Weight size={14} /> },
                                { id: "bench", label: "ม้านั่ง", icon: <Armchair size={14} /> },
                                { id: "machine", label: "เครื่อง", icon: <Settings size={14} /> },
                                { id: "cable", label: "เคเบิล", icon: <Cable size={14} /> }
                            ].map((item) => {
                                const isSelected = selectedEquipment.has(item.id as ExerciseEquipment);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleEquipment(item.id as ExerciseEquipment)}
                                        className={cn(
                                            "shrink-0 flex items-center gap-2 p-1 rounded-xl text-xs font-bold border transition-all duration-300 relative overflow-hidden group text-left",
                                            isSelected
                                                ? "bg-white border-white text-black shadow-lg shadow-white/20 scale-[0.98]"
                                                : "bg-gray-900/40 border-white/5 text-gray-500 hover:bg-gray-800/60 hover:border-white/10 hover:text-gray-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-1.5 rounded-md transition-colors",
                                            isSelected ? "bg-black/5 text-black" : "bg-black/40 text-gray-600 group-hover:text-gray-400"
                                        )}>
                                            {item.icon}
                                        </div>
                                        <span className="truncate">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="ค้นหาท่าออกกำลังกาย..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                    </div>

                    {/* List */}
                    <div className="space-y-4">
                        {filteredExercises.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                ไม่มีท่าที่ใช้อุปกรณ์ที่เลือกครับ
                            </div>
                        ) : (
                            filteredExercises.map((exercise) => {
                                const selectionIndex = selectedOrderedIds.indexOf(exercise.id);
                                const isSelected = selectionIndex !== -1;
                                return (
                                    <ExerciseCard
                                        key={exercise.id}
                                        exercise={exercise}
                                        isSelected={isSelected}
                                        selectionIndex={selectionIndex}
                                        toggleSelection={toggleSelection}
                                        updateExercise={updateExercise}
                                    />
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Footer / Start Button */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky bottom-0 z-10 space-y-3">

                <div className="flex items-center justify-between text-gray-400 text-sm px-1">
                    <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>เวลาโดยประมาณ:</span>
                    </div>
                    <span className="text-white font-bold text-lg">{formatDuration(totalDurationSeconds)}</span>
                </div>

                {/* Mode Selection */}
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setMode("timer")}
                        className={cn(
                            "py-2 rounded-lg text-sm font-bold transition-all",
                            mode === "timer" ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                    >
                        จับเวลา breath
                    </button>
                    <button
                        onClick={() => setMode("manual")}
                        className={cn(
                            "py-2 rounded-lg text-sm font-bold transition-all",
                            mode === "manual" ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                    >
                        นับเซ็ตเอง
                    </button>
                </div>

                <button
                    onClick={handleStart}
                    disabled={effectiveSelectedCount === 0}
                    className="w-full py-4 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 font-bold text-white text-lg shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Play size={20} fill="currentColor" />
                    เริ่มออกกำลังกาย ({effectiveSelectedCount} ท่า)
                </button>
            </div>
        </div>
    );
}
