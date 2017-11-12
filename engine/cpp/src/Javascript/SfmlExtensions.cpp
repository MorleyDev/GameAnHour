#include <unordered_map>
#include <functional>
#include <iostream>

#include <SFML/Graphics/RectangleShape.hpp>
#include <SFML/Graphics/CircleShape.hpp>
#include <SFML/Window/Event.hpp>
#include "SfmlExtensions.hpp"

const char* sfmlScript =
"(function () {"
"    var eventsReceived = [];"
"    SFML_OnEvent = function (type) {"
"        var args = []; for (var i = 1; i < arguments.length; ++i) args.push(arguments[i]);"
"        eventsReceived.push({"
"            type: type,"
"            parameters: args"
"        });"
"    };"
"    SFML_FlushEvents = function (handler) {"
"        var events = eventsReceived;"
"        eventsReceived = [];"
"        for (var i = 0; i < events.length; ++i) {"
"            handler(events[i]);"
"        }"
"    };"
"    SFML_Events = {"
"        Closed: 0,"
"        Resized: 1,"
"        LostFocus: 2,"
"        GainedFocus: 3,"
"        TextEntered: 4,"
"        KeyPressed: 5,"
"        KeyReleased: 6,"
"        MouseWheelMoved: 7,"
"        MouseWheelScrolled: 8,"
"        MouseButtonPressed: 9,"
"        MouseButtonReleased: 10,"
"        MouseMoved: 11,"
"        MouseEntered: 12,"
"        MouseLeft: 13,"
"        JoystickButtonPressed: 14,"
"        JoystickButtonReleased: 15,"
"        JoystickMoved: 16,"
"        JoystickConnected: 17,"
"        JoystickDisconnected: 18,"
"        TouchBegan: 19,"
"        TouchMoved: 20,"
"        TouchEnded: 21,"
"        SensorChanged: 22"
"    };"
"    SFML_Keys = {"
"        A: 0,"
"        B: 1,"
"        C: 2,"
"        D: 3,"
"        E: 4,"
"        F: 5,"
"        G: 6,"
"        H: 7,"
"        I: 8,"
"        J: 9,"
"        K: 10,"
"        L: 11,"
"        M: 12,"
"        N: 13,"
"        O: 14,"
"        P: 15,"
"        Q: 16,"
"        R: 17,"
"        S: 18,"
"        T: 19,"
"        U: 20,"
"        V: 21,"
"        W: 22,"
"        X: 23,"
"        Y: 24,"
"        Z: 25,"
"        Num0: 26,"
"        Num1: 27,"
"        Num2: 28,"
"        Num3: 29,"
"        Num4: 30,"
"        Num5: 31,"
"        Num6: 32,"
"        Num7: 33,"
"        Num8: 34,"
"        Num9: 35,"
"        Escape: 36,"
"        LControl: 37,"
"        LShift: 38,"
"        LAlt: 39,"
"        LSystem: 40,"
"        RControl: 40,"
"        RShift: 41,"
"        RAlt: 42,"
"        RSystem: 43,"
"        Menu: 44,"
"        LBracket: 45,"
"        RBracket: 46,"
"        SemiColon: 47,"
"        Comma: 48,"
"        Period: 49,"
"        Quote: 50,"
"        Slash: 51,"
"        BackSlash: 52,"
"        Tilde: 53,"
"        Equal: 54,"
"        Dash: 55,"
"        Space: 56,"
"        Return: 57,"
"        BackSpace: 58,"
"        Tab: 59,"
"        PageUp: 60,"
"        PageDown: 61,"
"        End: 62,"
"        Home: 63,"
"        Insert: 64,"
"        Delete: 65,"
"        Add: 66,"
"        Subtract: 67,"
"        Multiply: 68,"
"        Divide: 69,"
"        Left: 70,"
"        Right: 71,"
"        Up: 72,"
"        Down: 73,"
"        Numpad0: 74,"
"        Numpad1: 75,"
"        Numpad2: 76,"
"        Numpad3: 77,"
"        Numpad4: 78,"
"        Numpad5: 79,"
"        Numpad6: 80,"
"        Numpad7: 81,"
"        Numpad8: 82,"
"        Numpad9: 83,"
"        F1: 84,"
"        F2: 85,"
"        F3: 86,"
"        F4: 87,"
"        F5: 88,"
"        F6: 89,"
"        F7: 90,"
"        F8: 91,"
"        F9: 92,"
"        F10: 93,"
"        F11: 94,"
"        F12: 95,"
"        F13: 96,"
"        F14: 97,"
"        F15: 98,"
"        Pause: 99"
"    };"
"})();";

