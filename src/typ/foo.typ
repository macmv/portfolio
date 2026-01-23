#import "@preview/cetz:0.4.2"

#show math.equation: html.frame
#show math.equation.where(block: false): box

= Hello

foobar $F_1 (x) = 0$.

Here's some sample setup code:

```c
const int ledPin = 13;
const int switchPin = 12;

void setup() {
  pinMode(ledPin, OUTPUT);

  pinMode(switchPin, INPUT);
  digitalWrite(switchPin, HIGH);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(1000);
  digitalWrite(ledPin, LOW);
  delay(1000);
}
```

#lorem(1000)
