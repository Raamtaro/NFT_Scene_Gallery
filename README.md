# Particle Refraction Gallery
This project is made with TypeScript and the THREE.js library, the latter of which is a library for implementing WebGL effects into frontends. 

There are two main techniques in each scene:

1. Flow Field motion (Simplex Noise) on particle systems, frame-by-frame.

2. Refraction to create RGBCYB distortion effects. 

Both of these techniques rely on the use of a Frame Buffer Object (FBO). FBOs allow us to render a texture onto an off-screen render target frame-by-frame, allowing GPU intensive tasks much more efficiently. For example, in the case of a particle system, we can transfer xyz coordinates into an rgb format into a texture and render it off-screen, allowing us to perform calculations on each pixel/position by frame - this allows us to create organic motion on bodies of millions of particles without much negative impact on performance.

In the case of a refractive scene, we render the underlying scene onto our "Glass" mesh, and then can manipulate the appearance of the scene based on things such as the camera positioning, creating a realistic, light-bending effect.

Both of these techniques are quite complicated in of themselves - and so I'll link to two great articles which covers both of these techniques in further depth:

https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/

https://blog.maximeheckel.com/posts/refraction-dispersion-and-other-shader-light-effects/


## Scene Swapping

There is technically a third technique which I implement in this project to swap between scenes, which is also rooted in FBOs. Each scene is compiled with a Particle System and Display Case (`ParticleSystem()` and `DisplayCase()` classes, respectively), and then rendered onto an off-screen target (a `WebGLRenderTarget`). From there, they are fed into a `FinalScene()`, which is an Orthographic Camera + full-screen plane scene. 

I grab the textures from each of the off-screen targets, and feed them into the full screen plane's `ShaderMaterial()` as uniforms which are fed to the Fragment Shader, which I then swap between using some TypeScript logic and GLSL's built-in `mix()` function. 

## Project Structure

Aside from the particular WebGL effects, I use a singleton approach to manage my project structure. As far as the THREE.js experience goes, everything is managed through a centralized `Experience()` glass, which contains a few import parameters such as:

- Time
- Dimensions
- The WebGLRenderer
- Mouse coordinates
- Resources, like textures and GLBs

When child classes, such as the aforementioned `ParticleSystem` or `DisplayCase`, utilise effects which require things such as updates over time, or influence from the mouse position on the screen, they would call `Experience.getInstance()` to grab the current global `this` - this effectively keeps things centralized and doesn't mistakenly overcrowd the current context of the project with duplicates.

Additionally, my Time, Size, and Resource modules inherit from an `EventEmitter()` class. There are certainly a lot of variations of emitters out there - I use mine to emit 'tick' and 'resize' events to control rendering and, well, resizing events. The Resources also emits an event called 'ready' which is very handy when the THREE.js project I am working with loads things like GLBs or Textures asynchronously. In this way I can ensure that certain modules/'things' which require said resources wait for them to be available before doing their part in the code.

I have a boilerplate starter code from which I typically have been deriving most of my TypeScript <> THREE.js projects. You can check it out here: https://github.com/Raamtaro/TypeScript-THREEJS-Starter


## TBA Features

- Aesthetic Scene Swapping, something like this: https://tympanus.net/Development/PolygonalTransitions/index3.html

- NFT Minting in Conjuction with a Solidity Contract I created (implements Open-Zeppelin's library for the ERC271 protocol): https://github.com/Raamtaro/WebGLNft