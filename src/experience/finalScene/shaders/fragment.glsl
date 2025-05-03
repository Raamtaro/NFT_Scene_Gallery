uniform vec2 uResolution;
uniform sampler2D uSceneOneTexture;
uniform sampler2D uSceneTwoTexture;
uniform sampler2D uSceneThreeTexture;

uniform sampler2D uRenderedScene;
uniform sampler2D uNextScene;

uniform float uProgress;

uniform float uTime;

varying vec2 vUv;

void main () {
    vec2 px = 1.0 / uResolution;
    // vec2 uv = vUv;
    vec2 uv = (vUv) * (1.0 - 2.0 * px) + px;

    vec4 testTextureOne = texture(uSceneOneTexture, uv);
    vec4 testTextureTwo = texture(uSceneTwoTexture, uv);
    vec4 testTextureThree = texture(uSceneThreeTexture, uv);


    vec4 a = texture(uRenderedScene, uv);
    vec4 b = texture(uNextScene,     uv);
    gl_FragColor = mix(a, b, uProgress);

    // vec4 finalColor = mix(vec4(0.0), texture(uRenderedScene, uv), uProgress);

    // gl_FragColor = finalColor;
    // gl_FragColor = testTextureOne;
    // gl_FragColor = testTextureTwo;
    // gl_FragColor = testTextureThree;
    // gl_FragColor = vec4(uv, 0.0, 1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}