import * as THREE from 'three'
import TimeKeeper from '../utils/emitters/timeKeeper'

const sphereConfig = {
    geometry: new THREE.IcosahedronGeometry(2, 100),
    baseVector: new THREE.Vector3(0.125, 0.125, 0.125),
    smallVector: new THREE.Vector3(0.05, 0.05, 0.05),
    gpgpuConfig: {
        uFlowFieldInfluence: 0.504,
        uFlowFieldStrength: 1.35,
        uFlowFieldFrequency: .772
    },
    particleConfig: {
        uSize: 0.005,
        uFrequency: 2.15,
        uAmplitude: 3.05,
        uMaxDistance: 3.45
    },
    onUpdate(points: THREE.Points, time: TimeKeeper) {
        points!.rotation.y -= time!.uniformDelta  * 0.05
        points!.rotation.x += time!.uniformDelta  * 0.05
    }
}

const omConfig = {
    //Spread this in addition to manually adding the geometry in experience
    baseVector: new THREE.Vector3(0.125, 0.125, 0.125),
    smallVector: new THREE.Vector3(0.07, 0.07, 0.07),
    resizeBreakpoint: 640,
    gpgpuConfig: {
        uFlowFieldInfluence: 0.504,
        uFlowFieldStrength: 1.95,
        uFlowFieldFrequency: .272
    },
    particleConfig: {
        uSize: 0.002,
        uFrequency: .85,
        uAmplitude: 3.05,
        uMaxDistance: 2.95
    },
    onUpdate(points: THREE.Points, time: TimeKeeper) {
        // points!.rotation.y -= time!.uniformDelta  * 0.05
        points!.rotation.x = 0.23 * Math.sin(time!.uniformElapsed  * 0.5)
    }
}


export default {
    sphereConfig, 
    omConfig
}