void attachSfml(JavascriptEngine &engine, sf::RenderWindow &window, std::vector<sf::Transform> &stack) {
	engine.add("sfml", sfmlScript);
	engine.setGlobalFunction("SFML_Close", [&window](JavascriptEngine* ctx) {
		window.close();
		return 0;
	}, 0);
	engine.setGlobalFunction("SFML_Clear", [&window](JavascriptEngine* ctx) {
		const auto r = ctx->getargf(0);
		const auto g = ctx->getargf(1);
		const auto b = ctx->getargf(2);
		window.clear(sf::Color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b)));
		return 0;
	}, 3);
	engine.setGlobalFunction("SFML_Stroke_Circle", [&window, &stack](JavascriptEngine* ctx) {
		const auto x = ctx->getargf(0);
		const auto y = ctx->getargf(1);
		const auto radius = ctx->getargf(2);
		const auto r = ctx->getargf(3);
		const auto g = ctx->getargf(4);
		const auto b = ctx->getargf(5);
		const auto a = ctx->getargf(6);

		sf::Color color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(a * 255));
		sf::CircleShape circleShape(static_cast<float>(radius));
		circleShape.setOrigin(static_cast<float>(radius), static_cast<float>(radius));
		circleShape.setPosition(static_cast<float>(x), static_cast<float>(y));
		circleShape.setFillColor(sf::Color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(a * 255.0)));
		circleShape.setOutlineThickness(1.0f);
		circleShape.setOutlineColor(color);
		window.draw(circleShape, sf::RenderStates(stack.back()));
		return 0;
	}, 7);
	engine.setGlobalFunction("SFML_Stroke_Rectangle", [&window, &stack](JavascriptEngine* ctx) {
		const auto x = ctx->getargf(0);
		const auto y = ctx->getargf(1);
		const auto width = ctx->getargf(2);
		const auto height = ctx->getargf(3);
		const auto r = ctx->getargf(4);
		const auto g = ctx->getargf(5);
		const auto b = ctx->getargf(6);
		const auto a = ctx->getargf(7);

		sf::Color color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(a * 255.0));
		sf::RectangleShape rectShape(sf::Vector2f(static_cast<float>(width), static_cast<float>(height)));
		rectShape.setPosition(static_cast<float>(x), static_cast<float>(y));
		rectShape.setFillColor(sf::Color::Transparent);
		rectShape.setOutlineThickness(1.0f);
		rectShape.setOutlineColor(color);
		window.draw(rectShape, sf::RenderStates(stack.back()));
		return 0;
	}, 8);
	engine.setGlobalFunction("SFML_Stroke_Triangle", [&window, &stack](JavascriptEngine* ctx) {
		const auto x1 = ctx->getargf(0);
		const auto y1 = ctx->getargf(1);
		const auto x2 = ctx->getargf(2);
		const auto y2 = ctx->getargf(3);
		const auto x3 = ctx->getargf(4);
		const auto y3 = ctx->getargf(5);
		const auto r = ctx->getargf(6);
		const auto g = ctx->getargf(7);
		const auto b = ctx->getargf(8);
		const auto a = ctx->getargf(9);

		sf::Color color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(a * 255.0));
		sf::VertexArray array(sf::PrimitiveType::LineStrip, 4);
		array[0] = sf::Vertex(sf::Vector2f(static_cast<float>(x1), static_cast<float>(y1)), color);
		array[1] = sf::Vertex(sf::Vector2f(static_cast<float>(x2), static_cast<float>(y2)), color);
		array[2] = sf::Vertex(sf::Vector2f(static_cast<float>(x3), static_cast<float>(y3)), color);
		array[4] = sf::Vertex(sf::Vector2f(static_cast<float>(x1), static_cast<float>(y1)), color);
		window.draw(array, sf::RenderStates(stack.back()));
		return 0;
	}, 10);
	engine.setGlobalFunction("SFML_Fill_Circle", [&window, &stack](JavascriptEngine* ctx) {
		const auto x = ctx->getargf(0);
		const auto y = ctx->getargf(1);
		const auto radius = ctx->getargf(2);
		const auto r = ctx->getargf(3);
		const auto g = ctx->getargf(4);
		const auto b = ctx->getargf(5);
		const auto a = ctx->getargf(6);

		sf::CircleShape circleShape(static_cast<float>(radius));
		circleShape.setOrigin(static_cast<float>(radius), static_cast<float>(radius));
		circleShape.setPosition(static_cast<float>(x), static_cast<float>(y));
		circleShape.setFillColor(sf::Color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(a * 255.0)));
		window.draw(circleShape, sf::RenderStates(stack.back()));
		return 0;
	}, 7);
	engine.setGlobalFunction("SFML_Fill_Rectangle", [&window, &stack](JavascriptEngine* ctx) {
		auto a = ctx->getargf(-1);
		auto b = ctx->getargf(-2);
		auto g = ctx->getargf(-3);
		auto r = ctx->getargf(-4);
		auto height = ctx->getargf(-5);
		auto width = ctx->getargf(-6);
		auto y = ctx->getargf(-7);
		auto x = ctx->getargf(-8);

		sf::RectangleShape rectShape(sf::Vector2f(static_cast<float>(width), static_cast<float>(height)));
		rectShape.setPosition(static_cast<float>(x), static_cast<float>(y));
		rectShape.setFillColor(sf::Color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(a * 255.0)));
		window.draw(rectShape, sf::RenderStates(stack.back()));
		return 0;
	}, 8);
	engine.setGlobalFunction("SFML_Fill_Triangle", [&window, &stack](JavascriptEngine* ctx) {
		auto a = ctx->getargf(9);
		auto b = ctx->getargf(8);
		auto g = ctx->getargf(7);
		auto r = ctx->getargf(6);
		auto y3 = ctx->getargf(5);
		auto x3 = ctx->getargf(4);
		auto y2 = ctx->getargf(3);
		auto x2 = ctx->getargf(2);
		auto y1 = ctx->getargf(1);
		auto x1 = ctx->getargf(0);

		sf::Color color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(a * 255.0));
		sf::VertexArray array(sf::PrimitiveType::Triangles, 3);
		array[0] = sf::Vertex(sf::Vector2f(static_cast<float>(x1), static_cast<float>(y1)), color);
		array[1] = sf::Vertex(sf::Vector2f(static_cast<float>(x2), static_cast<float>(y2)), color);
		array[2] = sf::Vertex(sf::Vector2f(static_cast<float>(x3), static_cast<float>(y3)), color);
		window.draw(array, sf::RenderStates(stack.back()));
		return 0;
	}, 10);
	engine.setGlobalFunction("SFML_Draw_Line", [&window, &stack](JavascriptEngine* ctx) {
		auto a = ctx->getargf(7);
		auto b = ctx->getargf(6);
		auto g = ctx->getargf(5);
		auto r = ctx->getargf(4);
		auto y2 = ctx->getargf(3);
		auto x2 = ctx->getargf(2);
		auto y1 = ctx->getargf(1);
		auto x1 = ctx->getargf(0);

		sf::Color color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(a * 255.0f));
		sf::VertexArray array(sf::PrimitiveType::Lines, 2);
		array[0] = sf::Vertex(sf::Vector2f(static_cast<float>(x1), static_cast<float>(y1)), color);
		array[1] = sf::Vertex(sf::Vector2f(static_cast<float>(x2), static_cast<float>(y2)), color);
		window.draw(array, sf::RenderStates(stack.back()));
		return 0;
	}, 8);
	engine.setGlobalFunction("SFML_Draw_Text", [&window, &stack](JavascriptEngine* ctx) {
		return 0;
	}, 0);

	engine.setGlobalFunction("SFML_Push_Translate", [&stack](JavascriptEngine* ctx) {
		auto y = ctx->getargf(1);
		auto x = ctx->getargf(0);
		auto m = sf::Transform(stack.back());
		m.translate(static_cast<float>(x), static_cast<float>(y));
		stack.push_back(m);
		return 0;
	}, 2);
	engine.setGlobalFunction("SFML_Push_Scale", [&stack](JavascriptEngine* ctx) {
		auto y = ctx->getargf(1);
		auto x = ctx->getargf(0);
		auto m = sf::Transform(stack.back());
		m.scale(static_cast<float>(x), static_cast<float>(y));
		stack.push_back(m);
		return 0;
	}, 2);
	engine.setGlobalFunction("SFML_Push_Rotate", [&stack](JavascriptEngine* ctx) {
		auto radians = ctx->getargf(0);
		auto m = sf::Transform(stack.back());
		m.rotate(static_cast<float>(radians * 57.2958));
		stack.push_back(m);
		return 0;
	}, 1);
	engine.setGlobalFunction("SFML_Pop", [&stack](JavascriptEngine* ctx) {
		stack.pop_back();
		return 0;
	}, 0);
}

