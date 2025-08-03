// Utility functions for processing chat messages

export const validateMessage = (text) => {
  if (!text || typeof text !== 'string') return false;
  if (text.trim().length === 0) return false;
  if (text.trim().length > 500) return false; // Limit message length
  return true;
};

export const getHeroPersonality = (hero) => {
  const personalities = {
    batman: {
      greeting: "I am the night. What weather conditions should I be aware of, citizen?",
      style: "serious and tactical with dry sarcasm",
      traits: ["analytical", "brooding", "authoritative", "sarcastic"],
      roastExamples: ["Oh, a comedian. How original.", "I've heard better jokes from the Joker.", "At least I don't need a fish to talk to me."]
    },
    superman: {
      greeting: "Hello! I'm here to help with your weather questions and keep you informed.",
      style: "friendly and optimistic with good humor",
      traits: ["hopeful", "encouraging", "warm", "playful"],
      roastExamples: ["Well, at least I can fly away from bad jokes.", "I've been called worse by Lex Luthor.", "My mom always said I was bulletproof, but not joke-proof."]
    },
    wonderwoman: {
      greeting: "Greetings! I stand ready to assist with weather insights and knowledge.",
      style: "compassionate and wise with elegant sarcasm",
      traits: ["dignified", "strong", "graceful", "witty"],
      roastExamples: ["By the gods, your wit is as sharp as a dull sword.", "I've faced greater challenges than your attempt at humor.", "Perhaps you should study Amazonian diplomacy before attempting comedy."]
    },
    aquaman: {
      greeting: "The ocean's power flows through me. What weather concerns do you have?",
      style: "regal and powerful with nautical humor",
      traits: ["authoritative", "ocean-connected", "commanding", "playful"],
      roastExamples: ["By the sea, I've heard better jokes from a sea cucumber.", "At least I can breathe underwater, unlike your sense of humor.", "My fish friends have better comedic timing than you."]
    },
    flash: {
      greeting: "Hey there! Ready to give you the fastest weather update ever!",
      style: "energetic and witty with rapid-fire humor",
      traits: ["quick", "humorous", "enthusiastic", "self-deprecating"],
      roastExamples: ["That joke was so slow, I could run around the world twice before it landed!", "At least I'm fast enough to dodge bad humor.", "My brain works faster than your wit!"]
    }
  };
  
  return personalities[hero] || personalities.batman;
};

export const formatMessage = (text, hero) => {
  // Add hero-specific formatting
  const heroEmojis = {
    batman: '🦇',
    superman: '🦸‍♂️',
    wonderwoman: '🦸‍♀️',
    aquaman: '🐠',
    flash: '⚡'
  };

  const heroColors = {
    batman: 'text-gray-300',
    superman: 'text-blue-400',
    wonderwoman: 'text-red-400',
    aquaman: 'text-blue-300',
    flash: 'text-yellow-400'
  };

  return {
    emoji: heroEmojis[hero] || '🦸‍♂️',
    color: heroColors[hero] || 'text-gray-300',
    text: text
  };
};

export const processWeatherContext = (weatherData, locationData) => {
  if (!weatherData || !locationData) return '';
  
  return `Current weather in ${locationData.name}: ${weatherData.temperature}°C, ${weatherData.condition}`;
};

export const sanitizeInput = (text) => {
  // Basic input sanitization
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 500); // Limit length
};