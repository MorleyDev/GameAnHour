#include "DukJavascriptEngine.hpp"

#include <fstream>
#include <iostream>
#include <algorithm>

#ifdef _MSC_VER
#include <filesystem>
#endif//_MSC_VER

std::vector<std::function<duk_ret_t(duk_context*)>> DukJavascriptEngine::globalFunctions;

duk_ret_t globalNativeFunction(duk_context *ctx) {
	auto magic = duk_get_current_magic(ctx);

	return DukJavascriptEngine::globalFunctions[magic](ctx);
}

DukJavascriptEngine::DukJavascriptEngine(Profiler &profiler, std::function<void(DukJavascriptEngine& engine)> extend)
	: extend(extend),
	context(duk_create_heap_default()),
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
	extend(*this);
	add("hotreload", "ENGINE_Reloading = function () { }; ENGINE_Reloaded = function () { };");
	setGlobalFunction("ENGINE_Stash", [this](DukJavascriptEngine* ctx) { stashedState = ctx->getargstr(0); return false; }, 0);
}

DukJavascriptEngine::~DukJavascriptEngine() {
	if (context) {
		duk_destroy_heap(context);
	}
}

DukJavascriptEngine::DukJavascriptEngine(DukJavascriptEngine&& other)
	: argCountStack(std::move(other.argCountStack)),
	context(std::exchange(other.context, nullptr)),
	profiler(std::exchange(other.profiler, nullptr)) {
}

DukJavascriptEngine& DukJavascriptEngine::operator=(DukJavascriptEngine&& other) {
	if (context) {
		duk_destroy_heap(context);
	}

	argCountStack = std::move(other.argCountStack);
	context = std::exchange(other.context, nullptr);
	profiler = std::exchange(other.profiler, nullptr);
	return *this;
}

void DukJavascriptEngine::restart() {
	if (context) {
		duk_destroy_heap(context);
	}
	context = duk_create_heap_default();
	extend(*this);
	add("hotreload", "ENGINE_Reloading = function () { }; ENGINE_Reloaded = function () { };");
	setGlobalFunction("ENGINE_Stash", [this](DukJavascriptEngine* ctx) { stashedState = ctx->getargstr(0); return false; }, 0);
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
#ifdef _MSC_VER
	files[filepath] = std::experimental::filesystem::last_write_time(std::experimental::filesystem::path(filepath));
#endif//_MSC_VER
}

void DukJavascriptEngine::checkFileSystem() {
#ifdef _MSC_VER
	auto needReload = false;
	std::for_each(files.begin(), files.end(), [this, &needReload](auto& file) {
		auto newFileTime = std::experimental::filesystem::last_write_time(std::experimental::filesystem::path(file.first));
		if (file.second != newFileTime) {
			std::cout << profiler->getName() << " Detected file " << file.first << " has been updated. Reloading..." << std::endl;
			needReload = true;
		}
	});
	if (!needReload) {
		return;
	}

	trigger("ENGINE_Reloading");
	restart();
	std::for_each(files.begin(), files.end(), [this](auto& file) { load(file.first); });
	trigger("ENGINE_Reloaded", std::exchange(stashedState, std::string("")));
#endif//_MSC_VER
}

void DukJavascriptEngine::setGlobalFunction(const char* name, std::function<bool(DukJavascriptEngine*)> function, int nargs) {
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
