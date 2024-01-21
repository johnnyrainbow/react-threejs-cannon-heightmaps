import * as THREE from 'three';


import { Fragment, useEffect, useRef } from "react";
import { ThreeGame } from './three/ThreeGame';

function ThreeExample() {
  const refContainer = useRef(null);
  useEffect(() => {
    var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);
    const threeGame = new ThreeGame(renderer)



  }, []);


  return (
    <Fragment>
      <div id="scene" ref={refContainer}></div>
      <div style={{display:'none'}} id="texture"></div>
    </Fragment>
  );
}

export default ThreeExample