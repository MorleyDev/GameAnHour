#include "ConsoleExtensions.hpp"
#include <iostream>

void attachConsole(JavascriptEngine &engine) {
	engine.add(
		"console",
		"console = {"
		"    log: function () { var result = []; for(var i = 0; i < arguments.length; ++i) { result.push(typeof arguments[i] === 'string' ? arguments[i] : JSON.stringify(arguments[i])); }; CORE_ConsoleLog(result.join(' ')); },"
		"    info: function () { var result = []; for(var i = 0; i < arguments.length; ++i) { result.push(typeof arguments[i] === 'string' ? arguments[i] : JSON.stringify(arguments[i])); }; CORE_ConsoleInfo(result.join(' ')); },"
		"    warn: function () { var result = []; for(var i = 0; i < arguments.length; ++i) { result.push(typeof arguments[i] === 'string' ? arguments[i] : JSON.stringify(arguments[i])); }; CORE_ConsoleWarn(result.join(' ')); },"
		"    error: function () { var result = []; for(var i = 0; i < arguments.length; ++i) { result.push(typeof arguments[i] === 'string' ? arguments[i] : JSON.stringify(arguments[i])); }; CORE_ConsoleError(result.join(' ')); },"
		"}"
	);
	engine.setGlobalFunction("CORE_ConsoleLog", [](JavascriptEngine* engine) {
		std::cout << engine->getargstr(0) << std::endl;
		return false;
	}, 1);
	engine.setGlobalFunction("CORE_ConsoleInfo", [](JavascriptEngine *engine) {
		std::cout << "INFO: " << engine->getargstr(0) << std::endl;
		return false;
	}, 1);
	engine.setGlobalFunction("CORE_ConsoleWarn", [](JavascriptEngine *engine) {
		std::cout << "WARN: " << engine->getargstr(0) << std::endl;
		return false;
	}, 1);
	engine.setGlobalFunction("CORE_ConsoleError", [](JavascriptEngine *engine) {
		std::cerr << "EROR: " << engine->getargstr(0) << std::endl;
		return false;
	}, 1);
}
