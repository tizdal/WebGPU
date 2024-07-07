
import { Assets, Loader, Graphics, Sprite, Container, EventSystem, Rectangle, TextureStyle, autoDetectRenderer, Text } from 'pixi-v8';
import { BunnyV8 } from './bunny';
import { Pane } from 'tweakpane';

TextureStyle.defaultOptions.scaleMode = 'nearest'
EventSystem.defaultEventFeatures.move = false;
EventSystem.defaultEventFeatures.globalMove = false;

const bunnyPool: BunnyV8[] = [];
const responsesToQuestions = [];
let actualBunnyCount = 0;
let knownBunnyCount = 0;
let questionCheckTimer = 0;
let errors = 0;
let strike = false;
let challange : boolean|number = false;

let distanceWorker: Worker | undefined;

export async function jamboReeUnallocated({ preference }: { preference: 'webgl' | 'webgpu' }) {

    const renderer = await autoDetectRenderer({
        preference,
        clearBeforeRender: true,
        backgroundAlpha: 1,
        backgroundColor: 0xFFFFFF,
        width: 800,
        height: 600,
        resolution: 1,
        antialias: false,
        hello: true,
    });

    renderer.resize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.view.canvas as HTMLCanvasElement)

    const stage = new Container();

    // Load the image
    const textures = Object.values(await Assets.load([
        './assets/bunnies/rabbitv3_ash.png',
        './assets/bunnies/rabbitv3_batman.png',
        './assets/bunnies/rabbitv3_bb8.png',
        './assets/bunnies/rabbitv3_frankenstein.png',
        './assets/bunnies/rabbitv3_neo.png',
        './assets/bunnies/rabbitv3_sonic.png',
        './assets/bunnies/rabbitv3_spidey.png',
        './assets/bunnies/rabbitv3_stormtrooper.png',
        './assets/bunnies/rabbitv3_superman.png',
        './assets/bunnies/rabbitv3_tron.png',
        './assets/bunnies/rabbitv3_wolverine.png',
        './assets/bunnies/rabbitv3.png',
        './assets/challanges/final/EnergyRev.png',
        './assets/challanges/final/PainMGMT.png',
        './assets/challanges/final/SenseMotion.png',
        './assets/challanges/final/ResourceRev.png',
        './assets/challanges/final/PeekBehindEyes.png',
        './assets/challanges/final/InteractiveGames.png',
        './assets/challanges/final/SustainableAI.png'
    ]));


    const junctionTexture = Object.values(await Assets.load([
        './assets/junction.map.png'
    ]));

    const junction = new Sprite(junctionTexture[0]);

    junction.anchor.x = 0.5;
    junction.anchor.y = 0.5;

    junction.position.x = window.innerWidth/3;
    junction.position.y = window.innerHeight/3;

    stage.addChild(junction);

    let lastPos: any, delta: any, startPos: any;
    let isKeyDown: boolean;

    addEventListener('pointerdown', onDown);
    addEventListener('pointermove', onMove);
    addEventListener('pointerup', onUP);

    function onDown(e: any) {
        isKeyDown = true
        startPos = { x: e.x, y: e.y }
        console.log("OnDownPress");
        console.log(startPos);
        setTimeout(function(){
            console.log("Timeout 400 ");
            if (pause){
                findClosestHitBunny(startPos, bunnies);
                //calculateDistance(startPos, bunnies);
            } else {
                console.log("There was no pause");
            }
        }, 700);

        lastPos = null
    }
    function onMove(e: any) {
        if (!isKeyDown) return
        if (!lastPos) delta = { x: startPos.x - e.x, y: startPos.y - e.y }
        else delta = { x: e.x - lastPos.x, y: e.y - lastPos.y }
        lastPos = { x: e.x, y: e.y }
        stage.x += delta.x
        stage.y += delta.y
    }
    function onUP(e: any) {
        isKeyDown = false
    }
    

    const bounds = new Rectangle(0, 0, window.innerWidth, window.innerHeight);

    const bunnies: BunnyV8[] = [];

    const basicText : Text = new Text('Basic text in pixi 2');

    basicText.x = 50;
    basicText.y = 100;
    
    stage.addChild(basicText);

    setInterval(function(){
        if (!pause) {
            basicText.text = "Hackathonists Arrived:: " + bunnies.length;
            if (errors > 0){
                basicText.text += ". SmallTalk failed  " + errors + " times";
            }
            if (knownBunnyCount > 0){
                basicText.text += ". You spoke with " + knownBunnyCount;
            }
        } else {
            if (questionCheckTimer > 5){
                if (!challange){
                    strike = true;
                    basicText.text = "Looks like you did not get him" ;
                    setTimeout(function (){
                        addBunny();
                        errors++;
                        strike = false;
                        pause = false;
                    }, 1000);
                } else {
                    processChallange();
                }

            }
            questionCheckTimer++;
        }
    }, 1000)

    function addBunny(type : string = "bunny") {
        if (type == ""){
            return;
        }
        if (type == "bunny"){
            let bunnyTextureCount = 12; //textures.length
            let bunnyIndex = bunnies.length % bunnyTextureCount;
            let bunnyX = 1151.1811026028956;
            let bunnyY = 419.6868185311248;
            processItemThatMightBeBunny(bunnyIndex, bunnyX, bunnyY);
            actualBunnyCount++;
        }
    }

    function processItemThatMightBeBunny(bunnyIndex: number, bunnyX: number, bunnyY: number){
        const bunny = bunnyPool.pop() || new BunnyV8(textures[bunnyIndex], bounds, bunnyX, bunnyY);
        bunny.reset();
        stage.addChild(bunny.view);
        bunnies.push(bunny);
    }

    function startDistanceWorker() {
        if (typeof Worker !== 'undefined') {
          if (typeof distanceWorker === 'undefined') {
            distanceWorker = new Worker('workers/distance.js');
            distanceWorker.onmessage = finishedCalculations
          } else {
            console.log('Worker already exists.');
            //pentalty bunny
            addBunny();
          }
        } else {
          console.log('Sorry, your browser does not support Web Workers.');
          //did not comply with requirements
          //penalty bunny
          addBunny();
        }
    }
    //@ts-ignore removed , because of WebWorker issues...
    function calculateDistance(startPos: any, bunnies: BunnyV8[]) {
        if (!startPos || !bunnies){
            return;
        }
        if (distanceWorker) {
            distanceWorker.postMessage({startPos: startPos, bunnies: bunnies}); // Sending data to the worker
        } else {
          console.log('Worker not available.');
          //bunny penalty 
          addBunny();
        }
      }

      function finishedCalculations(this: Worker, event: MessageEvent<any>) {
        console.log('Received message from the worker:', event.data);
        alert(event.data);
      };

      function findClosestHitBunny(startPos: { x: number, y: number }, bunnies: BunnyV8[]): void {
        console.log("local calculation of closest bunny");
        let closestIndex = -1;
        let closestDistance = Number.MAX_VALUE;
      
        for (let i = 0; i < bunnies.length; i++) {
          const bunny = bunnies[i];
          const hit = hitTest(bunny.positionX, bunny.positionY, 25, 32, startPos.x, startPos.y);
      
          if (hit) {
            const distance = calculateDistanceLocal(bunny.positionX, bunny.positionY, startPos.x, startPos.y);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = i;
            }
          }
        }

        finishedCalculationsLocal(closestIndex);
      }

      function finishedCalculationsLocal(index: number) {
        console.log('Received message locally:', index);
        if (index > -1) {
            challange = index;
        }
      };
      
      function calculateDistanceLocal(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      }
      
      function hitTest(
        x1: number,
        y1: number,
        width1: number,
        height1: number,
        x2: number,
        y2: number
      ): boolean {
        return (
          x1 < x2 + 25 &&
          x1 + width1 > x2 &&
          y1 < y2 + 32 &&
          y1 + height1 > y2
        );
      }


    function loadWatcher(){
        requestAnimationFrame( () => {
            let t = Date.now();
            let fps = Math.round(1000 / (Date.now() - t));
            let addHackathonist = true;
            
            if (fps < 60) {
                console.log("fps danger zone");
                addHackathonist = true;
            }

            if (fps < 24){
                console.log("fps lag detected");
                addHackathonist = false;
            }
            if (addHackathonist){
                addBunny();
            }
            //loadWatcher();
        });
    }

    loadWatcher();


    let pause = false;

    renderer.view.canvas.addEventListener('mousedown', (e) => {
        console.log("Pause switcher");
        pause = true;
    });


    function renderUpdate() {

        if (!pause) {
            for (let i = 0; i < bunnies.length; i++) {
                if (!bunnies[i]){
                    continue;
                }
                bunnies[i].update();
            }
        } else if (!strike){
            basicText.text = "Did you get him ??";
        }

        renderer.render(stage);
        requestAnimationFrame(renderUpdate)
    }

    function processChallange(){
        basicText.text = "Bare minimum Win case ! Congrats";
        setTimeout(function(){
            challange = false;
            pause = false;
            knownBunnyCount++;
            errors--;
        }, 5000);
    }

    renderUpdate();
    startDistanceWorker();


}
