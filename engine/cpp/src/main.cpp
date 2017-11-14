#include <SFML/Graphics.hpp>

#include "Javascript/JavascriptEngine.hpp"
#include "Javascript/TimerExtensions.hpp"
#include "Javascript/ConsoleExtensions.hpp"
#include "Javascript/SfmlExtensions.hpp"
#include "Javascript/Box2dExtensions.hpp"
#include "Javascript/ReduxExtensions.hpp"
#include "Profile/Profiler.hpp"
#include <SFML/Audio/Sound.hpp>

#include <string>
#include <iostream>
#include <chrono>
#include <unordered_map>
#include <vector>

int main() {
	try {
		const auto startTime = std::chrono::system_clock::now();

		Profiler profiler;
		sf::RenderWindow window(sf::VideoMode(512, 512), "GAM");

		SfmlAssetStore assetStore;
		std::vector<sf::Transform> stack;
		stack.push_back(sf::Transform::Identity);

		std::vector<std::unique_ptr<sf::Sound>> activeSoundEffects;

		Box2d box2d;
		Redux redux;

		JavascriptEngine engine(profiler);
		attachConsole(engine);
		attachTimers(engine);
		attachSfml(engine, window, stack, assetStore, activeSoundEffects);
		attachBox2d(engine, box2d);
		attachRedux(engine, redux);

		engine.load("./dist/engine/sfml/index.js");

		auto previousFrame = startTime;
		auto previousTime = startTime;

		auto fps = 0;
		while (window.isOpen()) {
			auto currentTime = std::chrono::system_clock::now();
			auto diffMilliseconds = std::chrono::duration<double>(currentTime - previousTime).count() * 1000;
			if (diffMilliseconds >= 1) {
				previousTime = currentTime;

				profiler.profile("Tick", [&]() { tick(engine, diffMilliseconds); });
				profiler.profile("PollEvents", [&]() { pollEvents(engine, window); });
			} else {
				profiler.profile("Idle", [&]() { engine.idle(); });
			}
			profiler.profile("Animate", [&]() {
				animate(engine);
				window.display();
			});

			++fps;
			if (std::chrono::duration<double>(currentTime - previousFrame).count() >= 1) {
				window.setTitle(std::string("FPS: ") + std::to_string(fps / std::chrono::duration<double>(currentTime - previousFrame).count()));
				fps = 0;
				previousFrame = currentTime;
				profiler.profile("Idle", [&]() { engine.idle(); });
			};

			const auto stoppedSound = std::find_if(activeSoundEffects.begin(), activeSoundEffects.end(), [](const std::unique_ptr<sf::Sound>& sound) { return sound->getStatus() == sf::SoundSource::Stopped; });
			if (stoppedSound != activeSoundEffects.end()) {
				activeSoundEffects.erase(stoppedSound);
			}
		}
		profiler.printdump();
	}
	catch (const std::exception &err)
	{
		std::cerr << err.what() << std::endl;
		return 1;
	}
}
