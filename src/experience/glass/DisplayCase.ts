import * as THREE from 'three'

import {Mesh, ShaderMaterial} from 'three'

import Experience from "../experience.ts";
import TimeKeeper from '../../utils/emitters/timeKeeper.ts';
import Sizes from '../../utils/emitters/sizes.ts';
import Mouse from '../../utils/mouse.ts';

import vertexShader from "./shaders/vertex.glsl"
import fragmentShader from "./shaders/fragment.glsl"
import Renderer from '../renderer.ts';

// import GUI from 'lil-gui';


interface DisplayCaseConfig {
    geometry: THREE.BufferGeometry
    baseSize: THREE.Vector3
    smallSize: THREE.Vector3
    resizeBreakpoint: number
    uniformConfig: {
        // iors: {
        //     uIorR: number,
        //     uIorG: number,
        //     uIorB: number,
        //     uIorY: number,
        //     uIorC: number,
        //     uIorP: number,
        // },
        // refractionParams: {
        //     uChromaticAberration: number,
        //     uRefractPower: number,
        //     uSaturation: number,
        // },
        // lighting: {
        //     uShininess: number,
        //     uDiffuseness: number,
        //     uFresnelPower: number,
        // },
        factors: {
            uLightFactor: number,
            uFresnelFactor: number,
        }
    }

}

class DisplayCase {
    private experience: Experience
    private renderer: Renderer
    private dimensions: Sizes
    private time: TimeKeeper
    private mouse: Mouse
    private config: DisplayCaseConfig
    private geometry: THREE.BufferGeometry
    private material: ShaderMaterial 
    private baseScale: boolean | null = null
    private fbo: THREE.WebGLRenderTarget
    // // private gui: GUI
    
    public instance: Mesh


    constructor(config: DisplayCaseConfig) {
        this.experience = Experience.getInstance()
        
        this.dimensions = this.experience.size
        this.time = this.experience.time
        this.mouse = this.experience.mouse

        this.renderer = this.experience.renderer

        this.config = config

        // // this.gui = new GUI()

        
        this.material = new ShaderMaterial(
            {
                uniforms: {
                    uResolution: new THREE.Uniform(new THREE.Vector2(this.dimensions.width * this.dimensions.pixelRatio, this.dimensions.height * this.dimensions.pixelRatio)),
                    uTime: new THREE.Uniform(0.0),
                    uTargetTexture: new THREE.Uniform(null),

                    uIorR: new THREE.Uniform(1.0698),
                    uIorG: new THREE.Uniform(1.0476),
                    uIorB: new THREE.Uniform(1.0524),
                    uIorY: new THREE.Uniform(1.0648),
                    uIorC: new THREE.Uniform(1.077),
                    uIorP: new THREE.Uniform(1.0598),

                    uChromaticAberration: new THREE.Uniform(.77),
                    uRefractPower: new THREE.Uniform(0.746),
                    uOffset: new THREE.Uniform(0.0),
                    uSaturation: new THREE.Uniform(1.07),

                    uShininess: new THREE.Uniform(100),
                    uDiffuseness: new THREE.Uniform(0.213),
                    uLight: new THREE.Uniform(new THREE.Vector3(-1.0, 1.0, 1.0)),
                    uFresnelPower: new THREE.Uniform(8.4),
                    
                    uLightFactor: new THREE.Uniform(config.uniformConfig.factors.uLightFactor),
                    uFresnelFactor: new THREE.Uniform(config.uniformConfig.factors.uFresnelFactor)
                },  
                vertexShader: vertexShader,
                fragmentShader: fragmentShader
            }
        )

        // this.geometry = new THREE.BoxGeometry(6, 6, 6, 10, 10, 10) 
        this.geometry = this.config.geometry
        this.instance = new Mesh(this.geometry, this.material)



        this.instance.position.set(0, 0, 0)

        this.fbo = new THREE.WebGLRenderTarget(this.dimensions.width * this.dimensions.pixelRatio, this.dimensions.height * this.dimensions.pixelRatio, 
            {
                type: THREE.FloatType,
            }
        )
        

        this.init()
        this.dimensions.on('resize', this.onResize.bind(this))
        this.time.on('tick', this.update.bind(this))
        
    }

    private init(): void {
        this.configSize()
        // this.setUpControls()
    }

    private configSize(): void {
        // this.instance.rotateX(Math.PI / 2)


        if (this.dimensions.width <= this.config.resizeBreakpoint) {
            this.instance.scale.set(this.config.smallSize.x, this.config.smallSize.y, this.config.smallSize.z)
            this.baseScale = false
        } 
        else {
            this.instance.scale.set(this.config.baseSize.x, this.config.baseSize.y, this.config.baseSize.z) //this.config.resizeBreakpoint and above
            this.baseScale = true //This means that we are scaling for this.config.resizeBreakpoint+
        }
    }

    private onResize(): void {
        this.scaleResize()
        this.targetResize()
    }

    private scaleResize(): void {
        (this.material as ShaderMaterial).uniforms.uResolution.value = new THREE.Vector2(this.dimensions.width * this.dimensions.pixelRatio, this.dimensions.height * this.dimensions.pixelRatio)

        if (this.dimensions.width <= this.config.resizeBreakpoint) { //Will get caught if we resize to this.config.resizeBreakpoint or under
            if (this.baseScale && !(this.instance === null)) { //Checking to see what the baseScale is set at
                this.instance.scale.set(this.config.smallSize.x, this.config.smallSize.y, this.config.smallSize.z)
                this.baseScale = false //This means that we are viewing with a smaller screen
            }
            return //If it reaches here, then this.baseScale was already false, and there's no action needs
        }

        //Will pass the above check as long as we resize to above this.config.resizeBreakpoint

        if (!this.baseScale && !(this.instance === null)) { //Is the screen small?
            this.instance.scale.set(this.config.baseSize.x, this.config.baseSize.y, this.config.baseSize.z)
            this.baseScale = true
        }
        return
    }

    private targetResize(): void {
        this.fbo.setSize(this.dimensions.width * this.dimensions.pixelRatio, this.dimensions.height * this.dimensions.pixelRatio)
    }

    private swapAndRenderTarget(): void {
        this.instance.visible = false

        this.renderer.instance.setRenderTarget(this.fbo as THREE.WebGLRenderTarget);
        this.renderer.instance.clear(true, true, true);
        this.renderer.instance.render(this.experience.scene, this.experience.camera.instance);
        
        (this.material as ShaderMaterial).uniforms.uTargetTexture.value = this.fbo.texture;
        // (this.material as ShaderMaterial).uniforms.uTargetTexture.value.needsUpdate = true;

        this.renderer.instance.setRenderTarget(null)
        this.instance.visible = true
    }

    private updateIors(): void {
        
        (this.material as ShaderMaterial).uniforms.uOffset.value = this.mouse.targetVelocity*.125;
        

    }

    private update(): void {
        (this.material as ShaderMaterial).uniforms.uTime.value = this.time.uniformElapsed
        this.updateIors()
        this.instance.rotation.x += 0.001
        this.instance.rotation.y += 0.001

        

        this.swapAndRenderTarget()
    }
}

export default DisplayCase