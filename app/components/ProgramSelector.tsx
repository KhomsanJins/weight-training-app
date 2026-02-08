"use client";

import { motion } from "framer-motion";
import { Program, Exercise } from "../types"; // Added Exercise
import { cn } from "@/lib/utils";
import { Dumbbell, Activity, Flame, Zap, Trophy, Clock, List, ArrowRight, BicepsFlexed } from "lucide-react"; // Import icons

interface ProgramSelectorProps {
    programs: Program[];
    selectedPrograms: Program[];
    onToggle: (program: Program) => void;
    onNext: () => void;
}

const getProgramIcon = (id: string) => {
    switch (id) {
        case "push": return <Dumbbell className="text-blue-400" size={24} />;
        case "pull": return <BicepsFlexed className="text-purple-400" size={24} />;
        case "legs": return <Flame className="text-orange-400" size={24} />;
        case "upper": return <Zap className="text-yellow-400" size={24} />;
        case "lower": return <Activity className="text-green-400" size={24} />;
        default: return <Trophy className="text-gray-400" size={24} />;
    }
};

const getGradient = (id: string) => {
    switch (id) {
        case "push": return "from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border-blue-500/30";
        case "pull": return "from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-purple-500/30";
        case "legs": return "from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border-orange-500/30";
        case "upper": return "from-yellow-500/20 to-amber-500/20 hover:from-yellow-500/30 hover:to-amber-500/30 border-yellow-500/30";
        case "lower": return "from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border-green-500/30";
        default: return "from-gray-800 to-gray-800 border-gray-700";
    }
};

export default function ProgramSelector({
    programs,
    selectedPrograms,
    onToggle,
    onNext,
}: ProgramSelectorProps) {

    // Simple calculation assuming standard breathing (wait for passing breathingPattern if precise needed, but approx is fine here)
    // Approx 5s per rep + rest
    const calculateApproxDuration = (exercises: Exercise[]) => {
        const totalSeconds = exercises.reduce((acc, ex) => {
            return acc + (ex.defaultSets * ex.defaultReps * 5) + (ex.defaultSets * ex.defaultRest);
        }, 0);
        return Math.round(totalSeconds / 60);
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-6 pb-24">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                    เลือกโปรแกรมออกกำลังกาย
                </h2>
                <p className="text-gray-400">เลือกได้มากกว่า 1 โปรแกรมเพื่อผสมผสานการฝึก</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {programs.map((program) => {
                    const isSelected = selectedPrograms.some(p => p.id === program.id);
                    const duration = calculateApproxDuration(program.exercises);

                    return (
                        <motion.button
                            key={program.id}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onToggle(program)}
                            className={cn(
                                "relative p-6 rounded-2xl text-left transition-all border-2 backdrop-blur-xl flex flex-col h-full bg-linear-to-br",
                                getGradient(program.id),
                                isSelected
                                    ? "ring-2 ring-white ring-offset-2 ring-offset-black shadow-xl scale-[1.02] border-transparent"
                                    : "opacity-80 hover:opacity-100 shadow-lg"
                            )}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4 w-full">
                                <div className={cn(
                                    "p-3 rounded-xl backdrop-blur-sm border transition-colors",
                                    isSelected ? "bg-white text-black border-white" : "bg-gray-900/40 border-white/10"
                                )}>
                                    {getProgramIcon(program.id)}
                                </div>
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="bg-blue-500 text-white shadow-lg shadow-blue-500/40 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"
                                    >
                                        <ArrowRight size={12} />
                                        Selected
                                    </motion.div>
                                )}
                            </div>

                            {/* Title & Desc */}
                            <div className="mb-4 grow">
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                                    {program.name}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {program.description}
                                </p>
                            </div>

                            {/* Stats Row */}
                            <div className="flex items-center gap-4 text-xs font-mono text-gray-300 bg-black/20 p-3 rounded-lg border border-white/5 mb-4 w-full">
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-blue-400" />
                                    <span>~{duration} นาที</span>
                                </div>
                                <div className="w-px h-3 bg-white/10" />
                                <div className="flex items-center gap-1.5">
                                    <List size={14} className="text-purple-400" />
                                    <span>{program.exercises.length} ท่า</span>
                                </div>
                            </div>

                            {/* Preview List */}
                            <div className="space-y-1 w-full">
                                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">ท่าแนะนำ</span>
                                {program.exercises.slice(0, 3).map((ex) => (
                                    <div key={ex.id} className="flex items-center text-xs text-gray-400 truncate">
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full mr-2",
                                            isSelected ? "bg-blue-400" : "bg-gray-600"
                                        )} />
                                        {ex.name}
                                    </div>
                                ))}
                                {program.exercises.length > 3 && (
                                    <div className="text-[10px] text-gray-600 pl-3.5">
                                        +{program.exercises.length - 3} more...
                                    </div>
                                )}
                            </div>
                        </motion.button>
                    )
                })}
            </div>

            {/* Floating Next Button */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: selectedPrograms.length > 0 ? 0 : 100, opacity: selectedPrograms.length > 0 ? 1 : 0 }}
                className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none"
            >
                <button
                    onClick={onNext}
                    className="pointer-events-auto bg-white text-black font-bold text-lg px-8 py-4 rounded-full shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <span>ไปต่อ ({selectedPrograms.length} โปรแกรม)</span>
                    <ArrowRight size={20} />
                </button>
            </motion.div>
        </div>
    );
}
