import { Camera } from 'lucide-react';
import { SUPPORTED_GESTURES } from '../data/gestures';
import { NavSection } from '../types';

interface AboutProjectViewProps {
  onNavigate: (section: NavSection) => void;
}

const TECHNOLOGIES: ReadonlyArray<{ name: string; role: string }> = [
  {
    name: 'React & TypeScript',
    role: 'Modular component-based frontend interface with strict type safety.',
  },
  {
    name: 'Tailwind CSS',
    role: 'Responsive utility-first styling across desktop, tablet, and mobile viewports.',
  },
  {
    name: 'MediaPipe Hands (Tasks Vision)',
    role: 'Real-time on-device 21-point 3D hand landmark detection directly in the browser.',
  },
  {
    name: 'Web Speech API',
    role: 'Native browser text-to-speech synthesis for immediate voice output without external servers.',
  },
  {
    name: 'Browser Local Storage',
    role: 'Lightweight client-side persistence for transcripts, history, and voice preferences.',
  },
  {
    name: 'Lucide React',
    role: 'Consistent, clean vector icons for interface navigation and controls.',
  },
];

export function AboutProjectView({ onNavigate }: AboutProjectViewProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          About SignBridge
        </h1>
        <p className="text-sm text-slate-600">
          College CCA Prototype · AI Sign Language Recognition and Translation
          System
        </p>
      </div>

      {/* Introduction & Problem Statement */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2.5">
          <h2 className="text-lg font-semibold text-slate-900">
            01. Project Introduction
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            SignBridge is a lightweight, browser-based assistive web application
            designed to demonstrate how computer vision and web speech
            technologies can support inclusive communication. Using a standard
            webcam, SignBridge tracks hand landmarks in real time, matches basic
            handshapes to common English words, and speaks the translated text
            aloud.
          </p>
        </div>

        <hr className="border-slate-100" />

        <div className="space-y-2.5">
          <h2 className="text-lg font-semibold text-slate-900">
            02. Problem Statement
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Deaf and hard-of-hearing individuals who rely on sign language often
            face everyday barriers when interacting with people who do not know
            sign language—in classrooms, hospitals, public offices, and retail
            environments. Dedicated interpreters and specialized sensor gloves
            are expensive or unavailable for spontaneous daily conversations.
            There is a need for an accessible, zero-hardware web prototype that
            runs directly on everyday laptops and phones.
          </p>
        </div>

        <hr className="border-slate-100" />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            03. Project Objectives
          </h2>
          <ul className="space-y-2 text-sm sm:text-base text-slate-600 list-disc pl-5">
            <li>
              Capture live video from a user’s webcam safely inside the browser
              with clear permission handling.
            </li>
            <li>
              Detect 21 hand landmarks per frame using MediaPipe Hands without
              requiring a heavy backend server.
            </li>
            <li>
              Classify {SUPPORTED_GESTURES.length} essential everyday gestures
              (including Hello, Welcome, Thank You, Please, Yes, No, OK, Bad, I
              Love You, Peace, Help, Water, Call Me, Wait, Go, and more) into
              readable English text using transparent geometric landmark rules.
            </li>
            <li>
              Convert translated words into spoken audio via the Web Speech API
              and provide an illustrated Text-to-Sign Reference Library.
            </li>
          </ul>
        </div>
      </section>

      {/* Honest Prototype Note */}
      <section className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-6 space-y-2">
        <h2 className="text-base font-semibold text-slate-900">
          Prototype Scope & Transparency
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          MediaPipe Hands detects anatomical hand keypoints rather than full sign
          language grammar. To keep this prototype transparent, fast, and
          beginner-friendly, SignBridge applies a client-side rule-based
          geometric classifier on top of MediaPipe’s 21 landmarks to recognize
          static and angled poses for the {SUPPORTED_GESTURES.length} supported
          gestures. Full natural sign language involves facial expressions,
          two-handed dynamics, and temporal motion sequences that require
          dedicated sequence deep-learning models.
        </p>
      </section>

      {/* Technologies Used */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          04. Technologies Used
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TECHNOLOGIES.map((tech) => (
            <div
              key={tech.name}
              className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                {tech.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {tech.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Future Scope */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          05. Future Scope
        </h2>
        <ul className="space-y-2 text-sm sm:text-base text-slate-600 list-disc pl-5">
          <li>
            Train a sequence model (LSTM / Transformer) on landmark trajectories
            to recognize dynamic motion signs and full-sentence sign grammar.
          </li>
          <li>
            Support two-handed signs, fingerspelling (A–Z), and regional sign
            languages such as ISL (Indian Sign Language) and ASL.
          </li>
          <li>
            Integrate facial expression and upper-body pose landmarks to capture
            non-manual grammatical markers.
          </li>
          <li>
            Add multilingual voice translation and offline Progressive Web App
            (PWA) caching for low-connectivity environments.
          </li>
        </ul>
      </section>

      {/* Local Setup Instructions */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">
            06. Running Locally
          </h2>
          <p className="text-sm text-slate-600">
            Standard steps to install dependencies and start SignBridge on your
            local machine (Node.js 18+ required):
          </p>
        </div>

        <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
{`# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev

# 3. Build for production
npm run build`}
        </pre>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => onNavigate('recognition')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Camera className="w-4 h-4" />
            <span>Launch Sign Recognition</span>
          </button>
        </div>
      </section>
    </div>
  );
}
