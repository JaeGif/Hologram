uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;

float random2D(vec2 value)
{
    return fract(sin(dot(value.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {

    // positioning
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // glitch effect
    float glitchTime = uTime - modelPosition.y;
    float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76);
    glitchStrength = smoothstep(0.3, 1.0, glitchStrength);
    glitchStrength /= 3.0;
    modelPosition.x += (random2D(modelPosition.xz + uTime) - 0.5) * glitchStrength * 0.25;
    modelPosition.z += (random2D(modelPosition.zx + uTime) - 0.5) * glitchStrength * 0.25;


    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // model normal
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

    vPosition = modelPosition.xyz;
    vNormal = modelNormal.xyz;   // normal is typically a vec3
}