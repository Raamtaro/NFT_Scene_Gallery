import * as THREE from 'three'
import { GLTF } from "three/examples/jsm/Addons.js"
import Sizes from '../utils/emitters/sizes';
import TimeKeeper from '../utils/emitters/timeKeeper';
import Mouse from '../utils/mouse.ts';
import FinalScene from './finalScene/finalScene.ts';


import Renderer from './renderer.ts';
import Camera from './camera.ts';


import Resources from '../utils/emitters/resourceLoader/resources.ts';
import ParticleSystem from './particles/main/particleSystem.ts';
import DisplayCase from './glass/DisplayCase.ts';
import gsap from 'gsap';

type ResourceFile = GLTF | THREE.Texture

declare global {
    interface Window {
      experience: Experience;
    }
}

interface ParticleDisplayPairs {
    particleSystem: ParticleSystem
    displayCase: DisplayCase
    target?: THREE.WebGLRenderTarget
    scene?: THREE.Scene
    text: string
}


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

    public ultimateScene: FinalScene
    public particleDisplayPairings: ParticleDisplayPairs[] = []
    public headerGroup: HTMLElement = document.querySelector('.header-group') as HTMLElement

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
        this.ultimateScene = new FinalScene()

        
        this.resources.on('ready', this.init.bind(this))
         
    }

    public static getInstance(): Experience {
        if (!Experience.instance) {
            Experience.instance = new Experience()

        }

        return Experience.instance
    }

    private init(): void {

        this.setUpPairings()
        this.setupScenes()
        this.compileScenes()

        // this.scene.add(this.particleDisplayPairings[0].particleSystem.points as THREE.Points)
        // this.scene.add(this.particleDisplayPairings[0].displayCase.instance as THREE.Mesh)
        // this.headerGroup.innerText = this.particleDisplayPairings[0].text

        // this.scene.add(this.particleDisplayPairings[1].particleSystem.points as THREE.Points)
        // this.scene.add(this.particleDisplayPairings[1].displayCase.instance as THREE.Mesh)
        // this.headerGroup.innerText = this.particleDisplayPairings[1].text

        // this.scene.add(this.particleDisplayPairings[2].particleSystem.points as THREE.Points)
        // this.scene.add(this.particleDisplayPairings[2].displayCase.instance as THREE.Mesh)
        // this.headerGroup.innerText = this.particleDisplayPairings[2].text

        gsap.to(
            document.querySelector("header"),
            {
                opacity: 1.0,
                ease: 'power2.inOut',
                duration: 1.95,
            }
        )
        
        this.time.on('tick', this.render.bind(this))
        this.size.on('resize', this.resize.bind(this))
    }

    private setUpPairings(): void {
        this.particleDisplayPairings.push(
            {
                particleSystem: new ParticleSystem(
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
                            uSize: 0.001,
                            uFrequency: .15,
                            uAmplitude: 4.05,
                            uMaxDistance: 4.55
                        },
                        onUpdate(points, time) {
                            points!.rotation.y -= time!.uniformDelta  * 0.05
                        }
                    }
                ),
                displayCase: new DisplayCase(
                    {
                        geometry: new THREE.SphereGeometry(6, 100, 100), 
                        smallSize: new THREE.Vector3(.125, .125, .125),
                        baseSize: new THREE.Vector3(.195, .195, .195),
                        resizeBreakpoint: 640,
                        uniformConfig: {
                            factors: {
                                uLightFactor: 0.00,
                                uFresnelFactor: 0.00
                            }
                        }
                    }
                ),
                text: 'BLOOM'
            },
            {
                particleSystem: new ParticleSystem(
                    {
                        geometry: new THREE.IcosahedronGeometry(2, 100),
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
                ),
                displayCase: new DisplayCase(
                    {
                        geometry: new THREE.TetrahedronGeometry(5.75, 0), 
                        smallSize: new THREE.Vector3(.125, .125, .125),
                        baseSize: new THREE.Vector3(.195, .195, .195),
                        resizeBreakpoint: 640,
                        uniformConfig: {
                            factors: {
                                uLightFactor: 1.00,
                                uFresnelFactor: 1.00
                            }
                        } 
                    }
                ),
                text: 'WINGS'
            },
            {
                particleSystem: new ParticleSystem(
                    {
                        geometry: this.extractGeometryFromResourceFile('female'),
                        baseVector: new THREE.Vector3(0.075, 0.075, 0.075),
                        smallVector: new THREE.Vector3(0.05, 0.05, 0.05),
                        resizeBreakpoint: 640,
                        gpgpuConfig: {
                            uFlowFieldInfluence: 0.504,
                            uFlowFieldStrength: 0.05,
                            uFlowFieldFrequency: .772
                        },
                        particleConfig: {
                            uSize: 0.003,
                            uFrequency: 2.35,
                            uAmplitude: 3.05,
                            uMaxDistance: 3.05
                        },
                        onUpdate(points, time, mouse) {
                            points!.rotation.x = (-mouse!.coords_trail.y * 0.25 + Math.PI / 16) + Math.sin(points!.rotation.y + time!.uniformElapsed * 0.4) * 0.05
                            points!.rotation.y = mouse!.coords_trail.x * 0.225;
                            
                            
                        }
                    }
                ),
                displayCase: new DisplayCase(
                    {
                        geometry: new THREE.OctahedronGeometry(6.25, 0), 
                        smallSize: new THREE.Vector3(.125, .125, .125),
                        baseSize: new THREE.Vector3(.195, .195, .195),
                        resizeBreakpoint: 640,
                        uniformConfig: {
                            factors: {
                                uLightFactor: 1.00,
                                uFresnelFactor: 1.00
                            }
                        } 
                    }
                ),
                text: 'FEMME'
            }
        )
    }

    private setupScenes(): void {
        this.particleDisplayPairings.forEach(
            (pairing) => {
                pairing.scene = new THREE.Scene()
                pairing.scene.add(pairing.particleSystem.points as THREE.Points)
                pairing.scene.add(pairing.displayCase.instance as THREE.Mesh)
                pairing.scene.add(this.camera.instance)
            }
        )
    }

    private compileScenes(): void {
        this.particleDisplayPairings.forEach(
            (pairing) => {
                this.renderer.instance.compile(pairing.scene as THREE.Scene, this.camera.instance)
                pairing.target = new THREE.WebGLRenderTarget(this.size.width * this.size.pixelRatio, this.size.height * this.size.pixelRatio, 
                    {
                        type: THREE.FloatType,
                    }
                )
                pairing.target.texture.generateMipmaps = false
            }
        )
    }

    private runPipelineOnEachPairing(): void {
        this.particleDisplayPairings.forEach(
            (pairing) => {
                this.runPipeline(pairing)
                
            }
            
        )
        this.renderer.instance.setRenderTarget(null)

        
    }

    private runPipeline(pairing: ParticleDisplayPairs): void {
        this.renderer.instance.setRenderTarget(pairing.target as THREE.WebGLRenderTarget);
        this.renderer.instance.render(pairing.scene as THREE.Scene, this.camera.instance);
        // this.renderer.instance.setRenderTarget(null)
        
    }

    private updateFinalSceneUniforms(): void {
        this.ultimateScene.material.uniforms.uSceneOneTexture.value = this.particleDisplayPairings[0].target!.texture
        this.ultimateScene.material.uniforms.uSceneTwoTexture.value = this.particleDisplayPairings[1].target!.texture
        this.ultimateScene.material.uniforms.uSceneThreeTexture.value = this.particleDisplayPairings[2].target!.texture
        this.ultimateScene.material.uniforms.uRenderedScene.value = this.particleDisplayPairings[2].target!.texture
        this.ultimateScene.material.uniforms.uNextScene.value = this.particleDisplayPairings[0].target!.texture
    }

    private resize(): void {
        this.particleDisplayPairings.forEach(
            (pairing) => {
                pairing.target!.setSize(this.size.width * this.size.pixelRatio, this.size.height * this.size.pixelRatio)
            }
        )
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

        this.runPipelineOnEachPairing()
        this.updateFinalSceneUniforms()


        // this.renderer.instance.render(this.scene, this.camera.instance)
        
        this.renderer.instance.render(this.ultimateScene.instance, this.ultimateScene.camera)

    }
}

export default Experience