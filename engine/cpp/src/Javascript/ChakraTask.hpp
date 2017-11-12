#ifndef DUKSFML_CHAKRATASK_HPP
#define DUKSFML_CHAKRATASK_HPP

#include <cstdint>
#include <cstddef>
#include <utility>
#include <ChakraCore.h>

struct ChakraTask {
	std::size_t id;
	JsValueRef func;
	unsigned short numberOfArgs;
	JsValueRef* args;
	double delay;
	double timeUntil;
	bool repeating;
	ChakraTask(std::size_t id, JsValueRef func, unsigned short numberOfArgs, JsValueRef* args, double delay, bool repeating)
		: id(id),
		func(func),
		numberOfArgs(numberOfArgs),
		args(nullptr),
		delay(delay),
		timeUntil(delay),
		repeating(repeating) {
		JsAddRef(func, nullptr);
		if (numberOfArgs > 0) {
			this->args = new JsValueRef[numberOfArgs];
			for (auto i = 0; i < numberOfArgs; ++i) {
				this->args[i] = args[i];
				JsAddRef(this->args[i], nullptr);
			}
		}
	}

	ChakraTask(ChakraTask&& other)
		: id(std::exchange(other.id, 0)),
		func(std::exchange(other.func, JS_INVALID_REFERENCE)),
		numberOfArgs(std::exchange(other.numberOfArgs, 0)),
		args(std::exchange(other.args, nullptr)),
		delay(other.delay),
		timeUntil(other.timeUntil),
		repeating(other.repeating) {
	}
	ChakraTask& operator=(ChakraTask&& other) {
		if (args != nullptr) {
			for (auto i = 0; i < numberOfArgs; ++i) JsRelease(this->args[i], nullptr);
			delete[] args;
			args = nullptr;
		}
		id = std::exchange(other.id, 0);
		func = std::exchange(other.func, JS_INVALID_REFERENCE);
		numberOfArgs = std::exchange(other.numberOfArgs, 0);
		args = std::exchange(other.args, args);
		delay = other.delay;
		timeUntil = other.timeUntil;
		repeating = other.repeating;
		return *this;
	}

	ChakraTask(const ChakraTask& other) = delete;
	ChakraTask& operator=(const ChakraTask& other) = delete;

	~ChakraTask() {
		JsRelease(func, nullptr);
		if (args != nullptr) {
			for (auto i = 0; i < numberOfArgs; ++i) JsRelease(this->args[i], nullptr);
			delete[] args;
			args = nullptr;
		}
	}

	JsErrorCode invoke(JsValueRef* result) {
		return JsCallFunction(func, args, numberOfArgs, result);
	}
};


#endif // DUKSFML_CHAKRATASK_HPP
