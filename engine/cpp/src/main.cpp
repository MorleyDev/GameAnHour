#include <string>
#include <iostream>
#include <chrono>
#include <unordered_map>

#include <SFML/Graphics.hpp>

#include "Javascript/JavascriptEngine.hpp"
#include "Javascript/TimerExtensions.hpp"
#include "Javascript/SfmlExtensions.hpp"
#include "Profile/Profiler.hpp"


int main() {
	try {
        Profiler profiler;
		sf::RenderWindow window(sf::VideoMode(512, 512), "GAM");
        //window.setVerticalSyncEnabled(true);

        std::vector<sf::Transform> stack;
        stack.push_back(sf::Transform::Identity);

		JavascriptEngine engine;
		attachTimers(engine);
		attachSfml(engine, window, stack);

		engine.load("./dist/engine/sfml/index.js");

        auto startTime = std::chrono::system_clock::now();
		auto previousTime = startTime;

		auto fps = 0;
		while (window.isOpen()) {
            auto currentTime = std::chrono::system_clock::now();
            auto diffMilliseconds = std::chrono::duration<double>(currentTime - previousTime).count() * 1000;
            previousTime = currentTime;

            profiler.profile("Javascript::Tick", [&]() { tick(engine, diffMilliseconds); });
            profiler.profile("Javascript::Animate", [&]() { animate(engine); window.display(); });
            profiler.profile("Javascript::PollEvents", [&]() { pollEvents(engine, window); });

            ++fps;
            if (std::chrono::duration<double>(currentTime - startTime).count() >= 1) {
                window.setTitle(std::string("FPS: ") + std::to_string(fps / std::chrono::duration<double>(currentTime - startTime).count()));
                fps = 0;
                startTime = currentTime;
            };
		}
        auto totalTime = 0.0;
        auto stats = profiler.statdump();
        for(auto stat : stats) {
            totalTime += stat.second.total;
        }

        for(auto stat : stats) {
            auto avg = stat.second.total / stat.second.count;
            auto min = stat.second.min;
            auto max = stat.second.max;
            std::cout << stat.first << ": " << avg << " | ~" << std::floor((stat.second.total / totalTime) * 100) << "% | (" << min << " - " << max << ")" << std::endl;
        }
	}
	catch (const std::exception &err)
	{
		std::cerr << err.what() << std::endl;
		return 1;
	}
}
