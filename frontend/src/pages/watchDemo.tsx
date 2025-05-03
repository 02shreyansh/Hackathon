declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: unknown;
  }
}
import { useState, useRef, useEffect, SetStateAction } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, FastForward, Volume2, VolumeX, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const WatchDemoPage = () => {
const navigate=useNavigate();
const [isPlaying, setIsPlaying] = useState(false);
const [isMuted, setIsMuted] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);
const [activeTab, setActiveTab] = useState("phase1");
const playerRef = useRef<YT.Player | null>(null);
useEffect(() => {
  window.onYouTubeIframeAPIReady = () => {
    playerRef.current = new window.YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      videoId: 'doF7kMLdo0g',
      playerVars: {
        'playsinline': 1,
        'controls': 0,
        'rel': 0,
        'showinfo': 0,
        'modestbranding': 1,
        'enablejsapi': 1
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  };
  if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  } else {
    window.onYouTubeIframeAPIReady();
  }

  return () => {
    if (playerRef.current) {
      playerRef.current.destroy();
    }
    delete window.onYouTubeIframeAPIReady;
  };
}, []);

// Update current time periodically when playing
useEffect(() => {
  let intervalId: string | number | NodeJS.Timeout | undefined;
  
  if (isPlaying) {
    intervalId = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 1000);
  }
  
  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, [isPlaying]);

const onPlayerReady = (event: { target: { getDuration: () => SetStateAction<number>; }; }) => {
  setDuration(event.target.getDuration());
};

const onPlayerStateChange = (event: { data: unknown; }) => {
  // Update play/pause state
  switch (event.data) {
    case window.YT.PlayerState.PLAYING:
      setIsPlaying(true);
      break;
    case window.YT.PlayerState.PAUSED:
    case window.YT.PlayerState.ENDED:
      setIsPlaying(false);
      break;
  }
};

const togglePlay = () => {
  if (playerRef.current) {
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }
};

const toggleMute = () => {
  if (playerRef.current) {
    if (isMuted) {
      playerRef.current.unMute();
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  }
};

const fastForward = () => {
  if (playerRef.current) {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10, true);
  }
};

const rewind = () => {
  if (playerRef.current) {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10, true);
  }
};

const handleSeek = (e: { currentTarget: unknown; clientX: number; }) => {
  if (playerRef.current && duration > 0) {
    const seekBar = e.currentTarget as HTMLDivElement;
    const rect = seekBar.getBoundingClientRect();
    const seekPos = (e.clientX - rect.left) / rect.width;
    const seekTime = duration * seekPos;
    playerRef.current.seekTo(seekTime, true);
  }
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

return (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Side - Video Player */}
        <div className="w-full md:w-2/3 flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Bank Reconciliation Tool Demo</CardTitle>
              <CardDescription>
                Watch a demonstration of our powerful CSV matching engine for financial reconciliation
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="relative w-full rounded-md overflow-hidden bg-black aspect-video">
                {/* YouTube Player */}
                <div id="youtube-player" className="absolute top-0 left-0 w-full h-full"></div>
                
                {/* Custom player overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 transition-opacity hover:opacity-100 opacity-80 z-10">
                  {/* Progress bar */}
                  <div 
                    className="w-full h-1 bg-gray-700 rounded-full cursor-pointer mb-2"
                    onClick={handleSeek}
                  >
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    ></div>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={rewind} className="text-white h-8 w-8">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white h-8 w-8">
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={fastForward} className="text-white h-8 w-8">
                        <FastForward className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white h-8 w-8">
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="text-white text-xs">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full flex justify-between">
                <Button variant="outline">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right Side - Features Tabs */}
        <div className="w-full md:w-1/3 mt-4 md:mt-0">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
              <CardDescription>Learn about the different phases of our solution</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="phase1" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="phase1">Phase 1</TabsTrigger>
                  <TabsTrigger value="phase2">Phase 2</TabsTrigger>
                  <TabsTrigger value="phase3">Phase 3</TabsTrigger>
                </TabsList>
                
                <TabsContent value="phase1" className="space-y-4">
                  <h3 className="font-bold">Basic MVP - Manual Upload & Matching</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-1 rounded mr-2 text-xs">📁</span>
                      <div>
                        <p className="font-medium">File Upload Interface</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Upload bank.csv and ledger.csv with file preview</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-1 rounded mr-2 text-xs">🧠</span>
                      <div>
                        <p className="font-medium">CSV Matching Engine</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Clean data and apply fuzzy matching logic with confidence scores</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 p-1 rounded mr-2 text-xs">📊</span>
                      <div>
                        <p className="font-medium">Reconciliation Table</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Color-coded display of matched and unmatched entries</p>
                      </div>
                    </li>
                  </ul>
                </TabsContent>
                
                <TabsContent value="phase2" className="space-y-4">
                  <h3 className="font-bold">Feedback Loop + Agentic Escalation</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 p-1 rounded mr-2 text-xs">🧑‍🏫</span>
                      <div>
                        <p className="font-medium">User Feedback Mechanism</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Confirm/reject matches and link correct ones</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-1 rounded mr-2 text-xs">🧠</span>
                      <div>
                        <p className="font-medium">Learning System</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Save feedback locally to tune matching heuristics</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-1 rounded mr-2 text-xs">🚨</span>
                      <div>
                        <p className="font-medium">Escalation Logic</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Flag low-confidence matches for user review</p>
                      </div>
                    </li>
                  </ul>
                </TabsContent>
                
                <TabsContent value="phase3" className="space-y-4">
                  <h3 className="font-bold">Reporting & PDF Export</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 p-1 rounded mr-2 text-xs">📄</span>
                      <div>
                        <p className="font-medium">Report Generator</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Generate PDF reports with match summaries and transaction details</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-1 rounded mr-2 text-xs">📊</span>
                      <div>
                        <p className="font-medium">Monthly Summaries</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Human-readable monthly financial reports</p>
                      </div>
                    </li>
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={()=>navigate("/contact")}>Schedule a Full Demo</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  </div>
);
};

export default WatchDemoPage;
