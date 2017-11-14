#include "ChakraJavascriptEngine.hpp"
#include "TimerExtensions.hpp"
#include <algorithm>

unsigned int nextId = 0;

void CALLBACK PromiseContinuationCallback(JsValueRef task, void *callbackState) {
	auto* engine = static_cast<ChakraJavascriptEngine*>(callbackState);

	JsValueRef global;
	JsGetGlobalObject(&global);
	engine->taskQueue.emplace_back(nextId++, task, 1, &global, 0.0, false);
}

void attachTimers(ChakraJavascriptEngine& engine) {
	engine.setGlobalFunction("setTimeout", [](ChakraJavascriptEngine* engine) {
		const auto timerId = nextId++;
		const auto chakraArgs = engine->getArguments();
		const auto self = chakraArgs[0];
		const auto func = chakraArgs[1];
		const auto ms = engine->getargf(1); /*chakraArgs[2]*/
		const auto remainingArgs = &chakraArgs[2]; // 2 not 3 so we can take the ms from [2] as this
		engine->taskQueue.emplace_back(timerId, func, static_cast<unsigned short>(engine->getArgumentCount() - 3 + 1), remainingArgs, ms, false);
		engine->push(timerId);
		return true;
	}, 0);
	engine.setGlobalFunction("clearTimeout", [](ChakraJavascriptEngine* engine) {
		const auto targetId = engine->getargn(0);
		const auto item = std::find_if(engine->taskQueue.begin(), engine->taskQueue.end(), [targetId](ChakraTask& task) {
			return !task.repeating && targetId == task.id;
		});
		if (item != engine->taskQueue.end()) {
			engine->taskQueue.erase(item);
		} else {
			engine->cancelledTasks.push_back(targetId);
		}
		return false;
	}, 0);

	engine.setGlobalFunction("setInterval", [](ChakraJavascriptEngine* engine) {
		const auto timerId = nextId++;
		const auto chakraArgs = engine->getArguments();
		const auto self = chakraArgs[0];
		const auto func = chakraArgs[1];
		const auto ms = engine->getargf(1); /*chakraArgs[2]*/
		const auto remainingArgs = &chakraArgs[2]; // 2 not 3 so we can take the ms from [2] as this

		engine->taskQueue.emplace_back(timerId, func, static_cast<unsigned short>(engine->getArgumentCount() - 3 + 1), remainingArgs, ms, true);
		engine->push(timerId);
		return true;
	}, 0);
	engine.setGlobalFunction("clearInterval", [](ChakraJavascriptEngine* engine) {
		const auto targetId = engine->getargn(0);
		const auto item = std::find_if(engine->taskQueue.begin(), engine->taskQueue.end(), [targetId](ChakraTask& task) {
			return task.repeating && targetId == task.id;
		});
		if (item != engine->taskQueue.end()) {
			engine->taskQueue.erase(item);
		} else {
			engine->cancelledTasks.push_back(targetId);
		}
		return false;
	}, 0);

	engine.setGlobalFunction("requestAnimationFrame", [](ChakraJavascriptEngine* engine) {
		const auto timerId = nextId++;
		const auto chakraArgs = engine->getArguments();
		const auto self = chakraArgs[0];
		const auto func = chakraArgs[1];
		const auto remainingArgs = &chakraArgs[1]; // 1 not 2 so we can take the func as this

		engine->nextAnimationFrame.emplace_back(timerId, func, static_cast<unsigned short>(engine->getArgumentCount() - 2 + 1), remainingArgs, 0, false);
		engine->push(timerId);
		return true;
	}, 0);
	engine.setGlobalFunction("cancelAnimationFrame", [](ChakraJavascriptEngine* engine) {
		const auto targetId = engine->getargn(0);
		const auto item = std::find_if(engine->nextAnimationFrame.begin(), engine->nextAnimationFrame.end(), [targetId](ChakraTask& task) {
			return targetId == task.id;
		});
		if (item != engine->nextAnimationFrame.end()) {
			engine->nextAnimationFrame.erase(item);
		} else {
			engine->cancelledTasks.push_back(targetId);
		}
		return false;
	}, 0);

	JsSetPromiseContinuationCallback(PromiseContinuationCallback, &engine);
}

void tick(ChakraJavascriptEngine& engine, double ms) {
	JsValueRef result;

	auto isCancelled = [&engine](std::size_t taskId) {
		return std::find(engine.cancelledTasks.begin(), engine.cancelledTasks.end(), taskId) != engine.cancelledTasks.end();
	};
	std::vector<ChakraTask> next;
	next.reserve(engine.taskQueue.size());
	next.swap(engine.taskQueue);
	for (auto& task : next) {
		if (isCancelled(task.id)) {
			continue;
		}

		task.timeUntil -= ms;
		if (task.timeUntil <= 0) {
			const auto resultCode = task.invoke(&result);
			if (resultCode != JsNoError) {
				if (resultCode == JsErrorScriptException) {
					ChakraJavascriptEngine::GetAndThrowError("tick");
				}
				throw std::runtime_error("tick: Error invoking " + std::string(task.repeating ? "interval" : "timeout") + ", " + ChakraJavascriptEngine::GetJsErrorAsString(resultCode));
			}
			// Reschedule if repeating
			if (task.repeating) {
				if (isCancelled(task.id)) {
					continue;
				}
				task.timeUntil = task.delay;
				engine.taskQueue.push_back(std::move(task));
			}
		} else { // Not yet time
			engine.taskQueue.push_back(std::move(task));
		}
	}
	engine.cancelledTasks.clear();
}

void animate(ChakraJavascriptEngine& engine) {
	JsValueRef result;

	std::vector<ChakraTask> next;
	next.reserve(engine.nextAnimationFrame.size());
	next.swap(engine.nextAnimationFrame);
	for (auto& task : next) {
		if (std::find(engine.cancelledTasks.begin(), engine.cancelledTasks.end(), task.id) != engine.cancelledTasks.end()) {
			continue;
		}

		const auto resultCode = task.invoke(&result);
		if (resultCode != JsNoError) {
			if (resultCode == JsErrorScriptException) {
				ChakraJavascriptEngine::GetAndThrowError("tick");
			}
			throw std::runtime_error("animate: Error invoking function, " + ChakraJavascriptEngine::GetJsErrorAsString(resultCode));
		}
	}
	engine.cancelledTasks.clear();
}
