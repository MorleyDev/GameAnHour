#ifndef DUKSFML_JAVASCRIPTENGINE_HPP
#define DUKSFML_JAVASCRIPTENGINE_HPP

#include <functional>
#include <vector>

#define DUK_USE_LIGHTFUNC_BUILTINS

#include "../../duktape.h"

class JavascriptEngine
{
public:
    static std::vector<std::function<duk_ret_t (duk_context*)>> globalFunctions;

  private:
    duk_context *context;

    void pushGlobal();
    void push();
    void push(const char *value);
    void push(std::string value);
    void push(double value);
    void push(int value);
    void push(unsigned int value);
    void push(bool value);
    void pop();

    template <typename T, typename U, typename... NARGS> push(T value, U next, NARGS... rest) { push(value); push(next, rest...); }

    void getPropString(int index, std::string name);
    void call(std::size_t nargs);

  public:
    JavascriptEngine();
    ~JavascriptEngine();

    void add(std::string name, std::string script);
    void load(std::string filepath);
    void setGlobalFunction(std::string name, std::function<duk_ret_t (duk_context*)> function, int nargs = 0);

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
    void invoke(std::function<void (duk_context*)> callback, std::string globalFunctionName, ARGS... args)
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
