cmake_minimum_required(VERSION 3.6)
project(GameAnHour)

include_directories("${CMAKE_CURRENT_SOURCE_DIR}/ext/include")
if (CMAKE_BUILD_TYPE MATCHES Debug)
    if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU")
        link_directories("${CMAKE_CURRENT_SOURCE_DIR}/ext/lib/debug-mingw32x64")
    elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
        link_directories("${CMAKE_CURRENT_SOURCE_DIR}/ext/lib/debug-vs2017x64")
    endif()
else()
    if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU")
        link_directories("${CMAKE_CURRENT_SOURCE_DIR}/ext/lib/release-mingw32x64")
    elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
        link_directories("${CMAKE_CURRENT_SOURCE_DIR}/ext/lib/release-vs2017x64")
    endif()
endif()

if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
	set(CHAKRA_CPP_FILES 
		src/Javascript/ChakraJavascriptEngine.cpp
		src/Javascript/TimerExtensionsChakra.cpp)
else()
	set(CHAKRA_CPP_FILES)	
endif()

add_executable(GameAnHour
    src/main.cpp
    src/Javascript/DukJavascriptEngine.cpp
    src/Javascript/TimerExtensionsDuk.cpp
    src/Javascript/ConsoleExtensions.cpp
    src/Javascript/SfmlExtensions.cpp
    src/Javascript/Box2dExtensions.cpp
    src/Javascript/WorkerExtensions.cpp
    src/Profile/Profiler.cpp
	src/Sfml/SfmlAssetStore.cpp
	${CHAKRA_CPP_FILES})
set_property(TARGET GameAnHour PROPERTY CXX_STANDARD 17)

if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
    target_compile_definitions(GameAnHour PRIVATE GAM_CHAKRA_ENABLE=1)
	add_definitions(/std:c++17)
    if (CMAKE_BUILD_TYPE MATCHES Release)
        add_definitions(/MT)
    endif()
endif()

if (CMAKE_BUILD_TYPE MATCHES Debug)
    if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
        target_link_libraries(GameAnHour sfml-audio-d sfml-graphics-d sfml-network-d sfml-window-d sfml-system-d Box2D duktape ChakraCore)
    else()
        target_link_libraries(GameAnHour sfml-audio-d sfml-graphics-d sfml-network-d sfml-window-d sfml-system-d Box2D duktape)
    endif()
else()
	if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
        target_link_libraries(GameAnHour flac freetype ogg openal32 vorbis vorbisenc vorbisfile opengl32 winmm gdi32 opengl32 ws2_32 sfml-audio-s sfml-graphics-s sfml-network-s sfml-system-s sfml-window-s Box2D duktape ChakraCore)
        target_compile_definitions(GameAnHour PRIVATE SFML_STATIC=1)
	else()
		target_link_libraries(GameAnHour sfml-audio sfml-graphics sfml-network sfml-window sfml-system Box2D duktape)
	endif()
endif()
