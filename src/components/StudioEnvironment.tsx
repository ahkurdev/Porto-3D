import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Generates a zero-dependency procedural studio environment map using Three.js RoomEnvironment.
 * Ensures brushed titanium and obsidian bevels receive crisp reflections without external HDR fetches.
 */
const StudioEnvironment = () => {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();
    const room = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(room, 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.85;

    return () => {
      scene.environment = null;
      envRT.dispose();
      room.dispose();
      pmremGenerator.dispose();
    };
  }, [gl, scene]);

  return null;
};

export default StudioEnvironment;
