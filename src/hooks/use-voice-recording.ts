import { useState, useRef, useCallback, useEffect } from "react";
import { transcribeAudio } from "@/lib/ai/transcription";

export interface VoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  audioBlob: Blob | null;
  transcribedText: string;
  error: string | null;
  audioLevel: number;
  duration: number;
}

export interface VoiceRecordingActions {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  processRecording: () => Promise<string | null>;
  clearRecording: () => void;
}

export function useVoiceRecording(): VoiceRecordingState &
  VoiceRecordingActions {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcribedText, setTranscribedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Reset refs
    mediaRecorderRef.current = null;
    analyserRef.current = null;
    startTimeRef.current = null;

    // Reset audio level
    setAudioLevel(0);
  }, []);

  // Audio level monitoring
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average audio level
    const average =
      dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1

    setAudioLevel(normalizedLevel);

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
    }
  }, [isRecording]);

  // Duration tracking
  const updateDuration = useCallback(() => {
    if (startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      setDuration(Math.floor(elapsed / 1000));
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setIsRecording(true);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Set up audio context for visualization
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, {
          type: "audio/webm;codecs=opus",
        });
        setAudioBlob(audioBlob);
        setIsRecording(false);
        cleanup();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      // Start monitoring audio level
      monitorAudioLevel();

      // Start duration tracking
      startTimeRef.current = Date.now();
      setDuration(0);
      durationIntervalRef.current = setInterval(updateDuration, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start recording"
      );
      setIsRecording(false);
      cleanup();
    }
  }, [cleanup, monitorAudioLevel, updateDuration]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const processRecording = useCallback(async (): Promise<string | null> => {
    if (!audioBlob) {
      setError("No audio recording to process");
      return null;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const result = await transcribeAudio(audioBlob);

      if (result.error) {
        setError(result.error);
        return null;
      }

      setTranscribedText(result.text);
      return result.text;
    } catch (err) {
      console.error("Error processing recording:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process recording";
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [audioBlob]);

  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    setTranscribedText("");
    setError(null);
    setDuration(0);
    setIsProcessing(false);
    cleanup();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isRecording,
    isProcessing,
    audioBlob,
    transcribedText,
    error,
    audioLevel,
    duration,
    startRecording,
    stopRecording,
    processRecording,
    clearRecording,
  };
}
