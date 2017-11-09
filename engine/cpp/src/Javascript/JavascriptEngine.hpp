#ifndef DUKSFML_JAVASCRIPTENGINE_HPP
#define DUKSFML_JAVASCRIPTENGINE_HPP

#define DUK_USE_LIGHTFUNC_BUILTINS
#include <duktape.h>
#include <memory>
#include <functional>
#include <vector>
#include <string>


#include "../Profile/Profiler.hpp"

class JavascriptEngine
{
public:
	static std::vector<std::function<duk_ret_t(duk_context*)>> globalFunctions;

private:
	duk_context *context;
	Profiler* profiler;

	void getPropString(int index, std::string name);
	void call(std::size_t nargs);

public:
	explicit JavascriptEngine(Profiler& profiler);
	~JavascriptEngine();

	void pushGlobal();
	void pushObject();
	void pushUndefined();
	void push();
	void push(const char *value);
	void push(std::string value);
	void push(double value);
	void push(int value);
	void push(unsigned int value);
	void push(bool value);

	void putProp(int index, const char *name);

	double getFloat(int index);
	bool getBoolean(int index);
	int getInt(int index);
	std::string getString(int index);

	void pop();

	template <typename T, typename U, typename... NARGS> void push(T value, U next, NARGS... rest) {
		push(value);
		push(next, rest...);
	}

	void add(std::string name, std::string script);
	void load(std::string filepath);
	void setGlobalFunction(const char* name, std::function<bool(JavascriptEngine*)> function, int nargs = 0);

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

	template <typename... ARGS>
	void invoke(std::function<void(duk_context*)> callback, std::string globalFunctionName, ARGS... args)
	{
		pushGlobal();
		getPropString(-1, globalFunctionName);
		push(args...);
		call(sizeof...(ARGS));
		callback(context);
		pop();
		pop();
	}
};

#endif // DUKSFML_JAVASCRIPTENGINE_HPP
