import { useState, useRef, useEffect } from 'react';

const VideoPlayer = ({ src, title = '', onEnded, onProgress, autoPlay = false }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true); }
    else { videoRef.current.pause(); setIsPlaying(false); }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (onProgress && duration > 0) onProgress(videoRef.current.currentTime / duration);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) { containerRef.current.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative bg-black rounded-xl overflow-hidden aspect-video ${!showControls && isPlaying ? 'cursor-none' : ''}`}>
      <video ref={videoRef} src={src} className="w-full h-full object-contain" onClick={handlePlayPause} onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)} onEnded={() => { setIsPlaying(false); onEnded?.(); }}
        onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} autoPlay={autoPlay} playsInline />

      {title && !isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white cursor-pointer" onClick={handlePlayPause}>
          <h3 className="text-xl font-medium m-0 mb-2">{title}</h3>
          <p className="text-sm opacity-80 m-0">Click to play</p>
        </div>
      )}

      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-12 pb-3 px-4 transition-opacity duration-300 ${!showControls && isPlaying ? 'opacity-0' : 'opacity-100'}`}>
        <div className="mb-2">
          <input type="range" min={0} max={duration || 0} value={currentTime} onChange={(e) => { if(videoRef.current) videoRef.current.currentTime = parseFloat(e.target.value); setCurrentTime(parseFloat(e.target.value)); }}
            className="w-full h-1 appearance-none bg-white/30 rounded-full outline-none cursor-pointer accent-indigo-500"
            style={{ background: `linear-gradient(to right, #6366f1 ${progressPercent}%, rgba(255,255,255,0.3) ${progressPercent}%)` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={handlePlayPause} className="p-1.5 border-none bg-transparent text-white cursor-pointer rounded hover:bg-white/15 transition-colors flex items-center" aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                : <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>}
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => { if(videoRef.current) videoRef.current.muted = !isMuted; setIsMuted(!isMuted); }} className="p-1.5 border-none bg-transparent text-white cursor-pointer rounded hover:bg-white/15 transition-colors flex items-center" aria-label="Mute">
                {isMuted || volume === 0 ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>}
              </button>
              <input type="range" min={0} max={1} step={0.1} value={isMuted ? 0 : volume} onChange={(e) => { const v = parseFloat(e.target.value); setVolume(v); if(videoRef.current) videoRef.current.volume = v; setIsMuted(v===0); }}
                className="w-16 h-0.5 appearance-none bg-white/30 rounded outline-none cursor-pointer accent-white" />
            </div>
            <span className="text-[13px] text-white/90 ml-2">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <div className="flex items-center">
            <button onClick={toggleFullscreen} className="p-1.5 border-none bg-transparent text-white cursor-pointer rounded hover:bg-white/15 transition-colors flex items-center" aria-label="Fullscreen">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;