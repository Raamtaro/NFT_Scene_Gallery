import * as THREE from 'three'
import { GLTF } from "three/examples/jsm/Addons.js"
import Sizes from '../utils/emitters/sizes';
import TimeKeeper from '../utils/emitters/timeKeeper';
import Mouse from '../utils/mouse.ts';


import Renderer from './renderer.ts';
import Camera from './camera.ts';


import Resources from '../utils/emitters/resourceLoader/resources.ts';
import ParticleSystem from './particles/main/particleSystem.ts';

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
    // public particleSphere: ParticleSystem
    public particleOm: ParticleSystem | null = null

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
        

        // this.particleSphere = new ParticleSystem(
        //     {
        //         geometry: new THREE.IcosahedronGeometry(2, 100),
        //         baseVector: new THREE.Vector3(0.125, 0.125, 0.125),
        //         smallVector: new THREE.Vector3(0.05, 0.05, 0.05),
        //         gpgpuConfig: {
        //             uFlowFieldInfluence: 0.504,
        //             uFlowFieldStrength: 1.35,
        //             uFlowFieldFrequency: .772
        //         },
        //         particleConfig: {
        //             uSize: 0.005,
        //             uFrequency: 2.15,
        //             uAmplitude: 3.05,
        //             uMaxDistance: 3.45
        //         },
        //         onUpdate(points, time) {
        //             points!.rotation.y -= time!.uniformDelta  * 0.05
        //             points!.rotation.x += time!.uniformDelta  * 0.05
        //         }
        //     }
        // )
        
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
                baseVector: new THREE.Vector3(0.075, 0.075, 0.075),
                smallVector: new THREE.Vector3(0.05, 0.05, 0.05),
                gpgpuConfig: {
                    uFlowFieldInfluence: 0.504,
                    uFlowFieldStrength: 1.35,
                    uFlowFieldFrequency: .772
                },
                particleConfig: {
                    uSize: 0.003,
                    uFrequency: .65,
                    uAmplitude: 3.05,
                    uMaxDistance: 2.95
                },
                onUpdate(points, time) {
                    // points!.rotation.y -= time!.uniformDelta  * 0.05
                    points!.rotation.x = Math.sin(time!.uniformDelta  * 0.05)
                }
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