#ifndef DUKSFML_JAVASCRIPTENGINE_HPP
#define DUKSFML_JAVASCRIPTENGINE_HPP

#include <string>
#include <functional>

class JavascriptEngine
{
protected:
	virtual void getPropString(int index, std::string name) = 0;
	virtual void call(std::size_t nargs) = 0;

public:
	virtual ~JavascriptEngine();

	virtual void pushGlobal() = 0;
	virtual void pushObject() = 0;
	virtual void pushUndefined() = 0;
	virtual void push() = 0;
	virtual void push(const char *value) = 0;
	virtual void push(std::string value) = 0;
	virtual void push(double value) = 0;
	virtual void push(int value) = 0;
	virtual void push(unsigned int value) = 0;
	virtual void push(bool value) = 0;
	virtual void pop() = 0;

	virtual void putProp(int index, const char *name) = 0;

	virtual double getargf(int index) = 0;
	virtual bool getargb(int index) = 0;
	virtual int getargn(int index) = 0;
	virtual std::string getargstr(int index) = 0;

	template <typename T, typename U, typename... NARGS> void push(T value, U next, NARGS... rest) {
		push(value);
		push(next, rest...);
	}

	virtual void add(std::string name, std::string script) = 0;
	virtual void load(std::string filepath) = 0;
	virtual void setGlobalFunction(const char* name, std::function<bool(JavascriptEngine*)> function, int nargs = 0) = 0;

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
	void invoke(std::function<void(JavascriptEngine*)> callback, std::string globalFunctionName, ARGS... args)
	{
		pushGlobal();
		getPropString(-1, globalFunctionName);
		push(args...);
		call(sizeof...(ARGS));
		callback(this);
		pop();
		pop();
	}
};

#endif // DUKSFML_JAVASCRIPTENGINE_HPP
