import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Check, Sparkles, MessageCircle, Settings } from 'lucide-react';
import { Button } from './ui/button';

interface OnboardingWalkthroughProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'Welcome to Tonify!',
    description: 'Tonify helps you understand and adjust message tone so you can communicate confidently.',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    title: 'See Incoming Tone',
    description: 'Tap the smiley face icons next to messages to understand the emotional tone of what people send you.',
    icon: <MessageCircle className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-500',
    highlight: 'tone-indicator'
  },
  {
    title: 'Check Your Tone',
    description: 'Go to the Compose tab and tap "Check Tone" to see how your message might be received before sending.',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'from-amber-500 to-orange-500',
    highlight: 'compose-tab'
  },
  {
    title: 'Choose Your Style',
    description: 'Select a tone preset in Settings to match your communication preferences: Friendly, Professional, Casual, or Enthusiastic.',
    icon: <Settings className="w-8 h-8" />,
    color: 'from-pink-500 to-rose-500',
    highlight: 'settings-tab'
  }
];

export function OnboardingWalkthrough({ onComplete }: OnboardingWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleSkip}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white`}>
            {step.icon}
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h2 className="text-gray-900 mb-2">{step.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep
                  ? 'w-6 bg-[#007AFF]'
                  : idx < currentStep
                  ? 'w-1.5 bg-green-500'
                  : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button
              onClick={() => setCurrentStep(currentStep - 1)}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 bg-[#007AFF] hover:bg-[#0051D5]"
          >
            {currentStep < steps.length - 1 ? (
              <>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Get Started <Check className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Skip */}
        {currentStep < steps.length - 1 && (
          <button
            onClick={handleSkip}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-700 mt-3 transition-colors"
          >
            Skip tutorial
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
