import {Scene, PlaneGeometry, ShaderMaterial, LoadingManager, Mesh} from 'three';
import Experience from '../experience';
 
import gsap from 'gsap';


class LoadingScreen {
    private experience: Experience;
    private scene: Scene;
    private geometry: PlaneGeometry;
    private material: ShaderMaterial;
    private instance: Mesh;
    private loadingElement: HTMLElement = document.querySelector('.loader-counter') as HTMLElement;
    private currentProgress = {value: 0};

    public loadingManager: LoadingManager;

    constructor() {
        this.experience = Experience.getInstance();
        this.scene = this.experience.ultimateScene.instance;
        this.geometry = new PlaneGeometry(2, 2, 1, 1);
        this.material = new ShaderMaterial(
            {
                uniforms: {
                    uAlpha: {value: 1.0},
                },
                vertexShader:`
                    varying vec2 vUv;
                    void main() {
                        gl_Position = vec4(position, 1.0);
                        vUv = uv;
                    }
                `,
                fragmentShader:`
                    varying vec2 vUv;
                    uniform float uAlpha;
                    void main() {

                        gl_FragColor = vec4(vec3(0.941, 0.918, 0.839), uAlpha);
                    }
                `,
                transparent: true,
            }
        )

        this.instance = new Mesh(this.geometry, this.material);
        this.scene.add(this.instance);
        this.loadingManager = new LoadingManager(
            ()=> {
                const t1 = gsap.timeline({ease: 'power2.inOut'});

                t1.to(this.loadingElement, {
                    delay: 1.0,
                    opacity: 0,
                    y: -100,
                    duration: 1.0,
                })
                t1.fromTo(document.querySelector('.title') as HTMLElement, 
                    {
                        delay: 0.5,
                        
                        y: +100,
                    },
                    {
                        opacity: 1.0,
                        duration: 1.0,
                        y: 0,
                    }
                )
                t1.to((this.instance.material as ShaderMaterial).uniforms.uAlpha, {
                    delay: 1.0,
                    value: 0.0,
                    duration: 1.0,
                    onComplete: () => {
                        this.scene.remove(this.instance);
                        this.experience.setUpNavAndHeader();
                    }
                })
            },

            (itemUrl, itemsLoaded, itemsTotal) => {
                const url = itemUrl
                url.split('')
                const progress = itemsLoaded / itemsTotal * 100;

                gsap.to(this.currentProgress, {
                    value: progress,
                    duration: 0.5,
                    ease: 'power1.out',
                    roundProps: 'value',
                    overwrite: true,
                    onUpdate: () => {
                        this.loadingElement.textContent = `${this.currentProgress.value}%`
                    }
                })

            }
        );
    }
}
export default LoadingScreen;