mkdir build
pushd build
	mkdir debug
	pushd debug
		cmake ..\.. -G"MinGW Makefiles" -DCMAKE_BUILD_TYPE=Debug
		cmake --build . --config debug
	popd
popd

mkdir bin
pushd bin
	mkdir debug
	pushd debug
		xcopy ..\..\build\debug\*.exe .\
		xcopy ..\..\ext\bin\debug\*.dll .\
	popd
popd
