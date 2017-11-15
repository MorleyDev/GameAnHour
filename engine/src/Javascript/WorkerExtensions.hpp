#ifndef DUKSFML_WORKERENGINE_HPP
#define DUKSFML_WORKERENGINE_HPP

#include "../Concurrent/TaskQueue.hpp"
#include "DukJavascriptEngine.hpp"
#include "ChakraJavascriptEngine.hpp"
#include <concurrentqueue.h>
#include <string>
#include <vector>
#include <atomic>
#include <memory>

class JavascriptWorker {
private:
	Profiler profiler;
	DukJavascriptEngine engine;
	std::atomic<bool>& cancellationToken;
	moodycamel::ConcurrentQueue<std::string>& workQueue;
	std::unique_ptr<std::thread> thread;
	std::function<void(std::string)> emitToMain;

public:
	JavascriptWorker(std::string name, std::atomic<bool>& cancellationToken, moodycamel::ConcurrentQueue<std::string>& workQueue, std::function<void(std::string)> emitToMain);
	~JavascriptWorker();

	void start();

	void load(std::string filepath) {
		engine.load(filepath);
	}

	void join() {
		if (thread) {
			thread->join();
			thread.release();
		}
	}

	Profiler& getProfiler() {
		return profiler;
	}
};

extern void attachWorkers(DukJavascriptEngine& engine, moodycamel::ConcurrentQueue<std::string>& workQueue);
extern std::vector<std::unique_ptr<JavascriptWorker>> spawnWorkers(DukJavascriptEngine& engine, std::atomic<bool>& cancellationToken, TaskQueue& mainTaskQueue, moodycamel::ConcurrentQueue<std::string>& workQueue);

#ifdef GAM_CHAKRA_ENABLE
extern void attachWorkers(ChakraJavascriptEngine& engine, moodycamel::ConcurrentQueue<std::string>& workQueue);
extern std::vector<std::unique_ptr<JavascriptWorker>> spawnWorkers(ChakraJavascriptEngine& engine, std::atomic<bool>& cancellationToken, TaskQueue& mainTaskQueue, moodycamel::ConcurrentQueue<std::string>& workQueue);
#endif//GAM_CHAKRA_ENABLE

#endif//DUKSFML_WORKERENGINE_HPP
