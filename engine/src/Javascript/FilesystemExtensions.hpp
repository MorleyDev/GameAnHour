#ifndef DUKSFML_FILESYSTEMEXTENSIONS_HPP
#define DUKSFML_FILESYSTEMEXTENSIONS_HPP

#ifdef GAM_CHAKRA_ENABLE
#include "ChakraJavascriptEngine.hpp"

extern void attachFileSystem(ChakraJavascriptEngine& engine);
#endif//GAM_CHAKRA_ENABLE

#include "DukJavascriptEngine.hpp"

extern void attachFileSystem(DukJavascriptEngine& engine);

#endif//DUKSFML_FILESYSTEMEXTENSIONS_HPP
