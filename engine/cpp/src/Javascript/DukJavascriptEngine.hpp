#ifndef DUKSFML_DUKJAVASCRIPTENGINE_HPP
#define DUKSFML_DUKJAVASCRIPTENGINE_HPP

#define DUK_USE_LIGHTFUNC_BUILTINS
#include <duktape.h>
#include <functional>
#include <vector>
#include <string>

#include "../Profile/Profiler.hpp"
#include "JavascriptEngine.hpp"

class DukJavascriptEngine : public JavascriptEngine
{
public:
	static std::vector<std::function<duk_ret_t(duk_context*)>> globalFunctions;

private:
	std::vector<std::size_t> argCountStack;
	duk_context *context;
	Profiler* profiler;

protected:
	virtual void getPropString(int index, std::string name);
	virtual void call(std::size_t nargs);

public:
	explicit DukJavascriptEngine(Profiler& profiler);
	~DukJavascriptEngine();

	virtual void pushGlobal();
	virtual void pushObject();
	virtual void pushUndefined();
	virtual void push();
	virtual void push(const char *value);
	virtual void push(std::string value);
	virtual void push(double value);
	virtual void push(int value);
	virtual void push(unsigned int value);
	virtual void push(bool value);
	virtual void pop();

	virtual void putProp(int index, const char *name);

	virtual double getargf(int index);
	virtual bool getargb(int index);
	virtual int getargn(int index);
	virtual std::string getargstr(int index);

	virtual void add(std::string name, std::string script);
	virtual void load(std::string filepath);
	virtual void setGlobalFunction(const char* name, std::function<bool(JavascriptEngine*)> function, int nargs);
};

#endif // DUKSFML_DUKJAVASCRIPTENGINE_HPP
