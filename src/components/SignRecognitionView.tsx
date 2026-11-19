import { useCallback, useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle2,
  Hand,
  Info,
  Loader2,
  RotateCcw,
  Search,
  Trash2,
  Volume2,
} from 'lucide-react';
import { SUPPORTED_GESTURES } from '../data/gestures';
import { ClassificationResult, NavSection, TtsSettings } from '../types';
import {
  classifyHandGesture,
  drawHandLandmarks,
} from '../utils/gestureClassifier';
import { isSpeechSynthesisSupported, speakText } from '../utils/speech';
import { SignImage } from './SignImage';

interface SignRecognitionViewProps {
  transcript: string;
  onWordRecognized: (word: string, confidence: number) => void;
  onClearTranscript: () => void;
  ttsSettings: TtsSettings;
  onUpdateTtsSettings: (next: TtsSettings) => void;
  onNavigate: (section: NavSection) => void;
}

type CameraStatus = 'idle' | 'loading' | 'running' | 'error';

const MODEL_ASSET_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const HOLD_DURATION_MS = 550;
const COOLDOWN_MS = 1600;

export function SignRecognitionView({
  transcript,
  onWordRecognized,
  onClearTranscript,
  ttsSettings,
  onUpdateTtsSettings,
  onNavigate,
}: SignRecognitionViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const isRunningRef = useRef<boolean>(false);

  // Gesture hold stability tracking refs
  const candidateIdRef = useRef<string | null>(null);
  const candidateStartRef = useRef<number>(0);
  const lastCommittedRef = useRef<{ id: string; time: number }>({
    id: '',
    time: 0,
  });

  // Latest prop callbacks in refs to avoid restarting animation loop
  const onWordRecognizedRef = useRef(onWordRecognized);
  const ttsSettingsRef = useRef(ttsSettings);
  useEffect(() => {
    onWordRecognizedRef.current = onWordRecognized;
  }, [onWordRecognized]);
  useEffect(() => {
    ttsSettingsRef.current = ttsSettings;
  }, [ttsSettings]);

  const [status, setStatus] = useState<CameraStatus>('idle');
  const [loadingMessage, setLoadingMessage] = useState(
    'Initializing MediaPipe Hands...'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [liveResult, setLiveResult] = useState<ClassificationResult | null>(
    null
  );
  const [lastConfirmed, setLastConfirmed] =
    useState<ClassificationResult | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [guideQuery, setGuideQuery] = useState('');

  const filteredGuideGestures = guideQuery.trim()
    ? SUPPORTED_GESTURES.filter(
        (g) =>
          g.word.toLowerCase().includes(guideQuery.trim().toLowerCase()) ||
          g.shortCue.toLowerCase().includes(guideQuery.trim().toLowerCase())
      )
    : SUPPORTED_GESTURES;

  const stopCamera = useCallback(() => {
    isRunningRef.current = false;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    candidateIdRef.current = null;
    candidateStartRef.current = 0;
    lastVideoTimeRef.current = -1;
    setHandDetected(false);
    setLiveResult(null);
    setHoldProgress(0);
    setStatus('idle');
  }, []);

  const ensureLandmarker = useCallback(async (): Promise<HandLandmarker> => {
    if (landmarkerRef.current) {
      return landmarkerRef.current;
    }

    setLoadingMessage('Loading MediaPipe Hands model...');

    let vision;
    try {
      vision = await FilesetResolver.forVisionTasks('/mediapipe-wasm');
    } catch {
      vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm'
      );
    }

    try {
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_ASSET_URL,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.55,
      });
      landmarkerRef.current = landmarker;
      return landmarker;
    } catch {
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_ASSET_URL,
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.55,
      });
      landmarkerRef.current = landmarker;
      return landmarker;
    }
  }, []);

  const runDetectionLoop = useCallback(() => {
    if (!isRunningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;

    if (video && canvas && landmarker && video.readyState >= 2) {
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext('2d');

      if (ctx && video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const nowMs = performance.now();
        const detection = landmarker.detectForVideo(video, nowMs);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const firstHand = detection.landmarks?.[0];
        if (firstHand && firstHand.length === 21) {
          setHandDetected(true);
          const classification = classifyHandGesture(firstHand);

          drawHandLandmarks(
            ctx,
            firstHand,
            canvas.width,
            canvas.height,
            Boolean(classification)
          );

          setLiveResult(classification);

          if (classification) {
            if (candidateIdRef.current !== classification.gestureId) {
              candidateIdRef.current = classification.gestureId;
              candidateStartRef.current = nowMs;
              setHoldProgress(0);
            } else {
              const elapsed = nowMs - candidateStartRef.current;
              const progress = Math.min(1, elapsed / HOLD_DURATION_MS);
              setHoldProgress(progress);

              const sinceLastCommit = nowMs - lastCommittedRef.current.time;
              const isSameAsRecent =
                lastCommittedRef.current.id === classification.gestureId &&
                sinceLastCommit < COOLDOWN_MS;

              if (elapsed >= HOLD_DURATION_MS && !isSameAsRecent) {
                lastCommittedRef.current = {
                  id: classification.gestureId,
                  time: nowMs,
                };
                candidateStartRef.current = nowMs + COOLDOWN_MS;
                setHoldProgress(1);
                setLastConfirmed(classification);
                onWordRecognizedRef.current(
                  classification.word,
                  classification.confidence
                );

                if (ttsSettingsRef.current.autoSpeak) {
                  speakText(classification.word, ttsSettingsRef.current);
                }
              }
            }
          } else {
            candidateIdRef.current = null;
            candidateStartRef.current = 0;
            setHoldProgress(0);
          }
        } else {
          setHandDetected(false);
          setLiveResult(null);
          candidateIdRef.current = null;
          candidateStartRef.current = 0;
          setHoldProgress(0);
        }
      }
    }

    rafRef.current = requestAnimationFrame(runDetectionLoop);
  }, []);

  const startCamera = useCallback(async () => {
    setErrorMessage(null);
    setStatus('loading');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('error');
      setErrorMessage(
        'Webcam access is not supported in this browser or context. Please use a modern browser over HTTPS or localhost.'
      );
      return;
    }

    try {
      setLoadingMessage('Requesting webcam permission...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 960 },
          height: { ideal: 540 },
        },
        audio: false,
      });

      streamRef.current = stream;

      await ensureLandmarker();

      const video = videoRef.current;
      if (!video) {
        stopCamera();
        return;
      }

      video.srcObject = stream;
      await video.play();

      isRunningRef.current = true;
      setStatus('running');
      rafRef.current = requestAnimationFrame(runDetectionLoop);
    } catch (err) {
      stopCamera();
      setStatus('error');

      if (err instanceof DOMException) {
        if (
          err.name === 'NotAllowedError' ||
          err.name === 'PermissionDeniedError'
        ) {
          setErrorMessage(
            'Camera permission was denied. Please allow camera access in your browser address bar and click Try Again.'
          );
          return;
        }
        if (
          err.name === 'NotFoundError' ||
          err.name === 'DevicesNotFoundError'
        ) {
          setErrorMessage(
            'No webcam was detected on this device. Connect a camera and try again.'
          );
          return;
        }
        if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setErrorMessage(
            'Your webcam is currently being used by another application or browser tab. Close the other camera stream and retry.'
          );
          return;
        }
      }

      setErrorMessage(
        'Could not start hand tracking. Check your camera permissions and internet connection (required once to load the MediaPipe model), then retry.'
      );
    }
  }, [ensureLandmarker, runDetectionLoop, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, [stopCamera]);

  const handleSpeakTranscript = () => {
    if (!transcript.trim()) return;
    speakText(transcript, ttsSettings);
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign Language Recognition
          </h1>
          <p className="text-sm text-slate-600">
            Position one hand clearly inside the webcam frame and hold a
            supported sign briefly to translate it into text.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={ttsSettings.autoSpeak}
              onChange={(e) =>
                onUpdateTtsSettings({
                  ...ttsSettings,
                  autoSpeak: e.target.checked,
                })
              }
              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Auto-Speak</span>
          </label>

          {status === 'running' || status === 'loading' ? (
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <CameraOff className="w-4 h-4 shrink-0" />
              <span>Stop Camera</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Camera className="w-4 h-4 shrink-0" />
              <span>Start Camera</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left 2 columns: Live Video + Recognized Output */}
        <div className="xl:col-span-2 space-y-5">
          {/* Live Camera Viewport */}
          <div className="bg-slate-950 border border-slate-200 rounded-2xl overflow-hidden relative aspect-video">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover -scale-x-100 ${
                status === 'running' ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none ${
                status === 'running' ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Idle Overlay */}
            {status === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-slate-200 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                  <Camera className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md">
                  <p className="text-base font-semibold text-white">
                    Camera Ready
                  </p>
                  <p className="text-sm text-slate-400">
                    Click Start Camera to activate MediaPipe Hands tracking. All
                    video processing runs locally inside your browser.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors whitespace-nowrap"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Recognition</span>
                </button>
              </div>
            )}

            {/* Loading Overlay */}
            {status === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/95 text-white space-y-3">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                <p className="text-sm font-medium">{loadingMessage}</p>
                <p className="text-xs text-slate-400">
                  First-time initialization may take a few seconds.
                </p>
              </div>
            )}

            {/* Error Overlay */}
            {status === 'error' && (
              <div
                role="alert"
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-white space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-md">
                  <p className="text-base font-semibold text-white">
                    Unable to Access Camera
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            )}

            {/* Live Overlay HUD when running */}
            {status === 'running' && (
              <>
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                  <div className="bg-slate-950/75 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>
                      {handDetected
                        ? 'Hand detected · 21 landmarks'
                        : 'Camera active · Show one hand'}
                    </span>
                  </div>

                  {liveResult && (
                    <div className="bg-blue-600/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums font-medium">
                      {Math.round(liveResult.confidence * 100)}% match
                    </div>
                  )}
                </div>

                {/* Bottom scrim readout when a gesture is being held */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-transparent pt-10 pb-3.5 px-4 pointer-events-none">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-300">
                        {liveResult
                          ? 'Detected sign (hold briefly to add)'
                          : handDetected
                          ? 'Adjust handshape to match a supported sign'
                          : 'Waiting for hand in frame'}
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight mt-0.5">
                        {liveResult ? liveResult.word : '—'}
                      </p>
                    </div>

                    {liveResult && (
                      <div className="w-28 sm:w-36 space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-200 tabular-nums">
                          <span>Confirming</span>
                          <span>{Math.round(holdProgress * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-400 transition-all duration-75"
                            style={{ width: `${Math.round(holdProgress * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Current Recognition & Transcript Box */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Latest Confirmed Word
                </p>
                <div className="flex items-center gap-2.5 mt-1">
                  <span className="text-2xl font-bold text-slate-900 font-display">
                    {lastConfirmed ? lastConfirmed.word : 'None yet'}
                  </span>
                  {lastConfirmed && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Added to transcript</span>
                    </span>
                  )}
                </div>
                {lastConfirmed && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Matched rule: {lastConfirmed.summary}
                  </p>
                )}
              </div>

              {lastConfirmed && (
                <button
                  type="button"
                  onClick={() => speakText(lastConfirmed.word, ttsSettings)}
                  disabled={!isSpeechSynthesisSupported()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
                >
                  <Volume2 className="w-4 h-4 shrink-0" />
                  <span>Speak Word</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">
                  Translated Output
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('tts')}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
                >
                  Open full Text-to-Speech
                </button>
              </div>

              <div className="min-h-[76px] rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-base text-slate-900 leading-relaxed">
                {transcript.trim() ? (
                  transcript
                ) : (
                  <span className="text-slate-400 text-sm">
                    Confirmed gestures will appear here automatically and sync
                    with Text-to-Speech.
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSpeakTranscript}
                  disabled={!transcript.trim() || !isSpeechSynthesisSupported()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  <Volume2 className="w-4 h-4 shrink-0" />
                  <span>Speak All</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClearTranscript();
                    setLastConfirmed(null);
                  }}
                  disabled={!transcript.trim()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </section>

          {/* Transparent Prototype Notice */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-slate-700">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-semibold text-slate-900">
                Limited Prototype Note:
              </strong>{' '}
              MediaPipe Hands tracks 21 3D hand keypoints—it does not natively
              understand sign language. SignBridge applies geometric
              classification rules on top of those landmarks to recognize the{' '}
              {SUPPORTED_GESTURES.length} gestures listed on the right.
            </p>
          </div>
        </div>

        {/* Right column: Supported Gesture Reference Guide */}
        <aside className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Supported Gestures
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {SUPPORTED_GESTURES.length} poses · Hold ~0.5s to add
              </p>
            </div>
            <Hand className="w-4 h-4 text-blue-600 shrink-0" />
          </div>

          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={guideQuery}
                onChange={(e) => setGuideQuery(e.target.value)}
                placeholder="Filter 20 gestures..."
                aria-label="Filter supported gestures"
                className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {filteredGuideGestures.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No gestures match &ldquo;{guideQuery}&rdquo;.
              </div>
            ) : (
              filteredGuideGestures.map((gesture) => {
                const isMatchedNow = liveResult?.gestureId === gesture.id;
                return (
                  <div
                    key={gesture.id}
                    className={`p-3.5 flex items-center gap-3.5 transition-colors ${
                      isMatchedNow ? 'bg-blue-50/80' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                      <SignImage
                        src={gesture.imageUrl}
                        alt={`${gesture.word} gesture`}
                        label={gesture.word}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isMatchedNow ? 'text-blue-700' : 'text-slate-900'
                          }`}
                        >
                          {gesture.word}
                        </p>
                        {isMatchedNow && (
                          <span className="text-[11px] font-medium text-blue-700 shrink-0">
                            Matched
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-snug mt-0.5">
                        {gesture.shortCue}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
