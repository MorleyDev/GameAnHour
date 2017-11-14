type SfmlEvent
	= { type: 0 | 1 | 2 | 3 | 12 | 13; }
	| { type: 4 | 5 | 6; parameters: [number /*SFML_Keys*/] }
	| { type: 8; parameters: [number /*delta*/] }
	| { type: 9 | 10; parameters: [number /*button*/, number /*x*/, number /*y*/] }
	| { type: 11; parameters: [number /*x*/, number /*y*/] };

declare function SFML_Close(): void;
declare function SFML_SetVSync(enabled: boolean): void;

declare function SFML_LoadFont(name: string, src: string): { readonly name: string; readonly src: string };
declare function SFML_LoadImage(name: string, src: string): { readonly width: number; readonly height: number; readonly src: string; readonly name: string };
declare function SFML_LoadMusic(name: string, src: string): { readonly name: string; readonly src: string };
declare function SFML_LoadSound(name: string, src: string): { readonly name: string; readonly src: string };

declare function SFML_FlushEvents(handler: (event: SfmlEvent) => void): void;

declare function SFML_Clear(r: number, g: number, b: number): void;
declare function SFML_Fill_Circle(x: number, y: number, radius: number, r: number, g: number, b: number, a: number): void;
declare function SFML_Fill_Rectangle(x: number, y: number, width: number, height: number, r: number, g: number, b: number, a: number): void;
declare function SFML_Fill_Triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, r: number, g: number, b: number, a: number): void;
declare function SFML_Stroke_Circle(x: number, y: number, radius: number, r: number, g: number, b: number, a: number): void;
declare function SFML_Stroke_Rectangle(x: number, y: number, width: number, height: number, r: number, g: number, b: number, a: number): void;
declare function SFML_Stroke_Triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, r: number, g: number, b: number, a: number): void;
declare function SFML_Draw_Line(x1: number, y1: number, x2: number, y2: number, r: number, g: number, b: number, a: number): void;

declare function SFML_Stroke_Text(name: string, text: string, size: number, x: number, y: number, r: number, g: number, b: number, a: number): void;
declare function SFML_Fill_Text(name: string, text: string, size: number, x: number, y: number, r: number, g: number, b: number, a: number): void;

declare function SFML_Blit(name: string, srcX: number, srcY: number, srcWidth: number, srcHeight: number, dstX: number, dstY: number, dstWidth: number, dstHeight: number): void;

declare function SFML_Push_Translate(x: number, y: number): void;
declare function SFML_Push_Scale(x: number, y: number): void;
declare function SFML_Push_Rotate(radians: number): void;
declare function SFML_Pop(): void;

declare function SFML_PlaySound(name: string): void;

declare const SFML_Events: {
	Closed: 0,
	Resized: 1,
	LostFocus: 2,
	GainedFocus: 3,
	TextEntered: 4,
	KeyPressed: 5,
	KeyReleased: 6,
	MouseWheelScrolled: 8,
	MouseButtonPressed: 9,
	MouseButtonReleased: 10,
	MouseMoved: 11,
	MouseEntered: 12,
	MouseLeft: 13,
	JoystickButtonPressed: 14,
	JoystickButtonReleased: 15,
	JoystickMoved: 16,
	JoystickConnected: 17,
	JoystickDisconnected: 18,
	TouchBegan: 19,
	TouchMoved: 20,
	TouchEnded: 21,
	SensorChanged: 22
};
declare const SFML_Keys: {
	A: 0,
	B: 1,
	C: 2,
	D: 3,
	E: 4,
	F: 5,
	G: 6,
	H: 7,
	I: 8,
	J: 9,
	K: 10,
	L: 11,
	M: 12,
	N: 13,
	O: 14,
	P: 15,
	Q: 16,
	R: 17,
	S: 18,
	T: 19,
	U: 20,
	V: 21,
	W: 22,
	X: 23,
	Y: 24,
	Z: 25,
	Num0: 26,
	Num1: 27,
	Num2: 28,
	Num3: 29,
	Num4: 30,
	Num5: 31,
	Num6: 32,
	Num7: 33,
	Num8: 34,
	Num9: 35,
	Escape: 36,
	LControl: 37,
	LShift: 38,
	LAlt: 39,
	LSystem: 40,
	RControl: 40,
	RShift: 41,
	RAlt: 42,
	RSystem: 43,
	Menu: 44,
	LBracket: 45,
	RBracket: 46,
	SemiColon: 47,
	Comma: 48,
	Period: 49,
	Quote: 50,
	Slash: 51,
	BackSlash: 52,
	Tilde: 53,
	Equal: 54,
	Dash: 55,
	Space: 56,
	Return: 57,
	BackSpace: 58,
	Tab: 59,
	PageUp: 60,
	PageDown: 61,
	End: 62,
	Home: 63,
	Insert: 64,
	Delete: 65,
	Add: 66,
	Subtract: 67,
	Multiply: 68,
	Divide: 69,
	Left: 70,
	Right: 71,
	Up: 72,
	Down: 73,
	Numpad0: 74,
	Numpad1: 75,
	Numpad2: 76,
	Numpad3: 77,
	Numpad4: 78,
	Numpad5: 79,
	Numpad6: 80,
	Numpad7: 81,
	Numpad8: 82,
	Numpad9: 83,
	F1: 84,
	F2: 85,
	F3: 86,
	F4: 87,
	F5: 88,
	F6: 89,
	F7: 90,
	F8: 91,
	F9: 92,
	F10: 93,
	F11: 94,
	F12: 95,
	F13: 96,
	F14: 97,
	F15: 98,
	Pause: 99
};