void pollEvents(JavascriptEngine &engine, sf::RenderWindow &window) {
	sf::Event event = {};
	while (window.pollEvent(event)) {
		switch (event.type)	{
		case sf::Event::Resized: {
			engine.trigger("SFML_OnEvent", static_cast<int>(event.type), event.size.width, event.size.height);
			break;
		}

		case sf::Event::KeyPressed:
		case sf::Event::KeyReleased: {
			engine.trigger("SFML_OnEvent", static_cast<int>(event.type), event.key.code);
			break;
		}
		case sf::Event::MouseWheelScrolled: {
			engine.trigger("SFML_OnEvent", static_cast<int>(event.type), event.mouseWheel.delta);
			break;
		}
		case sf::Event::MouseButtonPressed:
		case sf::Event::MouseButtonReleased: {
			engine.trigger("SFML_OnEvent", static_cast<int>(event.type), event.mouseButton.button, event.mouseButton.x, event.mouseButton.y);
			break;
		}

		case sf::Event::MouseMoved: {
			engine.trigger("SFML_OnEvent", static_cast<int>(event.type), event.mouseMove.x, event.mouseMove.y);
			break;
		}
		case sf::Event::JoystickButtonPressed:
		case sf::Event::JoystickButtonReleased:
		case sf::Event::JoystickMoved:
		case sf::Event::JoystickConnected:
		case sf::Event::JoystickDisconnected:
		case sf::Event::TouchBegan:
		case sf::Event::TouchMoved:
		case sf::Event::TouchEnded:
		case sf::Event::SensorChanged:
			break;

		case sf::Event::Closed:
		case sf::Event::LostFocus:
		case sf::Event::GainedFocus:
		case sf::Event::MouseEntered:
		case sf::Event::MouseLeft:
		case sf::Event::TextEntered:
		default:
			engine.trigger("SFML_OnEvent", (int)event.type);
			break;
		}
	}
}
