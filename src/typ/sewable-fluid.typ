#import "@preview/circuiteria:0.2.0"
#import "@preview/cetz:0.3.2"

#show math.equation: html.frame
#show math.equation.where(block: false): box

#let center(it) = html.elem(
  "div",
  attrs: (style: "display: flex; justify-content: center;"),
  html.frame(it),
)

= Sewable Fluid Simulation

In this post, I'll go over making a fluid simulation that looks like this:

// #image("assets/sewable-fluid/title.png")
//
// And here's an interactive version:

#html.elem("div", attrs: (class: "simulation", id: "simulation-demo"))

I'll cover the details of sewing it, what parts you'll need, and how to program it.

= Electronics

The simulation itself revolves around a mictrocontroller and an innertial measurement unit (IMU).
The microcontroller runs the fluid simulation, and the IMU measures what direction gravity is in, so
that the fluid flows downwards. The display is built out of a strip of neopixels, which are
individually addressable LEDs.

The microcontroller I'm using is the STM32F401CCU6. The important bits of that name are the "STM32,"
which is the type of microcontroller, and the "F4," which is which class of microcontroller it is.
The F4 class has native floating point instructions, which is why it's fast enough to run this
entire simulation. The IMU I'm using  is the MPU-6050, which is a widely available chip (at least at
the time of writing). This IMU is a combined accelerometer and gyroscope. Only the accelerometer is
used in this project.

== Wiring everything up

The microcontroller and IMU are attached with an I2C bus. I2C (Inter-Integrated Circuit) is a
protocol that allows multiple chips to communicate with each other with two wires, as opposed to
connecting up a bunch of wires for each signal, or individual wires for each chip. We're only going
to use I2C to connect two chips in this circuit, but it's still convenient for this.

The neopixels use a different communication protocol that uses a single signal wire. This protocol
is far less flexible than I2C, and so can only control a single strip of neopixels at a time.

All that being said, the circuit we're going to build will look a bit like so:

#center(circuiteria.circuit({
  import cetz: draw
  import circuiteria: *

  element.block(
    id: "imu",
    name: "IMU",
    w: 3, h: 2,
    x: -4, y: 0,
    fill: util.colors.blue,
    ports: (
      east: ((id: "SCL", name: "SCL"), (id: "SDL", name: "SDL")),
      south: ((id: "vbat", name: "VBAT"), (id: "gnd", name: "GND")),
    ),
  )

  element.block(
    id: "pi",
    name: "STM32",
    w: 5, h: 2,
    x: 0, y: 0,
    ports: (
      west: ((id: "SCL", name: "SCL"), (id: "SDL", name: "SDL")),
      east: ((id: "GPIO0", name: "GPIO-0"),),
      south: (
        (id: "3v", name: "3.3v"),
        (id: "vbat", name: "VBAT"),
        (id: "gnd", name: "GND"),
      ),
    ),
    fill: util.colors.green
  )

  wire.stub("imu-port-gnd", "south", name: "-")

  wire.stub("pi-port-vbat", "south", name: "+5v")
  wire.stub("pi-port-gnd", "south", name: "-")

  wire.wire(
    "w1",
    ("imu-port-vbat", "pi-port-3v"),
    style: "dodge",
    dodge-sides: ("south", "south"),
    dodge-margins: (0, 0),
    dodge-y: -1.0,
  )
  wire.wire("w1", ("imu-port-SCL", "pi-port-SCL"))
  wire.wire("w1", ("imu-port-SDL", "pi-port-SDL"))

  for i in range(4) {
    element.block(
      id: "l-" + str(i),
      w: 1, h: 1,
      x: i * 2 + 6 + if i >= 2 { 2 } else { 0 }, y: 0.5,
      ports: (
        west: ((id: "data-in"),),
        east: ((id: "data-out"),),
        north: ((id: "3v"),),
        south: ((id: "gnd"),),
      ),
      fill: util.colors.purple
    )

    wire.stub("l-" + str(i) + "-port-3v", "north")
    wire.stub("l-" + str(i) + "-port-gnd", "south")

    if i == 0 {
      wire.stub("l-" + str(i) + "-port-3v", "north", name: "+5v")
      wire.stub("l-" + str(i) + "-port-gnd", "south", name: "-")
    }

    if i > 0 {
      wire.wire("w1", ("l-" + str(i - 1) + "-port-data-out", "l-" + str(i) + "-port-data-in"))
    }
  }

  draw.rect((10, 0.5), (11, 1.5), stroke: none, fill: rgb("#f0f0f0"))
  draw.content((10.5,1), [...])

  wire.wire("w1", ((6.5, 0), (14.5, 0)))
  wire.wire("w1", ((6.5, 2), (14.5, 2)))

  for i in range(4) {
    draw.circle((i * 2 + 6 + if i >= 2 { 2 } else { 0 } + 0.5, 2), radius: .1, fill: white)
    draw.circle((i * 2 + 6 + if i >= 2 { 2 } else { 0 } + 0.5, 0), radius: .1, fill: white)
  }

  wire.wire("w1", ("pi-port-GPIO0", "l-0-port-data-in"))
}))

