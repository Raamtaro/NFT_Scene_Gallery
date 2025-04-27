import { BufferGeometry, Vector2, Uniform, ShaderMaterial, BufferAttribute, Points, IUniform, Vector3 } from "three"
// import { GLTF } from "three/examples/jsm/Addons.js"
import Sizes from '../../../utils/emitters/sizes'
import TimeKeeper from '../../../utils/emitters/timeKeeper'

import Experience from '../../experience'

import Gpgpu from '../gpgpu/gpgpu'

import particleSimVertex from './shaders/vertex.glsl'
import particleSimFragment from './shaders/fragment.glsl'

// type ResourceFile = GLTF | Texture

// interface ResourceDictionary {
//     [name: string]: ResourceFile
// }

interface ParticleUniforms {
    [name: string]: IUniform
}

interface GpgpuUniformValues {
    uFlowFieldInfluence: number
    uFlowFieldStrength: number
    uFlowFieldFrequency: number
}

interface ParticleUniformValues {
    uSize: number
    uFrequency: number
    uAmplitude: number
    uMaxDistance: number
}

interface ParticleConfig {
    geometry: BufferGeometry
    baseVector: Vector3
    smallVector: Vector3
    resizeBreakpoint: number
    gpgpuConfig: GpgpuUniformValues
    particleConfig: ParticleUniformValues
    onUpdate: (points?: Points, time?: TimeKeeper) => void
}

class ParticleSystem {

    private experience: Experience
    private dimensions: Sizes
    private time: TimeKeeper

    // private models: ResourceDictionary
    private config: ParticleConfig
    // private geometry: BufferGeometry
    private bufferGeometry: BufferGeometry
    private shaderMaterial: ShaderMaterial
    private gpgpu: Gpgpu
    private count: number
    private size: number
    private particlesUvArray: Float32Array
    private sizesArray: Float32Array
    private uniforms: ParticleUniforms

    private baseScale: boolean | null = null
    public points: Points | null = null


    constructor(config: ParticleConfig) {
        this.experience = Experience.getInstance()
        this.dimensions = this.experience.size
        this.time = this.experience.time

        this.config = config
        
        // this.models = this.experience.resources.items

        // this.geometry = !name ? new IcosahedronGeometry(2, 100) : this.setGeometry(name)
        // this.geometry = new IcosahedronGeometry(2, 100)
        this.gpgpu = new Gpgpu(this.config.geometry, this.config.gpgpuConfig)
        this.count = this.gpgpu.count
        this.size = this.gpgpu.size
        this.particlesUvArray = new Float32Array(this.count * 2)
        this.sizesArray = new Float32Array(this.count)
        this.populateArrays()


        this.bufferGeometry = new BufferGeometry()
        this.uniforms = {
            uTime: new Uniform(0.0),
            uSize: new Uniform(this.config.particleConfig.uSize),
            uResolution: new Uniform(new Vector2(this.dimensions.width * this.dimensions.pixelRatio, this.dimensions.height * this.dimensions.pixelRatio)),
            uParticlesTexture: new Uniform(undefined),
            uAlpha: new Uniform(0.0),
            uFrequency: new Uniform(this.config.particleConfig.uFrequency),
            uAmplitude: new Uniform(this.config.particleConfig.uAmplitude),
            uMaxDistance: new Uniform(this.config.particleConfig.uMaxDistance)
            // uMouse: new Uniform(new Vector2(-10.0, 10.0))            
        }

        this.shaderMaterial = new ShaderMaterial({
            vertexShader: particleSimVertex,
            fragmentShader: particleSimFragment,
            uniforms: this.uniforms,
        })
        
        this.setupPoints()
        this.dimensions.on('resize', this.resize.bind(this))
        this.time.on('tick', this.update.bind(this))
        
    }
    
    // private setGeometry(name: string): BufferGeometry {
    //     let model: ResourceFile = this.models[name] as GLTF
    //     let geometry: BufferGeometry | null = null

    //     model.scene.traverse((child)=> {
    //         if (child instanceof Mesh) {
    //             geometry = child.geometry
    //             return
    //         }
    //     })

    //     if (!geometry) {
    //         throw new Error(`No mesh geometry found for model: ${name}`)
    //     }

    //     return geometry 
    // }

    private populateArrays(): void {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const i = (y * this.size + x)
                const i2 = i * 2

                //normalise 0 -> 1 
                const uvX = (x + 0.5) / this.size
                const uvY = (y + 0.5) / this.size

                this.particlesUvArray[i2 + 0] = uvX
                this.particlesUvArray[i2 + 1] = uvY

                //size
                this.sizesArray[i] = Math.random()
            }
        }           
    }

    private setupPoints(): void {
        this.bufferGeometry.setDrawRange(0, this.count)
        this.bufferGeometry.setAttribute('aParticlesUv', new BufferAttribute(this.particlesUvArray, 2))
        this.bufferGeometry.setAttribute('aSize', new BufferAttribute(this.sizesArray, 1))
        

        this.points = new Points(this.bufferGeometry, this.shaderMaterial)
        //Check to set the right size at first

        if (this.dimensions.width <= this.config.resizeBreakpoint) {
            this.points.scale.set(this.config.smallVector.x, this.config.smallVector.y, this.config.smallVector.z)
            // console.log(typeof this.points.scale)
            this.baseScale = false
        } 
        else {
            this.points.scale.set(this.config.baseVector.x, this.config.baseVector.y, this.config.baseVector.z) //this.config.resizeBreakpoint and above
            this.baseScale = true //This means that we are scaling for this.config.resizeBreakpoint+
        }

        this.points.frustumCulled = false
        // console.log(this.points.scale)

        this.points.renderOrder = 0
        this.points.position.set(0, 0, 0)
        // this.experience.scene.add(this.points)
    }

    private resize(): void {
        this.shaderMaterial.uniforms.uResolution.value.set(this.dimensions.width * this.dimensions.pixelRatio, this.dimensions.height * this.dimensions.pixelRatio)
        this.scaleResize()
    }

    private scaleResize(): void {
        // console.log(Setup.width)
        if (this.dimensions.width <= this.config.resizeBreakpoint) { //Will get caught if we resize to this.config.resizeBreakpoint or under
            if (this.baseScale && !(this.points === null)) { //Checking to see what the baseScale is set at
                this.points.scale.set(this.config.smallVector.x, this.config.smallVector.y, this.config.smallVector.z)
                this.baseScale = false //This means that we are viewing with a smaller screen
            }
            return //If it reaches here, then this.baseScale was already false, and there's no action needs
        }

        //Will pass the above check as long as we resize to above this.config.resizeBreakpoint

        if (!this.baseScale && !(this.points === null)) { //Is the screen small?
            this.points.scale.set(this.config.baseVector.x, this.config.baseVector.y, this.config.baseVector.z)
            this.baseScale = true
        }
        return
    }

    private update(): void {
        this.shaderMaterial.uniforms.uParticlesTexture.value = this.gpgpu.instance.getCurrentRenderTarget(this.gpgpu.particlesVariable).texture;
        this.shaderMaterial.uniforms.uTime.value = this.time.uniformElapsed;

        this.config.onUpdate(this.points as Points, this.time)
    }


}

export default ParticleSystem