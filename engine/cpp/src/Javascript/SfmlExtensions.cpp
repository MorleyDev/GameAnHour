#include <unordered_map>
#include <functional>

#include <SFML/Graphics/RectangleShape.hpp>
#include <SFML/Graphics/CircleShape.hpp>
#include <SFML/Window/Event.hpp>
#include "SfmlExtensions.hpp"

const char* sfmlScript =
        "(function () {"
        "    HTMLElement = function() { };"
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
        "    SFML_SetRenderer = function (renderer) {"
        "        SFML_Render = renderer;"
        "    };"
        "    SFML_Render = function () {  return ['clear']; };"
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

std::unordered_map<std::string, std::function<void (duk_context*, std::size_t, sf::RenderWindow&, std::vector<sf::Transform>&, sf::RenderStates&)>> drawCommands;

void recursivelyDraw(duk_context* ctx, sf::RenderWindow& window, std::vector<sf::Transform> &stack, sf::RenderStates &renderStates) {
    auto arraySize = duk_get_length(ctx, -1);
    for(auto i = 0; i < arraySize; ++i) {
        duk_get_prop_index(ctx, -1, i);
        if (duk_is_array(ctx, -1)) {
            recursivelyDraw(ctx, window, stack, renderStates);
            duk_pop(ctx);
            continue;
        } else {
            std::string command = (duk_safe_to_string(ctx, -1));
            duk_pop(ctx);

            auto it = drawCommands.find(command);
            if (it != drawCommands.end()) {
                drawCommands[command](ctx, arraySize - (i + 1), window, stack, renderStates);
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

void attachSfml(JavascriptEngine &engine, sf::RenderWindow &window) {
    engine.add("sfml", sfmlScript);
    engine.setGlobalFunction("SFML_Close", [&window](duk_context* ctx) {
        window.close();
        return 1;
    });

    drawCommands["clear"] = [](duk_context* context, std::size_t args, sf::RenderWindow& window, std::vector<sf::Transform> &stack, sf::RenderStates &renderStates) {
        if (args == 0) {
            window.clear(sf::Color::Black);
        } else {
            duk_get_prop_index(context, -1, 1);
            auto colour = getColour(context);
            window.clear(colour);
            duk_pop(context);
        }
    };

    drawCommands["origin"] = [](duk_context* context, std::size_t args, sf::RenderWindow& window, std::vector<sf::Transform> &stack, sf::RenderStates &renderStates) {
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
        renderStates.transform = transform;
        stack.push_back(transform);
        duk_get_prop_index(context, -1, 2);
         recursivelyDraw(context, window, stack, renderStates);
        duk_pop(context);
        stack.pop_back();
        renderStates.transform = stack.back();
    };

    drawCommands["scale"] = [](duk_context* context, std::size_t args, sf::RenderWindow& window, std::vector<sf::Transform> &stack, sf::RenderStates &renderStates) {
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
        renderStates.transform = transform;
        stack.push_back(transform);
        duk_get_prop_index(context, -1, 2);
        recursivelyDraw(context, window, stack, renderStates);
        duk_pop(context);
        stack.pop_back();
        renderStates.transform = stack.back();
    };

    drawCommands["rotate"] = [](duk_context* context, std::size_t args, sf::RenderWindow& window, std::vector<sf::Transform> &stack, sf::RenderStates &renderStates) {
        if(args != 2) {
            throw std::runtime_error("Not enough arguments provided to rotate command");
        }

        duk_get_prop_index(context, -1, 1); // Radians
        auto radians = duk_get_number(context, -1);
        duk_pop(context);

        sf::Transform transform(stack.back());
        transform.rotate(radians * 57.2958);
        renderStates.transform = transform;
        stack.push_back(transform);
        duk_get_prop_index(context, -1, 2);
         recursivelyDraw(context, window, stack, renderStates);
        duk_pop(context);
        stack.pop_back();
        renderStates.transform = stack.back();
    };

    auto strokeOrFill = [](bool isFill, duk_context* context, std::size_t args, sf::RenderWindow& window, std::vector<sf::Transform> &stack, sf::RenderStates &renderStates) {
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
                window.draw(vertexArray, renderStates);
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
                    circle.setOrigin(r, r);
                    window.draw(circle, renderStates);
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
                    window.draw(rectangle, renderStates);
                }
            }
            duk_pop(context);
        }
    };

    drawCommands["fill"] = std::bind(strokeOrFill, true, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3, std::placeholders::_4, std::placeholders::_5);
    drawCommands["stroke"] = std::bind(strokeOrFill, false, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3, std::placeholders::_4, std::placeholders::_5);
}

void draw(JavascriptEngine &engine, sf::RenderWindow &window) {
    std::vector<sf::Transform> stack;
    sf::RenderStates renderStates(sf::Transform::Identity);
    stack.push_back(sf::Transform::Identity);
    
    engine.invoke([&window, &stack, &renderStates](duk_context* ctx) {
        if (!duk_is_array(ctx, -1)) {
            throw std::runtime_error("Invalid rendering: Result not array");
        }
        recursivelyDraw(ctx, window, stack, renderStates);
    }, "SFML_Render");
}

void pollEvents(JavascriptEngine &engine, sf::RenderWindow &window) {

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
