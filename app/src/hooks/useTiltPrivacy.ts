import { useState, useEffect, useCallback } from 'react';

interface TiltPrivacyResult {
    isObscured: boolean;
    requestPermission: () => Promise<boolean>;
    needsPermission: boolean;
    permissionGranted: boolean | null;
}

interface TiltPrivacyOptions {
    flatThreshold?: number;    // beta angle below which it blurs (e.g. 25)
    sidewaysThreshold?: number; // gamma angle above which it blurs (e.g. 40)
}

export function useTiltPrivacy(options: TiltPrivacyOptions = {}): TiltPrivacyResult {
    const { flatThreshold = 30, sidewaysThreshold = 35 } = options;
    const [isObscured, setIsObscured] = useState(false);
    const [needsPermission, setNeedsPermission] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if the DeviceOrientationEvent requires permission (iOS 13+)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== 'undefined' && typeof (window as any).DeviceOrientationEvent !== 'undefined' && typeof (window as any).DeviceOrientationEvent.requestPermission === 'function') {
            setNeedsPermission(true);
        } else {
            // For non-iOS devices, permission is generally assumed or not explicitly requestable this way
            setPermissionGranted(true);
        }
    }, []);

    const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
        // event.beta: forward/backward tilt
        // event.gamma: left/right tilt
        const { beta, gamma } = event;

        if (beta === null || gamma === null) return;

        // A typical phone held naturally has a beta of maybe 45-80 degrees.
        // Tilted flat on a table -> beta ~ 0.
        // Tilted sideways -> large gamma -> someone snooping or user turning away.
        const isTiltedFlat = Math.abs(beta) < flatThreshold;
        const isTiltedSideways = Math.abs(gamma) > sidewaysThreshold;

        // Use a small delay/debounce or simple smoothing to prevent flickering
        if (isTiltedFlat || isTiltedSideways) {
            setIsObscured(true);
        } else {
            setIsObscured(false);
        }
    }, [flatThreshold, sidewaysThreshold]);

    useEffect(() => {
        if (permissionGranted) {
            window.addEventListener('deviceorientation', handleOrientation);
        }
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [permissionGranted, handleOrientation]);

    const requestPermission = async (): Promise<boolean> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== 'undefined' && typeof (window as any).DeviceOrientationEvent !== 'undefined' && typeof (window as any).DeviceOrientationEvent.requestPermission === 'function') {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const permissionState = await (DeviceOrientationEvent as any).requestPermission();
                if (permissionState === 'granted') {
                    setPermissionGranted(true);
                    return true;
                } else {
                    setPermissionGranted(false);
                    return false;
                }
            } catch (error) {
                console.error("Error requesting device orientation permission", error);
                return false;
            }
        }
        // If it's a platform that doesn't need explicit interaction-based permission
        setPermissionGranted(true);
        return true;
    };

    return { isObscured, requestPermission, needsPermission, permissionGranted };
}
