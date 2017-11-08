mkdir build
pushd build
	mkdir debug-vs2017
	pushd debug-vs2017
		cmake ..\.. -G"Visual Studio 15 2017 Win64" -DCMAKE_BUILD_TYPE=Debug
		cmake --build . --config debug
	popd
popd

mkdir bin
pushd bin
	mkdir debug-vs2017
	pushd debug-vs2017
		xcopy ..\..\build\debug-vs2017\Debug\*.exe .\ /S /Y
		xcopy ..\..\ext\bin\debug-vs2017\*.dll .\ /S /Y
	popd
popd
