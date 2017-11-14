#ifndef DUKSFML_JAVASCRIPTENGINE_HPP
#define DUKSFML_JAVASCRIPTENGINE_HPP

#ifdef GAM_CHAKRA_ENABLE
#include "ChakraJavascriptEngine.hpp"
#define JavascriptEngine ChakraJavascriptEngine
#else // GAM_CHAKRA_ENABLE
#include "DukJavascriptEngine.hpp"
#define JavascriptEngine DukJavascriptEngine
#endif // GAM_CHAKRA_ENABLE

#endif // DUKSFML_JAVASCRIPTENGINE_HPP
