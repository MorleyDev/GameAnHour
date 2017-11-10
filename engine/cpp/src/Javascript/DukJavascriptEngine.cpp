#include "DukJavascriptEngine.hpp"

#include <fstream>

std::vector<std::function<duk_ret_t(duk_context*)>> DukJavascriptEngine::globalFunctions;

duk_ret_t globalNativeFunction(duk_context *ctx) {
	auto magic = duk_get_current_magic(ctx);

	return DukJavascriptEngine::globalFunctions[magic](ctx);
}

DukJavascriptEngine::DukJavascriptEngine(Profiler &profiler)
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

DukJavascriptEngine::~DukJavascriptEngine() {
	duk_destroy_heap(context);
}

void DukJavascriptEngine::add(std::string name, std::string script)
{
	const auto wrapped = std::string("function () {\n") + script + "\n}";
	push(name);
	duk_compile_lstring_filename(context, DUK_COMPILE_FUNCTION, wrapped.c_str(), wrapped.length());
	if (duk_pcall(context, 0) != 0) {
		auto err = std::string(name) + ":" + duk_safe_to_string(context, -1);
		throw std::runtime_error(err);
	}
	pop();
}

void DukJavascriptEngine::load(std::string filepath) {
	std::ifstream engineCode(filepath);
	if (!engineCode.is_open()) {
		throw std::runtime_error(std::string("File not found: ") + filepath);
	}

	std::string script((std::istreambuf_iterator<char>(engineCode)), std::istreambuf_iterator<char>());
	add(filepath, script);
}

void DukJavascriptEngine::setGlobalFunction(const char* name, std::function<bool(JavascriptEngine*)> function, int nargs) {
	globalFunctions.push_back([this, name, function, nargs](duk_context* ctx) {
		argCountStack.push_back(nargs);
		const auto _ = profiler->profile(name);
		const auto result = function(this) ? 1 : 0;
		argCountStack.pop_back();
		return result;
	});
	const auto index = globalFunctions.size() - 1;

	duk_push_global_object(context);
	duk_push_c_function(context, globalNativeFunction, nargs);
	duk_set_magic(context, -1, static_cast<duk_idx_t>(index));
	duk_put_prop_string(context, -2, name);
	duk_pop(context);
}

void DukJavascriptEngine::getPropString(int index, std::string name) {
	duk_get_prop_string(context, index, name.c_str());
}

void DukJavascriptEngine::call(std::size_t nargs) {
	if (duk_pcall(context, static_cast<duk_idx_t>(nargs)) != 0) {
		const auto result = std::string(duk_safe_to_string(context, -1));
		pop();
		throw std::runtime_error(result);
	}
}

void DukJavascriptEngine::pushGlobal() {
	duk_push_global_object(context);
}

void DukJavascriptEngine::pushObject() {
	duk_push_bare_object(context);
}

void DukJavascriptEngine::pushUndefined() {
	duk_push_undefined(context);
}

void DukJavascriptEngine::push() {}

void DukJavascriptEngine::push(const char *value) {
	duk_push_string(context, value);
}

void DukJavascriptEngine::push(std::string value) {
	duk_push_string(context, value.c_str());
}

void DukJavascriptEngine::push(double value) {
	duk_push_number(context, value);
}

void DukJavascriptEngine::push(int value) {
	duk_push_number(context, value);
}
void DukJavascriptEngine::push(unsigned int value) {
	duk_push_number(context, value);
}

void DukJavascriptEngine::push(bool value) {
	duk_push_boolean(context, value ? 1 : 0);
}

void DukJavascriptEngine::pop() {
	duk_pop(context);
}

double DukJavascriptEngine::getargf(int index) {
	return duk_get_number(context, index - argCountStack.back());
}

bool DukJavascriptEngine::getargb(int index) {
	return duk_get_boolean(context, index - argCountStack.back()) != 0;
}

int DukJavascriptEngine::getargn(int index) {
	return duk_get_int(context, index - argCountStack.back());
}

std::string DukJavascriptEngine::getargstr(int index) {
	return duk_get_string(context, index - argCountStack.back());
}

void DukJavascriptEngine::putProp(int index, const char *name) {
	duk_put_prop_string(context, index, name);
}
