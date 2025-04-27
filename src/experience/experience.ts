import * as THREE from 'three'
import { GLTF } from "three/examples/jsm/Addons.js"
import Sizes from '../utils/emitters/sizes';
import TimeKeeper from '../utils/emitters/timeKeeper';
import Mouse from '../utils/mouse.ts';


import Renderer from './renderer.ts';
import Camera from './camera.ts';


import Resources from '../utils/emitters/resourceLoader/resources.ts';
import ParticleSystem from './particles/main/particleSystem.ts';
import DisplayCase from './glass/DisplayCase.ts';
import gsap from 'gsap';

// import sceneConfig from './sceneConfig.ts';

type ResourceFile = GLTF | THREE.Texture

// interface ResourceDictionary {
//     [name: string]: ResourceFile
// }

declare global {
    interface Window {
      experience: Experience;
    }
}

// interface SceneObject {
//     scene: Scene,
//     target?: WebGLRenderTarget
// }

class Experience {

    private static instance: Experience | null = null

    public canvas: HTMLCanvasElement
    public size: Sizes 
    public time: TimeKeeper
    public renderer: Renderer 
    public camera: Camera
    public mouse: Mouse
    public scene: THREE.Scene
    public resources: Resources
    public particleSphere: ParticleSystem
    public particleOm: ParticleSystem | null = null
    public particleLotus: ParticleSystem | null = null
    public displayCase: DisplayCase

    constructor() {

        Experience.instance = this

        this.canvas = document.querySelector('canvas') as HTMLCanvasElement;
        this.size = new Sizes()
        this.time = new TimeKeeper()
        this.mouse = new Mouse()
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.scene = new THREE.Scene()
        this.resources = new Resources()
        

        this.particleSphere = new ParticleSystem(
            {
                geometry: new THREE.IcosahedronGeometry(2, 100),
                // geometry: new THREE.BoxGeometry(6, 6, 6, 256, 256, 256),
                baseVector: new THREE.Vector3(0.125, 0.125, 0.125),
                smallVector: new THREE.Vector3(0.05, 0.05, 0.05),
                resizeBreakpoint: 640,
                gpgpuConfig: {
                    uFlowFieldInfluence: 0.504,
                    uFlowFieldStrength: 0.35,
                    uFlowFieldFrequency: .772
                },
                particleConfig: {
                    uSize: 0.003,
                    uFrequency: .95,
                    uAmplitude: 3.05,
                    uMaxDistance: 3.35
                },
                onUpdate(points, time) {
                    points!.rotation.y -= time!.uniformDelta  * 0.05
                    points!.rotation.x += time!.uniformDelta  * 0.05
                }
            }
        )
        this.displayCase = new DisplayCase(
            {
                // geometry: new THREE.OctahedronGeometry(7.75, 0),
                geometry: new THREE.SphereGeometry(6, 100, 100),
                smallSize: new THREE.Vector3(.125, .125, .125),
                baseSize: new THREE.Vector3(.195, .195, .195),
                resizeBreakpoint: 640
            }
        )

        
        this.resources.on('ready', this.init.bind(this))
         
    }

    public static getInstance(): Experience {
        if (!Experience.instance) {
            Experience.instance = new Experience()

        }

        return Experience.instance
    }

    private init(): void {

        this.particleOm = new ParticleSystem(
            {
                geometry: this.extractGeometryFromResourceFile('om'),
                baseVector: new THREE.Vector3(0.1295, 0.1295, 0.1295),
                smallVector: new THREE.Vector3(0.07, 0.07, 0.07),
                resizeBreakpoint: 640,
                gpgpuConfig: {
                    uFlowFieldInfluence: 0.504,
                    uFlowFieldStrength: 1.95,
                    uFlowFieldFrequency: .272
                },
                particleConfig: {
                    uSize: 0.001,
                    uFrequency: .85,
                    uAmplitude: 3.05,
                    uMaxDistance: 3.95
                },
                onUpdate(points, time) {
                    // points!.rotation.y -= time!.uniformDelta  * 0.05
                    points!.rotation.x = 0.23 * Math.sin(time!.uniformElapsed  * 0.5)
                }
            }
        )

        this.particleLotus = new ParticleSystem(
            {
                geometry: this.extractGeometryFromResourceFile('lotus'),
                baseVector: new THREE.Vector3(0.125, 0.125, 0.125),
                smallVector: new THREE.Vector3(0.07, 0.07, 0.07),
                resizeBreakpoint: 640,
                gpgpuConfig: {
                    uFlowFieldInfluence: 0.504,
                    uFlowFieldStrength: 1.15,
                    uFlowFieldFrequency: .272
                },
                particleConfig: {
                    uSize: 0.002,
                    uFrequency: .85,
                    uAmplitude: 3.05,
                    uMaxDistance: 3.95
                },
                onUpdate(points, time) {
                    points!.rotation.y -= time!.uniformDelta  * 0.05
                    // points!.rotation.x = 0.23 * Math.sin(time!.uniformElapsed  * 0.5)
                }
            }
        )

        
        console.log(this.extractGeometryFromResourceFile('tree'))

        this.scene.add(this.particleSphere.points as THREE.Points)

        gsap.to(
            document.querySelector("header"),
            {
                opacity: 1.0,
                ease: 'power2.inOut',
                duration: 1.95,
            }
        )



        this.time.on('tick', this.render.bind(this))
    }

    private extractGeometryFromResourceFile(name: string): THREE.BufferGeometry {
        let model: ResourceFile = this.resources.items[name] as GLTF
        let geometry: THREE.BufferGeometry | null = null
            model.scene.traverse((child)=> {
                if (child instanceof THREE.Mesh) {
                    geometry = child.geometry
                    return
                }
            })

            if (!geometry) {
                throw new Error(`No mesh geometry found for model: ${name}`)
            }

            return geometry 

    }

    private render(): void {
        this.renderer.instance.render(this.scene, this.camera.instance)

    }
}

export default Experience