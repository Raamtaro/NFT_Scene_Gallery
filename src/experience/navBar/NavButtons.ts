import { ShaderMaterial } from "three";
import Experience from "../experience";
import gsap from "gsap";
import Header from "../header/Header";


class NavBar {
    private experience: Experience
    private sceneSelector: HTMLUListElement
    private finalRenderMaterial: ShaderMaterial
    private t1: GSAPTimeline
    private open: boolean = false
    private panel: HTMLElement
    private hamburger: HTMLButtonElement
    private items: HTMLLIElement[] | null = null

    constructor() {
        this.experience = Experience.getInstance()
        this.finalRenderMaterial = this.experience.ultimateScene.material
        this.sceneSelector = document.querySelector('.scene-list') as HTMLUListElement
        this.t1 = gsap.timeline({ease: 'power2.inOut', delay: .75, paused: true})
        this.panel = document.querySelector('.menu-panel') as HTMLDivElement
        this.hamburger = document.querySelector('.hamburger') as HTMLButtonElement

        // this.init()
    }   

    public init(): void {
        this.showHamburger()
        this.setupText()
        this.setupEventListeners()
        this.setupToggle()
    }

    private showHamburger(): void {
        gsap.to(this.hamburger,{
            delay: 0.5,
            opacity: 1,
            duration: .5,
            ease: 'power2inOut'
        })
    }

    private setupToggle(): void {
        this.items = Array.from(this.sceneSelector.children) as HTMLLIElement[]

        this.t1
            .to(this.panel,
                {
                    x: "50%",
                    duration: 0.5,
                    onStart: () => {
                        this.panel.style.pointerEvents = "auto"
                    }
                }
            )
            .to(this.items, 
                {
                    opacity: 1,
                    stagger: 0.1,
                    duration: 0.5,
                    pointerEvents: "auto",
                },
                '-=0.5'
            )
        this.hamburger.addEventListener('click', () => {
            this.open ? this.closeMenu() : this.openMenu();
            });
    }

    private openMenu(): void {
        this.open = true;
        this.t1.play();
        // rotate bars into an X, optional
        gsap.to(this.hamburger, {
          rotation: 90,
          duration: 0.3
        });
    }

    private closeMenu(): void {
        this.open = false;
        this.t1.reverse();
        gsap.to(this.hamburger, {
          rotation: 0,
          y: 0,
          duration: 0.3
        });
    }

    private setupText(): void {
        const sceneText = this.experience.particleDisplayPairings.map((pair, index) => {
            return {
                key: index,
                text: pair.text
            }
        })

        sceneText.forEach((scene) => {
            const li = document.createElement('li')
            li.classList.add('scene-item')
            li.innerText = scene.text
            this.sceneSelector.appendChild(li)
        })
    }

    private setupEventListeners(): void {
        this.sceneSelector.addEventListener('click', (e) => {
            const target = e.target as HTMLLIElement
            if (target.classList.contains('scene-item')) {
                const index = Array.from(this.sceneSelector.children).indexOf(target)
                this.handleSceneChange(index)
            }
        })
    }

    private handleSceneChange(index: number): void {
        const mat = this.finalRenderMaterial;
        const prevTex = mat.uniforms.uNextScene.value || mat.uniforms.uRenderedScene.value;
        const newTex  = this.experience.fboPairs[index].target!.texture;
      
        // inject the two textures:
        mat.uniforms.uRenderedScene.value = prevTex;
        mat.uniforms.uNextScene.value     = newTex;
        mat.uniforms.uProgress.value      = 0;
      
        // single tween 0 → 1
        gsap.to(mat.uniforms.uProgress, {
          value: 1,
          duration: 1.5,
          ease: 'power2.inOut',
          overwrite: true,
          onComplete: () => {
            this.experience.currentIndex = index;
          }
        });

        (this.experience.header as Header).switchText(index)
    }
}

export default NavBar