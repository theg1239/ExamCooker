"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, List, HelpCircle, Check } from "lucide-react";

interface QuizModalContentProps {
  courseCode: string;
  courseName: string;
  onClose: () => void;
}

interface QuizState {
  selectedWeeks: number[];
  numQuestions: number | null;
  duration: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

interface ValidationState {
  weeks: {
    isValid: boolean;
    message: string;
  };
  questions: {
    isValid: boolean;
    message: string;
  };
  duration: {
    isValid: boolean;
    message: string;
  };
}

const STORAGE_KEY = "quizSettings";

export default function QuizModalContent({
  courseCode,
  courseName,
  onClose,
}: QuizModalContentProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [quizState, setQuizState] = useState<QuizState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          Array.isArray(parsed.selectedWeeks) &&
          typeof parsed.numQuestions === "number" &&
          typeof parsed.duration === "object"
        ) {
          return parsed;
        }
      }
    }
    return {
      selectedWeeks: [],
      numQuestions: null,
      duration: { hours: 0, minutes: 0, seconds: 0 },
    };
  });

  const [validation, setValidation] = useState<ValidationState>({
    weeks: { isValid: true, message: "" },
    questions: { isValid: true, message: "" },
    duration: { isValid: true, message: "" },
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quizState));
  }, [quizState]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const getTotalSeconds = () => {
    const { hours, minutes, seconds } = quizState.duration;
    return hours * 3600 + minutes * 60 + seconds;
  };

  const validateInputs = (): boolean => {
    const newValidation = { ...validation };
    let isValid = true;

    if (quizState.selectedWeeks.length === 0) {
      newValidation.weeks = {
        isValid: false,
        message: "Please select at least one week",
      };
      isValid = false;
    } else {
      newValidation.weeks = {
        isValid: true,
        message: `${quizState.selectedWeeks.length} weeks selected`,
      };
    }

    const maxQuestions = quizState.selectedWeeks.length * 10;
    if (!quizState.numQuestions || quizState.numQuestions <= 0) {
      newValidation.questions = {
        isValid: false,
        message: "Please enter a valid number of questions",
      };
      isValid = false;
    } else if (quizState.numQuestions > maxQuestions) {
      newValidation.questions = {
        isValid: false,
        message: `Maximum ${maxQuestions} questions allowed for selected weeks`,
      };
      isValid = false;
    } else {
      newValidation.questions = {
        isValid: true,
        message: `${quizState.numQuestions} questions selected`,
      };
    }

    const totalSeconds = getTotalSeconds();
    if (totalSeconds === 0) {
      newValidation.duration = {
        isValid: false,
        message: "Please set a duration greater than 0",
      };
      isValid = false;
    } else if (
      quizState.numQuestions !== null &&
      totalSeconds < quizState.numQuestions * 30
    ) {
      newValidation.duration = {
        isValid: false,
        message: "Duration too short for number of questions",
      };
      isValid = false;
    } else {
      newValidation.duration = {
        isValid: true,
        message: `${formatDuration(quizState.duration)} duration set`,
      };
    }

    setValidation(newValidation);
    return isValid;
  };

  const formatDuration = (duration: {
    hours: number;
    minutes: number;
    seconds: number;
  }) => {
    return `${String(duration.hours).padStart(2, "0")}:${String(
      duration.minutes
    ).padStart(2, "0")}:${String(duration.seconds).padStart(2, "0")}`;
  };

  const handleStartQuiz = () => {
    if (validateInputs()) {
      const formattedWeeks = quizState.selectedWeeks.join("-");
      const formattedDuration = formatDuration(quizState.duration).replace(
        /:/g,
        ""
      );
      router.push(
        `/quiz/weeks=${formattedWeeks}&numQ=${quizState.numQuestions}&time=${formattedDuration}&course=${courseCode}`
      );
    }
  };

  const toggleWeek = (week: number) => {
    setQuizState((prev) => ({
      ...prev,
      selectedWeeks: prev.selectedWeeks.includes(week)
        ? prev.selectedWeeks.filter((w) => w !== week)
        : [...prev.selectedWeeks, week].sort((a, b) => a - b),
    }));
  };

  const handleNumQuestionsChange = (value: number) => {
    setQuizState((prev) => ({
      ...prev,
      numQuestions: value,
    }));
  };

  const handleDurationChange = (
    field: "hours" | "minutes" | "seconds",
    value: number
  ) => {
    const maxValue = field === "hours" ? 23 : 59;
    const sanitizedValue = Math.max(0, Math.min(value, maxValue));

    setQuizState((prev) => ({
      ...prev,
      duration: {
        ...prev.duration,
        [field]: sanitizedValue,
      },
    }));
  };

  return (
    <div className="relative overflow-hidden p-6 max-w-2xl mx-auto shadow-lg bg-[#C2E6EC] dark:bg-[#0C1222]">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={24} className="text-black dark:text-[#D5D5D5]" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black dark:text-[#D5D5D5]">
            {courseCode}
          </h2>
          <h3 className="text-lg font-semibold text-black dark:text-[#D5D5D5]">
            {courseName}
          </h3>
        </div>
        <button onClick={handleStartQuiz} className="relative group">
          <div className="absolute inset-0 bg-black dark:bg-[#3BF4C7]" />
          <div className="absolute inset-0 blur-[75px] dark:lg:bg-none lg:dark:group-hover:bg-[#3BF4C7] transition dark:group-hover:duration-200 duration-1000" />
          <button
            type="submit"
            title="Start Quiz"
            className="dark:text-[#D5D5D5] dark:group-hover:text-[#3BF4C7] dark:group-hover:border-[#3BF4C7]
                        dark:border-[#D5D5D5] dark:bg-[#0C1222] border-black border-2 relative px-4 py-2 text-lg bg-[#3BF4C7] text-black font-bold
                        group-hover:-translate-x-1 group-hover:-translate-y-1 transition duration-150"
          >
            Start Quiz
          </button>
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="w-1/2 flex flex-col justify-between" ref={dropdownRef}>
          <div className="flex items-center mb-2">
            <label className="text-sm font-medium text-black dark:text-[#D5D5D5]">
              Select Weeks
            </label>
          </div>
          <div className="relative">
            <button
              className={`p-3 w-full border text-left flex justify-between items-center bg-white dark:bg-[#3D414E] text-black dark:text-[#D5D5D5] ${
                validation.weeks.isValid ? "border-gray-300" : "border-red-500"
              }`}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>
                {quizState.selectedWeeks.length === 0
                  ? "Select Weeks"
                  : quizState.selectedWeeks.join(",")}
              </span>
              <Check
                className="mr-2 text-black dark:text-[#D5D5D5]"
                size={20}
              />
            </button>
            {showDropdown && (
              <div className="absolute z-10 w-full bg-white dark:bg-[#3D414E] text-black dark:text-[#D5D5D5] border mt-1 shadow-lg overflow-y-auto max-h-48">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
                  <div
                    key={week}
                    onClick={() => toggleWeek(week)}
                    className={`cursor-pointer p-2 hover:bg-black/20 dark:hover:bg-white/20 ${
                      quizState.selectedWeeks.includes(week) ? "" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={quizState.selectedWeeks.includes(week)}
                      readOnly
                      className="mr-2"
                    />
                    <span>{week}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {!validation.weeks.isValid && (
            <p className="text-red-500 text-xs">{validation.weeks.message}</p>
          )}
        </div>

        <div className="w-1/2">
          <div className="flex items-center mb-2">
            <label className="text-sm font-medium text-black dark:text-[#D5D5D5]">
              Number of Questions
            </label>
          </div>
          <input
            type="number"
            value={quizState.numQuestions || ""}
            onChange={(e) => handleNumQuestionsChange(Number(e.target.value))}
            placeholder="Enter number"
            className={`w-full p-2 border  dark:bg-[#3D414E] text-black dark:text-[#D5D5D5] ${
              validation.questions.isValid
                ? "border-gray-300"
                : "border-red-500"
            }`}
            style={{ height: "3rem" }}
          />
          {!validation.questions.isValid && (
            <p className="text-red-500 text-xs">
              {validation.questions.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="w-1/3">
          <label className="text-sm font-mediumtext-black text-black dark:text-[#D5D5D5]">
            Hours
          </label>
          <input
            type="number"
            value={quizState.duration.hours}
            onChange={(e) =>
              handleDurationChange("hours", Number(e.target.value))
            }
            className={`w-full p-2 border dark:bg-[#3D414E] text-black dark:text-[#D5D5D5] ${
              validation.duration.isValid ? "border-gray-300" : "border-red-500"
            }`}
            style={{ height: "3rem" }}
          />
        </div>
        <div className="w-1/3">
          <label className="text-sm font-medium text-black dark:text-[#D5D5D5]">
            Minutes
          </label>
          <input
            type="number"
            value={quizState.duration.minutes}
            onChange={(e) =>
              handleDurationChange("minutes", Number(e.target.value))
            }
            className={`w-full p-2 border dark:bg-[#3D414E] text-black dark:text-[#D5D5D5] ${
              validation.duration.isValid ? "border-gray-300" : "border-red-500"
            }`}
            style={{ height: "3rem" }}
          />
        </div>
        <div className="w-1/3">
          <label className="text-sm font-medium text-black dark:text-[#D5D5D5]">
            Seconds
          </label>
          <input
            type="number"
            value={quizState.duration.seconds}
            onChange={(e) =>
              handleDurationChange("seconds", Number(e.target.value))
            }
            className={`w-full p-2 border dark:bg-[#3D414E] text-black dark:text-[#D5D5D5] ${
              validation.duration.isValid ? "border-gray-300" : "border-red-500"
            }`}
            style={{ height: "3rem" }}
          />
        </div>
      </div>
      {!validation.duration.isValid && (
        <p className="text-red-500 text-xs">{validation.duration.message}</p>
      )}
    </div>
  );
}
