////////////////////////////
//  CONFIGURATION
////////////////////////////
const COSTS = {
  car: 25000,
  building: 400000,
  tree: 1000
};
const SCENE_WIDTH = 80;   // metres
const SCENE_DEPTH = 60;

////////////////////////////
//  SETUP THREE.JS
////////////////////////////
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // sky blue
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
camera.position.set(0, 25, 40);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias:true });
renderer.setSize(innerWidth, innerHeight);
window.addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
});

////////////////////////////
//  LIGHTING
////////////////////////////
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(10, 30, 10);
scene.add(sun);

////////////////////////////
//  GROUND & BEACH
////////////////////////////
const groundGeo = new THREE.PlaneGeometry(SCENE_WIDTH, SCENE_DEPTH);
const sandMat = new THREE.MeshStandardMaterial({ color:0xE6D19A });
const ground = new THREE.Mesh(groundGeo, sandMat);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// water plane (flat ocean)
const waterGeo = new THREE.PlaneGeometry(SCENE_WIDTH, SCENE_DEPTH, 32, 32);
const waterMat = new THREE.MeshStandardMaterial({
  color:0x0077be, transparent:true, opacity:0.7
});
const water = new THREE.Mesh(waterGeo, waterMat);
water.rotation.x = -Math.PI/2;
water.position.y = 0.05;
scene.add(water);

////////////////////////////
//  CITY OBJECTS
////////////////////////////
const objects = [];   // track for damage cost
function createBox(x,z,w,d,h,color) {
  const geo = new THREE.BoxGeometry(w,h,d);
  const mat = new THREE.MeshStandardMaterial({ color });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, h/2, z);
  scene.add(m);
  return m;
}
function createCar(x,z) {
  const car = createBox(x,z,4,2,2,0xff4444);
  car.userData = { type:'car', cost:COSTS.car };
  objects.push(car);
}
function createBuilding(x,z,w,d,h) {
  const b = createBox(x,z,w,d,h,0xcccccc);
  b.userData = { type:'building', cost:COSTS.building };
  objects.push(b);
}
function createTree(x,z) {
  const trunk = createBox(x,z,0.6,0.6,5,0x8B4513);
  const crown = createBox(x,z,3,3,4,0x228B22);
  crown.position.y = 5;
  const tree = new THREE.Group();
  tree.add(trunk); tree.add(crown);
  scene.add(tree);
  tree.userData = { type:'tree', cost:COSTS.tree };
  objects.push(tree);
}

// place scene items
const startZ = -SCENE_DEPTH/2 + 5;
createBuilding(-10, startZ+5, 8, 6, 12);
createBuilding(  5, startZ+4, 10, 5, 8);
createBuilding(-18, startZ+10, 6, 6, 6);
createCar(-5, startZ);
createCar( 7, startZ+2);
createCar(-12, startZ-2);
createTree(-15, startZ-5);
createTree(12, startZ-4);

////////////////////////////
//  WAVE
////////////////////////////
let wave;
function buildWave(meters) {
  if (wave) scene.remove(wave);
  const waveGeo = new THREE.PlaneGeometry(SCENE_WIDTH, SCENE_DEPTH, 32, 1);
  // displace vertices to form a wall
  const pos = waveGeo.attributes.position;
  const H = Math.min(meters, 30); // cap display
  for (let i=0;i<pos.count;i++) {
    const z = pos.getZ(i);
    const crest = Math.max(0, z - startZ + 5); // simple linear front
    pos.setY(i, Math.sin(Math.min(1, crest/20) * Math.PI) * H);
  }
  waveGeo.computeVertexNormals();
  const waveMat = new THREE.MeshStandardMaterial({ color:0x0077be, transparent:true, opacity:0.75 });
  wave = new THREE.Mesh(waveGeo, waveMat);
  wave.rotation.x = -Math.PI/2;
  wave.position.y = 0.1;
  scene.add(wave);
  return H;
}

////////////////////////////
//  DAMAGE CALCULATOR
////////////////////////////
function calculateDamage(waveM) {
  const ratio = Math.min(1, Math.pow(waveM / 10, 1.5));
  let total = 0;
  objects.forEach(obj=>{
    const dmg = obj.userData.cost * ratio;
    obj.material && (obj.material.color.setHex(0xff4444)); // quick visual damage
    total += dmg;
  });
  return Math.round(total);
}

////////////////////////////
//  UI & ANIMATION
////////////////////////////
const magInput = document.getElementById('magInput');
const waveHSpan = document.getElementById('waveH');
const damageSpan = document.getElementById('damage');
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');

let animId;
function reset() {
  if (animId) cancelAnimationFrame(animId);
  objects.forEach(obj=>{
    if (obj.material) obj.material.color.setHex(obj.userData.type==='car'?0xff4444:0xcccccc);
  });
  waveHSpan.textContent = '0.0 m';
  damageSpan.textContent = '0';
  if (wave) { scene.remove(wave); wave=null; }
}

function run() {
  reset();
  const M = parseFloat(magInput.value);
  if (isNaN(M) || M<0 || M>9.9) { magInput.setCustomValidity('Invalid'); return; }
  magInput.setCustomValidity('');
  const waveM = Math.round(10 * (10**(M - 5.5) * 1.5))/10;
  buildWave(waveM);
  waveHSpan.textContent = waveM.toFixed(1)+' m';
  const dmg = calculateDamage(waveM);
  // simple animation: slide wave forward
  const targetZ = SCENE_DEPTH/2;
  const speed = 0.3;
  function animate() {
    if (wave.position.z < targetZ) {
      wave.position.z += speed;
      animId = requestAnimationFrame(animate);
    } else {
      damageSpan.textContent = dmg.toLocaleString();
    }
  }
  animate();
}

runBtn.addEventListener('click', run);
resetBtn.addEventListener('click', reset);
magInput.addEventListener('keydown', e=>{ if(e.key==='Enter') run(); });
