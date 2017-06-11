import { audioContext } from './webaudio';

export const requirements = [
  {
    title: 'Web Audio API',
    description: 'The Web Audio API is necessary to record and play sounds.',
    link: 'http://caniuse.com/#feat=audio-api',
    isSupported: !!audioContext
  },
  {
    title: 'getUserMedia/Stream API',
    description: 'The getUserMedia/Stream API is necessary to record sound from your microphone.',
    link: 'http://caniuse.com/#feat=stream',
    isSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }
];

export const allRequirementsAreSupported = requirements.reduce((value, requirement) => value ? requirement.isSupported : false, true);