Or for short:
- We'll attach the IMU to the STM32 with two wires for the I2C connection.
- We'll attach a single wire from the STM32 to the first LED, then that LED will be connected to the
  next, in a daisy chain.
- The neopixels (in purple) run off 5v, and the STM32 can step down 5v to the 3.3v the IMU needs.

= Particle-based Fluid Simulations

Particle based fluid simulations revolve around gradient descent. Specifically, they revolve around
a world of particles, that have physics applied to each other, and then all repel each other when
they get to close. 

== Defining our Particles

Before getting into any of the math, we'll start off by defining our particles. Each particle is a
point in space, with a velocity and a position. We'll start by just applying a force of gravity to
them. I'll be using Verlet integration, which is a method of applying a force to a particle over
discrete time steps, without losing accuracy over time. Specifically, for each particle, we run the
following code:

```rs
let velocity = particle.position - particle.prev_position;
let accel = GRAVITY * DELTA_TIME * DELTA_TIME;

particle.position = particle.position + velocity + accel;
```

`DELTA_TIME` is 1/60th of a second, as we are running this simulation at 60 frames per second.
`GRAVITY` is a vector pointing downwards, with the force of gravity that we're using. If we run this
in a simulation, we get something like so:

#html.elem("div", attrs: (class: "simulation", id: "simulation-gravity"))

As you can see, that's not very convincing. If you click on the simulation, you can push the
particles around, but aside from that, the particles don't react to each other at all.

== Adding the Math

The goal of a fluid simulation is to space out the particles as evenly as possible. To do that, we
need to know two things: how "dense" the fluid is at every particle, and what direction to push each
particle to make them spaced out evenly. Intuitively this makes sense---if there aren't enough
particles in a given space, then some nearby particles should expand to fill that space. If there
are too many particles in a space, the particles should push outwards to take up more space.

Lets start with the density function. Density is defined as the number of particles in a given
space. Because we only have a few particles, we'll use the distance between particles to approximate
density. As the particles get closer to each other, we'll increase the density estimate. To make
this density estimate behave nicely, we'll pass the distance between particles through a function to
smooth out these estimates. The function I'm using is the poly6 kernel. This function is defined as
follows:

#center[
  $
  W_("poly6")(r) = 315/(64 pi d^9) cases(
    (r^2 - d^2)^3 #h(2mm) &0 <= r <= d,
    0                     &"otherwise"
  )
  $
]

When graphed, this looks like so:

#html.elem("div", attrs: (class: "simulation", id: "graph-poly6"))

Of course, the distance is always positive. So, we will only be using the right half of this graph.
The result is still clear: as particles get closer together, the density estimate goes up. Once the
particles are right on top of each other, the force tapers off a bit. This helps the simulation not
explode---if the particles right ontop of each other produced infinite density, the solver would try
and push those particles apart with infinite force, and the whole simulation would break down.

Now, in code, we can compute the density for every particle:
```rs
for particle in self.particles {
  let mut estimated_density = 0.0;

  for neighbor in self.index.neighbors(particle) {
    let distance = (particle.position - neighbor.position).length();

    let weight = kernel_poly6(distance, self.radius);
    estimated_density += PARTICLE_MASS * weight;
  }

  particle.density = estimated_density;
  // NOTE: This is wrong! I'll expand on this
  // later, but it'll at least get us started.
  particle.density_error =
    (particle.density / REST_DENSITY - 1.0).max(-0.005);
}
```

Once we've computed the particle's density, we compute the error in that density. That is, how far
away the density is from our target density. I'll get into why it's wrong later, but this
illustrates the basic idea: the density error is how far away the particle is from it's ideal
density.

Next, we need to figure out how particles know what direction to move in. We'll do this using a
gradient. The gradient is a function that takes a 2D vector, and returns a 2D vector. The vector
passed into this function is the delta between a particle and one of its neighbors. The returned
vector is the direction that the particle should move to increase it's density. Graphing the
gradient function looks like so:

#html.elem("div", attrs: (class: "simulation", id: "graph-gradient"))

#center[_Note: these arrows are illustrative---the actual gradient is much larger_.]

