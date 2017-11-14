#ifndef DUKSFML_TASKQUEUE_HPP
#define DUKSFML_TASKQUEUE_HPP

#include <thread>
#include <mutex>
#include <optional>
#include <queue>
#include <atomic>

class TaskQueue {
private:
	std::mutex mutex;
	std::queue<std::function<void ()>> tasks;
	std::atomic<std::size_t> counter;

	std::optional<std::function<void()>> _pull() {
		std::lock_guard<std::mutex> lock(mutex);
		if (tasks.empty()) {
			return {};
		}
		--counter;
		std::function<void()> result( std::move( tasks.front() ) );
		tasks.pop();
		return std::move(result);
	}

	void _push(std::function<void()> task) {
		std::lock_guard<std::mutex> lock(mutex);
		tasks.push(std::move(task));
	}

public:
	TaskQueue() : mutex(), tasks(), counter(0) { }
	~TaskQueue() { }

	std::optional<std::function<void ()>> pull() {
		if (counter.load() == 0) {
			return {};
		}
		return std::move(_pull());
	}

	void push(std::function<void ()> task) {
		_push(std::move(task));
		++counter;
	}

	std::size_t consume(std::size_t limit) {
		std::size_t i = 0;
		for (; i < limit; ++i) {
			auto task = pull();
			if (!task) {
				break;
			}
			(*task)();
		}
		return i;
	}

	std::vector<std::thread> spawnCores(std::atomic<bool>& cancellationToken) {
		auto numberOfThreads = std::thread::hardware_concurrency() - 1;
		if (numberOfThreads < 1) {
			numberOfThreads = 1;
		}
		std::vector<std::thread> threads;
		threads.reserve(numberOfThreads);
		for (auto i = 0u; i < numberOfThreads; ++i) {
			threads.push_back(spawn(cancellationToken));
		}
		return threads;
	}

	std::thread spawn(std::atomic<bool>& cancellationToken) {
		return std::thread([this, &cancellationToken]() {
			while (!cancellationToken) {
				consume(100);
				std::this_thread::sleep_for(std::chrono::milliseconds(10));
			}
		});
	}
};

#endif//DUKSFML_TASKQUEUE_HPP
