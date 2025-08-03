'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateMessage, getHeroPersonality } from '../../utils/messageProcessor';

const ChatInterface = ({ currentHero, weatherData, locationData }) => {
  const [messages, setMessages] = useState([]);
  
  // Add welcome message when component mounts
  useEffect(() => {
    if (currentHero && messages.length === 0) {
      const personality = getHeroPersonality(currentHero);
      const welcomeMessage = {
        id: Date.now(),
        text: personality.greeting,
        sender: 'bot',
        hero: currentHero,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([welcomeMessage]);
    }
  }, [currentHero]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isHeroSpeaking, setIsHeroSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setIsRecording(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        setIsRecording(false);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsRecording(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSendMessage = async (text = inputText) => {
    if (!validateMessage(text)) return;

    const userMessage = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          currentHero: currentHero,
          weatherData: weatherData,
          locationData: locationData,
          chatHistory: messages.slice(-5) // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'bot',
        hero: currentHero,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMessage]);

             // Play audio if available with enhanced experience
       if (data.audioUrl) {
         const audio = new Audio(data.audioUrl);
         
         // Add audio event listeners for better UX
         audio.addEventListener('loadstart', () => {
           console.log('Loading hero voice...');
         });
         
         audio.addEventListener('canplay', () => {
           console.log('Hero voice ready to play');
         });
         
         audio.addEventListener('play', () => {
           console.log('Hero is speaking...');
           setIsHeroSpeaking(true);
         });
         
         audio.addEventListener('ended', () => {
           console.log('Hero finished speaking');
           setIsHeroSpeaking(false);
         });
         
         audio.addEventListener('error', (err) => {
           console.log('Audio playback failed:', err);
         });
         
         // Play the audio
         audio.play().catch(err => console.log('Audio playback failed:', err));
       }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again.",
        sender: 'bot',
        hero: currentHero,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
      handleSendMessage();
    }
  };

  const getHeroIcon = (hero) => {
    const icons = {
      batman: '🦇',
      superman: '🦸‍♂️',
      wonderwoman: '🦸‍♀️',
      aquaman: '🐠',
      flash: '⚡'
    };
    return icons[hero] || '🦸‍♂️';
  };

  const getHeroColor = (hero) => {
    const colors = {
      batman: 'text-gray-300',
      superman: 'text-blue-400',
      wonderwoman: 'text-red-400',
      aquaman: 'text-blue-300',
      flash: 'text-yellow-400'
    };
    return colors[hero] || 'text-gray-300';
  };

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-md rounded-lg border border-gray-600">
      {/* Header */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
             <span className={`text-2xl ${isHeroSpeaking ? 'animate-pulse' : ''}`}>{getHeroIcon(currentHero)}</span>
             <div>
               <h3 className="text-lg font-semibold text-yellow-400">
                 Chat with {currentHero?.charAt(0).toUpperCase() + currentHero?.slice(1)}
                 {isHeroSpeaking && <span className="ml-2 text-green-400 animate-pulse">🎤 Speaking...</span>}
               </h3>
               <p className="text-xs text-gray-400">Ask about weather, DC comics, or anything!</p>
             </div>
           </div>
          <div className="flex space-x-2">
            <button
              onClick={startVoiceRecording}
              disabled={isRecording}
              className={`p-2 rounded-full transition-colors ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'
              }`}
              title="Voice Input"
            >
              {isRecording ? '🎤' : '🎤'}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-700 text-white border-l-4 border-yellow-500'
                }`}
              >
                {message.sender === 'bot' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{getHeroIcon(message.hero)}</span>
                    <span className={`text-xs font-semibold ${getHeroColor(message.hero)}`}>
                      {message.hero?.charAt(0).toUpperCase() + message.hero?.slice(1)}
                    </span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs opacity-60 mt-1">{message.timestamp}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-700 text-white px-4 py-2 rounded-lg border-l-4 border-yellow-500">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getHeroIcon(currentHero)}</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-600">
        <div className="flex space-x-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about weather, DC comics, or anything..."
            className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-yellow-500"
            rows="2"
            disabled={isLoading}
        />
        <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Press Enter to send • Click microphone for voice input
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;