#ifndef DUKSFML_DUKJAVASCRIPTENGINE_HPP
#define DUKSFML_DUKJAVASCRIPTENGINE_HPP

#define DUK_USE_LIGHTFUNC_BUILTINS
#include <duktape.h>
#include <functional>
#include <vector>
#include <string>

#include "../Profile/Profiler.hpp"

class DukJavascriptEngine
{
public:
	static std::vector<std::function<duk_ret_t (duk_context*)>> globalFunctions;

private:
	std::vector<duk_int_t> argCountStack;
	duk_context *context;
	Profiler* profiler;

	void getPropString(int index, std::string name) {
		duk_get_prop_string(context, index, name.c_str());
	}

	void call(std::size_t nargs) {
		if (duk_pcall(context, static_cast<duk_idx_t>(nargs)) != 0) {
			const auto result = std::string(duk_safe_to_string(context, -1));
			pop();
			throw std::runtime_error(result);
		}
	}

public:
	explicit DukJavascriptEngine(Profiler& profiler);
	~DukJavascriptEngine();

	DukJavascriptEngine(const DukJavascriptEngine&) = delete;
	DukJavascriptEngine& operator=(const DukJavascriptEngine&) = delete;

	DukJavascriptEngine(DukJavascriptEngine&& other);
	DukJavascriptEngine& operator=(DukJavascriptEngine&& other);

	void pushGlobal() { duk_push_global_object(context); }
	void pushObject() { duk_push_bare_object(context); }
	void pushUndefined() { duk_push_undefined(context); }
	void push() { }

	void push(std::vector<uint8_t> blob) {
		push(blob.data(), blob.size());
	}
	void push(std::uint8_t* blob, std::size_t length) {
		auto* bufferPtr = duk_push_fixed_buffer(context, length);
		std::memcpy(bufferPtr, blob, length);
	}

	void push(const char *value) { duk_push_string(context, value); }
	void push(std::string value) { duk_push_string(context, value.c_str()); }
	void push(double value) { duk_push_number(context, value); }
	void push(int value) { duk_push_number(context, value); }
	void push(unsigned int value) { duk_push_number(context, value); }
	void push(bool value) { duk_push_boolean(context, value ? 1 : 0); }
	void pop() { duk_pop(context); }

	void putProp(int index, const char *name) { duk_put_prop_string(context, index, name); }

	double getargf(int index) { return duk_get_number(context, index - argCountStack.back()); }
	bool getargb(int index) { return duk_get_boolean(context, index - argCountStack.back()) != 0; }
	int getargn(int index) { return duk_get_int(context, index - argCountStack.back()); }
	std::string getargstr(int index) { return duk_get_string(context, index - argCountStack.back()); }

	void add(std::string name, std::string script);
	void load(std::string filepath);
	void setGlobalFunction(const char* name, std::function<bool(DukJavascriptEngine*)> function, int nargs);

	void idle() {  }

	template <typename T, typename U, typename... NARGS> void push(T value, U next, NARGS... rest) {
		push(value);
		push(next, rest...);
	}
	template <typename... ARGS>
	void trigger(std::string globalFunctionName, ARGS... args)
	{
		pushGlobal();
		getPropString(-1, globalFunctionName);
		push(args...);
		call(sizeof...(ARGS));
		pop();
		pop();
	}
};

#endif // DUKSFML_DUKJAVASCRIPTENGINE_HPP
