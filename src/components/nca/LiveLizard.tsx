import NCACanvas from './NCACanvas';
import weights from '../../assets/nca/lizard.json';
export interface LiveLizardProps {
  paused: boolean;
  onReady: () => void;
  onError: (error: Error) => void;
}
export default function LiveLizard(props: LiveLizardProps) {
  // Keep the simulation domain stable across responsive layouts. CSS sizes the presentation.
  return <NCACanvas width={96} height={96} weights={weights} transparent
    revealAfterSteps={100} className="nca-canvas" {...props} />;
}
