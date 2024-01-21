import * as THREE from 'three';
import * as CANNON from "cannon-es";
import CannonDebugger from 'cannon-es-debugger'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TerrainData from './terrain_data';
import ColoredDemoSection from './colored_demo_section';

export class ThreeGame {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;

    controls: any;
    cannonDebugger: any;

    world: CANNON.World;
    cannonBalls:any;
    constructor(renderer: THREE.WebGLRenderer) {

        this.renderer = renderer;

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        this.camera.position.z = 10;
        this.camera.position.y = 5;
        this.camera.position.x = 10;

        // Scene
        this.scene = new THREE.Scene();

        this.addLighting()

        // this.addHeightMap()
        // this.scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()))
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.initCannon()
        this.animate()

        console.log("Created scene :)")
    }
    addListeners() {
        window.addEventListener('resize', () => {
            this.renderer.setPixelRatio(window.devicePixelRatio);

            this.camera.aspect = window.innerWidth / window.innerHeight
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.camera.updateProjectionMatrix();
        }, false)
    }
    _setupMaterial(terrainData: any, colorData: any) {
        var section: any = new ColoredDemoSection(document.getElementById('texture'), terrainData, colorData);
        var texture = new THREE.CanvasTexture(section.canvas2D);

        return new THREE.MeshStandardMaterial({ roughness: 1.0, metalness: 0.0, map: texture });
    }
    _buildTerrainData() {
        // const width = this.verticesPerSide * this.dataResolutionMultiplier;
        // const height = this.verticesPerSide * this.dataResolutionMultiplier;




        const opts: any = {
            height
                :
                1204,
            lacunarity
                :
                0.3,

            octaves
                :
                5,
            offsetX
                :
                -72,
            offsetY
                :
                -135,
            persistance
                :
                0.35,
            seed
                :
                11,
            width
                :
                1204,
            zoom
                :
                0.1
        }
        const isIsland = false;
        opts.modifier = isIsland ? this.islandModifier : this.modifier
        const terrainData = new TerrainData(opts);
        return terrainData
    }
    modifier = (v: any) => {
        var value = (0.5 + v / 2);
        return value ** 3;
    }

    islandModifier = (v: any, x: any, y: any) => {
        var xd = (x - 0.5) * 2;
        var yd = (y - 0.5) * 2;

        var d = Math.sqrt(xd ** 2 + yd ** 2);

        var value = (0.5 + v / 2);
        if (d < 0.5) {
            return value ** 3;
        } else {
            var dm = (0.5 - (d - 0.5)) / 0.5;

            return value ** 3 * dm;
        }
    }
    _buildGeometry(terrainData: any) {
        const DEFAULT_HEIGHT_MULTIPLIER = 100;
        const meshSize = 100;
        const resolution = 300;
        const verticesPerSide = resolution + 1
        const dataResolutionMultiplier = 4;
        const geometry = new THREE.PlaneGeometry(meshSize, meshSize, resolution, resolution);
        geometry.rotateX(- Math.PI / 2);

        const cannonOut: any = []
        for (var x = 0; x < verticesPerSide; x++) {
            cannonOut.push([])
            for (var y = 0; y < verticesPerSide; y++) {

                var ind = (x + verticesPerSide * y) * 3 + 1

                const val = terrainData.valueAtCoord(x * dataResolutionMultiplier, y * dataResolutionMultiplier) * terrainData.zoom * DEFAULT_HEIGHT_MULTIPLIER;
                geometry.attributes.position.array[ind] = val;
                cannonOut[x].push(val)
            }
            cannonOut[x].reverse()
            // console.log("pushed x ", cannonOut[x])
        }

        // for (var x = verticesPerSide - 1; x > 0; x--) {
        //     cannonOut.push([])
        //     for (var y = verticesPerSide - 1; y > 0; y--) {
        //         const val = terrainData.valueAtCoord(x * dataResolutionMultiplier, y * dataResolutionMultiplier) * terrainData.zoom * DEFAULT_HEIGHT_MULTIPLIER;
        //         cannonOut[verticesPerSide - x].push(val)
        //     }
        // }
        console.log("cannon out ", JSON.stringify(cannonOut))
        return { geometry, cannonOut, resolution, meshSize };
    }

