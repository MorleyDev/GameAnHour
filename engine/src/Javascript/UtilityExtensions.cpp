#include "UtilityExtensions.hpp"

#include <atomic>

std::atomic<std::size_t> prevCounter(0);

template<typename TEngine> void _attachUtility(TEngine& engine) {
	engine.setGlobalFunction("UTILITY_GetUnique", [](TEngine* ctx) {
		ctx->push(static_cast<unsigned int>(++prevCounter));
		return true;
	}, 0);
}

void attachUtility(DukJavascriptEngine& engine) { _attachUtility(engine); }

#ifdef GAM_CHAKRA_ENABLE
void attachUtility(ChakraJavascriptEngine& engine) { _attachUtility(engine); }
#endif//GAM_CHAKRA_ENABLE
