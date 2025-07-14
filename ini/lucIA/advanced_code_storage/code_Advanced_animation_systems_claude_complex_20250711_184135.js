// Código extraído de: Advanced animation systems
// API: Claude
// Fecha: 2025-07-11 18:41:15

// Ejemplo 1
class AnimationLayerSystem {
    constructor() {
        this.layers = [];
        this.weights = [];
        this.transitions = new Map();
    }

    addLayer(animation, weight = 1.0) {
        this.layers.push(new THREE.AnimationAction(animation));
        this.weights.push(weight);
    }

    update(delta) {
        this.layers.forEach((layer, index) => {
            layer.weight = this.weights[index];
            layer.update(delta);
        });
    }
}

// Ejemplo 2
class AnimationTransitionManager {
    transition(fromAnim, toAnim, duration) {
        return new Promise((resolve) => {
            const startWeight = fromAnim.weight;
            const endWeight = toAnim.weight;
            
            this.animate({
                duration: duration,
                update: (progress) => {
                    fromAnim.weight = startWeight * (1 - progress);
                    toAnim.weight = endWeight * progress;
                },
                complete: resolve
            });
        });
    }
}

// Ejemplo 3
const animationSystem = new AnimationLayerSystem();
const mixer = new THREE.AnimationMixer(model);

// Ejemplo 4
const states = {
    IDLE: 'idle',
    WALK: 'walk',
    RUN: 'run'
};

// Ejemplo 5
class BlendTree {
    constructor() {
        this.parameters = new Map();
        this.nodes = new Map();
    }

    addNode(name, animation, threshold) {
        this.nodes.set(name, {
            animation: animation,
            threshold: threshold
        });
    }

    update(blendParameter) {
        this.nodes.forEach((node, name) => {
            const weight = this.calculateWeight(
                blendParameter, 
                node.threshold
            );
            node.animation.weight = weight;
        });
    }
}

// Ejemplo 6
class AnimationCache {
    constructor() {
        this.cache = new WeakMap();
    }

    getAnimation(key) {
        if (!this.cache.has(key)) {
            this.cache.set(key, this.loadAnimation(key));
        }
        return this.cache.get(key);
    }
}

// Ejemplo 7
function updateAnimations(camera) {
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(camera.projectionMatrix);
    
    characters.forEach(char => {
        if (frustum.containsPoint(char.position)) {
            char.updateAnimations();
        }
    });
}

// Ejemplo 8
class AnimationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AnimationError';
    }
}

function safeAnimationUpdate(delta) {
    try {
        animationSystem.update(delta);
    } catch (error) {
        console.error('Animation update failed:', error);
        // Fallback a animación por defecto
        playDefaultAnimation();
    }
}

// Ejemplo 9
class CharacterController {
    constructor(model) {
        this.model = model;
        this.animationSystem = new AnimationLayerSystem();
        this.blendTree = new BlendTree();
        this.transitionManager = new AnimationTransitionManager();
    }

    async changeState(newState) {
        const currentAnim = this.animationSystem.getCurrentAnimation();
        const nextAnim = this.animationSystem.getAnimation(newState);
        
        await this.transitionManager.transition(
            currentAnim, 
            nextAnim, 
            0.3
        );
    }
}

