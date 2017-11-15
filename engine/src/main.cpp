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

	Profiler mainProfiler("Main");
	Profiler secondaryProfiler("Secondary");

	moodycamel::ConcurrentQueue<std::string> secondaryQueue;
	moodycamel::ConcurrentQueue<std::string> workQueue;

	const auto startTime = std::chrono::system_clock::now();

	Sfml sfml("GAM", sf::VideoMode(512, 512), tasks, mainThreadTasks);
	Box2d box2d;

	DukJavascriptEngine primaryEngine(mainProfiler, [&sfml, &box2d, &secondaryQueue, &workQueue](DukJavascriptEngine& engine) {
		attachConsole(engine);
		attachTimers(engine);
		attachSfml(engine, sfml);
		attachBox2d(engine, box2d);
		attachWorkers(engine, workQueue);

		engine.add("secondary", "SECONDARY_Receive = function () { }; SECONDARY_Join = function () { };");
		engine.setGlobalFunction("SECONDARY_Emit", [&secondaryQueue](DukJavascriptEngine* engine) {
			secondaryQueue.enqueue(engine->getargstr(0));
			return false;
		}, 1);
	});

	auto workers = spawnWorkers(primaryEngine, cancellationToken, mainThreadTasks, workQueue);
	auto threads = spawnTaskProcessorPool(tasks, cancellationToken);
	std::unique_ptr<std::thread> secondaryThread;
	try {
		std::for_each(workers.begin(), workers.end(), [](std::unique_ptr<JavascriptWorker>& worker) { worker->load("./dist/engine/sfml/worker.js"); });
		std::for_each(workers.begin(), workers.end(), [](std::unique_ptr<JavascriptWorker>& worker) { worker->start(); });
		primaryEngine.load("./dist/engine/sfml/primary.js");

		secondaryThread = std::make_unique<std::thread>([&cancellationToken, &secondaryProfiler, &box2d, &secondaryQueue, &mainThreadTasks, &primaryEngine, &workQueue]() {
			JavascriptEngine secondaryEngine(secondaryProfiler, [&mainThreadTasks, &box2d, &primaryEngine, &workQueue](JavascriptEngine& engine) {
				attachConsole(engine);
				attachTimers(engine);
				attachBox2d(engine, box2d);
				attachWorkers(engine, workQueue);

				engine.add("secondary", "SECONDARY_Receive = function () { }; SECONDARY_Join = function () { };");
				engine.setGlobalFunction("SECONDARY_Emit", [&mainThreadTasks, &primaryEngine](JavascriptEngine* ctx) {
					auto msg = ctx->getargstr(0);
					mainThreadTasks.push([msg, &primaryEngine]() { primaryEngine.trigger("SECONDARY_Receive", msg); });
					return false;
				}, 1);
			});
			try {
				secondaryEngine.load("./dist/engine/sfml/secondary.js");

				auto previousTime = std::chrono::system_clock::now();
				std::string msg;
				while (!cancellationToken) {
					auto currentTime = std::chrono::system_clock::now();
					auto deltaTime = std::chrono::duration<double>(currentTime - previousTime).count() * 1000;
					if (deltaTime >= 1) {
						secondaryProfiler.profile("Tick", [&]() { tick(secondaryEngine, deltaTime); });
						secondaryProfiler.profile("Animate", [&]() { animate(secondaryEngine); });
					}
					while (!cancellationToken && secondaryQueue.try_dequeue(msg)) {
						secondaryEngine.trigger("SECONDARY_Receive", msg);
					}
					secondaryEngine.checkFileSystem();
					secondaryEngine.idle();
					std::this_thread::yield();
				}
				secondaryEngine.trigger("SECONDARY_Join", secondaryProfiler.getName());
			}
			catch (const std::exception &err)
			{
				std::cerr << "UNHANDLED EXCEPTION IN SECONDARY THREAD: " << err.what() << std::endl;
			}
		});


		auto previousSecond = startTime;
		auto previousTime = startTime;
		auto previousFrame = startTime - std::chrono::milliseconds(5);

		auto fps = 0;
		while (sfml.window.isOpen()) {
			auto currentTime = std::chrono::system_clock::now();
			auto diffMilliseconds = std::chrono::duration<double>(currentTime - previousTime).count() * 1000;
			if (diffMilliseconds >= 1) {
				previousTime = currentTime;

				mainProfiler.profile("Tick", [&]() { tick(primaryEngine, diffMilliseconds); });
				mainProfiler.profile("PollEvents", [&]() { pollEvents(primaryEngine, sfml); });
			} else {
				mainProfiler.profile("Idle(Yield)", [&]() {
					primaryEngine.idle();
				});
			}

			if (std::chrono::duration<double>(currentTime - previousFrame).count() >= 0.005) {
				mainProfiler.profile("Animate", [&]() {
					animate(primaryEngine);
					sfml.window.display();
				});
				++fps;
			}

			if (std::chrono::duration<double>(currentTime - previousSecond).count() >= 1) {
				sfml.window.setTitle(std::string("FPS: ") + std::to_string(fps / std::chrono::duration<double>(currentTime - previousSecond).count()));
				fps = 0;

				previousSecond = currentTime;
				mainProfiler.profile("Idle(Forced)", [&]() { primaryEngine.idle(); });
				primaryEngine.checkFileSystem();
				std::this_thread::yield();
			};

			const auto stoppedSound = std::find_if(sfml.activeSoundEffects.begin(), sfml.activeSoundEffects.end(), [](const std::unique_ptr<sf::Sound>& sound) { return sound->getStatus() == sf::SoundSource::Stopped; });
			if (stoppedSound != sfml.activeSoundEffects.end()) {
				sfml.activeSoundEffects.erase(stoppedSound);
			}

			mainThreadTasks.consume(100);
		}
		cancellationToken.store(true);
		secondaryThread->join();
		std::for_each(threads.begin(), threads.end(), [](std::thread& thread) { thread.join(); });
		std::for_each(workers.begin(), workers.end(), [](std::unique_ptr<JavascriptWorker>& worker) { worker->join(); });

		mainProfiler.iodump(std::cout);
		secondaryProfiler.iodump(std::cout);
		std::for_each(workers.begin(), workers.end(), [](std::unique_ptr<JavascriptWorker>& worker) { worker->getProfiler().iodump(std::cout); });
	}
	catch (const std::exception &err)
	{
		std::cerr << "UNHANDLED EXCEPTION: " << err.what() << std::endl;
		cancellationToken.store(true);
		std::for_each(threads.begin(), threads.end(), [](std::thread& thread) { thread.join(); });
		std::for_each(workers.begin(), workers.end(), [](std::unique_ptr<JavascriptWorker>& worker) { worker->join(); });
		if (secondaryThread) secondaryThread->join();
		return 1;
	}
}
