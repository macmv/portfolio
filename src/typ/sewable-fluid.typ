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

I'll cover the details of sewing it, what parts you'll need, and how to program it. All the source
code can be found on my GitHub. The code for the standalone fluid simulation is in this repository:
#link("https://github.com/macmv/fluid-sim"), and the code for the microcontroller is on this
repository: #link("https://github.com/macmv/fl-pi").

This was heavily inspired by a project from mixtela, which can be viewed here:
#link("https://www.youtube.com/watch?v=jis1MC5Tm8k").

This project is meant to serve as an interesting design piece, that you could sew onto the shoulder
of a jacket, or on the outside of a backpack. It is not washable, as it contains sensors that can't
withstand water. However, these sensors are underneat the outter fabric, so it could withstand light
rain easily, as the LED strips on the outside are quite water resistant.

This runs off 3 AAA batteries. If around half the LEDs are on, which is the case most of the time,
and they are at full brightness, combined the LEDS will draw about 0.6 amps at 5v. This is driven
off of 3 AAA batteries, which hold about 1 amp hour of charge. So, we can expect this to last for
about an hour and a half on a full charge. The microcontroller and sensors draw a couple milliamps
in comparison, so they can be ignored for battery life purposes. Additionally, the brightness could
be turned down, which would increase the battery life up to 10x when on a lower brightness setting.

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

Particle based fluid simulations revolve around attempting to keep all the particles an even
distance away from each other. Or, more specifically, trying to keep all the particles at an even
density. The density at any particle can be estimated by counting how many particles are nearby, and
how close they are. Then, the particles can be moved towards or away from neighboring particles to
maintain a consistent density throughout.

This problem of maintaining constant density can be solved by repeatedly inching the particles
towards/away from each other, and then re-computing all of their densities. This is done using an
algorithm known as gradient descent. Most of the math done here is based off the paper "Position
Based Fluids," which can be read here: #link("https://mmacklin.com/pbf_sig_preprint.pdf").

== Defining our Particles

Before getting into any of the math, we'll start off by defining our particles. Each particle is a
point in space, with a position and mass. All particles have the same mass in this simulation. We'll
start by just applying a force of gravity to them. I'll be using Verlet integration, which is a
method of applying a force to a particle over discrete time steps, without losing accuracy over
time. Specifically, for each particle, we run the following code:

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

The density error between a particle and it's neighbor is just the sum of their errors. So we
multiply that by the gradient vector, and the result is a vector that points the particles towards
or away from each other, depending on how close they are. This vector can be summed for a particle
and all of it's neighbors, and that sum represents the direction the particle should move to
minimize it's own error. Minimizing it's error also means making the density even throughout, and so
this loop will have the desired effect of maintaining a constant density.

Note that we store these position deltas in an array for later processing. We don't want to move any
particles before the other's have been processed. This is crucial, as we want the force between any
two particles to be equal and opposite to each other.

That's pretty much the entire simulation. We just need to apply those position deltas, and then
re-run this loop and the previous loop a handful of times. Each step of gradient descent isn't all
that accurate, but the more times it is run, the more accurate it becomes. Putting that all together
gives us something like this:

#html.elem("div", attrs: (class: "simulation", id: "simulation-naive-lambda"))

This is looking pretty good! The particles are reacting to each other, and making a sort of squishy
substance. But it doesn't really look like water. To fix this, we've got to go fix that
`density_error` I mentioned before.

Also, I'm glossing over a _lot_ of tuning constants and such. If you want to recreate this
yourself, I highly recommend taking a look at the paper I've linked, as well as my implementation on
GitHub. The guts of the simulation itself are in this file:
#link("https://github.com/macmv/fluid-sim/blob/main/fl-sim/src/lib.rs").

== Improving the Simulation

To fix the `density_error`, we need to fix the compressibility of the fluid. Water is not
compressible, and we're trying to simulate something like water. The current `density_error` does
not account for that. Instead, the particles at the bottom of the simulation are pushing outwards
with the same force as the particles at the top of the simulation. But, the particles at the bottom
are being squished by the particles above more, so they end up forming a denser mesh than the
particles above. This is what makes the fluid feel so squishy in it's current state.

The fix is to use the sum of the magnitude of the spiky gradient around each particle. While a bit
of a mouthful, we can think of it as the amount that the particle is being pushed. If there's a
particle right in between two others, the density won't be super high (because we have the poly6
kernel for density). But, the spiky gradient will produce a large vector between the middle particle
and each of it's neighbors. By using the magnitude of this spiky gradient, we can see that this
particle is getting "pushed" strongly by it's neighbors, and so the density error should be higher.

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
`gradient_sum` and `gradient_sum_squared`. If we use this new density error, the simulation
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

While it's quite small, it still has the desired effect. It'll always be negative, because it just
pushes particles away from each other when they get too close. We can add it into the
`position_deltas` calculation like so:

```rs
let correction = tensile_correction(distance, self.radius);

total_position_delta +=
  (particle.density_error + neighbor.density_error + correction)
    * PARTICLE_MASS
    * kernel_gradient;
```

And that makes the surface of the fluid behave much more smoothly:

#html.elem("div", attrs: (class: "simulation", id: "simulation-with-tensile"))

That's just about it. With tensile correction enabled, that's the complete simulation that I've been
using. This produces good enough results for my purposes, and it is fast enough to run on a
microcontroller. I would like the fluid to be a little more "splashy"---that is, I'd like to see
more separated particles splash into the air when the fluid moves around. But it works well enough
as is, and I still think it's pretty convincing, especially given that there are only 128 particles
in these examples.
