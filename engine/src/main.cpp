#include "Javascript/JavascriptEngine.hpp"
#include "Javascript/TimerExtensions.hpp"
#include "Javascript/ConsoleExtensions.hpp"
#include "Javascript/WorkerExtensions.hpp"
#include "Javascript/SfmlExtensions.hpp"
#include "Javascript/Box2dExtensions.hpp"
#include "Profile/Profiler.hpp"
#include "Concurrent/TaskQueue.hpp"

#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>

#include <string>
#include <iostream>
#include <chrono>
#include <unordered_map>
#include <vector>

int main() {
	TaskQueue mainThreadTasks;
	TaskQueue tasks;
	std::atomic<bool> cancellationToken(false);
	auto threads = spawnTaskProcessorPool(tasks, cancellationToken);

	const auto startTime = std::chrono::system_clock::now();

	Profiler profiler("Engine");
	Sfml sfml("GAM", sf::VideoMode(512, 512), tasks, mainThreadTasks);

	Box2d box2d;
	JavascriptEngine engine(profiler);
	attachConsole(engine);
	attachTimers(engine);
	attachSfml(engine, sfml);
	attachBox2d(engine, box2d);

	moodycamel::ConcurrentQueue<std::string> workQueue;
	auto workers = attachWorkers(engine, cancellationToken, mainThreadTasks, workQueue);

	try {
		engine.load("./dist/engine/sfml/index.js");
		std::for_each(workers.begin(), workers.end(), [](std::unique_ptr<JavascriptWorker>& worker) { worker->load("./dist/engine/sfml/worker.js"); });
		std::for_each(workers.begin(), workers.end(), [](std::unique_ptr<JavascriptWorker>& worker) { worker->start(); });

		auto previousSecond = startTime;
		auto previousTime = startTime;
		auto previousFrame = startTime - std::chrono::milliseconds(5);

		auto fps = 0;
		while (sfml.window.isOpen()) {
			auto currentTime = std::chrono::system_clock::now();
			auto diffMilliseconds = std::chrono::duration<double>(currentTime - previousTime).count() * 1000;
			if (diffMilliseconds >= 1) {
				previousTime = currentTime;

				profiler.profile("Tick", [&]() { tick(engine, diffMilliseconds); });
				profiler.profile("PollEvents", [&]() { pollEvents(engine, sfml); });
			} else {
				profiler.profile("Idle(Yield)", [&]() {
					engine.idle();
				});
			}

			if (std::chrono::duration<double>(currentTime - previousFrame).count() >= 0.005) {
				profiler.profile("Animate", [&]() {
					animate(engine);
					sfml.window.display();
				});
				++fps;
			}

			if (std::chrono::duration<double>(currentTime - previousSecond).count() >= 1) {
				sfml.window.setTitle(std::string("FPS: ") + std::to_string(fps / std::chrono::duration<double>(currentTime - previousSecond).count()));
				fps = 0;

				previousSecond = currentTime;
				profiler.profile("Idle(Forced)", [&]() { engine.idle(); });
				std::this_thread::yield();
			};

			const auto stoppedSound = std::find_if(sfml.activeSoundEffects.begin(), sfml.activeSoundEffects.end(), [](const std::unique_ptr<sf::Sound>& sound) { return sound->getStatus() == sf::SoundSource::Stopped; });
			if (stoppedSound != sfml.activeSoundEffects.end()) {
				sfml.activeSoundEffects.erase(stoppedSound);
			}

			mainThreadTasks.consume(100);
		}
		profiler.iodump(std::cout);

		cancellationToken.store(true);
		std::for_each(threads.begin(), threads.end(), [](std::thread& thread) { thread.join(); });
		std::for_each(workers.begin(), workers.end(), [](std::unique_ptr<JavascriptWorker>& worker) {
			worker->join();
			worker->getProfiler().iodump(std::cout);
		});
	}
	catch (const std::exception &err)
	{
		std::cerr << "UNHANDLED EXCEPTION: " << err.what() << std::endl;
		cancellationToken.store(true);
		std::for_each(threads.begin(), threads.end(), [](std::thread& thread) { thread.join(); });
		std::for_each(workers.begin(), workers.end(), [](std::unique_ptr<JavascriptWorker>& worker) { worker->join(); });
		return 1;
	}
}
