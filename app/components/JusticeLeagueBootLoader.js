'use client';

import { useState, useEffect, useRef } from 'react';

const JusticeLeagueBootLoader = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  
  // Audio context and sound generation
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Initialize audio context
  const initializeAudio = async () => {
    if (typeof window !== 'undefined' && soundEnabled && !audioInitialized) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        gainNodeRef.current.gain.value = 0.5; // Increased volume from 0.1 to 0.5
        
        // Resume audio context if suspended
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        setAudioInitialized(true);
        setShowAudioPrompt(false);
      } catch (error) {
        console.warn('Audio context not supported:', error);
        setSoundEnabled(false);
        setShowAudioPrompt(false);
      }
    }
  };

  // Handle user interaction to enable audio
  const handleEnableAudio = () => {
    initializeAudio();
  };

  const handleDisableAudio = () => {
    setSoundEnabled(false);
    setShowAudioPrompt(false);
  };

  // Cleanup audio context
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Sound generation functions
  const playBeep = (frequency = 800, duration = 100) => {
    if (!soundEnabled || !audioInitialized || !audioContextRef.current || !gainNodeRef.current) return;
    
    try {
      const oscillator = audioContextRef.current.createOscillator();
      const envelope = audioContextRef.current.createGain();
      
      oscillator.connect(envelope);
      envelope.connect(gainNodeRef.current);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      envelope.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      envelope.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.01);
      envelope.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration / 1000);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Sound playback error:', error);
    }
  };

  const playTypingSound = () => {
    if (!soundEnabled || !audioInitialized) return;
    const frequencies = [600, 650, 700, 750];
    const randomFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
    playBeep(randomFreq, 50);
  };

  const playSuccessSound = () => {
    if (!soundEnabled || !audioInitialized) return;
    playBeep(1000, 150);
    setTimeout(() => playBeep(1200, 150), 100);
  };

  const playStartupSound = () => {
    if (!soundEnabled || !audioInitialized) return;
    playBeep(400, 200);
    setTimeout(() => playBeep(600, 200), 150);
    setTimeout(() => playBeep(800, 300), 300);
  };

  // Boot sequence messages with Justice League theme
  const bootSequence = [
    { text: '> WATCHTOWER SYSTEM INITIALIZING...', delay: 800, color: 'text-cyan-400', sound: 'startup' },
    { text: '> CONNECTING TO JUSTICE LEAGUE DATABASE...', delay: 1000, color: 'text-green-400', sound: 'beep' },
    { text: '> BATMAN PROTOCOL: ACTIVE', delay: 600, color: 'text-yellow-400', sound: 'success' },
    { text: '> SUPERMAN MONITORING: ONLINE', delay: 700, color: 'text-blue-400', sound: 'success' },
    { text: '> WONDER WOMAN SYSTEMS: OPERATIONAL', delay: 650, color: 'text-red-400', sound: 'success' },
    { text: '> FLASH SPEED FORCE: CONNECTED', delay: 550, color: 'text-orange-400', sound: 'success' },
    { text: '> AQUAMAN OCEANIC NETWORK: LINKED', delay: 750, color: 'text-teal-400', sound: 'success' },
    { text: '> GREEN LANTERN CORPS: SYNCHRONIZED', delay: 700, color: 'text-emerald-400', sound: 'success' },
    { text: '> CYBORG TECH INTEGRATION: COMPLETE', delay: 600, color: 'text-purple-400', sound: 'success' },
    { text: '> WEATHER MONITORING SATELLITES: ONLINE', delay: 900, color: 'text-indigo-400', sound: 'beep' },
    { text: '> GLOBAL THREAT ASSESSMENT: CLEAR', delay: 800, color: 'text-green-500', sound: 'success' },
    { text: '> HERO DEPLOYMENT READY', delay: 600, color: 'text-yellow-500', sound: 'beep' },
    { text: '> WATCHTOWER SYSTEMS: FULLY OPERATIONAL', delay: 1000, color: 'text-green-500', sound: 'startup' },
    { text: '> WELCOME TO THE JUSTICE LEAGUE WEATHER NETWORK', delay: 1200, color: 'text-cyan-300', sound: 'startup' }
  ];

  // Enhanced typewriter effect with sound
  const typeText = (text, callback, soundType = 'beep') => {
    setIsTyping(true);
    setDisplayedText('');
    let index = 0;
    
    // Play initial sound based on message type
    if (soundType === 'startup') {
      playStartupSound();
    } else if (soundType === 'success') {
      playSuccessSound();
    } else {
      playBeep();
    }
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text[index]);
        
        // Play typing sound for certain characters
        if (Math.random() > 0.7) { // Random typing sounds
          playTypingSound();
        }
        
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        
        // Play completion sound
        if (soundType === 'success') {
          setTimeout(() => playBeep(1200, 100), 100);
        }
        
        setTimeout(callback, 300);
      }
    }, 30); // Typing speed
  };

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Boot sequence controller with sound
  useEffect(() => {
    // Only start boot sequence after audio decision is made
    if (showAudioPrompt) return;
    
    if (currentStep < bootSequence.length) {
      const currentMessage = bootSequence[currentStep];
      
      typeText(currentMessage.text, () => {
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, currentMessage.delay);
      }, currentMessage.sound);
    } else {
      // Boot sequence complete - play final fanfare
      if (soundEnabled && audioInitialized) {
        playBeep(800, 200);
        setTimeout(() => playBeep(1000, 200), 200);
        setTimeout(() => playBeep(1200, 300), 400);
      }
      
      setTimeout(() => {
        onComplete && onComplete();
      }, 1000);
    }
  }, [currentStep, showAudioPrompt]);

  const currentMessage = bootSequence[currentStep];

  // Show audio permission prompt first
  if (showAudioPrompt) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="bg-gray-900 border border-cyan-500 rounded-lg p-8 max-w-md mx-4 text-center">
          <div className="text-cyan-400 text-2xl mb-4">⚡ JUSTICE LEAGUE ⚡</div>
          <div className="text-white mb-6">
            <p className="mb-4">Welcome to the Watchtower Network</p>
            <p className="text-sm text-gray-400">Enable sound effects for the full Justice League experience?</p>
          </div>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={handleEnableAudio}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors flex items-center space-x-2"
            >
              <span>🔊</span>
              <span>Enable Sound</span>
            </button>
            <button
              onClick={handleDisableAudio}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors flex items-center space-x-2"
            >
              <span>🔇</span>
              <span>Silent Mode</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-12 gap-1 h-full w-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="bg-cyan-500 opacity-10 animate-pulse"
              style={{
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main terminal container */}
      <div className="relative z-10 w-full max-w-4xl mx-4">
        {/* Terminal header */}
        <div className="bg-gray-900 border border-cyan-500 rounded-t-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="ml-4 text-cyan-400 font-mono text-sm">WATCHTOWER TERMINAL v2.1.0</span>
            </div>
            
            {/* Sound toggle button */}
            <button
              onClick={() => {
                if (soundEnabled && audioInitialized) {
                  setSoundEnabled(false);
                } else if (!soundEnabled) {
                  setSoundEnabled(true);
                  initializeAudio();
                }
              }}
              className="flex items-center space-x-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-400 hover:text-cyan-400 transition-colors"
              title={soundEnabled && audioInitialized ? 'Disable Sound' : 'Enable Sound'}
            >
              <span>{soundEnabled && audioInitialized ? '🔊' : '🔇'}</span>
              <span className="hidden sm:inline">
                {soundEnabled && audioInitialized ? 'SOUND ON' : 'SOUND OFF'}
              </span>
            </button>
          </div>
          
          {/* Justice League Logo ASCII */}
          <div className="text-cyan-400 font-mono text-xs leading-tight mb-4">
            <pre>{`
    ██╗██╗   ██╗███████╗████████╗██╗ ██████╗███████╗
    ██║██║   ██║██╔════╝╚══██╔══╝██║██╔════╝██╔════╝
    ██║██║   ██║███████╗   ██║   ██║██║     █████╗  
██   ██║██║   ██║╚════██║   ██║   ██║██║     ██╔══╝  
╚█████╔╝╚██████╔╝███████║   ██║   ██║╚██████╗███████╗
 ╚════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝ ╚═════╝╚══════╝
                                                      
██╗     ███████╗ █████╗  ██████╗ ██╗   ██╗███████╗   
██║     ██╔════╝██╔══██╗██╔════╝ ██║   ██║██╔════╝   
██║     █████╗  ███████║██║  ███╗██║   ██║█████╗     
██║     ██╔══╝  ██╔══██║██║   ██║██║   ██║██╔══╝     
███████╗███████╗██║  ██║╚██████╔╝╚██████╔╝███████╗   
╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝   
            `}</pre>
          </div>
        </div>

        {/* Terminal body */}
        <div className="bg-black border-l border-r border-cyan-500 p-6 min-h-[400px] font-mono">
          {/* Previous messages */}
          <div className="space-y-2 mb-4">
            {bootSequence.slice(0, currentStep).map((message, index) => (
              <div key={index} className={`${message.color} text-sm`}>
                {message.text}
                <span className="text-green-400 ml-2">✓</span>
              </div>
            ))}
          </div>

          {/* Current typing message */}
          {currentStep < bootSequence.length && (
            <div className={`${currentMessage?.color || 'text-cyan-400'} text-sm flex items-center`}>
              {displayedText}
              {showCursor && (
                <span className="ml-1 bg-cyan-400 text-black px-1 animate-pulse">█</span>
              )}
              {/* Sound wave indicator */}
              {isTyping && soundEnabled && audioInitialized && (
                <div className="ml-3 flex items-center space-x-1">
                  <div className="w-1 h-2 bg-cyan-400 animate-pulse"></div>
                  <div className="w-1 h-3 bg-cyan-400 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-2 bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-8">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>SYSTEM INITIALIZATION</span>
              <span>{Math.round((currentStep / bootSequence.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / bootSequence.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-green-400' : 'bg-gray-600'} animate-pulse`}></div>
              <span className="text-gray-400">BATMAN</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${currentStep >= 3 ? 'bg-blue-400' : 'bg-gray-600'} animate-pulse`}></div>
              <span className="text-gray-400">SUPERMAN</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${currentStep >= 4 ? 'bg-red-400' : 'bg-gray-600'} animate-pulse`}></div>
              <span className="text-gray-400">WONDER WOMAN</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${currentStep >= 5 ? 'bg-orange-400' : 'bg-gray-600'} animate-pulse`}></div>
              <span className="text-gray-400">FLASH</span>
            </div>
          </div>
        </div>

        {/* Terminal footer */}
        <div className="bg-gray-900 border border-cyan-500 rounded-b-lg p-3">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>WATCHTOWER ORBITAL STATION</span>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (soundEnabled && audioInitialized) {
                    playBeep(1200, 200);
                  }
                  onComplete && onComplete();
                }}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-black rounded text-xs font-semibold transition-colors"
                title="Skip boot sequence"
              >
                SKIP ⚡
              </button>
              <span>SECURE CONNECTION ESTABLISHED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default JusticeLeagueBootLoader;