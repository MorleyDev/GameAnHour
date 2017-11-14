#ifndef DUKSFML_CHAKRAJAVASCRIPTENGINE_HPP
#define DUKSFML_CHAKRAJAVASCRIPTENGINE_HPP

#include <stdint.h>
#include <ChakraCore.h>

#include <string>
#include <functional>

#include "ChakraTask.hpp"
#include "../Profile/Profiler.hpp"

class ChakraJavascriptEngine
{
public:
	static std::vector<std::function<JsValueRef(JsValueRef, bool, JsValueRef*, unsigned short)>> globalFunctions;
	static void GetAndThrowError(std::string name);
	static std::string GetJsErrorAsString(JsErrorCode code);

	std::vector<ChakraTask> taskQueue;
	std::vector<ChakraTask> nextAnimationFrame;
	std::vector<std::size_t> cancelledTasks;

private:
	JsRuntimeHandle runtime;
	JsContextRef context;
	std::vector<std::pair<JsValueRef*, std::size_t>> arguments;
	std::vector<JsValueRef> stack;
	std::size_t currentSourceContext;

	Profiler& profiler;

	void getPropString(int index, std::string name) {
		std::string sname(name);
		std::wstring wname(sname.begin(), sname.end());

		JsPropertyIdRef propertyId;
		JsGetPropertyIdFromName(wname.c_str(), &propertyId);

		JsValueRef value;
		JsGetProperty(stack[stack.size() + index], propertyId, &value);
		stack.push_back(value);

		JsAddRef(value, nullptr);
	}

	void call(unsigned short nargs) {
		JsValueRef result;
		JsValueRef undefined;
		JsGetUndefinedValue(&undefined);
		JsValueRef* args = new JsValueRef[nargs+1];
		args[0] = undefined;
		for (auto i = 0; i < nargs; ++i) { args[i+1] = stack[stack.size() - nargs + i]; }
		auto func = stack[stack.size() - nargs - 1];
		if (JsCallFunction(func, args, nargs + 1, &result) != JsNoError) {
			ChakraJavascriptEngine::GetAndThrowError("call");
		}
		pop();
		for (auto i = 0; i < nargs; ++i) { pop(); }
		delete[] args;

		stack.push_back(result);
		JsAddRef(result, nullptr);
	}

public:
	explicit ChakraJavascriptEngine(Profiler& profiler);
	~ChakraJavascriptEngine();

	void pushGlobal() {
		JsValueRef v;
		JsGetGlobalObject(&v);
		stack.push_back(v);
		JsAddRef(v, nullptr);
	}

	void pushObject() {
		JsValueRef v;
		JsCreateObject(&v);
		JsAddRef(v, nullptr);
		stack.push_back(v);
	}

	void pushUndefined() {
		stack.push_back(nullptr);
	}

	void push() {
	}

	void push(const char *value) {
		JsValueRef v;
		JsCreateString(value, std::strlen(value), &v);
		JsAddRef(v, nullptr);
		stack.push_back(v);
	}

	void push(std::string value) {
		JsValueRef v;
		JsCreateString(value.c_str(), value.size(), &v);
		JsAddRef(v, nullptr);
		stack.push_back(v);
	}

	void push(double value) {
		JsValueRef v;
		JsDoubleToNumber(value, &v);
		JsAddRef(v, nullptr);
		stack.push_back(v);
	}

	void push(int value) {
		JsValueRef v;
		JsIntToNumber(value, &v);
		JsAddRef(v, nullptr);
		stack.push_back(v);
	}
	void push(unsigned int value) {
		JsValueRef v;
		JsIntToNumber(value, &v);
		JsAddRef(v, nullptr);
		stack.push_back(v);
	}
	void push(bool value) {
		JsValueRef v;
		JsBoolToBoolean(value, &v);
		JsAddRef(v, nullptr);
		stack.push_back(v);
	}
	void pop() {
		auto v = stack.back();
		if (v != nullptr) {
			JsRelease(v, nullptr);
		}
		stack.pop_back();
	}

	void putProp(int index, const char *name) {
		std::string sname(name);
		std::wstring wname(sname.begin(), sname.end());

		auto item = stack.back();
		auto destination = stack[stack.size() + index];
		stack.pop_back();

		JsPropertyIdRef ref;
		JsGetPropertyIdFromName(wname.c_str(), &ref);
		JsSetProperty(destination, ref, item, true);
	}

	double getargf(int index) {
		double out;
		JsNumberToDouble( arguments.back().first[index + 1], &out );
		return out;
	}

	bool getargb(int index) {
		bool out;
		JsBooleanToBool(arguments.back().first[index + 1], &out);
		return out;
	}

	int getargn(int index) {
		int out;
		JsNumberToInt(arguments.back().first[index + 1], &out);
		return out;
	}
	std::string getargstr(int index) {
		const wchar_t* out;
		std::size_t outSize;
		JsStringToPointer(arguments.back().first[index + 1], &out, &outSize);
		std::wstring wstr(out, outSize);
		return std::string(wstr.begin(), wstr.end());
	}

	JsValueRef* getArguments() {
		return arguments.back().first;
	}
	std::size_t getArgumentCount() {
		return arguments.back().second;
	}

	void add(std::string name, std::string script);
	void load(std::string filepath);
	void setGlobalFunction(const char* name, std::function<bool(ChakraJavascriptEngine*)> function, int nargs);

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

	void idle() {
		JsIdle(nullptr);
	}
};


#endif//DUKSFML_CHAKRAJAVASCRIPTENGINE_HPP
