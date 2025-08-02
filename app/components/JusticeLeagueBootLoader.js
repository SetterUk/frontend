"use client";
import { useEffect, useRef, useState } from "react";

export default function JusticeLeagueBootLoader({ onComplete }) {
  const videoRef = useRef(null);
  const [bootDone, setBootDone] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    if (playVideo && videoRef.current) {
      videoRef.current.muted = !soundEnabled;

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Autoplay failed:", error);
        });
      }
    }
  }, [playVideo, soundEnabled]);

  const handleVideoEnd = () => {
    setBootDone(true);
    if (onComplete) onComplete();
  };

  const initializeAudio = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createBufferSource();
    source.buffer = audioContext.createBuffer(1, 1, 22050);
    source.connect(audioContext.destination);
    source.start(0);
  };

  const handleEnableAudio = () => {
    setSoundEnabled(true);
    initializeAudio();
    setShowAudioPrompt(false);
    setPlayVideo(true);
  };

  const handleDisableAudio = () => {
    setSoundEnabled(false);
    setShowAudioPrompt(false);
    setPlayVideo(true);
  };

  if (bootDone) return null;

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
      {showAudioPrompt ? (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="bg-gray-900 border border-cyan-500 rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="text-cyan-400 text-2xl mb-4">⚡ JUSTICE LEAGUE ⚡</div>
            <div className="text-white mb-6">
              <p className="mb-4">Welcome to the Watchtower Network</p>
              <p className="text-sm text-gray-400">
                Enable sound effects for the full Justice League experience?
              </p>
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
      ) : (
        <video
          ref={videoRef}
          src="/bootloader.mp4"
          className="w-full h-full object-cover"
          muted={!soundEnabled}
          onEnded={handleVideoEnd}
          playsInline
        />
      )}
    </div>
  );
}
