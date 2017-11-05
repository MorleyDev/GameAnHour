#include <string>
#include <iostream>
#include <chrono>
#include <unordered_map>

#include <SFML/Graphics.hpp>

#include "Javascript/JavascriptEngine.hpp"
#include "Javascript/TimerExtensions.hpp"
#include "Javascript/SfmlExtensions.hpp"


int main() {
	try {
		sf::RenderWindow window(sf::VideoMode(512, 512), "GAM");
        //window.setVerticalSyncEnabled(true);

        std::vector<sf::Transform> stack;
        stack.push_back(sf::Transform::Identity);

		JavascriptEngine engine;
		attachTimers(engine);
		attachSfml(engine, window, stack);

		engine.load("./dist/engine/sfml/index.js");

        const auto startTime = std::chrono::system_clock::now();
		auto previousTime = startTime;

		auto fps = 0;
		while (window.isOpen()) {
			auto currentTime = std::chrono::system_clock::now();
			auto diffMilliseconds = std::chrono::duration<double>(currentTime - previousTime).count() * 1000;
			previousTime = currentTime;
			tick(engine, diffMilliseconds);

            window.clear();
			animate(engine);
			draw(engine, window);
			window.display();

			pollEvents(engine, window);
            ++fps;
            window.setTitle(std::string("FPS: ") + std::to_string(fps / std::chrono::duration<double>(currentTime - startTime).count()));
		}
	}
	catch (const std::exception &err)
	{
		std::cerr << err.what() << std::endl;
		return 1;
	}
}
