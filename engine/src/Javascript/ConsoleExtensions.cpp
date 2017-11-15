#include "ConsoleExtensions.hpp"

#include <iostream>
#include <mutex>

std::mutex consoleMutex;

#ifdef GAM_CHAKRA_ENABLE
void attachConsole(ChakraJavascriptEngine &engine) {
	engine.add(
		"console",
		"console = {"
		"    log: function () { var result = []; for(var i = 0; i < arguments.length; ++i) { result.push(typeof arguments[i] === 'string' ? arguments[i] : JSON.stringify(arguments[i])); }; CORE_ConsoleLog(result.join(' ')); },"
		"    info: function () { var result = []; for(var i = 0; i < arguments.length; ++i) { result.push(typeof arguments[i] === 'string' ? arguments[i] : JSON.stringify(arguments[i])); }; CORE_ConsoleInfo(result.join(' ')); },"
		"    warn: function () { var result = []; for(var i = 0; i < arguments.length; ++i) { result.push(typeof arguments[i] === 'string' ? arguments[i] : JSON.stringify(arguments[i])); }; CORE_ConsoleWarn(result.join(' ')); },"
		"    error: function () { var result = []; for(var i = 0; i < arguments.length; ++i) { result.push(typeof arguments[i] === 'string' ? arguments[i] : JSON.stringify(arguments[i])); }; CORE_ConsoleError(result.join(' ')); },"
		"}"
	);
	engine.setGlobalFunction("CORE_ConsoleLog", [](ChakraJavascriptEngine* engine) {
		std::lock_guard<std::mutex> lock(consoleMutex);
		std::cout << engine->getargstr(0) << std::endl;
		return false;
	}, 1);
	engine.setGlobalFunction("CORE_ConsoleInfo", [](ChakraJavascriptEngine *engine) {
		std::lock_guard<std::mutex> lock(consoleMutex);
		std::cout << "INFO: " << engine->getargstr(0) << std::endl;
		return false;
	}, 1);
	engine.setGlobalFunction("CORE_ConsoleWarn", [](ChakraJavascriptEngine *engine) {
		std::lock_guard<std::mutex> lock(consoleMutex);
		std::cout << "WARN: " << engine->getargstr(0) << std::endl;
		return false;
	}, 1);
	engine.setGlobalFunction("CORE_ConsoleError", [](ChakraJavascriptEngine *engine) {
		std::lock_guard<std::mutex> lock(consoleMutex);
		std::cerr << "EROR: " << engine->getargstr(0) << std::endl;
		return false;
	}, 1);
}
#endif//GAM_CHAKRA_ENABLE

void attachConsole(DukJavascriptEngine &engine) {
	engine.add(
		"console",
		"console = {"
		"    log: function () { var result = []; for(var i = 0; i < arguments.length; ++i) { result.push(typeof arguments[i] === 'string' ? arguments[i] : JSON.stringify(arguments[i])); }; CORE_ConsoleLog(result.join(' ')); },"
		"    info: function () { var result = []; for(var i = 0; i < arguments.length; ++i) { result.push(typeof arguments[i] === 'string' ? arguments[i] : JSON.stringify(arguments[i])); }; CORE_ConsoleInfo(result.join(' ')); },"
		"    warn: function () { var result = []; for(var i = 0; i < arguments.length; ++i) { result.push(typeof arguments[i] === 'string' ? arguments[i] : JSON.stringify(arguments[i])); }; CORE_ConsoleWarn(result.join(' ')); },"
		"    error: function () { var result = []; for(var i = 0; i < arguments.length; ++i) { result.push(typeof arguments[i] === 'string' ? arguments[i] : JSON.stringify(arguments[i])); }; CORE_ConsoleError(result.join(' ')); },"
		"}"
	);
	engine.setGlobalFunction("CORE_ConsoleLog", [](DukJavascriptEngine* engine) {
		std::lock_guard<std::mutex> lock(consoleMutex);
		std::cout << engine->getargstr(0) << std::endl;
		return false;
	}, 1);
	engine.setGlobalFunction("CORE_ConsoleInfo", [](DukJavascriptEngine *engine) {
		std::lock_guard<std::mutex> lock(consoleMutex);
		std::cout << "INFO: " << engine->getargstr(0) << std::endl;
		return false;
	}, 1);
	engine.setGlobalFunction("CORE_ConsoleWarn", [](DukJavascriptEngine *engine) {
		std::lock_guard<std::mutex> lock(consoleMutex);
		std::cout << "WARN: " << engine->getargstr(0) << std::endl;
		return false;
	}, 1);
	engine.setGlobalFunction("CORE_ConsoleError", [](DukJavascriptEngine *engine) {
		std::lock_guard<std::mutex> lock(consoleMutex);
		std::cerr << "EROR: " << engine->getargstr(0) << std::endl;
		return false;
	}, 1);
}