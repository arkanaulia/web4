"use client";

import * as THREE from "three";
import { useRef, useState, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Detailed, useProgress } from "@react-three/drei";
import {
  EffectComposer,
  DepthOfField,
  ToneMapping,
} from "@react-three/postprocessing";

// Mouse tracking hook
function useMouse3D(mouseRef) {
  const { size, camera } = useThree();

  useEffect(() => {
    function onMouseMove(event) {
      const x = (event.clientX / size.width) * 2 - 1;
      const y = -(event.clientY / size.height) * 2 + 1;
      const vector = new THREE.Vector3(x, y, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      mouseRef.current = camera.position
        .clone()
        .add(dir.multiplyScalar(distance));
    }

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [camera, size]);
}

// Iridescent material
function IridescentMaterial() {
  return (
    <meshStandardMaterial
      metalness={1}
      roughness={0.1}
      color="#ffffff"
      iridescence={1}
      iridescenceIOR={1.8}
      envMapIntensity={2}
    />
  );
}

function LoaderSignal() {
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      window.dispatchEvent(new Event("r3f-ready"));
    }
  }, [progress]);

  return null;
}

// Banana component
function Banana({ index, z, speed, mouse, isHovered }) {
  const ref = useRef();
  const { viewport, camera } = useThree();
  const { width, height } = viewport.getCurrentViewport(camera, [0, 0, -z]);
  const { nodes } = useGLTF("/arkanlogo.glb");

  const [data] = useState({
    y: THREE.MathUtils.randFloatSpread(height * 2),
    x: THREE.MathUtils.randFloatSpread(2),
    spin: THREE.MathUtils.randFloat(8, 12),
    rX: Math.random() * Math.PI,
    rZ: Math.random() * Math.PI,
  });

  const floatingRef = useRef({ y: data.y, rX: data.rX, rZ: data.rZ });
  const [lookTarget] = useState(new THREE.Vector3());
  const [velocity] = useState(new THREE.Vector3());

  const bounceForce = 1.5;

  // Raycaster to detect clicks on objects
  const raycaster = useRef(new THREE.Raycaster());
  const mouse2D = useRef(new THREE.Vector2());

  // Handle mouse click to make the object bounce
  const handleClick = (event) => {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    const rect = event.target.getBoundingClientRect();
    mouse2D.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse2D.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the raycaster
    raycaster.current.update(camera, viewport);

    // Set up the ray
    raycaster.current.update(camera, mouse2D.current);

    // Check for intersections with meshes
    const intersects = raycaster.current.intersectObject(ref.current);

    if (intersects.length > 0) {
      // Apply the bounce effect if the object was clicked
      console.log("Object clicked:", intersects[0]);
      const direction = new THREE.Vector3()
        .subVectors(ref.current.position, mouse.current)
        .normalize();
      velocity.add(direction.multiplyScalar(bounceForce));
      console.log("Velocity after click:", velocity); // Debugging line
    }
  };

  useFrame((state, dt) => {
    if (!ref.current) return;
    if (dt > 0.1) dt = 0.1;

    const mesh = ref.current;
    const pos = mesh.position;
    const rot = mesh.rotation;

    const distanceToMouse = pos.distanceTo(mouse.current);

    if (distanceToMouse < 3) {
      const direction = new THREE.Vector3()
        .subVectors(pos, mouse.current)
        .normalize();
      velocity.add(direction.multiplyScalar(bounceForce));
    }

    // Apply velocity for bounce
    pos.add(velocity);
    velocity.multiplyScalar(0.95);

    if (isHovered) {
      // Let it rotate toward mouse
      lookTarget.copy(mouse.current);
      const dummy = new THREE.Object3D();
      dummy.position.copy(pos);
      dummy.lookAt(lookTarget);
      dummy.rotateX(Math.PI / 2);
      mesh.quaternion.slerp(dummy.quaternion, 0.05);
    } else {
      // Floating logic only if not hovered
      floatingRef.current.y += dt * speed;
      const threshold = height * (index === 0 ? 4 : 1.5);
      if (floatingRef.current.y > threshold) {
        floatingRef.current.y -= threshold * 2;
      }

      // Update base position and rotation
      pos.set(index === 0 ? 0 : data.x * width, floatingRef.current.y, -z);

      floatingRef.current.rX += dt / data.spin;
      floatingRef.current.rZ += dt / data.spin;

      rot.x = THREE.MathUtils.lerp(rot.x, floatingRef.current.rX, 0.05);
      rot.y = THREE.MathUtils.lerp(
        rot.y,
        Math.sin(index * 1000 + state.clock.elapsedTime / 10) * Math.PI,
        0.05
      );
      rot.z = THREE.MathUtils.lerp(rot.z, floatingRef.current.rZ, 0.05);
    }
  });

  return (
    <Detailed ref={ref} distances={[0, 65, 300]}>
      <mesh
        geometry={nodes.arkanlogo.geometry}
        scale={10}
        onClick={handleClick} // Trigger bounce on click
      >
        <IridescentMaterial />
      </mesh>
    </Detailed>
  );
}

// Scene content
function SceneContent({ speed, count, depth, easing, hovered }) {
  const mouse = useRef(new THREE.Vector3());
  useMouse3D(mouse);

  return (
    <>
      <color attach="background" args={["#212121"]} />
      <spotLight
        position={[10, 20, 10]}
        penumbra={1}
        decay={0}
        intensity={3}
        color="orange"
      />
      {Array.from({ length: count }, (_, i) => (
        <Banana
          key={i}
          index={i}
          z={Math.round(easing(i / count) * depth)}
          speed={speed}
          mouse={mouse}
          isHovered={hovered}
        />
      ))}
      <Environment preset="city" />
      <EffectComposer disableNormalPass multisampling={0}>
        <DepthOfField
          target={[0, 0, 70]}
          focalLength={0.4}
          bokehScale={8}
          height={700}
        />
        <ToneMapping />
      </EffectComposer>
    </>
  );
}

// Main component
export default function Bananas({
  speed = 1,
  count = 80,
  depth = 80,
  easing = (x) => Math.sqrt(1 - Math.pow(x - 1, 2)),
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="h-full rounded-3xl overflow-hidden">
      <Canvas
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 15], fov: 10, near: 0.01, far: depth + 15 }}
      >
        <SceneContent
          speed={speed}
          count={count}
          depth={depth}
          easing={easing}
          hovered={hovered}
        />
      </Canvas>
      <LoaderSignal />
    </div>
  );
}
