import { Mesh, OrthographicCamera, Scene, ShaderMaterial, IUniform, Uniform, Vector2, PlaneGeometry } from "three";
import Sizes from "../../utils/emitters/sizes";
import TimeKeeper from "../../utils/emitters/timeKeeper";
// import Mouse from "../../utils/mouse";
import Experience from "../experience";

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'



interface PostUniforms {
    [name: string]: IUniform
}

class FinalScene {
    private experience: Experience
    private dimensions: Sizes
    private time: TimeKeeper
    // private mouse: Mouse
    private quad: Mesh
    private uniforms: PostUniforms


    public camera: OrthographicCamera
    public instance: Scene
    public material: ShaderMaterial

    constructor() {
        this.experience = Experience.getInstance()
        this.dimensions = this.experience.size
        this.time = this.experience.time

        this.camera = this.setupCamera(1, 1)

        this.uniforms = {
            uResolution: new Uniform(new Vector2(this.dimensions.width * this.dimensions.pixelRatio, this.dimensions.height * this.dimensions.pixelRatio)),
            uTime: new Uniform(0.0),

            uSceneOneTexture: new Uniform(null),
            uSceneTwoTexture: new Uniform(null),
            uSceneThreeTexture: new Uniform(null),

            uRenderedScene: new Uniform(null),
            uNextScene: new Uniform(null),

            uProgress: new Uniform(0.0),
        }

        this.material = new ShaderMaterial(
            {
                uniforms: this.uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader
            }
        )

        this.instance = new Scene()

        this.quad = new Mesh(
            new PlaneGeometry(1, 1),
            this.material
        )
        
        this.instance.add(this.quad)



        this.time.on('tick', this.update.bind(this))
        this.dimensions.on('resize', this.resize.bind(this))
    }

    private setupCamera (frustum: number, aspect: number): OrthographicCamera {
        return new OrthographicCamera(
            frustum * aspect / -2,
            frustum * aspect / 2,
            frustum/2, 
            frustum / -2,
            -1000,
            1000
        )
    }

    private resize (): void {
        this.material.uniforms.uResolution.value.set(this.dimensions.width * this.dimensions.pixelRatio, this.dimensions.height * this.dimensions.pixelRatio)
    }

    private update(): void {
        this.material.uniforms.uTime.value = this.time.uniformElapsed
    }


}

export default FinalScene