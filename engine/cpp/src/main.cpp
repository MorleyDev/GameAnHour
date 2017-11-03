#include <string>
#include <iostream>
#include <chrono>
#include <unordered_map>

#include <SFML/Graphics.hpp>

#include "Javascript/JavascriptEngine.hpp"
#include "Javascript/TimerExtensions.hpp"

std::unordered_map<std::string, std::function<void (duk_context*, std::size_t)>> drawCommands;

void recursivelyDraw(duk_context* ctx) {
    auto arraySize = duk_get_length(ctx, -1);
    for(auto i = 0; i < arraySize; ++i) {
        duk_get_prop_index(ctx, -1, i);
        if (duk_is_array(ctx, -1)) {
            recursivelyDraw(ctx);
            duk_pop(ctx);
            continue;
        } else {
            std::string command = (duk_safe_to_string(ctx, -1));
            duk_pop(ctx);

            auto it = drawCommands.find(command);
            if (it != drawCommands.end()) {
                drawCommands[command](ctx, arraySize - (i + 1));
            }
            break;
        }
    }
}

auto getColour(duk_context* context) {
    duk_get_prop_string(context, -1, "r");
    duk_get_prop_string(context, -2, "g");
    duk_get_prop_string(context, -3, "b");
    duk_get_prop_string(context, -4, "a");
    auto r = duk_get_int(context, -4);
    auto g = duk_get_int(context, -3);
    auto b = duk_get_int(context, -2);
    auto a = duk_get_number(context, -1);
    duk_pop_n(context, 4);

    return sf::Color(r, g, b, static_cast<std::uint8_t >(255.0 * a));
}

