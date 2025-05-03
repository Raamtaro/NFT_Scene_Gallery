import Experience from "../experience";
import gsap from "gsap";

class Header {
    private experience: Experience
    public instance: HTMLElement = document.querySelector('.header-group') as HTMLElement

    constructor() {
        this.experience = Experience.getInstance()
        this.init()

    }

    private init(): void {
        this.instance.innerText = this.experience.particleDisplayPairings[this.experience.currentIndex].text
        gsap.to(this.instance, {
            opacity: 1.0,
            duration: 1.5,
            ease: 'power2.inOut',
        })
    }

    public switchText(index: number): void {

        
        gsap.to(this.instance, {
            opacity: 0.0,
            duration: 1.5,
            ease: 'power2.inOut',
            onComplete: () => {
                const targetText = this.experience.particleDisplayPairings[index].text
                this.instance.innerText = targetText
                gsap.to(this.instance, {
                    opacity: 1.0,
                    duration: 1.5,
                    ease: 'power2.inOut',
                })
            }
        })
        
    }

}

export default Header