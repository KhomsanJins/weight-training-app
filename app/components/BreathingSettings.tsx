"use client";

import { BreathingPattern } from "../types";
import { Minus, Plus } from "lucide-react";

interface BreathingSettingsProps {
    pattern: BreathingPattern;
    onChange: (pattern: BreathingPattern) => void;
}

export default function BreathingSettings({
    pattern,
    onChange,
}: BreathingSettingsProps) {
    const handleChange = (key: keyof BreathingPattern, value: number) => {
        onChange({ ...pattern, [key]: value });
    };

    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 w-full">
            <h3 className="text-lg font-bold text-white mb-4">ตั้งค่าจังหวะหายใจ</h3>
            <div className="space-y-4">
                <SettingSlider
                    label="หายใจเข้า (วิ)"
                    value={pattern.inhale}
                    onChange={(v) => handleChange("inhale", v)}
                />
                <SettingSlider
                    label="กลั้น (เต็มปอด) (วิ)"
                    value={pattern.holdIn}
                    onChange={(v) => handleChange("holdIn", v)}
                />
                <SettingSlider
                    label="หายใจออก (วิ)"
                    value={pattern.exhale}
                    onChange={(v) => handleChange("exhale", v)}
                />
                <SettingSlider
                    label="กลั้น (หมดปอด) (วิ)"
                    value={pattern.holdOut}
                    onChange={(v) => handleChange("holdOut", v)}
                />
            </div>
        </div>
    );
}

function SettingSlider({
    label,
    value,
    onChange,
}: {
    label: string;
    value: number;
    onChange: (val: number) => void;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300">{label}</label>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onChange(Math.max(0, value - 0.5))}
                    className="p-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                >
                    <Minus size={16} />
                </button>
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <button
                    onClick={() => onChange(Math.min(10, value + 0.5))}
                    className="p-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                >
                    <Plus size={16} />
                </button>
                <span className="text-sm font-mono text-blue-400 w-12 text-center bg-gray-900/50 py-1 rounded">
                    {value}s
                </span>
            </div>
        </div>
    );
}
