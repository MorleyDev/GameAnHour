#include "ChakraJavascriptEngine.hpp"
#include <fstream>
#include <filesystem>
#include <iostream>

std::vector<std::string> globalFunctionNames;
std::vector<std::function<JsValueRef (JsValueRef, bool, JsValueRef*, unsigned short)>> ChakraJavascriptEngine::globalFunctions;

void ChakraJavascriptEngine::GetAndThrowError(std::string name) {
	const wchar_t* wcharptr;
	std::size_t wlength;

	JsValueRef error;
	JsPropertyIdRef messageId;
	JsValueRef messageRef;
	JsGetAndClearException(&error);
	JsGetPropertyIdFromName(L"message", &messageId);
	JsGetProperty(error, messageId, &messageRef);
	JsStringToPointer(messageRef, &wcharptr, &wlength);
	std::wstring wmessage(wcharptr, wlength);
	std::string message(wmessage.begin(), wmessage.end());

	throw std::runtime_error(name + ": Unexpected error running script. " + message);
}

std::string ChakraJavascriptEngine::GetJsErrorAsString(JsErrorCode code) {
	switch(code) {
	case JsNoError: return "JsNoError";
	case JsErrorCategoryUsage: return "JsErrorCategoryUsage";
	case JsErrorInvalidArgument: return "JsErrorInvalidArgument";
	case JsErrorNullArgument: return "JsErrorNullArgument";
	case JsErrorNoCurrentContext: return "JsErrorNoCurrentContext";
	case JsErrorInExceptionState: return "JsErrorInExceptionState";
	case JsErrorNotImplemented: return "JsErrorNotImplemented";
	case JsErrorWrongThread: return "JsErrorWrongThread";
	case JsErrorRuntimeInUse: return "JsErrorRuntimeInUse";
	case JsErrorBadSerializedScript: return "JsErrorBadSerializedScript";
	case JsErrorInDisabledState: return "JsErrorInDisabledState";
	case JsErrorCannotDisableExecution: return "JsErrorCannotDisableExecution";
	case JsErrorHeapEnumInProgress: return "JsErrorHeapEnumInProgress";
	case JsErrorArgumentNotObject: return "JsErrorArgumentNotObject";
	case JsErrorInProfileCallback: return "JsErrorInProfileCallback";
	case JsErrorInThreadServiceCallback: return "JsErrorInThreadServiceCallback";
	case JsErrorCannotSerializeDebugScript: return "JsErrorCannotSerializeDebugScript";
	case JsErrorAlreadyDebuggingContext: return "JsErrorAlreadyDebuggingContext";
	case JsErrorAlreadyProfilingContext: return "JsErrorAlreadyProfilingContext";
	case JsErrorIdleNotEnabled: return "JsErrorIdleNotEnabled";
	case JsCannotSetProjectionEnqueueCallback: return "JsCannotSetProjectionEnqueueCallback";
	case JsErrorCannotStartProjection: return "JsErrorCannotStartProjection";
	case JsErrorInObjectBeforeCollectCallback: return "JsErrorInObjectBeforeCollectCallback";
	case JsErrorObjectNotInspectable: return "JsErrorObjectNotInspectable";
	case JsErrorPropertyNotSymbol: return "JsErrorPropertyNotSymbol";
	case JsErrorPropertyNotString: return "JsErrorPropertyNotString";
	case JsErrorInvalidContext: return "JsErrorInvalidContext";
	case JsInvalidModuleHostInfoKind: return "JsInvalidModuleHostInfoKind";
	case JsErrorModuleParsed: return "JsErrorModuleParsed";
	case JsNoWeakRefRequired: return "JsNoWeakRefRequired";
	case JsErrorCategoryEngine: return "JsErrorCategoryEngine";
	case JsErrorOutOfMemory: return "JsErrorOutOfMemory";
	case JsErrorBadFPUState: return "JsErrorBadFPUState";
	case JsErrorCategoryScript: return "JsErrorCategoryScript";
	case JsErrorScriptException: return "JsErrorScriptException";
	case JsErrorScriptCompile: return "JsErrorScriptCompile";
	case JsErrorScriptTerminated: return "JsErrorScriptTerminated";
	case JsErrorScriptEvalDisabled: return "JsErrorScriptEvalDisabled";
	case JsErrorCategoryFatal: return "JsErrorCategoryFatal";
	case JsErrorFatal: return "JsErrorFatal";
	case JsErrorWrongRuntime: return "JsErrorWrongRuntime";
	case JsErrorCategoryDiagError: return "JsErrorCategoryDiagError";
	case JsErrorDiagAlreadyInDebugMode: return "JsErrorDiagAlreadyInDebugMode";
	case JsErrorDiagNotInDebugMode: return "JsErrorDiagNotInDebugMode";
	case JsErrorDiagNotAtBreak: return "JsErrorDiagNotAtBreak";
	case JsErrorDiagInvalidHandle: return "JsErrorDiagInvalidHandle";
	case JsErrorDiagObjectNotFound: return "JsErrorDiagObjectNotFound";
	case JsErrorDiagUnableToPerformAction: return "JsErrorDiagUnableToPerformAction";
	default: return "Unknown";
	}
}

