#include "FilesystemExtensions.hpp"

#ifdef GAM_CHAKRA_ENABLE
void attachFileSystem(ChakraJavascriptEngine& engine) {
}
#endif//GAM_CHAKRA_ENABLE

#include "DukJavascriptEngine.hpp"

void attachFileSystem(DukJavascriptEngine& engine) {
	engine.setGlobalFunction("FS_LoadFile", [](DukJavascriptEngine* engine) {
		engine->getargstr(0);
		return false;
	}, 3);
}
