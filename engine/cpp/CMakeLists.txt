cmake_minimum_required(VERSION 3.6)
project(GameAnHour)

include_directories("${CMAKE_CURRENT_SOURCE_DIR}/ext/include")
if (CMAKE_BUILD_TYPE MATCHES Debug)
    if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU")
        link_directories("${CMAKE_CURRENT_SOURCE_DIR}/ext/lib/debug-mingw32")
    elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
        link_directories("${CMAKE_CURRENT_SOURCE_DIR}/ext/lib/debug-vs2017")
    endif()
else()
    if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU")
        link_directories("${CMAKE_CURRENT_SOURCE_DIR}/ext/lib/release-mingw32")
    elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
        link_directories("${CMAKE_CURRENT_SOURCE_DIR}/ext/lib/release-vs2017")
    endif()
endif()

if (CMAKE_BUILD_TYPE MATCHES Debug)
    if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
        add_definitions(/MT)
    endif()
endif()

add_executable(GameAnHour
    src/main.cpp
    src/Javascript/JavascriptEngine.cpp
    src/Javascript/TimerExtensions.cpp
    src/Javascript/SfmlExtensions.cpp
    src/Profile/Profiler.cpp
    src/Javascript/Box2dExtensions.cpp
    src/Javascript/ReduxExtensions.cpp)
set_property(TARGET GameAnHour PROPERTY CXX_STANDARD 17)

if (CMAKE_BUILD_TYPE MATCHES Debug)
    target_link_libraries(GameAnHour sfml-audio-d sfml-graphics-d sfml-network-d sfml-window-d sfml-system-d Box2D duktape)
else()
	if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
		target_link_libraries(GameAnHour sfml-audio-s sfml-graphics-s sfml-network-s sfml-window-s sfml-system-s Box2D duktape)
	else()
		target_link_libraries(GameAnHour sfml-audio sfml-graphics sfml-network sfml-window sfml-system Box2D duktape)
	endif()
endif()

