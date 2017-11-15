#include "SfmlExtensions.hpp"

#include <SFML/Graphics/RectangleShape.hpp>
#include <SFML/Graphics/CircleShape.hpp>
#include <SFML/Graphics/Sprite.hpp>
#include <SFML/Graphics/Text.hpp>
#include <SFML/Audio/Sound.hpp>
#include <SFML/Window/Event.hpp>

#include <unordered_map>
#include <functional>
#include <iostream>
#include <cmath>

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
"    SFML_OnLoadImage = function () { };"
"    SFML_OnLoadFont = function () { };"
"    SFML_OnLoadSound = function () { };"
"})();";

Sfml::Sfml(std::string title, sf::VideoMode video, TaskQueue& tasks, TaskQueue& mainThreadTasks)
: window(video, title),
  assetStore(tasks, mainThreadTasks),
  stack(),
  activeSoundEffects() {
	stack.push_back(sf::Transform::Identity);
}

template<typename TEngine> void _attachSfml(TEngine &engine, Sfml &sfml) {
	engine.add("sfml", sfmlScript);
	engine.setGlobalFunction("SFML_Close", [&sfml](TEngine* ctx) {
		sfml.window.close();
		return false;
	}, 0);
	engine.setGlobalFunction("SFML_SetSize", [&sfml](TEngine* ctx) {
		const auto w = ctx->getargn(0);
		const auto h = ctx->getargn(1);
		sfml.window.setSize(sf::Vector2u(static_cast<unsigned int>(w), static_cast<unsigned int>(h)));
		return false;
	}, 2);
	engine.setGlobalFunction("SFML_Clear", [&sfml](TEngine* ctx) {
		const auto r = ctx->getargf(0);
		const auto g = ctx->getargf(1);
		const auto b = ctx->getargf(2);
		sfml.window.clear(sf::Color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b)));
		return false;
	}, 3);
	engine.setGlobalFunction("SFML_Stroke_Circle", [&sfml](TEngine* ctx) {
		const auto x = ctx->getargf(0);
		const auto y = ctx->getargf(1);
		const auto radius = ctx->getargf(2);
		const auto r = ctx->getargf(3);
		const auto g = ctx->getargf(4);
		const auto b = ctx->getargf(5);
		const auto a = ctx->getargf(6);

		sf::Color color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(std::floor(a * 255.0)));
		sf::CircleShape circleShape(static_cast<float>(radius));
		circleShape.setOrigin(static_cast<float>(radius), static_cast<float>(radius));
		circleShape.setPosition(static_cast<float>(x), static_cast<float>(y));
		circleShape.setFillColor(sf::Color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(std::floor(a * 255.0))));
		circleShape.setOutlineThickness(1.0f);
		circleShape.setOutlineColor(color);
		sfml.window.draw(circleShape, sf::RenderStates(sfml.stack.back()));
		return false;
	}, 7);
	engine.setGlobalFunction("SFML_Stroke_Rectangle", [&sfml](TEngine* ctx) {
		const auto x = ctx->getargf(0);
		const auto y = ctx->getargf(1);
		const auto width = ctx->getargf(2);
		const auto height = ctx->getargf(3);
		const auto r = ctx->getargf(4);
		const auto g = ctx->getargf(5);
		const auto b = ctx->getargf(6);
		const auto a = ctx->getargf(7);

		sf::Color color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(std::floor(a * 255.0)));
		sf::RectangleShape rectShape(sf::Vector2f(static_cast<float>(width), static_cast<float>(height)));
		rectShape.setPosition(static_cast<float>(x), static_cast<float>(y));
		rectShape.setFillColor(sf::Color::Transparent);
		rectShape.setOutlineThickness(1.0f);
		rectShape.setOutlineColor(color);
		sfml.window.draw(rectShape, sf::RenderStates(sfml.stack.back()));
		return false;
	}, 8);
	engine.setGlobalFunction("SFML_Stroke_Triangle", [&sfml](TEngine* ctx) {
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

		sf::Color color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(std::floor(a * 255.0)));
		sf::VertexArray array(sf::PrimitiveType::LineStrip, 4);
		array[0] = sf::Vertex(sf::Vector2f(static_cast<float>(x1), static_cast<float>(y1)), color);
		array[1] = sf::Vertex(sf::Vector2f(static_cast<float>(x2), static_cast<float>(y2)), color);
		array[2] = sf::Vertex(sf::Vector2f(static_cast<float>(x3), static_cast<float>(y3)), color);
		array[4] = sf::Vertex(sf::Vector2f(static_cast<float>(x1), static_cast<float>(y1)), color);
		sfml.window.draw(array, sf::RenderStates(sfml.stack.back()));
		return false;
	}, 10);
	engine.setGlobalFunction("SFML_Fill_Circle", [&sfml](TEngine* ctx) {
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
		circleShape.setFillColor(sf::Color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(std::floor(a * 255.0))));
		sfml.window.draw(circleShape, sf::RenderStates(sfml.stack.back()));
		return false;
	}, 7);
	engine.setGlobalFunction("SFML_Fill_Rectangle", [&sfml](TEngine* ctx) {
		const auto x = ctx->getargf(0);
		const auto y = ctx->getargf(1);
		const auto width = ctx->getargf(2);
		const auto height = ctx->getargf(3);
		const auto r = ctx->getargf(4);
		const auto g = ctx->getargf(5);
		const auto b = ctx->getargf(6);
		const auto a = ctx->getargf(7);

		sf::RectangleShape rectShape(sf::Vector2f(static_cast<float>(width), static_cast<float>(height)));
		rectShape.setPosition(static_cast<float>(x), static_cast<float>(y));
		rectShape.setFillColor(sf::Color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(std::floor(a * 255.0))));
		sfml.window.draw(rectShape, sf::RenderStates(sfml.stack.back()));
		return false;
	}, 8);
	engine.setGlobalFunction("SFML_Fill_Triangle", [&sfml](TEngine* ctx) {
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

		sf::Color color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(std::floor(a * 255.0)));
		sf::VertexArray array(sf::PrimitiveType::Triangles, 3);
		array[0] = sf::Vertex(sf::Vector2f(static_cast<float>(x1), static_cast<float>(y1)), color);
		array[1] = sf::Vertex(sf::Vector2f(static_cast<float>(x2), static_cast<float>(y2)), color);
		array[2] = sf::Vertex(sf::Vector2f(static_cast<float>(x3), static_cast<float>(y3)), color);
		sfml.window.draw(array, sf::RenderStates(sfml.stack.back()));
		return false;
	}, 10);
	engine.setGlobalFunction("SFML_Draw_Line", [&sfml](TEngine* ctx) {
		const auto x1 = ctx->getargf(0);
		const auto y1 = ctx->getargf(1);
		const auto x2 = ctx->getargf(2);
		const auto y2 = ctx->getargf(3);
		const auto r = ctx->getargf(4);
		const auto g = ctx->getargf(5);
		const auto b = ctx->getargf(6);
		const auto a = ctx->getargf(7);

		sf::Color color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(std::floor(a * 255.0f)));
		sf::VertexArray array(sf::PrimitiveType::Lines, 2);
		array[0] = sf::Vertex(sf::Vector2f(static_cast<float>(x1), static_cast<float>(y1)), color);
		array[1] = sf::Vertex(sf::Vector2f(static_cast<float>(x2), static_cast<float>(y2)), color);
		sfml.window.draw(array, sf::RenderStates(sfml.stack.back()));
		return false;
	}, 8);
	engine.setGlobalFunction("SFML_Fill_Text", [&sfml](TEngine* ctx) {
		const auto name = ctx->getargstr(0);
		const auto text = ctx->getargstr(1);
		const auto size = ctx->getargn(2);
		const auto x = ctx->getargf(3);
		const auto y = ctx->getargf(4);
		const auto r = ctx->getargf(5);
		const auto g = ctx->getargf(6);
		const auto b = ctx->getargf(7);
		const auto a = ctx->getargf(8);
		const auto font = sfml.assetStore.font(name, "./assets/fonts/" + name + ".ttf");

		sf::Text t(text, *font, size);
		t.setPosition(static_cast<float>(x), static_cast<float>(y));
		t.setFillColor(sf::Color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(std::floor(a * 255.0))));
		sfml.window.draw(t, sf::RenderStates(sfml.stack.back()));
		return false;
	}, 9);
	engine.setGlobalFunction("SFML_Stroke_Text", [&sfml](TEngine* ctx) {
		const auto name = ctx->getargstr(0);
		const auto text = ctx->getargstr(1);
		const auto size = ctx->getargn(2);
		const auto x = ctx->getargf(3);
		const auto y = ctx->getargf(4);
		const auto r = ctx->getargf(5);
		const auto g = ctx->getargf(6);
		const auto b = ctx->getargf(7);
		const auto a = ctx->getargf(8);
		const auto font = sfml.assetStore.font(name, "./assets/fonts/" + name + ".ttf");

		sf::Text t(text, *font, size);
		t.setPosition(static_cast<float>(x), static_cast<float>(y));
		t.setFillColor(sf::Color::Transparent);
		t.setOutlineColor(sf::Color(static_cast<sf::Uint8>(r), static_cast<sf::Uint8>(g), static_cast<sf::Uint8>(b), static_cast<sf::Uint8>(std::floor(a * 255.0))));
		sfml.window.draw(t, sf::RenderStates(sfml.stack.back()));
		return false;
	}, 9);

	engine.setGlobalFunction("SFML_Blit", [&sfml](TEngine* ctx) {
		const auto name = ctx->getargstr(0);
		const auto srcX = ctx->getargn(1);
		const auto srcY = ctx->getargn(2);
		const auto srcWidth = ctx->getargn(3);
		const auto srcHeight = ctx->getargn(4);
		const auto dstX = ctx->getargf(5);
		const auto dstY = ctx->getargf(6);
		const auto dstWidth = ctx->getargf(7);
		const auto dstHeight = ctx->getargf(8);

		const auto img = sfml.assetStore.image(name, "./assets/images/" + name + ".png");
		sf::Sprite spr(*img, sf::IntRect(srcX, srcY, srcWidth, srcHeight));
		spr.setPosition(static_cast<float>(dstX), static_cast<float>(dstY));
		spr.setScale(static_cast<float>(dstWidth / srcWidth), static_cast<float>(dstHeight / srcHeight));
		sfml.window.draw(spr, sf::RenderStates(sfml.stack.back()));
		return false;
	}, 9);

	engine.setGlobalFunction("SFML_Push_Translate", [&sfml](TEngine* ctx) {
		const auto x = ctx->getargf(0);
		const auto y = ctx->getargf(1);

		auto m = sf::Transform(sfml.stack.back());
		m.translate(static_cast<float>(x), static_cast<float>(y));
		sfml.stack.push_back(m);
		return false;
	}, 2);
	engine.setGlobalFunction("SFML_Push_Scale", [&sfml](TEngine* ctx) {
		const auto x = ctx->getargf(0);
		const auto y = ctx->getargf(1);
		
		auto m = sf::Transform(sfml.stack.back());
		m.scale(static_cast<float>(x), static_cast<float>(y));
		sfml.stack.push_back(m);
		return false;
	}, 2);
	engine.setGlobalFunction("SFML_Push_Rotate", [&sfml](TEngine* ctx) {
		const auto radians = ctx->getargf(0);
		
		auto m = sf::Transform(sfml.stack.back());
		m.rotate(static_cast<float>(radians * 57.2958));
		sfml.stack.push_back(m);
		return false;
	}, 1);
	engine.setGlobalFunction("SFML_Pop", [&sfml](TEngine* ctx) {
		sfml.stack.pop_back();
		return false;
	}, 0);
	engine.setGlobalFunction("SFML_SetVSync", [&sfml](TEngine* ctx) {
		const auto enabled = ctx->getargb(0);

		sfml.window.setVerticalSyncEnabled(enabled);
		return false;
	}, 1);
	engine.setGlobalFunction("SFML_LoadImage", [&sfml](TEngine* ctx) {
		const auto name = ctx->getargstr(0);
		const auto src = ctx->getargstr(1);
		const auto id = ctx->getargn(2);

		const auto img = sfml.assetStore.image(name, src, [id, ctx](std::shared_ptr<sf::Texture> texture) {
			ctx->trigger("SFML_OnLoadImage", id, texture->getSize().x, texture->getSize().y);
		});
		ctx->pushObject();
		ctx->push(img->getSize().x);
		ctx->putProp(-2, "width");
		ctx->push(img->getSize().y);
		ctx->putProp(-2, "height");
		ctx->push(src);
		ctx->putProp(-2, "src");
		ctx->push(name);
		ctx->putProp(-2, "name");
		return true;
	}, 3);
	engine.setGlobalFunction("SFML_LoadFont", [&sfml](TEngine* ctx) {
		const auto name = ctx->getargstr(0);
		const auto src = ctx->getargstr(1);
		const auto id = ctx->getargn(2);

		const auto font = sfml.assetStore.font(name, src, [id, ctx](std::shared_ptr<sf::Font>) { ctx->trigger("SFML_OnLoadFont", id); });
		ctx->pushObject();
		ctx->push(name);
		ctx->putProp(-2, "name");
		ctx->push(src);
		ctx->putProp(-2, "src");
		return true;
	}, 3);
	engine.setGlobalFunction("SFML_LoadSound", [&sfml](TEngine* ctx) {
		const auto name = ctx->getargstr(0);
		const auto src = ctx->getargstr(1);
		const auto id = ctx->getargn(2);

		const auto sound = sfml.assetStore.sound(name, src, [id, ctx](std::shared_ptr<sf::SoundBuffer>) { ctx->trigger("SFML_OnLoadSound", id); });
		ctx->pushObject();
		ctx->push(name);
		ctx->putProp(-2, "name");
		ctx->push(src);
		ctx->putProp(-2, "src");
		return true;
	}, 3);
	engine.setGlobalFunction("SFML_LoadMusic", [&sfml](TEngine* ctx) {
		const auto name = ctx->getargstr(0);

		const auto src = ctx->getargstr(1);
		const auto music = sfml.assetStore.music(name, src);
		ctx->pushObject();
		ctx->push(name);
		ctx->putProp(-2, "name");
		ctx->push(src);
		ctx->putProp(-2, "src");
		return true;
	}, 2);
	engine.setGlobalFunction("SFML_PlaySound", [&sfml](TEngine* ctx) {
		const auto name = ctx->getargstr(0);
		const auto volume = ctx->getargf(1);

		const auto sound = sfml.assetStore.sound(name, "./assets/sound/" + name + ".ogg");
		auto soundEffect = std::make_unique<sf::Sound>();
		soundEffect->setBuffer(*sound);
		soundEffect->setVolume(static_cast<float>(volume * 100.0));
		soundEffect->play();
		sfml.activeSoundEffects.push_back(std::move(soundEffect));
		return false;
	}, 2);

	engine.setGlobalFunction("SFML_PlayMusic", [&sfml](TEngine* ctx) {
		const auto name = ctx->getargstr(0);
		const auto volume = ctx->getargf(1);
		const auto loop = ctx->getargb(2);
		auto music = sfml.assetStore.music(name, "./assets/music/" + name + ".ogg");
		music->setLoop(loop);
		music->setVolume(static_cast<float>(volume * 100.0));
		if (music->getStatus() != sf::SoundStream::Playing) {
			music->play();
		}
		return false;
	}, 3);
	engine.setGlobalFunction("SFML_PauseMusic", [&sfml](TEngine* ctx) {
		const auto name = ctx->getargstr(0);
		auto music = sfml.assetStore.music(name, "./assets/music/" + name + ".ogg");
		if (music->getStatus() == sf::SoundStream::Playing) {
			music->pause();
		}
		return false;
	}, 1);
	engine.setGlobalFunction("SFML_StopMusic", [&sfml](TEngine* ctx) {
		const auto name = ctx->getargstr(0);
		auto music = sfml.assetStore.music(name, "./assets/music/" + name + ".ogg");
		music->stop();
		return false;
	}, 1);
}

template<typename TEngine> void _pollEvents(TEngine &engine, Sfml &sfml) {
	sf::Event event = {};
	while (sfml.window.pollEvent(event)) {
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

void attachSfml(DukJavascriptEngine &engine, Sfml &sfml) {
	_attachSfml(engine, sfml);
}

void pollEvents(DukJavascriptEngine &engine, Sfml &sfml) {
	_pollEvents(engine, sfml);
}

#ifdef GAM_CHAKRA_ENABLE
void attachSfml(ChakraJavascriptEngine &engine, Sfml &sfml) {
	_attachSfml(engine, sfml);
}

void pollEvents(ChakraJavascriptEngine &engine, Sfml &sfml) {
	_pollEvents(engine, sfml);
}
#endif