#html.elem("div", attrs: (style: "height: 1em;"))

Or, if we look at the magnitude of the gradient at Y=0:

#html.elem("div", attrs: (class: "simulation", id: "graph-gradient-slice"))

This function is notably spiky. The gradient increases as the distance between the particles gets
smaller. There is a gap right at X=0 and Y=0, but that's because we don't know what direction to
move two overlapping particles.

We can now compute the gradient between every pair of particles, and multiply that gradient by our
`density_error`. In code, that looks like this:

```rs
let mut position_deltas = [vector![0.0, 0.0]; N];

for particle in self.particles {
  let mut total_position_delta = vector![0.0, 0.0];

  for neighbor in self.index.neighbors(particle) {
    let delta = particle.predicted - neighbor.predicted;
    let distance = delta.length();

    let kernel_gradient = kernel_spiky_gradient(delta, self.radius);

    total_position_delta +=
      (particle.density_error + neighbor.density_error)
        * PARTICLE_MASS
        * kernel_gradient;
  }

  position_deltas[particle] = total_position_delta / REST_DENSITY;
}
```

We sum up the gradients, using the sum of the particle's density error and it's neighbor's density
error. When the density error is positive, the particles will move towards each other, and they'll
repel otherwise.

This is the bulk of the simulation. The last bit is to just apply those position deltas to the
particle's positions, and we'll have something that looks a bit like so:

#html.elem("div", attrs: (class: "simulation", id: "simulation-naive-lambda"))

This is looking pretty good! The particles are reacting to each other, and making a sort of squishy
substance. But it doesn't really look like water. To fix this, we've got to go fix that
`density_error` I mentioned before.

== Improving the Simulation

To fix the `density_error`, we can use the sum of the magnitude of the spiky gradient around each
particle. While a bit of a mouthful, we can think of it as the amount that the particle is being
pushed. If there's a particle right in between two others, the density won't be super high (because
we have the poly6 kernel applied to the gradient). But, the spiky gradient will produce a large
vector between the middle particle and each of it's neighbors. By using the magnitude of this spiky
gradient, we can see that this particle is getting "pushed" strongly by it's neighbors, and so the
density error should be higher.

In code, that looks like modifying our first loop like so:
```rs
for particle in self.particles {
  let mut estimated_density = 0.0;
  let mut gradient_sum = vector![0.0, 0.0];
  let mut gradient_sum_squared = 0.0;

  for neighbor in self.index.neighbors(id as u32) {
    let delta = particle.predicted - neighbor.predicted;
    let distance = delta.length();

    // This is our old density estimate.
    let weight = kernel_poly6(distance, self.radius);
    estimated_density += PARTICLE_MASS * weight;

    // While we're here, let's also compute the gradient.
    let gradient =
      kernel_spiky_gradient(delta, self.radius)
      * (PARTICLE_MASS / REST_DENSITY);
    gradient_sum += gradient;
    gradient_sum_squared += gradient.norm_squared();
  }

  gradient_sum_squared += gradient_sum.norm_squared();
  // This is our old 'density error'
  let density_constraint =
    (estimated_density / REST_DENSITY - 1.0).max(-0.005);

  self.particles[id].density_error =
    -density_constraint / gradient_sum_squared;
}
```

We need to also add the gradient from this particle itself, so that's why we're computing both
`gradient_sum` and `gradient_sum_squared`. But, if we use this new new density error, the simulation
immediately looks far better:

#html.elem("div", attrs: (class: "simulation", id: "simulation-no-tensile"))

Specifically, the particles at the bottom aren't getting squished at all, and the fluid doesn't feel
squishy any more. It actually responds like a splash of water, and it takes up a consistent amount
of space. We've got a new problem now though: the surface is constantly moving around. This can be
fixed up with a new corrective force, known as tensile correction.

== Tensile Correction

This is the last bit of making a convincing fluid simulation. The particles along the top are all
quite noisy, and are allowed to get quite close to each other. We don't really want that, and we can
fix that with a tensile correction term. If we add a repelling force when particles are right next
to each other, we can make the top of the fluid a lot more stable.

The tensile correction force I used looks like this:

#html.elem("div", attrs: (class: "simulation", id: "graph-tensile"))

While it's quite small, it still has the desired effect. We can add it into the `position_deltas`
calculation like so:

```rs
let correction = tensile_correction(distance, self.radius);

total_position_delta +=
  (particle.density_error + neighbor.density_error + correction)
    * PARTICLE_MASS
    * kernel_gradient;
```

And that makes the surface of the fluid behave much more smoothly:

#html.elem("div", attrs: (class: "simulation", id: "simulation-with-tensile"))
