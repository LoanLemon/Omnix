import { useEffect, useRef, useState } from "react";
import { Play, Pause, Music, AlignLeft, Volume2, VolumeX, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface VocalWaveformPlayerProps {
  audioUrl: string;
  lyricText?: string;
}

export function VocalWaveformPlayer({ audioUrl, lyricText }: VocalWaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(true);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  // 1. Generate or extract waveform envelope
  useEffect(() => {
    let active = true;

    async function loadAndDecodeAudio() {
      try {
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const decoded = await audioCtx.decodeAudioData(arrayBuffer);
        
        if (!active) return;
        
        const rawData = decoded.getChannelData(0);
        const samples = 80; // Number of bars to render
        const blockSize = Math.floor(rawData.length / samples);
        const peaks: number[] = [];
        
        for (let i = 0; i < samples; i++) {
          let max = 0;
          const start = i * blockSize;
          for (let j = 0; j < blockSize; j++) {
            const val = Math.abs(rawData[start + j]);
            if (val > max) max = val;
          }
          peaks.push(max);
        }

        // Normalize peaks
        const maxPeak = Math.max(...peaks, 0.01);
        const normalized = peaks.map(p => (p / maxPeak) * 0.9 + 0.1);
        setWaveform(normalized);
        await audioCtx.close();
      } catch (err) {
        // Fallback to organic synthetic vocal waveform
        if (active) {
          console.warn("Could not decode audio peaks natively, generating synthetic envelope", err);
          const synthetic: number[] = [];
          for (let i = 0; i < 80; i++) {
            // Harmonic wave formula to simulate professional vocal tracks
            const base = Math.sin(i * 0.1) * 0.4 + 0.5;
            const highFreq = Math.sin(i * 0.6) * 0.2;
            const noise = Math.random() * 0.08;
            synthetic.push(Math.max(0.15, Math.min(0.95, base + highFreq + noise)));
          }
          setWaveform(synthetic);
        }
      }
    }

    loadAndDecodeAudio();
    return () => {
      active = false;
    };
  }, [audioUrl]);

  // 2. Playback state bindings
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = "procedural_song_vocals.wav";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // 3. Canvas waveform drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveform.length === 0) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barWidth = width / waveform.length;
    const spacing = 1.5; // Gap between bars
    const activeProgress = duration > 0 ? currentTime / duration : 0;
    const activeIndex = Math.floor(activeProgress * waveform.length);

    // Track mouse hover state to highlight upcoming seek positions
    const hoverIndex = hoverTime !== null && duration > 0 ? Math.floor((hoverTime / duration) * waveform.length) : null;

    waveform.forEach((val, index) => {
      const x = index * barWidth;
      const barHeight = val * (height - 4);
      const y = (height - barHeight) / 2;

      // Draw rounded bar
      ctx.beginPath();
      // Determine coloring based on active progress and hover timeline
      if (index <= activeIndex) {
        // Completed/active playhead
        ctx.fillStyle = "#f97316"; // Neon orange
      } else if (hoverIndex !== null && index <= hoverIndex) {
        // Highlighted preview seeking range
        ctx.fillStyle = "rgba(249, 115, 22, 0.65)";
      } else {
        // Upcoming unplayed audio
        ctx.fillStyle = "rgba(113, 113, 122, 0.3)"; // Zinc grey
      }

      // Draw subtle bar rectangle
      ctx.roundRect(x + spacing, y, barWidth - spacing * 2, barHeight, 2);
      ctx.fill();
    });
  }, [waveform, currentTime, duration, hoverTime]);

  // 4. Seeking handler
  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(1, Math.max(0, clickX / rect.width));
    const seekTime = percent * duration;

    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const percent = Math.min(1, Math.max(0, hoverX / rect.width));
    setHoverTime(percent * duration);
  };

  const handleCanvasMouseLeave = () => {
    setHoverTime(null);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="border border-orange-500/20 bg-zinc-950/90 dark:bg-black/80 rounded-sm overflow-hidden p-4 space-y-4 shadow-xl relative group">
      {/* Absolute faint backing aesthetic lines */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
      
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
        className="hidden"
      />

      {/* Title Bar & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-sm bg-orange-500/10 border border-orange-500/20 text-orange-500 animate-pulse">
            <Music className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold tracking-wider text-orange-500 uppercase">
              ACE Vocal Synthesizer Output
            </div>
            <div className="text-[8px] font-mono text-zinc-500 uppercase">
              0xSYNTH_CHANNEL_01 // 44.1KHZ_WAV
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1 text-zinc-400 hover:text-orange-500 transition-colors font-mono"
            title="Mute/Unmute"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1 text-zinc-400 hover:text-orange-500 transition-colors font-mono"
            title="Download Audio File"
          >
            <Download className="w-4 h-4" />
          </button>
          
          {lyricText && (
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`p-1.5 rounded-sm border text-[8px] font-mono flex items-center gap-1 transition-all ${
                showLyrics 
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-500" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <AlignLeft className="w-3 h-3" />
              <span>{showLyrics ? "HIDE_LYRICS" : "SHOW_LYRICS"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Playback Deck */}
      <div className="flex items-center gap-4 bg-zinc-900/40 p-2.5 rounded border border-zinc-800/40">
        {/* Play Button */}
        <button
          onClick={togglePlay}
          className="h-10 w-10 shrink-0 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-all duration-300 shadow-[0_0_12px_rgba(249,115,22,0.3)] hover:scale-105"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
        </button>

        {/* Waveform Canvas & Seeking Timeline */}
        <div className="flex-1 relative h-12 flex flex-col justify-center">
          <canvas
            ref={canvasRef}
            width={320}
            height={44}
            onClick={handleCanvasInteraction}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
            className="w-full h-11 cursor-pointer"
          />
          {hoverTime !== null && (
            <div 
              className="absolute top-0 text-[7px] font-mono text-orange-500 bg-zinc-950 px-1 py-0.5 rounded border border-orange-500/20 -translate-y-4 pointer-events-none"
              style={{
                left: `${(hoverTime / (duration || 1)) * 100}%`,
                transform: `translate(-50%, -10px)`
              }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Time Counters */}
        <div className="text-[9px] font-mono text-zinc-400 text-right min-w-[64px] flex flex-col justify-center border-l border-zinc-800 pl-3">
          <div className="text-orange-500 font-bold">{formatTime(currentTime)}</div>
          <div className="text-zinc-600">{formatTime(duration)}</div>
        </div>
      </div>

      {/* Collapsible Scrollable lyric panel */}
      {showLyrics && lyricText && (
        <div className="border border-zinc-800/60 bg-zinc-900/20 rounded p-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2 border-b border-zinc-800/40 pb-1.5 flex justify-between">
            <span>LYRICS & SONGSTRUCTURE</span>
            <span className="text-[7px] text-orange-500/50">SCROLL_ABLE</span>
          </div>
          <div className="max-h-36 overflow-y-auto text-[11px] font-mono text-zinc-300 leading-relaxed space-y-2 pr-1 scrollbar-thin scrollbar-thumb-orange-500/20">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {lyricText}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