    addLighting() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 3.5));

        const light = new THREE.SpotLight(0xfdb813, 1);
        light.position.set(200, 200, -200);
        light.castShadow = true;
        // light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(70, 1, 200, 2000));
        light.shadow.mapSize.width = 2048 * 4;
        light.shadow.mapSize.height = 2048 * 4;
        light.shadow.radius = 1;

        this.scene.add(light)
    }
    addHeightMap() {
        // let allPts = []
        // // Create a matrix of height values
        // const matrix: any = []
        // const sizeX = 10
        // const sizeZ = 10
        // for (let i = 0; i < sizeX; i++) {
        //     matrix.push([])
        //     for (let j = 0; j < sizeZ; j++) {
        //         if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeZ - 1) {
        //             const height = 3
        //             matrix[i].push(height)
        //             allPts.push(...[j, height, i])
        //             continue
        //         }

        //         const height = Math.cos((i / sizeX) * Math.PI * 2) * Math.cos((j / sizeZ) * Math.PI * 2) + 2
        //         matrix[i].push(height)
        //         allPts.push(...[j, height, i])
        //     }
        // }


        const terrainData = this._buildTerrainData()
        const colorData = [
            {
                max: 0.058,
                color: [220, 186, 150]
            },
            {
                max: 0.175,
                color: [75, 186, 80]
            },
            {
                max: 0.3,
                color: [68, 178, 72]
            },
            {
                max: 0.5,
                color: [111, 106, 96]
            },
            {
                max: 0.65,
                color: [100, 90, 85]
            },
            {
                max: 0.8,
                color: [220, 220, 220]
            },
            {
                max: 100,
                color: [255, 255, 255]
            }
        ]
        const material = this._setupMaterial(terrainData, colorData)
        const { geometry, cannonOut, resolution, meshSize } = this._buildGeometry(terrainData)
        const mm = new THREE.Mesh(geometry, material)
        mm.position.y = -2
        this.scene.add(mm)
        // console.log("created matrix", matrix)
        // const heightmapHeights = heightMapJSON.map(p=> p[1])
        // console.log("mapped ", heightmapHeights)
        console.log("using resolution", 10 / resolution)
        console.log("vs", 0.1 / 3)
        var heightfieldShape = new CANNON.Heightfield(cannonOut, {
            elementSize: meshSize / resolution // Distance between the data points in X and Y directions
        });

        var heightfieldBody = new CANNON.Body({ mass: 0 });
        heightfieldBody.addShape(heightfieldShape);
        heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

        // heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)



        heightfieldBody.position.set(-meshSize / 2, -2, meshSize / 2)
        this.world.addBody(heightfieldBody);
    }

    generateBalls() {
        // this.world.addBody(new CANNON.Body)
    }
    initRenderer() {
        var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        // renderer.shadowMap.enabled = true;
        // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer = renderer;
        document.body.appendChild(renderer.domElement);
        // use ref as a mount point of the Three.js scene instead of the document.body
        return renderer;
    }

    initCannon() {
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.8, 0), // m/s²
        });


        this.cannonDebugger = new CannonDebugger(this.scene, this.world, {})

        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.world.addBody(groundBody);

        this.addHeightMap()

    }




    animate = () => {
        console.log("animating")
        requestAnimationFrame(this.animate);
        this.controls.update()

        // Step the physics world
        this.world.fixedStep();
        this.cannonDebugger.update() // Update the CannonDebugger meshes
        // Copy coordinates from cannon.js to three.js

        // Render three.js
        this.renderer.render(this.scene, this.camera);
    }
}