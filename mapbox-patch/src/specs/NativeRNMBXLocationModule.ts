import { type TurboModule, TurboModuleRegistry } from 'react-native';

type LocationEvent = {
  type: string; //"userlocationdupdated"
  payload: {
    coords: {
      latitude: number;
      longitude: number;
      altitude: number;
      accuracy: number;
      speed: number;
      heading: number;
    };
    timestamp: number;
  };
};

export interface Spec extends TurboModule {
  start(minDisplacement: number): void;
  stop(): void;
  setRequestsAlwaysUse(requestsAlwaysUse: boolean): void;
  setMinDisplacement(minDisplacement: number): void;
  getLastKnownLocation(): Promise<LocationEvent['payload']>;
  simulateHeading(changesPerSecond: number, increment: number): void;
  setLocationEventThrottle(throttle: number): void;

  // Fixed: Use standard TurboModule event pattern instead of EventEmitter type reference
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNMBXLocationModule');
