(function () {
    var eventsReceived = [];

    SFML_OnEvent = function (type) {
        var args = []; for(var i = 1; i < arguments.length; ++i) args.push(arguments[i]);
        eventsReceived.push({
            type: type,
            parameters: args
        });
        if (type === SFML_Events.Closed) {
            SFML_Close();
        }
    };

    SFML_FlushEvents = function (handler) {
        var events = eventsReceived;
        eventsReceived = [];
        for(var i = 0; i < events.length; ++i) {
            handler(events[i]);
        }
    };

    SFML_Render = function () {
        return [
            ["clear", { r: 255, g: 0, b: 0, a: 1 }],
            [
                [
                    "origin",
                    { x: 256, y: 256 },
                    [
                        ["rotate", 0, [
                            ["fill", [
                                { x: 10, y: 10 },
                                { x: 100, y: 100 },
                                { x: 10, y: 100 }
                            ], { r: 0, g: 0, b: 255, a: 1 }]
                        ]]
                    ]
                ],
                ["stroke", [{ x: 100, y: 100 }, { x: 200, y: 150 }], { r: 0, g: 255, b: 0, a: 1 }],
                ["stroke", { x: 300, y: 300, radius: 50 }, { r: 100, g: 200, b: 100, a: 1 }]
            ]
        ];
    };

    SFML_Events = {
        Closed: 0,                 ///< The window requested to be closed (no data)
        Resized: 1,                ///< The window was resized (data in event.size)
        LostFocus: 2,              ///< The window lost the focus (no data)
        GainedFocus: 3,            ///< The window gained the focus (no data)
        TextEntered: 4,            ///< A character was entered (data in event.text)
        KeyPressed: 5,             ///< A key was pressed (data in event.key)
        KeyReleased: 6,            ///< A key was released (data in event.key)
        MouseWheelMoved: 7,        ///< The mouse wheel was scrolled (data in event.mouseWheel) (deprecated)
        MouseWheelScrolled: 8,     ///< The mouse wheel was scrolled (data in event.mouseWheelScroll)
        MouseButtonPressed: 9,     ///< A mouse button was pressed (data in event.mouseButton)
        MouseButtonReleased: 10,    ///< A mouse button was released (data in event.mouseButton)
        MouseMoved: 11,             ///< The mouse cursor moved (data in event.mouseMove)
        MouseEntered: 12,           ///< The mouse cursor entered the area of the window (no data)
        MouseLeft: 13,              ///< The mouse cursor left the area of the window (no data)
        JoystickButtonPressed: 14,  ///< A joystick button was pressed (data in event.joystickButton)
        JoystickButtonReleased: 15, ///< A joystick button was released (data in event.joystickButton)
        JoystickMoved: 16,          ///< The joystick moved along an axis (data in event.joystickMove)
        JoystickConnected: 17,      ///< A joystick was connected (data in event.joystickConnect)
        JoystickDisconnected: 18,   ///< A joystick was disconnected (data in event.joystickConnect)
        TouchBegan: 19,             ///< A touch event began (data in event.touch)
        TouchMoved: 20,             ///< A touch moved (data in event.touch)
        TouchEnded: 21,             ///< A touch event ended (data in event.touch)
        SensorChanged: 22          ///< A sensor value changed (data in event.sensor)
    };
    
    SFML_Keys = {
        A: 0,        ///< The A key
        B: 1,            ///< The B key
        C: 2,            ///< The C key
        D: 3,            ///< The D key
        E: 4,            ///< The E key
        F: 5,            ///< The F key
        G: 6,            ///< The G key
        H: 7,            ///< The H key
        I: 8,            ///< The I key
        J: 9,            ///< The J key
        K: 10,            ///< The K key
        L: 11,            ///< The L key
        M: 12,            ///< The M key
        N: 13,            ///< The N key
        O: 14,            ///< The O key
        P: 15,            ///< The P key
        Q: 16,            ///< The Q key
        R: 17,            ///< The R key
        S: 18,            ///< The S key
        T: 19,            ///< The T key
        U: 20,            ///< The U key
        V: 21,            ///< The V key
        W: 22,            ///< The W key
        X: 23,            ///< The X key
        Y: 24,            ///< The Y key
        Z: 25,            ///< The Z key
        Num0: 26,         ///< The 0 key
        Num1: 27,         ///< The 1 key
        Num2: 28,         ///< The 2 key
        Num3: 29,         ///< The 3 key
        Num4: 30,         ///< The 4 key
        Num5: 31,         ///< The 5 key
        Num6: 32,         ///< The 6 key
        Num7: 33,         ///< The 7 key
        Num8: 34,         ///< The 8 key
        Num9: 35,         ///< The 9 key
        Escape: 36,       ///< The Escape key
        LControl: 37,     ///< The left Control key
        LShift: 38,       ///< The left Shift key
        LAlt: 39,         ///< The left Alt key
        LSystem: 40,      ///< The left OS specific key: window (Windows and Linux), apple (MacOS X), ...
        RControl: 40,     ///< The right Control key
        RShift: 41,       ///< The right Shift key
        RAlt: 42,         ///< The right Alt key
        RSystem: 43,      ///< The right OS specific key: window (Windows and Linux), apple (MacOS X), ...
        Menu: 44,         ///< The Menu key
        LBracket: 45,     ///< The [ key
        RBracket: 46,     ///< The ] key
        SemiColon: 47,    ///< The ; key
        Comma: 48,        ///< The , key
        Period: 49,       ///< The . key
        Quote: 50,        ///< The ' key
        Slash: 51,        ///< The / key
        BackSlash: 52,    ///< The \ key
        Tilde: 53,        ///< The ~ key
        Equal: 54,        ///< The = key
        Dash: 55,         ///< The - key
        Space: 56,        ///< The Space key
        Return: 57,       ///< The Return key
        BackSpace: 58,    ///< The Backspace key
        Tab: 59,          ///< The Tabulation key
        PageUp: 60,       ///< The Page up key
        PageDown: 61,     ///< The Page down key
        End: 62,          ///< The End key
        Home: 63,         ///< The Home key
        Insert: 64,       ///< The Insert key
        Delete: 65,       ///< The Delete key
        Add: 66,          ///< The + key
        Subtract: 67,     ///< The - key
        Multiply: 68,     ///< The * key
        Divide: 69,       ///< The / key
        Left: 70,         ///< Left arrow
        Right: 71,        ///< Right arrow
        Up: 72,           ///< Up arrow
        Down: 73,         ///< Down arrow
        Numpad0: 74,      ///< The numpad 0 key
        Numpad1: 75,      ///< The numpad 1 key
        Numpad2: 76,      ///< The numpad 2 key
        Numpad3: 77,      ///< The numpad 3 key
        Numpad4: 78,      ///< The numpad 4 key
        Numpad5: 79,      ///< The numpad 5 key
        Numpad6: 80,      ///< The numpad 6 key
        Numpad7: 81,      ///< The numpad 7 key
        Numpad8: 82,      ///< The numpad 8 key
        Numpad9: 83,      ///< The numpad 9 key
        F1: 84,           ///< The F1 key
        F2: 85,           ///< The F2 key
        F3: 86,           ///< The F3 key
        F4: 87,           ///< The F4 key
        F5: 88,           ///< The F5 key
        F6: 89,           ///< The F6 key
        F7: 90,           ///< The F7 key
        F8: 91,           ///< The F8 key
        F9: 92,           ///< The F9 key
        F10: 93,          ///< The F10 key
        F11: 94,          ///< The F11 key
        F12: 95,          ///< The F12 key
        F13: 96,          ///< The F13 key
        F14: 97,          ///< The F14 key
        F15: 98,          ///< The F15 key
        Pause: 99        ///< The Pause key
    }
})();
