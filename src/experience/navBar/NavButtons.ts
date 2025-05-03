import { ShaderMaterial } from "three";
import Experience from "../experience";
import gsap from "gsap";
import Header from "../header/Header";

interface NavBarConfig {
    key: number
    text: string
}


class NavBar {
    private experience: Experience
    private sceneSelector: HTMLUListElement
    private sceneText: NavBarConfig[]
    private finalRenderMaterial: ShaderMaterial

    constructor() {
        this.experience = Experience.getInstance()
        this.finalRenderMaterial = this.experience.ultimateScene.material
        this.sceneText = this.experience.particleDisplayPairings.map((pair, index) => {
            return {
                key: index,
                text: pair.text
            }
        })
        // console.log(this.sceneText)
        this.sceneSelector = document.querySelector('.scene-list') as HTMLUListElement
        this.init()
    }   

    private init(): void {
        this.setupText()
        this.setupEventListeners()
    }

    private setupText(): void {
        this.sceneText.forEach((scene) => {
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