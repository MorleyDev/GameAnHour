#include "JavascriptEngine.hpp"

#include <fstream>

std::vector<std::function<duk_ret_t (duk_context*)>> JavascriptEngine::globalFunctions;

duk_ret_t globalNativeFunction(duk_context *ctx) {
    auto magic = duk_get_current_magic(ctx);

    return JavascriptEngine::globalFunctions[magic](ctx);
}

JavascriptEngine::JavascriptEngine(Profiler &profiler)
        : context(duk_create_heap_default()),
          profiler(&profiler) {
    add(
            "global",
            "if (typeof global === 'undefined') {"
            "    (function () {"
            "        var global = new Function('return this;')();"
            "        Object.defineProperty(global, 'global', {"
            "            value: global,"
            "            writable: true,"
            "            enumerable: false,"
            "            configurable: true"
            "        });"
            "    })();"
            "}"
    );
    add(
        "console",
        "console = {"
        "    log: function () { },"
        "    info: function () { },"
        "    warn: function () { },"
        "    error: function () { },"
        "}"
    );
}

JavascriptEngine::~JavascriptEngine() {
    duk_destroy_heap(context);
}

void JavascriptEngine::add(std::string name, std::string script)
{
    std::string wrapped = std::string("function () {\n") + script + "\n}";
    push(name);
    duk_compile_lstring_filename(context, DUK_COMPILE_FUNCTION, wrapped.c_str(), wrapped.length());
    if (duk_pcall(context, 0) != 0) {
        auto err = std::string(name) + ":" + duk_safe_to_string(context, -1);
        throw std::runtime_error(err);
    }
    pop();
}

void JavascriptEngine::load(std::string filepath) {
    std::ifstream engineCode(filepath);
    if (!engineCode.is_open()) {
        throw std::runtime_error(std::string("File not found: ") + filepath);
    }

    auto script = std::string((std::istreambuf_iterator<char>(engineCode)), std::istreambuf_iterator<char>());
    add(filepath, script);
}

void JavascriptEngine::setGlobalFunction(const char* name, std::function<bool (JavascriptEngine*)> function, int nargs) {
    globalFunctions.push_back([this, name, function](duk_context* ctx) {
        auto _ = profiler->profile(name);
        return function(this) ? 1 : 0;
    });
    auto index = globalFunctions.size() - 1;

    duk_push_global_object(context);
    duk_push_c_function(context, globalNativeFunction, nargs);
    duk_set_magic(context, -1, static_cast<duk_idx_t>(index));
    duk_put_prop_string(context, -2, name);
    duk_pop(context);
}

void JavascriptEngine::getPropString(int index, std::string name) {
    duk_get_prop_string(context, index, name.c_str());
}

void JavascriptEngine::call(std::size_t nargs) {
    if (duk_pcall(context, static_cast<duk_idx_t>(nargs)) != 0) {
        auto result = std::string(duk_safe_to_string(context, -1));
        pop();
        throw std::runtime_error(result);
    }
}

void JavascriptEngine::pushGlobal() {
    duk_push_global_object(context);
}

void JavascriptEngine::pushObject() {
    duk_push_bare_object(context);
}

void JavascriptEngine::pushUndefined() {
    duk_push_undefined(context);
}

void JavascriptEngine::push() {}

void JavascriptEngine::push(const char *value) {
    duk_push_string(context, value);
}

void JavascriptEngine::push(std::string value) {
    duk_push_string(context, value.c_str());
}

void JavascriptEngine::push(double value) {
    duk_push_number(context, value);
}

void JavascriptEngine::push(int value) {
    duk_push_number(context, value);
}
void JavascriptEngine::push(unsigned int value) {
    duk_push_number(context, value);
}

void JavascriptEngine::push(bool value) {
    duk_push_boolean(context, value ? 1 : 0);
}

void JavascriptEngine::pop() {
    duk_pop(context);
}

double JavascriptEngine::getFloat(int index) {
    return duk_get_number(context, index);
}

bool JavascriptEngine::getBoolean(int index) {
    return duk_get_boolean(context, index) != 0;
}

int JavascriptEngine::getInt(int index) {
    return duk_get_int(context, index);
}

std::string JavascriptEngine::getString(int index) {
    return duk_get_string(context, index);
}

void JavascriptEngine::putProp(int index, const char *name) {
    duk_put_prop_string(context, index, name);
}
