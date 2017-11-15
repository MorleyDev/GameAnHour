#ifndef DUKSFML_CONSOLEENGINE_HPP
#define DUKSFML_CONSOLEENGINE_HPP

#include "DukJavascriptEngine.hpp"

#ifdef GAM_CHAKRA_ENABLE
#include "ChakraJavascriptEngine.hpp"
#include "ChakraJavascriptEngine.hpp"

extern void attachConsole(ChakraJavascriptEngine &engine);
#endif//GAM_CHAKRA_ENABLE

extern void attachConsole(DukJavascriptEngine &engine);

#endif//DUKSFML_CONSOLEENGINE_HPP