int main()
{
	try
	{
		sf::RenderWindow window(sf::VideoMode(512, 512), "GAM");
		window.setVerticalSyncEnabled(true);
        std::vector<sf::Transform> stack;
        sf::RenderStates renderState(sf::Transform::Identity);
        stack.push_back(sf::Transform::Identity);

		JavascriptEngine engine;
        attachTimers(engine);

		engine.load("./js/sfml.js");
		engine.load("./index.js");

        drawCommands["clear"] = [&window](duk_context* context, std::size_t args) {
            if (args == 0) {
                window.clear(sf::Color::Black);
            } else {
                duk_get_prop_index(context, -1, 1);
                auto colour = getColour(context);
                window.clear(colour);
                duk_pop(context);
            }
        };

        drawCommands["origin"] = [&window, &stack, &renderState](duk_context* context, std::size_t args) {
            if(args != 2) {
                throw std::runtime_error("Not enough arguments provided to origin command");
            }

            duk_get_prop_index(context, -1, 1); // Position
            duk_get_prop_string(context, -1, "x");
            duk_get_prop_string(context, -2, "y");
            auto y = duk_get_number(context, -1);
            auto x = duk_get_number(context, -2);
            duk_pop_3(context);

            sf::Transform transform(stack.back());
            transform.translate(x, y);
            renderState.transform = transform;
            stack.push_back(transform);
                duk_get_prop_index(context, -1, 2);
                    recursivelyDraw(context);
                duk_pop(context);
            stack.pop_back();
            renderState.transform = stack.back();
        };

        drawCommands["scale"] = [&window, &stack, &renderState](duk_context* context, std::size_t args) {
            if(args != 2) {
                throw std::runtime_error("Not enough arguments provided to scale command");
            }

            duk_get_prop_index(context, -1, 1); // Position
            duk_get_prop_string(context, -1, "x");
            duk_get_prop_string(context, -2, "y");
            auto y = duk_get_number(context, -1);
            auto x = duk_get_number(context, -2);
            duk_pop_3(context);

            sf::Transform transform(stack.back());
            transform.scale(x, y);
            renderState.transform = transform;
            stack.push_back(transform);
            duk_get_prop_index(context, -1, 2);
            recursivelyDraw(context);
            duk_pop(context);
            stack.pop_back();
            renderState.transform = stack.back();
        };

        drawCommands["rotate"] = [&window, &stack, &renderState](duk_context* context, std::size_t args) {
            if(args != 2) {
                throw std::runtime_error("Not enough arguments provided to rotate command");
            }

            duk_get_prop_index(context, -1, 1); // Radians
            auto radians = duk_get_number(context, -1);
            duk_pop(context);

            sf::Transform transform(stack.back());
            transform.rotate(radians * 57.2958);
            renderState.transform = transform;
            stack.push_back(transform);
            duk_get_prop_index(context, -1, 2);
            recursivelyDraw(context);
            duk_pop(context);
            stack.pop_back();
            renderState.transform = stack.back();
        };

        auto strokeOrFill = [&window, &renderState](bool isFill, duk_context* context, std::size_t args) {
            if (args != 2) {
                throw std::runtime_error("Not enough arguments provided to fill command");
            } else {
                duk_get_prop_index(context, -1, 2); // Colour
                auto colour = getColour(context);
                duk_pop(context);

                duk_get_prop_index(context, -1, 1); // Shape
                if (duk_is_array(context, -1)) {
                    auto count = duk_get_length(context, -1);

                    sf::VertexArray vertexArray(count == 2 ? sf::PrimitiveType::Lines : sf::PrimitiveType::Triangles, count);
                    for (auto i = 0; i < count; ++i) {
                        duk_get_prop_index(context, -1, i);
                        duk_get_prop_string(context, -1, "x");
                        auto x = duk_get_number(context, -1);
                        duk_pop(context);

                        duk_get_prop_string(context, -1, "y");
                        auto y = duk_get_number(context, -1);
                        duk_pop(context);
                        duk_pop(context);
                        vertexArray[i] = sf::Vertex(sf::Vector2f(x, y), colour);
                    }
                    window.draw(vertexArray, renderState);
                } else {
                    duk_get_prop_string(context, -1, "x");
                    duk_get_prop_string(context, -2, "y");
                    auto y = duk_get_number(context, -1);
                    auto x = duk_get_number(context, -2);
                    duk_pop_2(context);

                    if (duk_has_prop_string(context, -1, "text")) {
                        // TODO
                    } else if (duk_has_prop_string(context, -1, "radius")) {
                        duk_get_prop_string(context, -1, "radius");
                        auto r = duk_get_number(context, -1);
                        duk_pop(context);

                        sf::CircleShape circle(r);
                        if (!isFill) {
                            circle.setOutlineThickness(1.0f);
                            circle.setOutlineColor(colour);
                            circle.setFillColor(sf::Color::Transparent);
                        } else {
                            circle.setFillColor(colour);
                        }
                        circle.setPosition(x, y);
                        window.draw(circle, renderState);
                    }  else if (duk_has_prop_string(context, -1, "width")) {
                        duk_get_prop_string(context, -1, "width");
                        duk_get_prop_string(context, -2, "height");
                        auto w = duk_get_number(context, -2);
                        auto h = duk_get_number(context, -1);
                        duk_pop_2(context);

                        sf::RectangleShape rectangle(sf::Vector2f(w, h));
                        rectangle.setPosition(x, y);
                        if (!isFill) {
                            rectangle.setOutlineThickness(1.0f);
                            rectangle.setOutlineColor(colour);
                            rectangle.setFillColor(sf::Color::Transparent);
                        } else {
                            rectangle.setFillColor(colour);
                        }
                        window.draw(rectangle, renderState);
                    }
                }
                duk_pop(context);
            }
        };

        drawCommands["fill"] = std::bind(strokeOrFill, true, std::placeholders::_1, std::placeholders::_2);
        drawCommands["stroke"] = std::bind(strokeOrFill, false, std::placeholders::_1, std::placeholders::_2);

		engine.setGlobalFunction("SFML_Close", [&window](duk_context *context) { window.close(); return 0; });

		auto previousTime = std::chrono::system_clock::now();
		while (window.isOpen()) {
			auto currentTime = std::chrono::system_clock::now();
			auto diffMilliseconds = std::chrono::duration<double>(currentTime - previousTime).count() * 1000;
			if (diffMilliseconds >= 1) {
				previousTime = currentTime;
                tick(engine, diffMilliseconds);
			}

            animate(engine);
			engine.invoke([](duk_context* ctx) {
                if (!duk_is_array(ctx, -1)) {
                    std::cout << "Invalid rendering: Result not array" << std::endl;
                    return;
                }
                recursivelyDraw(ctx);
            }, "SFML_Render");
			window.display();

			sf::Event event;
			while (window.pollEvent(event))
			{
				switch (event.type)
				{
				case sf::Event::Resized: {
                    engine.trigger("SFML_OnEvent", static_cast<int>(event.type), event.size.width, event.size.height);
                    break;
                }

				case sf::Event::KeyPressed:
				case sf::Event::KeyReleased: {
                    engine.trigger("SFML_OnEvent", static_cast<int>(event.type), event.key.code);
                    break;
                }
				case sf::Event::MouseWheelScrolled:{
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
	}
	catch (const std::exception &err)
	{
		std::cerr << err.what() << std::endl;
		return 1;
	}
}