JsValueRef CALLBACK chakraNativeFunction(JsValueRef callee, bool isConstructCall, JsValueRef *arguments, unsigned short argumentCount, void *callbackState) {
	const auto index = reinterpret_cast<std::size_t>(callbackState);
	return ChakraJavascriptEngine::globalFunctions[index](callee, isConstructCall, arguments, argumentCount);
}

ChakraJavascriptEngine::ChakraJavascriptEngine(Profiler& profiler, std::function<void(ChakraJavascriptEngine& engine)> extend)
	: profiler(profiler),
	extend(extend),
	currentSourceContext(0) {
	JsCreateRuntime(JsRuntimeAttributeEnableIdleProcessing, nullptr, &runtime);
	JsCreateContext(runtime, &context);
	JsSetCurrentContext(context);

	extend(*this);
	add("hotreload", "ENGINE_Reloading = function () { }; ENGINE_Reloaded = function () { };");
	setGlobalFunction("ENGINE_Stash", [this](ChakraJavascriptEngine* ctx) { stashedState = ctx->getargstr(0); return false; }, 0);
}

void ChakraJavascriptEngine::restart() {
	JsDisposeRuntime(runtime);
	currentSourceContext = 0;

	JsCreateRuntime(JsRuntimeAttributeEnableIdleProcessing, nullptr, &runtime);
	JsCreateContext(runtime, &context);
	JsSetCurrentContext(context);

	extend(*this);
	add("hotreload", "ENGINE_Reloading = function () { }; ENGINE_Reloaded = function () { };");
	setGlobalFunction("ENGINE_Stash", [this](ChakraJavascriptEngine* ctx) { stashedState = ctx->getargstr(0); return false; }, 0);
}

void ChakraJavascriptEngine::add(std::string name, std::string script) {
	JsSetCurrentContext(context);
	std::wstring wscript(script.begin(), script.end());
	std::wstring wname(script.begin(), script.end());

	if (JsRunScript(wscript.c_str(), currentSourceContext++, wname.c_str(), nullptr) != JsNoError) {
		ChakraJavascriptEngine::GetAndThrowError(name);
	}
}

void ChakraJavascriptEngine::load(std::string filepath) {
	std::ifstream engineCode(filepath);
	if (!engineCode.is_open()) {
		throw std::runtime_error(std::string("File not found: ") + filepath);
	}

	std::string script((std::istreambuf_iterator<char>(engineCode)), std::istreambuf_iterator<char>());
	add(filepath, script);
	files[filepath] = std::experimental::filesystem::last_write_time(std::experimental::filesystem::path(filepath));
}

ChakraJavascriptEngine::~ChakraJavascriptEngine() {
	JsDisposeRuntime(runtime);
}

void ChakraJavascriptEngine::setGlobalFunction(const char* name, std::function<bool(ChakraJavascriptEngine*)> function, int nargs /*unused*/) {
	const auto id = ChakraJavascriptEngine::globalFunctions.size();

	globalFunctionNames.push_back(std::string(name));
	ChakraJavascriptEngine::globalFunctions.push_back([this, name, function](JsValueRef self, bool isConstruct, JsValueRef* args, unsigned short argumentCount) {
		auto _ = profiler.profile(name);
		arguments.push_back(std::make_pair(args, argumentCount));
		auto execute = function(this);
		arguments.pop_back();

		if (!execute) {
			return JS_INVALID_REFERENCE;
		}
		auto arg = stack.back(); pop();
		return arg;
	});

	JsValueRef global;

	std::string sname(name);
	std::wstring wname(sname.begin(), sname.end());

	JsGetGlobalObject(&global);
	JsPropertyIdRef propertyId;
	JsGetPropertyIdFromName(wname.c_str(), &propertyId);

	JsValueRef jsfunc;
	const auto createResult = JsCreateFunction(chakraNativeFunction, reinterpret_cast<void*>(id), &jsfunc);
	if (createResult != JsNoError) {
		throw std::runtime_error(std::string(name) + ": Error creating function, " + ChakraJavascriptEngine::GetJsErrorAsString(createResult));
	}

	const auto setResult = JsSetProperty(global, propertyId, jsfunc, true);
	if (setResult != JsNoError) {
		throw std::runtime_error(std::string(name) + ": Error setting function on global object, " + ChakraJavascriptEngine::GetJsErrorAsString(setResult));
	}
}

void ChakraJavascriptEngine::checkFileSystem() {
	auto needReload = false;
	std::for_each(files.begin(), files.end(), [this, &needReload](auto& file) {
		auto newFileTime = std::experimental::filesystem::last_write_time(std::experimental::filesystem::path(file.first));
		if (file.second != newFileTime) {
			std::cout << profiler.getName() << " Detected file " << file.first << " has been updated. Reloading..." << std::endl;
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
}
