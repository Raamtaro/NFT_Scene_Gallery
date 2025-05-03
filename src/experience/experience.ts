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
import NavBar from './navBar/NavButtons.ts';
import Header from './header/Header.ts';

type ResourceFile = GLTF | THREE.Texture

declare global {
    interface Window {
      experience: Experience;
    }
}

interface ParticleDisplayPairs {
    particleSystem: ParticleSystem
    displayCase: DisplayCase
    text: string
}

interface FBOPairs {
    scene?: THREE.Scene
    target?: THREE.WebGLRenderTarget
}


class Experience {

    private static instance: Experience | null = null

    public currentIndex: number = 0

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
    public fboPairs: FBOPairs[] = []  //The indices should correspond to the particleDisplayPairings
    

    public navBar: NavBar | null = null
    public header: Header | null = null

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
        

        
        this.time.on('tick', this.render.bind(this))
        this.size.on('resize', this.resize.bind(this))

        this.header = new Header()
        this.setupNavBar()
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
                            points!.rotation.x = (-mouse!.coords_trail.y * 0.35 + Math.PI / 16) + Math.sin(points!.rotation.y + time!.uniformElapsed * 0.4) * 0.05
                            points!.rotation.y = mouse!.coords_trail.x * 0.325;
                            
                            
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

    private setupNavBar(): void {
        this.navBar = new NavBar()
    }

    private setupScenes(): void {
        this.particleDisplayPairings.forEach(
            (pairing, i) => {
                this.fboPairs.push({})
                this.fboPairs[i].scene = new THREE.Scene() //This line is throwing an uncaught in promise error - cannot set property 'scene' of undefined
                this.fboPairs[i].scene.background = new THREE.Color(0x0E1111)
                pairing.displayCase.fboScene = this.fboPairs[i].scene
                this.fboPairs[i].scene.add(pairing.particleSystem.points as THREE.Points)
                this.fboPairs[i].scene.add(pairing.displayCase.instance as THREE.Mesh)
                this.fboPairs[i].scene.add(this.camera.instance)
            }
        )
    }

    private compileScenes(): void {
        this.fboPairs.forEach(
            (pairing) => {
                this.renderer.instance.compile(pairing.scene as THREE.Scene, this.camera.instance)
                pairing.target = new THREE.WebGLRenderTarget(this.size.width * this.size.pixelRatio, this.size.height * this.size.pixelRatio, 
                    {
                        type: THREE.FloatType,
                        wrapS: THREE.ClampToEdgeWrapping,
                        wrapT: THREE.ClampToEdgeWrapping,
                        magFilter: THREE.LinearFilter,
                        minFilter: THREE.LinearFilter,
                        
                    }
                )
                pairing.target.texture.generateMipmaps = false
            }
        )
    }

    private runPipelineOnEachPairing(): void {
        this.fboPairs.forEach(
            (pairing) => {
                this.runPipeline(pairing)
                
            }
            
        )
        this.renderer.instance.setRenderTarget(null)

        
    }

    private runPipeline(pairing: FBOPairs): void {
        this.renderer.instance.setRenderTarget(pairing.target as THREE.WebGLRenderTarget);
        this.renderer.instance.clear(true, true, true);
        this.renderer.instance.render(pairing.scene as THREE.Scene, this.camera.instance);
    }

    private updateFinalSceneUniforms(): void {
        // this.ultimateScene.material.uniforms.uSceneOneTexture.value = this.fboPairs[0].target!.texture
        // this.ultimateScene.material.uniforms.uSceneTwoTexture.value = this.fboPairs[1].target!.texture
        // this.ultimateScene.material.uniforms.uSceneThreeTexture.value = this.fboPairs[2].target!.texture
        this.ultimateScene.material.uniforms.uRenderedScene.value = this.fboPairs[this.currentIndex].target!.texture
        // this.ultimateScene.material.uniforms.uNextScene.value = this.fboPairs[0].target!.texture
    }

    private resize(): void {
        this.fboPairs.forEach(
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
        
        this.renderer.instance.render(this.ultimateScene.instance, this.ultimateScene.camera)

    }
}

export default Experience