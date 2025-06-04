import { useEffect, useState } from "preact/hooks";
import RAPIER from "@dimforge/rapier2d";
import "./SkillsSimulation.css";

export const SkillsSimulation = () => {
  const [objects, setObjects] = useState<RAPIER.Vector2[]>([]);

  const numObjects = 20;

  useEffect(() => {
    // Use the RAPIER module here.
    let gravity = { x: 0.0, y: -9.81 };
    let world = new RAPIER.World(gravity);

    world.createCollider(
      RAPIER.ColliderDesc.cuboid(10.0, 0.1).setTranslation(5.0, -0.05),
    );
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(0.1, 10.0).setTranslation(-0.05, 5.0),
    );
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(0.1, 10.0).setTranslation(10.05, 5.0),
    );

    for (let i = 0; i < numObjects; i++) {
      let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
        i * (10 / numObjects),
        1.0,
      );
      let rigidBody = world.createRigidBody(rigidBodyDesc);

      let colliderDesc = RAPIER.ColliderDesc.ball(0.5);
      world.createCollider(colliderDesc, rigidBody);
    }

    let timeout = 0;

    let simLoop = () => {
      world.step();

      const objects = [] as RAPIER.Vector2[];
      world.forEachRigidBody((body) => {
        objects.push(body.translation());
      });
      setObjects(objects);

      timeout = setTimeout(simLoop, 16);
    };

    simLoop();

    return () => {
      clearTimeout(timeout);
      world.free();
    };
  }, []);

  // The world is 700px wide, and that is 10m wide in the simulation.
  const scale = 700 / 10;

  return (
    <div class="skills-sim">
      {objects.map((obj, index) => (
        <div
          key={index}
          class="object"
          style={{
            marginLeft: `${obj.x * scale - scale / 2}px`,
            bottom: `${obj.y * scale + 5}px`,
            width: scale,
            height: scale,
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  );
};
