#include "WorkerExtensions.hpp"
#include "TimerExtensions.hpp"
#include "ConsoleExtensions.hpp"
#include <iostream>

JavascriptWorker::JavascriptWorker(std::string name, std::atomic<bool>& cancellationToken, moodycamel::ConcurrentQueue<std::string>& workQueue, std::function<void (std::string)> emitToMain)
	: profiler(name),
	engine(profiler, [this](DukJavascriptEngine& engine) {
		attachConsole(engine);
		attachTimers(engine);
		engine.add("workers", "WORKER_Receive = function () { }; WORKER_Join = function () { };");
		engine.setGlobalFunction("WORKER_Emit", [this](DukJavascriptEngine* ctx) {
			this->emitToMain(ctx->getargstr(0));
			return false;
		}, 1);
	}),
	cancellationToken(cancellationToken),
	workQueue(workQueue),
	emitToMain(emitToMain),
	thread() {
}

JavascriptWorker::~JavascriptWorker() {
	if (thread) {
		thread->join();
	}
}

void JavascriptWorker::start() {
	thread = std::move( std::make_unique<std::thread>([this]() {
		try {
			std::string action;
			auto previousTime = std::chrono::system_clock::now();
			while (!cancellationToken) {
				if (!workQueue.try_dequeue(action)) {
					auto currentTime = std::chrono::system_clock::now();
					auto diff = std::chrono::duration<double>(currentTime - previousTime).count() / 1000.0;
					if (diff >= 1) {
						profiler.profile("Tick", [&]() {
							tick(engine, diff);
						});
						profiler.profile("Animate", [&]() {
							animate(engine);
						});
					}
					engine.checkFileSystem();
					std::this_thread::sleep_for(std::chrono::milliseconds(5));
				}
				else {
					engine.trigger("WORKER_Receive", action);
				}
			}
			engine.trigger("WORKER_Join", profiler.getName());
		}
		catch (const std::exception &err)
		{
			std::cerr << "UNHANDLED EXCEPTION IN WORKER THREAD: " << err.what() << std::endl;
		}
	}) );
}

std::vector<std::unique_ptr<JavascriptWorker>> attachWorkers(JavascriptEngine& engine, std::atomic<bool>& cancellationToken, TaskQueue& mainTaskQueue, moodycamel::ConcurrentQueue<std::string>& workQueue) {
	engine.add("workers", "WORKER_Receive = function () { }; WORKER_Join = function () { };");
	engine.setGlobalFunction("WORKER_Emit", [&workQueue](JavascriptEngine* ctx) {
		workQueue.enqueue(ctx->getargstr(0));
		return false;
	}, 1);

	std::vector<std::unique_ptr<JavascriptWorker>> workers;
	auto numberOfThreads = std::thread::hardware_concurrency() - 1;
	if (numberOfThreads == 0) {
		numberOfThreads = 1;
	}

	for (auto i = 0u; i < numberOfThreads; ++i) {
		workers.emplace_back(std::make_unique<JavascriptWorker>("Worker" + std::to_string(i), cancellationToken, workQueue, [&engine, &mainTaskQueue](std::string msg) {
			mainTaskQueue.push([&engine, msg]() {
				engine.trigger("WORKER_Receive", msg);
			});
		}));
	}
	return workers;
}
