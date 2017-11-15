#ifndef DUKSFML_TASKQUEUE_HPP
#define DUKSFML_TASKQUEUE_HPP

#include <thread>
#include <mutex>
#include <optional>
#include <concurrentqueue.h>
#include <atomic>
#include <iostream>

class TaskQueue {
private:
	moodycamel::ConcurrentQueue<std::function<void ()>> tasks;

public:
	TaskQueue() : tasks() { }
	~TaskQueue() { }

	void push(std::function<void ()> task) {
		tasks.enqueue(task);
	}

	std::size_t consume(std::size_t limit) {
		std::function<void()> task;
		std::size_t i = 0;
		for (; i < limit; ++i) {
			if (!tasks.try_dequeue(task)) {
				break;
			}
			task();
		}
		return i;
	}
};

inline std::thread spawnTaskProcessor(TaskQueue& taskQueue, std::atomic<bool>& cancellationToken) {
	return std::thread([&taskQueue, &cancellationToken]() {
		try {
			while (!cancellationToken) {
				taskQueue.consume(100);
				std::this_thread::sleep_for(std::chrono::milliseconds(10));
			}
		}
		catch (const std::exception &err)
		{
			std::cerr << "UNHANDLED EXCEPTION IN TASK PROCESSOR: " << err.what() << std::endl;
		}
	});
}

inline std::vector<std::thread> spawnTaskProcessorPool(TaskQueue& taskQueue, std::atomic<bool>& cancellationToken) {
	auto numberOfThreads = std::thread::hardware_concurrency() - 1;
	if (numberOfThreads < 1) {
		numberOfThreads = 1;
	}
	std::vector<std::thread> threads;
	threads.reserve(numberOfThreads);
	for (auto i = 0u; i < numberOfThreads; ++i) {
		threads.push_back(spawnTaskProcessor(taskQueue, cancellationToken));
	}
	return threads;
}

#endif//DUKSFML_TASKQUEUE_HPP
