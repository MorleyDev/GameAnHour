
declare function BOX2D_SetGravity(x: number, y: number): void;
declare function BOX2D_CreateBody_Box(x: number, y: number, width: number, height: number, isStatic: boolean, density: number, friction: number, restitution: number): void;
declare function BOX2D_CreateBody_Ball(x: number, y: number, radius: number, isStatic: boolean, density: number, friction: number, restitution: number): void;
declare function BOX2D_CreateBody_Tri(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, isStatic: boolean, density: number, friction: number, restitution: number): void;

declare function BOX2D_GetBody(id: number): { positionX: number; positionY: number; velocityX: number; velocityY: number; angularVelocity: number; angle: number; };
declare function BOX2D_DestroyBody(id: number): void;
declare function BOX2D_ApplyForce(id: number, locationX: number, locationY: number, forceX: number, forceY: number): void;
declare function BOX2D_Advance(deltaTime: number): void;

declare function BOX2D_PullCollisionStart(): { a: number; b: number } | undefined;
declare function BOX2D_PullCollisionEnd(): { a: number; b: number } | undefined;

declare function BOX2D_GetCollisionStartCount(): number;
declare function BOX2D_GetCollisionEndCount(): number;
