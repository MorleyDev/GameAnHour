#include <string>
#include <iostream>
#include <chrono>
#include <unordered_map>

#include <SFML/Graphics.hpp>

#include "Javascript/JavascriptEngine.hpp"
#include "Javascript/TimerExtensions.hpp"
#include "Javascript/SfmlExtensions.hpp"
#include "Profile/Profiler.hpp"
#include "Javascript/Box2dExtensions.hpp"
#include "Javascript/ReduxExtensions.hpp"

int main() {
	try {
        const auto startTime = std::chrono::system_clock::now();

        Profiler profiler;
		sf::RenderWindow window(sf::VideoMode(512, 512), "GAM");
        //window.setVerticalSyncEnabled(true);

        std::vector<sf::Transform> stack;
        stack.push_back(sf::Transform::Identity);

        Box2d box2d;
        Redux redux;

		JavascriptEngine engine(profiler);
		attachTimers(engine);
		attachSfml(engine, window, stack);
        attachBox2d(engine, box2d);
        attachRedux(engine, redux);

		engine.load("./dist/engine/sfml/index.js");

        auto previousFrame = startTime;
		auto previousTime = startTime;

		auto fps = 0;
		while (window.isOpen()) {
            auto currentTime = std::chrono::system_clock::now();
            auto diffMilliseconds = std::chrono::duration<double>(currentTime - previousTime).count() * 1000;
            previousTime = currentTime;

            profiler.profile("Tick", [&]() { tick(engine, diffMilliseconds); });
            profiler.profile("Animate", [&]() { animate(engine); window.display(); });
            profiler.profile("PollEvents", [&]() { pollEvents(engine, window); });

            ++fps;
            if (std::chrono::duration<double>(currentTime - previousFrame).count() >= 1) {
                window.setTitle(std::string("FPS: ") + std::to_string(fps / std::chrono::duration<double>(currentTime - previousFrame).count()));
                fps = 0;
                previousFrame = currentTime;
            };
		}
        const auto endTime = std::chrono::system_clock::now();
        const auto stats = profiler.statdump();
        const auto totalTime = std::chrono::duration<double>(endTime - startTime).count();

        auto profiledTime = 0.0;
        for(auto stat : stats) {
            profiledTime += stat.second.total;
            auto avg = stat.second.total / stat.second.count;
            auto min = stat.second.min;
            auto max = stat.second.max;
            std::cout << "Engine#" << stat.first << " | " << avg << " | ~" << std::floor((stat.second.total / totalTime) * 100) << "% | (" << min << " - " << max << ") | x" << stat.second.count << std::endl;
        }
        const auto unaccountedTime = std::abs(totalTime - profiledTime);
        std::cout << "Cpp#Unknown" << " | " << unaccountedTime  << " | ~" << std::floor((unaccountedTime  / totalTime) * 100) << "% | (" << unaccountedTime  << " - " << unaccountedTime  << ")" << std::endl;
	}
	catch (const std::exception &err)
	{
		std::cerr << err.what() << std::endl;
		return 1;
	}
}
