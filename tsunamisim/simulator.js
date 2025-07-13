// Main simulation class
class TsunamiSimulator {
    constructor() {
        this.initScene();
        this.initObjects();
        this.setupEventListeners();
        this.initPhysics();
        this.animationState = 'idle'; // 'idle', 'playing', 'paused'
        this.updateSeverityRing(5.0);
    }

    initScene() {
        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 15, 30);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('container').prepend(this.renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);
        
        // Animation loop
        this.animate = this.animate.bind(this);
        this.animationId = requestAnimationFrame(this.animate);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initObjects() {
        // Beach and ocean floor
        this.createBeach();
        
        // Coastal road
        this.createRoad();
        
        // Buildings
        this.buildings = [];
        this.createBuildings();
        
        // Cars
        this.cars = [];
        this.createCars();
        
        // People (simplified as cylinders for this demo)
        this.people = [];
        this.createPeople();
        
        // Palm trees
        this.palmTrees = [];
        this.createPalmTrees();
        
        // Beach props
        this.createBeachProps();
        
        // Tsunami wave
        this.wave = null;
        this.waveHeight = 0;
        
        // X-ray plane (hidden by default)
        this.xrayPlane = this.createXrayPlane();
        this.xrayVisible = false;
    }

    createBeach() {
        // Beach sand
        const beachGeometry = new THREE.PlaneGeometry(100, 50);
        const beachMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xF5DEB3,
            roughness: 0.8
        });
        this.beach = new THREE.Mesh(beachGeometry, beachMaterial);
        this.beach.rotation.x = -Math.PI / 2;
        this.beach.position.z = -10;
        this.scene.add(this.beach);
        
        // Ocean
        const oceanGeometry = new THREE.PlaneGeometry(100, 50);
        const oceanMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1E90FF,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        this.ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
        this.ocean.rotation.x = -Math.PI / 2;
        this.ocean.position.z = -35;
        this.scene.add(this.ocean);
    }

    createRoad() {
        const roadGeometry = new THREE.PlaneGeometry(20, 3);
        const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        this.road = new THREE.Mesh(roadGeometry, roadMaterial);
        this.road.rotation.x = -Math.PI / 2;
        this.road.position.set(0, 0.1, -5);
        this.scene.add(this.road);
        
        // Road markings
        const lineGeometry = new THREE.PlaneGeometry(20, 0.2);
        const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        
        for (let i = -1; i <= 1; i += 2) {
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.rotation.x = -Math.PI / 2;
            line.position.set(0, 0.11, -5 + i * 0.8);
            this.scene.add(line);
        }
    }

    createBuildings() {
        const buildingColors = [0x8B4513, 0xA0522D, 0xCD853F];
        const buildingPositions = [
            { x: -8, z: -2, width: 5, depth: 4, height: 3, name: "Hotel" },
            { x: 0, z: -2, width: 4, depth: 4, height: 2, name: "Café" },
            { x: 8, z: -2, width: 5, depth: 4, height: 2.5, name: "Surf Shop" }
        ];
        
        buildingPositions.forEach((pos, i) => {
            const geometry = new THREE.BoxGeometry(pos.width, pos.height, pos.depth);
            const material = new THREE.MeshStandardMaterial({ 
                color: buildingColors[i % buildingColors.length],
                roughness: 0.7
            });
            const building = new THREE.Mesh(geometry, material);
            building.position.set(pos.x, pos.height/2, pos.z);
            building.userData = {
                type: 'building',
                baseCost: 400000,
                originalPosition: { x: pos.x, y: pos.height/2, z: pos.z },
                name: pos.name
            };
            this.scene.add(building);
            this.buildings.push(building);
            
            // Add windows
            const windowGeometry = new THREE.PlaneGeometry(pos.width * 0.8, pos.height * 0.6);
            const windowMaterial = new THREE.MeshStandardMaterial({
                color: 0xADD8E6,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
            const windows = new THREE.Mesh(windowGeometry, windowMaterial);
            windows.position.set(pos.x, pos.height * 0.5, pos.z + pos.depth/2 + 0.01);
            windows.userData = { type: 'window' };
            this.scene.add(windows);
        });
    }

    createCars() {
        const carColors = [0xFF0000, 0x0000FF, 0x00FF00, 0xFFFF00, 0xFFA500];
        const carPositions = [
            { x: -7, z: -5 },
            { x: -3, z: -5 },
            { x: 3, z: -5 },
            { x: 7, z: -5 },
            { x: 0, z: -6.5 }
        ];
        
        carPositions.forEach((pos, i) => {
            const geometry = new THREE.BoxGeometry(1.8, 0.8, 3);
            const material = new THREE.MeshStandardMaterial({ 
                color: carColors[i % carColors.length],
                roughness: 0.5,
                metalness: 0.3
            });
            const car = new THREE.Mesh(geometry, material);
            car.position.set(pos.x, 0.4, pos.z);
            car.rotation.y = Math.PI / 2;
            car.userData = {
                type: 'car',
                baseCost: 25000,
                originalPosition: { x: pos.x, y: 0.4, z: pos.z },
                floating: false
            };
            this.scene.add(car);
            this.cars.push(car);
        });
    }

    createPeople() {
        const peoplePositions = [
            { x: -8, z: -7 },
            { x: -4, z: -7 },
            { x: 0, z: -7 },
            { x: 4, z: -7 },
            { x: 8, z: -7 }
        ];
        
        peoplePositions.forEach((pos, i) => {
            // Simplified person (cylinder for body, sphere for head)
            const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8);
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x0000FF });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.set(pos.x, 0.4, pos.z);
            
            const headGeometry = new THREE.SphereGeometry(0.25);
            const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.set(pos.x, 0.9, pos.z);
            
            const person = new THREE.Group();
            person.add(body);
            person.add(head);
            person.userData = {
                type: 'person',
                running: false,
                originalPosition: { x: pos.x, y: 0, z: pos.z }
            };
            
            this.scene.add(person);
            this.people.push(person);
        });
    }

    createPalmTrees() {
        const treePositions = [
            { x: -15, z: -8 },
            { x: -10, z: -9 },
            { x: 10, z: -9 },
            { x: 15, z: -8 }
        ];
        
        treePositions.forEach((pos, i) => {
            // Trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(pos.x, 1.5, pos.z);
            
            // Leaves
            const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
            const leavesMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x228B22,
                flatShading: true
            });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.set(pos.x, 3.5, pos.z);
            
            const tree = new THREE.Group();
            tree.add(trunk);
            tree.add(leaves);
            tree.userData = {
                type: 'palmTree',
                baseCost: 1000,
                originalPosition: { x: pos.x, y: 0, z: pos.z },
                standing: true
            };
            
            this.scene.add(tree);
            this.palmTrees.push(tree);
        });
    }

    createBeachProps() {
        // Beach umbrellas
        const umbrellaPositions = [
            { x: -5, z: -12 },
            { x: 0, z: -12 },
            { x: 5, z: -12 }
        ];
        
        umbrellaPositions.forEach((pos, i) => {
            // Pole
            const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2);
            const poleMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
            const pole = new THREE.Mesh(poleGeometry, poleMaterial);
            pole.position.set(pos.x, 1, pos.z);
            
            // Canopy (cone)
            const canopyGeometry = new THREE.ConeGeometry(1.5, 1, 8);
            const canopyMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xFF0000,
                side: THREE.DoubleSide
            });
            const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
            canopy.position.set(pos.x, 2.5, pos.z);
            canopy.rotation.x = Math.PI;
            
            const umbrella = new THREE.Group();
            umbrella.add(pole);
            umbrella.add(canopy);
            umbrella.userData = {
                type: 'umbrella',
                originalPosition: { x: pos.x, y: 0, z: pos.z },
                standing: true
            };
            
            this.scene.add(umbrella);
        });
    }

    createXrayPlane() {
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            visible: false
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.5;
        this.scene.add(plane);
        return plane;
    }

    createWave(waveHeight) {
        // Remove existing wave if present
        if (this.wave) {
            this.scene.remove(this.wave);
        }
        
        // Create wave as a curved plane
        const waveWidth = 100;
        const waveSegments = 50;
        
        const waveGeometry = new THREE.PlaneGeometry(waveWidth, waveHeight, waveSegments, 1);
        
        // Add curvature to the wave
        const positions = waveGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            // Create a sine wave pattern
            positions.setZ(i, Math.sin(x / waveWidth * Math.PI * 4) * waveHeight * 0.2);
        }
        
        const waveMaterial = new THREE.MeshStandardMaterial({
            color: 0x1E90FF,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        this.wave = new THREE.Mesh(waveGeometry, waveMaterial);
        this.wave.rotation.x = -Math.PI / 2;
        this.wave.position.set(0, 0, -40); // Start position offscreen
        this.scene.add(this.wave);
    }

    initPhysics() {
        this.damageCost = 0;
        this.objectsDestroyed = 0;
        this.waveActive = false;
        this.wavePosition = -40;
        this.waveHeight = 0;
    }

    setupEventListeners() {
        // Magnitude input
        const magnitudeInput = document.getElementById('magnitude-input');
        magnitudeInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.validateInput(value);
            this.updateSeverityRing(value);
        });
        
        // Control buttons
        document.getElementById('play-btn').addEventListener('click', () => this.startSimulation());
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseSimulation());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetSimulation());
        
        // X-ray toggle
        document.getElementById('xray-toggle').addEventListener('click', () => {
            this.xrayVisible = !this.xrayVisible;
            this.xrayPlane.material.visible = this.xrayVisible;
        });
    }

    validateInput(value) {
        const input = document.getElementById('magnitude-input');
        if (isNaN(value) || value < 0 || value > 9.9) {
            input.classList.add('invalid');
            return false;
        } else {
            input.classList.remove('invalid');
            return true;
        }
    }

    updateSeverityRing(value) {
        const ring = document.getElementById('severity-ring');
        if (value < 4) {
            ring.style.backgroundColor = '#4CAF50'; // Green
        } else if (value < 7) {
            ring.style.backgroundColor = '#FFC107'; // Yellow
        } else {
            ring.style.backgroundColor = '#f44336'; // Red
        }
    }

    startSimulation() {
        const magnitudeInput = document.getElementById('magnitude-input');
        const magnitude = parseFloat(magnitudeInput.value);
        
        if (!this.validateInput(magnitude)) return;
        
        // Calculate wave height using the provided formula
        this.waveHeight = Math.round(10**(magnitude - 5.5) * 1.5 * 10) / 10;
        
        // Create wave
        this.createWave(this.waveHeight);
        
        // Reset damage counters
        this.damageCost = 0;
        this.objectsDestroyed = 0;
        document.getElementById('damage-counter').textContent = '$ 0';
        document.getElementById('summary-card').style.display = 'none';
        
        // Start animation
        this.animationState = 'playing';
        this.waveActive = true;
        this.wavePosition = -40;
        
        // Reset all objects to original positions
        this.resetObjects();
    }

    pauseSimulation() {
        this.animationState = 'paused';
    }

    resetSimulation() {
        this.animationState = 'idle';
        this.waveActive = false;
        
        // Remove wave
        if (this.wave) {
            this.scene.remove(this.wave);
            this.wave = null;
        }
        
        // Reset all objects
        this.resetObjects();
        
        // Reset damage counter
        this.damageCost = 0;
        this.objectsDestroyed = 0;
        document.getElementById('damage-counter').textContent = '$ 0';
        document.getElementById('summary-card').style.display = 'none';
    }

    resetObjects() {
        // Reset buildings
        this.buildings.forEach(building => {
            building.position.x = building.userData.originalPosition.x;
            building.position.y = building.userData.originalPosition.y;
            building.position.z = building.userData.originalPosition.z;
            building.rotation.x = 0;
            building.rotation.y = 0;
            building.rotation.z = 0;
        });
        
        // Reset cars
        this.cars.forEach(car => {
            car.position.x = car.userData.originalPosition.x;
            car.position.y = car.userData.originalPosition.y;
            car.position.z = car.userData.originalPosition.z;
            car.rotation.x = 0;
            car.rotation.y = Math.PI / 2;
            car.rotation.z = 0;
            car.userData.floating = false;
        });
        
        // Reset people
        this.people.forEach(person => {
            person.position.x = person.userData.originalPosition.x;
            person.position.y = 0;
            person.position.z = person.userData.originalPosition.z;
            person.rotation.x = 0;
            person.rotation.y = 0;
            person.rotation.z = 0;
            person.userData.running = false;
        });
        
        // Reset palm trees
        this.palmTrees.forEach(tree => {
            tree.position.x = tree.userData.originalPosition.x;
            tree.position.y = 0;
            tree.position.z = tree.userData.originalPosition.z;
            tree.rotation.x = 0;
            tree.rotation.y = 0;
            tree.rotation.z = 0;
            tree.userData.standing = true;
        });
    }

    updateDamageCounter() {
        document.getElementById('damage-counter').textContent = `$ ${Math.floor(this.damageCost).toLocaleString()}`;
    }

    showSummary() {
        document.getElementById('summary-magnitude').textContent = 
            document.getElementById('magnitude-input').value;
        document.getElementById('summary-wave-height').textContent = 
            `${this.waveHeight.toFixed(1)} m`;
        document.getElementById('summary-damage').textContent = 
            `$${Math.floor(this.damageCost).toLocaleString()}`;
        document.getElementById('summary-destroyed').textContent = 
            this.objectsDestroyed;
        document.getElementById('summary-card').style.display = 'block';
    }

    animateWave() {
        if (!this.waveActive) return;
        
        // Move wave forward
        this.wavePosition += 0.5;
        this.wave.position.z = this.wavePosition;
        
        // Check if wave has reached beach
        if (this.wavePosition >= -15) {
            this.simulateWaveImpact();
        }
        
        // Check if wave has passed the scene
        if (this.wavePosition > 20) {
            this.waveActive = false;
            this.showSummary();
        }
    }

    simulateWaveImpact() {
        const waveFront = this.wave.position.z + this.waveHeight * 0.5;
        
        // Calculate damage ratio
        const damageRatio = Math.min(1, (this.waveHeight / 10) ** 1.5);
        
        // Affect buildings
        this.buildings.forEach(building => {
            const distanceToWave = Math.abs(building.position.z - waveFront);
            
            if (distanceToWave < this.waveHeight * 0.7) {
                // Apply damage
                const buildingDamage = building.userData.baseCost * damageRatio;
                if (!building.userData.damageApplied) {
                    this.damageCost += buildingDamage;
                    this.objectsDestroyed++;
                    building.userData.damageApplied = true;
                    this.updateDamageCounter();
                }
                
                // Visual effects
                if (this.waveHeight > 5) {
                    // Buildings collapse in high waves
                    building.rotation.z = Math.sin(this.wavePosition * 0.1) * 0.2;
                    building.position.y = building.userData.originalPosition.y - 0.1;
                }
            }
        });
        
        // Affect cars
        this.cars.forEach(car => {
            const distanceToWave = Math.abs(car.position.z - waveFront);
            
            if (distanceToWave < this.waveHeight * 0.5 && !car.userData.floating) {
                car.userData.floating = true;
                this.damageCost += car.userData.baseCost * damageRatio;
                this.objectsDestroyed++;
                this.updateDamageCounter();
                
                // Make car float and rotate
                gsap.to(car.position, {
                    y: this.waveHeight * 0.7,
                    duration: 2,
                    ease: "power1.inOut"
                });
                
                gsap.to(car.rotation, {
                    z: Math.PI * 0.5,
                    duration: 3,
                    ease: "power1.inOut"
                });
            }
        });
        
        // Affect people
        this.people.forEach(person => {
            const distanceToWave = Math.abs(person.position.z - waveFront);
            
            if (distanceToWave < this.waveHeight * 0.3 && !person.userData.running) {
                person.userData.running = true;
                
                // Make person run away
                const runDirection = person.position.x > 0 ? 1 : -1;
                gsap.to(person.position, {
                    x: person.position.x + runDirection * 10,
                    z: person.position.z - 5,
                    duration: 5,
                    ease: "power1.out"
                });
            }
        });
        
        // Affect palm trees
        this.palmTrees.forEach(tree => {
            const distanceToWave = Math.abs(tree.position.z - waveFront);
            
            if (distanceToWave < this.waveHeight * 0.4 && tree.userData.standing) {
                tree.userData.standing = false;
                this.damageCost += tree.userData.baseCost * damageRatio;
                this.objectsDestroyed++;
                this.updateDamageCounter();
                
                // Make tree fall
                gsap.to(tree.rotation, {
                    z: Math.PI * 0.5,
                    duration: 1,
                    ease: "power1.out"
                });
            }
        });
    }

    animate() {
        if (this.animationState !== 'paused') {
            this.animateWave();
        }
        
        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(this.animate);
    }
}

// Initialize the simulator when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const simulator = new TsunamiSimulator();
});
