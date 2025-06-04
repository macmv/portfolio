import { useEffect, useState } from "preact/hooks";
import RAPIER from "@dimforge/rapier2d";
import "./Physics.css";

export const Physics = () => {
  const [objects, setObjects] = useState<RAPIER.RigidBody[]>([]);

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
        ((i % 8) * 10) / 8 + 0.5 + Math.random() * 0.4 - 0.2,
        1.0 * Math.floor(i / 8) + 0.5,
      );
      let rigidBody = world.createRigidBody(rigidBodyDesc);

      let colliderDesc = RAPIER.ColliderDesc.ball(0.5);
      world.createCollider(colliderDesc, rigidBody);
    }

    let timeout = 0;

    let simLoop = () => {
      world.step();

      const objects = [] as RAPIER.RigidBody[];
      world.forEachRigidBody((body) => {
        objects.push(body);
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

  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [mouseStart, setMouseStart] = useState<[number, number] | null>(null);

  return (
    <div
      class="physics-sim"
      onMouseDown={(e) => {
        if (highlighted !== null) {
          setMouseStart([e.clientX, e.clientY]);
          objects[highlighted].setGravityScale(0.0, true);
        }
      }}
      onMouseUp={() => {
        if (highlighted !== null) {
          objects[highlighted].setGravityScale(1.0, true);
        }
        setMouseStart(null);
        setHighlighted(null);
      }}
      onMouseMove={(e) => {
        if (highlighted !== null && mouseStart !== null) {
          const obj = objects[highlighted];

          const dx = e.clientX - mouseStart[0];
          const dy = e.clientY - mouseStart[1];
          setMouseStart([e.clientX, e.clientY]);

          obj.setTranslation(
            new RAPIER.Vector2(
              obj.translation().x + dx / scale,
              obj.translation().y - dy / scale,
            ),
            true,
          );
          obj.setLinvel(new RAPIER.Vector2(0, 0), true);
        }
      }}
    >
      {objects.map((obj, index) => (
        <div
          key={index}
          class="object"
          onMouseOver={() => {
            if (mouseStart === null) {
              setHighlighted(index);
            }
          }}
          onMouseOut={() => {
            if (mouseStart === null) {
              setHighlighted(null);
            }
          }}
          style={{
            left: obj.translation().x * scale - scale / 2 - 3,
            bottom: obj.translation().y * scale - scale / 2 - 3,
            ...(highlighted === index ? { borderColor: "var(--green)" } : {}),
          }}
        />
      ))}
    </div>
  );
};
