# GameAnHour
Framework for rapid yet functional prototyping of games

## Pauper

### Assets

Contains classes for loading and maintaining the lifespan of assets (graphics, audio, files)

### Entity-Component System (ECS)

Contains a functional Entity-Component System based on a Redux architecture. Actions are used to Create and Destroy Entities from the current state, and Attach/Detach Components to Entities. Contains functions for map/filter/reduce operations against a state of entities.

### Phyics

Contains physics components and physics-based collision logic for the Entity-Component System. Physics Engine depends upon the overall Engine. Browser uses Matter.JS, whilst SFML uses Box2D

Contains Components
* HardBodyComponent :- A Hard Body with Shape, Position, Velocity, Forces
* StaticBodyComponent :- A Static Body with Shape, but unmoved by forces

### Input

Contains classes for handling Reactive Streams of user input (mouse, keyboard, etc)

### Iterable

Contains helper functions for generic map/reduce operations on iterable sets

### Maths

Contains Maths for Vector and Angle calculations

### Models

Contains data types that can model areas of a game such as Shapes and Colours.

### Monadic

Contains monadic data types such as the Maybe type.

### Redux

Contains helper functions for Redux operations

### Render

Contains data models of a 2D Frame, and functions to render that frame to various sources (Canvas, SFML, etc.)

### RX Operators

Contains custom ReactiveX Operators

### Utility

Contains generic utility functions for detecting browser/production, generating unique ids.

## Main
### Bootstrap
### Epic
### Initial State
### Reducer
### Render
### Model

## Engine

### Browser

### SFML
